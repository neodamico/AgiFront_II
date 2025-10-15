"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileText, Lock, X, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api, contaAPI, formatarNumeroConta } from "../lib/api";
import type { TransacaoResponse, SaqueRequest, DepositoRequest, TransferenciaRequest, SaqueDolarParaRealRequest, ConversaoMoedaRequest, ConversaoMoedaResponse } from "../lib/types";
import { TipoTransacao } from "../lib/types";

// --- Tipos de Transação ---
type TransacaoTipo = "saque" | "deposito" | "transferencia" | "saque_internacional" | "deposito_internacional";

// Tipo auxiliar para armazenar dados da transação antes da confirmação de senha
interface TransactionPayload {
  tipoTransacao: TransacaoTipo;
  contaId: number;
  contaDestinoId?: number;
  valor: number;
  motivoMovimentacao: string;
  senha?: string;
}

// Tipo para o modal de feedback
interface FeedbackState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

// Função utilitária para formatar mensagens de erro do backend para serem amigáveis ao usuário.
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente.";
  let errorMsg = error?.message || '';

  if (errorMsg.startsWith('{') && errorMsg.endsWith('}')) {
    try {
      const errorJson = JSON.parse(errorMsg);
      errorMsg = errorJson.message || errorJson.message;
    } catch (e) {
      // Ignora se não for JSON válido
    }
  }

  if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("senha")) {
    errorMessage = "Senha incorreta. Por favor, verifique a senha da conta e tente novamente.";
  } else if (errorMsg.toLowerCase().includes("conta não encontrada")) {
    errorMessage = "Conta não encontrada com o número informado.";
  } else if (errorMsg.toLowerCase().includes("saldo insuficiente")) {
    errorMessage = "Saldo insuficiente para realizar esta transação.";
  } else if (errorMsg.toLowerCase().includes("saldo em dólares insuficiente")) {
    errorMessage = "Saldo em dólares (US$) insuficiente na conta global para realizar o saque.";
  } else if (errorMsg.toLowerCase().includes("somente contas globais")) {
    errorMessage = "Essa operação é exclusiva para contas globais.";
  } else if (errorMsg) {
    let cleanMessage = errorMsg.replace(/^(Erro ao processar transação: |Falha na validação dos dados: |Erro: )/i, '').trim();
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    errorMessage = cleanMessage.length > 5 ? cleanMessage : errorMessage;
  }
  return errorMessage;
};


export function BankingTransactions() {
  const [transactionData, setTransactionData] = useState({
    tipoTransacao: "" as TransacaoTipo | "",
    numeroConta: "",
    valor: "",
    senha: "",
    numeroContaDestino: "",
    motivoMovimentacao: "",
  });

  const [saldo, setSaldo] = useState<number | null>(null);
  const [saldoDolar, setSaldoDolar] = useState<number | null>(null);
  const [limiteChequeEspecial, setLimiteChequeEspecial] = useState<number | null>(null);
  const [extrato, setExtrato] = useState<TransacaoResponse[]>([]);
  const [showExtrato, setShowExtrato] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nsuFiltro, setNsuFiltro] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<TransactionPayload | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    title: "",
    message: "",
    type: 'success',
  });

  // Exibe o modal de feedback
  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ show: true, title, message, type });
  };

  // Função de reset para limpar todos os estados relevantes
  const resetForm = () => {
    setTransactionData({
      tipoTransacao: "" as TransacaoTipo | "",
      numeroConta: "",
      valor: "",
      senha: "",
      numeroContaDestino: "",
      motivoMovimentacao: "",
    });
    setSaldo(null);
    setSaldoDolar(null);
    setLimiteChequeEspecial(null);
    setShowExtrato(false);
    setPendingPayload(null);
    setShowPasswordModal(false);
    setNsuFiltro("");
  };


  const consultarSaldos = async () => {
    if (!transactionData.numeroConta) {
      showFeedback("Erro de Validação", "Por favor, informe o número da conta para consultar o saldo.", "error");
      return;
    }

    setLoading(true);
    try {
      const numeroLimpo = transactionData.numeroConta.replace(/\D/g, "");
      const numeroFormatado = formatarNumeroConta(numeroLimpo);
      const contaDetalhes = await api.contas.buscarPorNumeroConta(numeroFormatado);

      setSaldo(contaDetalhes.saldo);
      setSaldoDolar(contaDetalhes.saldoDolar || null);
      setLimiteChequeEspecial(contaDetalhes.limiteChequeEspecial || 0);

    } catch (error: any) {
      showFeedback("Erro ao Consultar Saldo", formatErrorMessage(error), "error");
      setSaldo(null);
      setSaldoDolar(null);
      setLimiteChequeEspecial(null);
    } finally {
      setLoading(false);
    }
  };

  const consultarExtrato = async () => {
    if (!transactionData.numeroConta) {
      showFeedback("Erro de Validação", "Por favor, informe o número da conta para consultar o extrato.", "error");
      return;
    }

    setLoading(true);
    try {
      const numeroLimpo = transactionData.numeroConta.replace(/\D/g, "");
      const numeroFormatado = formatarNumeroConta(numeroLimpo);
      const conta = await api.contas.buscarPorNumeroConta(numeroFormatado);
      const extratoData = await api.transacoes.buscarExtrato(conta.id);
      setExtrato(extratoData);
      setShowExtrato(true);
      setNsuFiltro("");

    } catch (error: any) {
      showFeedback("Erro ao Consultar Extrato", formatErrorMessage(error), "error");
      setExtrato([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmission = async () => {
    if (!pendingPayload || !transactionData.senha || transactionData.senha.length !== 6 || !/^\d{6}$/.test(transactionData.senha)) {
      showFeedback("Erro de Validação", "A senha deve conter exatamente 6 dígitos numéricos.", "error");
      return;
    }

    const gerenteId = localStorage.getItem("gerenteId");
    if (!gerenteId) {
      showFeedback("Erro de Autenticação", "Gerente não identificado. Faça login novamente.", "error");
      return;
    }

    setLoading(true);

    try {
      let response;
      let title = "";
      let description = "";

      // Payload base para transações que exigem senha
      const payload = {
        valor: pendingPayload.valor,
        senha: transactionData.senha,
        motivoMovimentacao: pendingPayload.motivoMovimentacao,
      };

      switch (pendingPayload.tipoTransacao) {
        case "saque":
          response = await api.transacoes.realizarSaque({ contaId: pendingPayload.contaId, ...payload } as SaqueRequest, Number.parseInt(gerenteId));
          title = "Saque Concluído";
          description = `Saque de R$ ${pendingPayload.valor.toFixed(2)} realizado com sucesso! NSU: ${response.nsUnico}`;
          break;

        case "transferencia":
          response = await api.transacoes.realizarTransferencia(
            {
              contaOrigemId: pendingPayload.contaId,
              contaDestinoId: pendingPayload.contaDestinoId!,
              ...payload,
            } as TransferenciaRequest,
            Number.parseInt(gerenteId)
          );
          title = "Transferência Concluída";
          description = `Transferência de R$ ${pendingPayload.valor.toFixed(2)} realizada com sucesso! NSU: ${response.nsUnico}`;
          break;

        case "saque_internacional":
          const saqueInternacionalPayload: SaqueDolarParaRealRequest = {
            contaId: pendingPayload.contaId,
            valorReais: pendingPayload.valor,
            senha: transactionData.senha,
            motivoMovimentacao: pendingPayload.motivoMovimentacao
          };
          response = await api.transacoes.realizarSaqueInternacional(saqueInternacionalPayload, Number.parseInt(gerenteId));
          title = "Saque Internacional Concluído";
          description = `Saque de R$ ${pendingPayload.valor.toFixed(2)} realizado com sucesso, debitado do saldo em dólar. NSU: ${response.nsUnico}`;
          break;
      }

      showFeedback(title, description, "success");
      consultarSaldos();
      resetForm();

    } catch (error: any) {
      console.error("Erro na transação final:", error);
      showFeedback("Falha na Transação", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
      setShowPasswordModal(false);
      setTransactionData({ ...transactionData, senha: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const MAX_CHARS_MOTIVO = 75;
    if (transactionData.motivoMovimentacao.length > MAX_CHARS_MOTIVO) {
      showFeedback("Erro de Validação", "O motivo da movimentação não pode exceder 75 caracteres.", "error");
      return;
    }

    if (!transactionData.tipoTransacao || !transactionData.numeroConta || !transactionData.valor) {
      showFeedback("Erro de Validação", "Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    const gerenteId = localStorage.getItem("gerenteId");
    if (!gerenteId) {
      showFeedback("Erro de Autenticação", "Gerente não identificado. Faça login novamente.", "error");
      return;
    }

    setLoading(true);

    try {
      const valor = Number.parseFloat(transactionData.valor);
      const numeroLimpo = transactionData.numeroConta.replace(/\D/g, "");
      const numeroFormatado = formatarNumeroConta(numeroLimpo);
      const conta = await api.contas.buscarPorNumeroConta(numeroFormatado);

      const isSaqueInternacional = transactionData.tipoTransacao === "saque_internacional";
      const isDepositoInternacional = transactionData.tipoTransacao === "deposito_internacional";
      const isTransacaoInternacional = isSaqueInternacional || isDepositoInternacional;

      if (isTransacaoInternacional && conta.tipoConta !== "GLOBAL") {
        showFeedback("Operação Não Permitida", "Saques e depósitos internacionais só podem ser realizados em contas globais (internacionais).", "error");
        setLoading(false);
        return;
      }

      const payloadBase: TransactionPayload = {
        tipoTransacao: transactionData.tipoTransacao,
        contaId: conta.id,
        valor,
        motivoMovimentacao: transactionData.motivoMovimentacao,
      };

      if (transactionData.tipoTransacao === "transferencia") {
        if (!transactionData.numeroContaDestino) {
          showFeedback("Erro de Validação", "Por favor, informe a conta de destino para a transferência.", "error");
          return;
        }
        const numeroDestinoLimpo = transactionData.numeroContaDestino.replace(/\D/g, "");
        const numeroDestinoFormatado = formatarNumeroConta(numeroDestinoLimpo);
        const contaDestino = await api.contas.buscarPorNumeroConta(numeroDestinoFormatado);
        payloadBase.contaDestinoId = contaDestino.id;
      }

      // DEPÓSITO NACIONAL: Não exige senha, executa diretamente
      if (transactionData.tipoTransacao === "deposito") {
        const response = await api.transacoes.realizarDeposito(
          { contaId: conta.id, valor, senha: "", motivoMovimentacao: transactionData.motivoMovimentacao } as DepositoRequest,
          Number.parseInt(gerenteId)
        );
        showFeedback("Depósito Concluído", `Depósito de R$ ${valor.toFixed(2)} realizado com sucesso! NSU: ${response.nsUnico}`, "success");
        consultarSaldos();
        resetForm();
        return;

      }

      // DEPÓSITO INTERNACIONAL: Não exige senha, executa diretamente
      if (isDepositoInternacional) {
        const depositoInternacionalPayload: ConversaoMoedaRequest = {
          contaId: conta.id,
          valorReais: valor, // A API espera valor em Reais para a conversão
          motivoMovimentacao: transactionData.motivoMovimentacao
        };
        const response = await api.transacoes.realizarDepositoInternacional(
          depositoInternacionalPayload,
          Number.parseInt(gerenteId)
        );

        showFeedback("Depósito Internacional Concluído", `Depósito de US$ ${response.valorDolares?.toFixed(2)} realizado com sucesso, com base em um depósito de R$ ${response.valorReais?.toFixed(2)}! NSU: ${response.nsuOperacao}`, "success");

        consultarSaldos();
        resetForm();
        return;
      }

      // SAQUE / TRANSFERÊNCIA / SAQUE INTERNACIONAL: Requer senha, abre o modal
      setPendingPayload(payloadBase);
      setShowPasswordModal(true);

    } catch (error: any) {
      showFeedback("Falha na Pré-Transação", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const isTransfer = transactionData.tipoTransacao === "transferencia";
  const isSaque = transactionData.tipoTransacao === "saque";
  const isSaqueInternacional = transactionData.tipoTransacao === "saque_internacional";
  const isDepositoInternacional = transactionData.tipoTransacao === "deposito_internacional";
  const isTransacaoInternacional = isSaqueInternacional || isDepositoInternacional;

  const transacoesFiltradas = extrato.filter(transacao =>
    transacao.nsUnico.toLowerCase().includes(nsuFiltro.toLowerCase())
  );

  const MAX_CHARS_MOTIVO = 75;

  // Lógica para cálculo do saldo, limite disponível e limite em uso
  const isChequeEspecial = limiteChequeEspecial !== null && limiteChequeEspecial > 0;
  const saldoReal = saldo || 0;
  
  const displaySaldo = isChequeEspecial && saldoReal < 0 ? 0 : saldoReal;
  const limiteEmUso = isChequeEspecial && saldoReal < 0 ? Math.abs(saldoReal) : 0;
  const limiteDisponivel = isChequeEspecial ? Math.max(0, limiteChequeEspecial - limiteEmUso) : 0;

  const saldoClass = `mr-2 ${saldoReal >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}`;
  

  return (
    <>
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <DollarSign className="w-5 h-5" />
            <span>Transações Bancárias</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Dados da Transação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* NÚMERO DA CONTA (Origem) */}
                <div>
                  <Label htmlFor="numeroConta">Número da Conta *</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="numeroConta"
                      value={transactionData.numeroConta}
                      onChange={(e) =>
                        setTransactionData({ ...transactionData, numeroConta: formatarNumeroConta(e.target.value) })
                      }
                      placeholder="000000-0"
                      maxLength={8}
                      required
                    />
                    <Button type="button" onClick={consultarSaldos} disabled={loading} size="sm">
                      Ver Saldo
                    </Button>
                  </div>
                  {/* Lógica de exibição de saldos */}
                  {saldo !== null && (
                    <p className="text-sm mt-1 flex flex-col sm:flex-row sm:items-baseline">
                      <span className={saldoClass}>
                        Saldo em Conta: R${" "}
                        {displaySaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      {isChequeEspecial && (
                        <span className="ml-0 mt-1 sm:mt-0 sm:ml-2 text-gray-600 text-sm">
                          <span>
                            Limite Disp.: R${" "}
                            {limiteDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          {limiteEmUso > 0 && (
                            <span className="ml-2 text-red-500 font-semibold text-sm">
                              (Em Uso: R${" "}
                              {limiteEmUso.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                            </span>
                          )}
                        </span>
                      )}
                      {saldoDolar !== null && (
                        <span className="ml-0 mt-1 sm:mt-0 sm:ml-2 text-green-600 font-bold">
                          Saldo (US$): {saldoDolar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* ESPAÇO RESERVADO / NÚMERO DA CONTA DE DESTINO */}
                {isTransfer ? (
                  <div>
                    <Label htmlFor="numeroContaDestino">Número da Conta de Destino *</Label>
                    <Input
                      id="numeroContaDestino"
                      value={transactionData.numeroContaDestino}
                      onChange={(e) =>
                        setTransactionData({
                          ...transactionData,
                          numeroContaDestino: formatarNumeroConta(e.target.value),
                        })
                      }
                      placeholder="000000-0"
                      maxLength={8}
                      required
                    />
                  </div>
                ) : (
                  <div className="min-h-9" aria-hidden="true" />
                )}

                {/* VALOR (R$ ou US$) */}
                <div>
                  <Label htmlFor="valor">Valor R$ *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={transactionData.valor}
                    onChange={(e) => setTransactionData({ ...transactionData, valor: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* TIPO DE TRANSAÇÃO */}
                <div>
                  <Label htmlFor="tipoTransacao">Tipo de Transação *</Label>
                  <Select
                    value={transactionData.tipoTransacao}
                    onValueChange={(value) => setTransactionData({ ...transactionData, tipoTransacao: value as TransacaoTipo | "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saque">Saque (R$)</SelectItem>
                      <SelectItem value="deposito">Depósito (R$)</SelectItem>
                      <SelectItem value="transferencia">Transferência (R$)</SelectItem>
                      <SelectItem value="saque_internacional">Saque Internacional (US$)</SelectItem>
                      <SelectItem value="deposito_internacional">Depósito Internacional (US$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* MOTIVO DA MOVIMENTAÇÃO */}
                <div className="md:col-span-2">
                  <Label htmlFor="motivoMovimentacao">Motivo da Movimentação</Label>
                  <Input
                    id="motivoMovimentacao"
                    value={transactionData.motivoMovimentacao}
                    onChange={(e) => setTransactionData({ ...transactionData, motivoMovimentacao: e.target.value })}
                    placeholder="Opcional (obrigatório para valores acima de R$ 10.000 ou US$ 2.000)"
                    maxLength={MAX_CHARS_MOTIVO}
                  />
                  <p className={`text-xs text-right mt-1 ${transactionData.motivoMovimentacao.length === MAX_CHARS_MOTIVO ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                    {transactionData.motivoMovimentacao.length}/{MAX_CHARS_MOTIVO} caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Consulta de Extrato */}
            {transactionData.numeroConta && (
              <div className="form-section p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <h3 className="text-lg font-semibold text-primary">Extrato Bancário</h3>
                  <div className="flex items-center space-x-2">
                    {showExtrato && extrato.length > 0 && (
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Buscar por NSU..."
                          value={nsuFiltro}
                          onChange={(e) => setNsuFiltro(e.target.value)}
                          className="pl-8 w-[200px]"
                        />
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      type="button"
                      onClick={consultarExtrato}
                      disabled={loading}
                      className="flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Consultar Extrato</span>
                    </Button>
                  </div>
                </div>
                {showExtrato && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transacoesFiltradas.length === 0 ? (
                      <p className="text-muted-foreground">
                        {extrato.length > 0 && nsuFiltro
                          ? `Nenhuma transação encontrada com o NSU: ${nsuFiltro}`
                          : "Nenhuma transação encontrada."}
                      </p>
                    ) : (
                      transacoesFiltradas.map((transacao) => {
                        const numeroContaLimpo = transactionData.numeroConta.replace(/\D/g, "");
                        const numeroContaFormatado = formatarNumeroConta(numeroContaLimpo);

                        // Aqui está a mudança: Mantenha as variáveis com valores fixos.
                        const currencySymbol = "R$";
                        const displayValue = transacao.valor;

                        let contaRelacionada: string | undefined = undefined;
                        let contaLabel = "";

                        if (transacao.tipo === TipoTransacao.TRANSFERENCIA) {
                          if (transacao.numeroContaDestino === numeroContaFormatado) {
                            contaRelacionada = transacao.numeroContaOrigem;
                            contaLabel = "Origem";
                          } else if (transacao.numeroContaOrigem === numeroContaFormatado) {
                            contaRelacionada = transacao.numeroContaDestino;
                            contaLabel = "Destino";
                          }
                        }

                        const isEntrada =
                          [TipoTransacao.DEPOSITO, TipoTransacao.DEPOSITO_INTERNACIONAL, TipoTransacao.CONVERSAO_MOEDA].includes(transacao.tipo) ||
                          (transacao.tipo === TipoTransacao.TRANSFERENCIA && transacao.numeroContaDestino === numeroContaFormatado);

                        return (
                          <div key={transacao.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{transacao.tipo.replace(/_/g, ' ')}</p>
                                {contaRelacionada && (
                                  <p className="text-xs text-muted-foreground">
                                    Conta {contaLabel}: {contaRelacionada}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {new Date(transacao.dataHora).toLocaleString("pt-BR")}
                                </p>
                                {transacao.motivoMovimentacao && (
                                  <p className="text-sm">{transacao.motivoMovimentacao}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  NSU: {transacao.nsUnico}
                                </p>
                              </div>
                              <p
                                className={`font-bold ${isEntrada ? "text-green-600" : "text-red-600"}`}
                              >
                                {isEntrada ? "+" : "-"}
                                {currencySymbol}{" "}
                                {Math.abs(displayValue).toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={loading || transactionData.motivoMovimentacao.length > MAX_CHARS_MOTIVO}
              >
                {loading ? "Processando..." : "Processar Transação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Senha */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-red-600" />
              <span>Confirmação de Segurança</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Por favor, insira a senha da conta para confirmar a transação.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="modal-senha">Senha da Conta *</Label>
              <Input
                id="modal-senha"
                type="password"
                value={transactionData.senha}
                onChange={(e) => setTransactionData({ ...transactionData, senha: e.target.value })}
                placeholder="Digite a senha (6 dígitos)"
                minLength={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)} disabled={loading}>
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleFinalSubmission}
              disabled={loading || transactionData.senha.length !== 6 || !/^\d{6}$/.test(transactionData.senha)}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Confirmando..." : "Confirmar e Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Feedback (Sucesso/Erro) */}
      <Dialog open={feedback.show} onOpenChange={(open) => setFeedback({ ...feedback, show: open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <span>{feedback.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {feedback.message}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setFeedback({ ...feedback, show: false })} className={feedback.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}