"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileText, Lock, X, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Adicionado DialogFooter
import { api, contaAPI, formatarNumeroConta } from "@/lib/api";
import type { TransacaoResponse } from "@/lib/types";

// Tipo auxiliar para armazenar dados da transação antes da confirmação de senha
interface TransactionPayload {
  tipoTransacao: string;
  contaOrigemId: number;
  contaDestinoId?: number;
  valor: number;
  motivoMovimentacao: string;
}

// NOVO TIPO: Para o modal de feedback
interface FeedbackState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

/**
 * Função utilitária para formatar mensagens de erro do backend para serem amigáveis ao usuário.
 * @param error O objeto de erro (geralmente com a propriedade 'message').
 * @returns Uma string de erro amigável.
 */
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente.";
  const errorMsg = error?.message || '';

  if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("senha")) {
    errorMessage = "Senha incorreta. Por favor, verifique a senha da conta e tente novamente.";
  } else if (errorMsg.toLowerCase().includes("conta não encontrada")) {
    errorMessage = "Conta não encontrada com o número informado.";
  } else if (errorMsg.toLowerCase().includes("saldo insuficiente")) {
    errorMessage = "Saldo insuficiente para realizar esta transação.";
  } else if (errorMsg) {
    // Tenta limpar a mensagem de erro padrão da API, removendo prefixos técnicos
    let cleanMessage = errorMsg.replace(/^(Erro ao processar transação: |Falha na validação dos dados: |Erro: )/i, '').trim();
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    errorMessage = cleanMessage.length > 5 ? cleanMessage : errorMessage;
  }
  return errorMessage;
};


export function BankingTransactions() {
  const [transactionData, setTransactionData] = useState({
    tipoTransacao: "",
    numeroConta: "",
    valor: "",
    senha: "", // Senha será usada apenas no modal/momento da transação
    numeroContaDestino: "",
    motivoMovimentacao: "",
  });

  const [saldo, setSaldo] = useState<number | null>(null);
  // Estado para armazenar o limite do cheque especial
  const [limiteChequeEspecial, setLimiteChequeEspecial] = useState<number | null>(null);
  const [extrato, setExtrato] = useState<TransacaoResponse[]>([]);
  const [showExtrato, setShowExtrato] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para filtrar o extrato pelo NSU
  const [nsuFiltro, setNsuFiltro] = useState("");

  // Estados para o Modal de Confirmação de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<TransactionPayload | null>(null);

  // NOVO ESTADO: Para o modal de feedback
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    title: "",
    message: "",
    type: 'success',
  });

  // NOVA FUNÇÃO: Exibe o modal de feedback
  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ show: true, title, message, type });
  };

  // Função de reset para limpar todos os estados relevantes
  const resetForm = () => {
    setTransactionData({
      tipoTransacao: "",
      numeroConta: "",
      valor: "",
      senha: "",
      numeroContaDestino: "",
      motivoMovimentacao: "",
    });
    setSaldo(null);
    setLimiteChequeEspecial(null); // Limpa o limite
    setShowExtrato(false);
    setPendingPayload(null);
    setShowPasswordModal(false);
    setNsuFiltro(""); // Limpa o filtro de NSU
  };


  const consultarSaldo = async () => {
    if (!transactionData.numeroConta) {
      showFeedback("Erro de Validação", "Por favor, informe o número da conta para consultar o saldo.", "error");
      return;
    }

    setLoading(true);
    try {
      const numeroLimpo = transactionData.numeroConta.replace(/\D/g, "");
      const numeroFormatado = formatarNumeroConta(numeroLimpo);

      // Buscamos a conta completa, assumindo que ela contém saldo e limite
      const contaDetalhes = await api.contas.buscarPorNumeroConta(numeroFormatado);

      setSaldo(contaDetalhes.saldo);
      // Assumimos que a resposta contém 'limiteChequeEspecial', usando 0 como fallback se não existir
      setLimiteChequeEspecial(contaDetalhes.limiteChequeEspecial || 0);

    } catch (error: any) {
      // Agora usa a função formatErrorMessage
      showFeedback("Erro ao Consultar Saldo", formatErrorMessage(error), "error");
      setSaldo(null);
      setLimiteChequeEspecial(null); // Limpa o limite em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const consultarExtrato = async () => {
    if (!transactionData.numeroConta) {
      // Feedback de erro (NOVO: Modal)
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
      setNsuFiltro(""); // Reseta o filtro ao carregar novo extrato

    } catch (error: any) {
      // Agora usa a função formatErrorMessage
      showFeedback("Erro ao Consultar Extrato", formatErrorMessage(error), "error");
      setExtrato([]);
    } finally {
      setLoading(false);
    }
  };

  // Funçao que será chamada após a senha ser confirmada no Modal
  const handleFinalSubmission = async () => {
    // Validação da senha no frontend (complementa a validação do backend)
    if (!pendingPayload || !transactionData.senha || transactionData.senha.length !== 6 || !/^\d{6}$/.test(transactionData.senha)) {
      // MENSAGEM PADRONIZADA DE ERRO
      showFeedback("Erro de Validação", "A senha deve conter exatamente 6 dígitos numéricos.", "error");
      return;
    }

    const gerenteId = localStorage.getItem("gerenteId");
    if (!gerenteId) {
      // MENSAGEM PADRONIZADA DE ERRO
      showFeedback("Erro de Autenticação", "Gerente não identificado. Faça login novamente.", "error");
      return;
    }

    setLoading(true);

    try {
      let response;
      const valor = pendingPayload.valor;
      const senha = transactionData.senha;
      let title = "";
      let description = "";

      // Monta o payload final com a senha
      const finalPayload = {
        motivoMovimentacao: pendingPayload.motivoMovimentacao,
        senha: senha,
        valor: valor,
      };

      switch (pendingPayload.tipoTransacao) {
        case "saque":
          response = await api.transacoes.realizarSaque(
            { contaId: pendingPayload.contaOrigemId, ...finalPayload },
            Number.parseInt(gerenteId)
          );
          title = "Saque Concluído";
          description = `Saque de R$ ${valor.toFixed(2)} realizado com sucesso! NSU: ${response.nsUnico}`;
          break;

        case "transferencia":
          response = await api.transacoes.realizarTransferencia(
            {
              contaOrigemId: pendingPayload.contaOrigemId,
              contaDestinoId: pendingPayload.contaDestinoId!,
              ...finalPayload
            },
            Number.parseInt(gerenteId)
          );
          title = "Transferência Concluída";
          description = `Transferência de R$ ${valor.toFixed(2)} realizada com sucesso! NSU: ${response.nsUnico}`;
          break;
      }

      // Exibe modal de sucesso (NOVO: Modal)
      showFeedback(title, description, "success");

      resetForm();

    } catch (error: any) {
      console.error("Erro na transação final:", error);
      // Agora usa a função formatErrorMessage
      showFeedback("Falha na Transação", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
      setShowPasswordModal(false);
      setTransactionData({ ...transactionData, senha: "" }); // Limpa a senha
    }
  };

  // Funçao que prepara o payload e controla o fluxo de Deposito vs. Confirmação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação do Motivo de Movimentação (75 caracteres)
    if (transactionData.motivoMovimentacao.length > MAX_CHARS_MOTIVO) {
      showFeedback("Erro de Validação", "O motivo da movimentação não pode exceder 75 caracteres.", "error");
      return;
    }

    if (!transactionData.tipoTransacao || !transactionData.numeroConta || !transactionData.valor) {
      // MENSAGEM PADRONIZADA DE ERRO
      showFeedback("Erro de Validação", "Por favor, preencha todos os campos obrigatórios.", "error");
      return;
    }

    const gerenteId = localStorage.getItem("gerenteId");
    if (!gerenteId) {
      // MENSAGEM PADRONIZADA DE ERRO
      showFeedback("Erro de Autenticação", "Gerente não identificado. Faça login novamente.", "error");
      return;
    }

    setLoading(true);

    try {
      const valor = Number.parseFloat(transactionData.valor);
      const numeroLimpo = transactionData.numeroConta.replace(/\D/g, "");
      const numeroFormatado = formatarNumeroConta(numeroLimpo);
      // Busca a conta de origem para pegar o ID
      const conta = await api.contas.buscarPorNumeroConta(numeroFormatado);

      let contaDestino;
      if (transactionData.tipoTransacao === "transferencia") {
        if (!transactionData.numeroContaDestino) {
          // MENSAGEM PADRONIZADA DE ERRO
          showFeedback("Erro de Validação", "Por favor, informe a conta de destino para a transferência.", "error");
          setLoading(false);
          return;
        }
        const numeroDestinoLimpo = transactionData.numeroContaDestino.replace(/\D/g, "");
        const numeroDestinoFormatado = formatarNumeroConta(numeroDestinoLimpo);
        contaDestino = await api.contas.buscarPorNumeroConta(numeroDestinoFormatado);
      }

      // --- Prepara o Payload Base ---
      const basePayload: TransactionPayload = {
        tipoTransacao: transactionData.tipoTransacao,
        valor,
        motivoMovimentacao: transactionData.motivoMovimentacao,
        contaOrigemId: conta.id, // Para Saque/Transferência
      };

      if (transactionData.tipoTransacao === "transferencia" && contaDestino) {
        basePayload.contaDestinoId = contaDestino.id;
      }

      // --- Executa ou Prepara a Confirmação ---
      if (transactionData.tipoTransacao === "deposito") {
        // DEPÓSITO: Não exige senha, executa diretamente
        const response = await api.transacoes.realizarDeposito(
          { contaId: conta.id, valor, senha: "", motivoMovimentacao: transactionData.motivoMovimentacao },
          Number.parseInt(gerenteId)
        );

        // Exibe modal de sucesso para depósito (NOVO: Modal)
        showFeedback("Depósito Concluído", `Depósito de R$ ${valor.toFixed(2)} realizado com sucesso! NSU: ${response.nsUnico}`, "success");

        resetForm();

      } else {
        // SAQUE / TRANSFERÊNCIA: Requer senha, abre o modal
        setPendingPayload(basePayload);
        setShowPasswordModal(true);
      }
    } catch (error: any) {
      // Agora usa a função formatErrorMessage
      showFeedback("Falha na Pré-Transação", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const isTransfer = transactionData.tipoTransacao === "transferencia";
  const isSaque = transactionData.tipoTransacao === "saque";

  // Função para filtrar as transações
  const transacoesFiltradas = extrato.filter(transacao =>
    transacao.nsUnico.toLowerCase().includes(nsuFiltro.toLowerCase())
  );

  const MAX_CHARS_MOTIVO = 75;

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
                    {isSaque && (
                      <Button type="button" onClick={consultarSaldo} disabled={loading} size="sm">
                        Ver Saldo
                      </Button>
                    )}
                  </div>
                  {/* Lógica de exibição de saldo e cheque especial */}
                  {saldo !== null && isSaque && (
                    <p className="text-sm mt-1 flex flex-col sm:flex-row sm:items-baseline">
                      {(() => {
                        const limiteTotal = limiteChequeEspecial ?? 0;
                        const limiteEmUso = saldo < 0 ? Math.abs(saldo) : 0;
                        const limiteDisponivel = limiteTotal - limiteEmUso;
                        const displaySaldo = saldo < 0 ? 0 : saldo;

                        // Determina a classe de cor principal (Verde para saldo positivo, Amarelo/Laranja para usando o limite)
                        const saldoClass = saldo >= 0 ? "text-green-600 font-bold" : "text-yellow-600 font-bold";

                        return (
                          <>
                            {/* Saldo em Conta (Exibe 0,00 se negativo) */}
                            <span className={saldoClass}>
                              Saldo em Conta: R${" "}
                              {displaySaldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>

                            {limiteTotal > 0 && (
                              <span className="ml-0 mt-1 sm:mt-0 sm:ml-2 text-gray-600 text-sm">
                                {/* Limite Disponível */}
                                <span>
                                  Limite Disp.: R${" "}
                                  {Math.max(0, limiteDisponivel).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>

                                {/* Limite em Uso (Mostra apenas se o limite estiver sendo usado) */}
                                {limiteEmUso > 0 && (
                                  <span className="ml-2 text-red-500 font-semibold text-sm">
                                    (Em Uso: R${" "}
                                    {limiteEmUso.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                                  </span>
                                )}
                              </span>
                            )}
                          </>
                        );
                      })()}
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

                {/* VALOR (R$)*/}
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
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
                    onValueChange={(value) => setTransactionData({ ...transactionData, tipoTransacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saque">Saque</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                      <SelectItem value="transferencia">Transferência</SelectItem>
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
                    placeholder="Opcional (obrigatório para valores acima de R$ 10.000)"
                    maxLength={MAX_CHARS_MOTIVO} // Limite de 75 caracteres
                  />
                  {/* Contador de Caracteres */}
                  <p className={`text-xs text-right mt-1 ${transactionData.motivoMovimentacao.length === MAX_CHARS_MOTIVO ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                    {transactionData.motivoMovimentacao.length}/{MAX_CHARS_MOTIVO} caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Consulta de Extrato */}
            {transactionData.numeroConta && (
              <div className="form-section p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2"> {/* Modificado para flex-wrap */}
                  <h3 className="text-lg font-semibold text-primary">Extrato Bancário</h3>
                  <div className="flex items-center space-x-2">
                    {/* CAMPO DE BUSCA POR NSU */}
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
                      transacoesFiltradas.map((transacao) => { // Usando o array filtrado
                        // Obtém o número da conta consultada
                        const numeroContaLimpo = transactionData.numeroConta.replace(/\D/g, "");
                        const numeroContaFormatado = formatarNumeroConta(numeroContaLimpo);

                        // LÓGICA: Determina qual conta exibir para TRANSFERENCIA
                        let contaRelacionada: string | undefined = undefined;
                        let contaLabel = "";

                        if (transacao.tipo === "TRANSFERENCIA") {
                          // Se a conta destino é a conta consultada, significa que RECEBEU
                          if (transacao.numeroContaDestino === numeroContaFormatado) {
                            contaRelacionada = transacao.numeroContaOrigem;
                            contaLabel = "Origem";
                          }
                          // Se a conta origem é a conta consultada, significa que ENVIOU
                          else if (transacao.numeroContaOrigem === numeroContaFormatado) {
                            contaRelacionada = transacao.numeroContaDestino;
                            contaLabel = "Destino";
                          }
                        }

                        // Determina se a transação é uma entrada
                        const isEntrada =
                          transacao.tipo === "DEPOSITO" ||
                          (transacao.tipo === "TRANSFERENCIA" && transacao.numeroContaDestino === numeroContaFormatado);

                        return (
                          <div key={transacao.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{transacao.tipo}</p>

                                {/* Exibe a conta relacionada */}
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
                                {isEntrada ? "+" : "-"}R${" "}
                                {/* Usamos Math.abs() para garantir que o valor seja sempre positivo antes de formatar */}
                                {Math.abs(transacao.valor).toLocaleString("pt-BR", {
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
                disabled={loading || transactionData.motivoMovimentacao.length > MAX_CHARS_MOTIVO} // Adicionado verificação de limite
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
              {pendingPayload?.tipoTransacao === 'saque'
                ? 'Por favor, insira a senha da conta para realizar o Saque.'
                : 'Por favor, insira a senha da conta de origem para confirmar a Transferência.'
              }
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

      {/* NOVO: Modal de Feedback (Sucesso/Erro) */}
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
