"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Repeat, Search, Trash2, List, X, AlertTriangle, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api, formatarNumeroConta } from "../lib/api"
import { TipoServico, FrequenciaDebito, type DebitoAutomaticoResponse } from "../lib/types"

// Tipo para o modal de feedback
interface FeedbackState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

// Função utilitária para formatar mensagens de erro
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente.";
  let errorMsg = error?.message || '';

  // Tenta analisar a resposta de erro como JSON
  if (errorMsg.startsWith('{') && errorMsg.endsWith('}')) {
    try {
      const errorJson = JSON.parse(errorMsg);
      errorMsg = errorJson.message || errorMsg;
    } catch (e) {
      // Ignora se não for JSON válido
    }
  }

  if (errorMsg.toLowerCase().includes("conta não encontrada")) {
    errorMessage = "Conta não encontrada com o número informado.";
  } else if (errorMsg.toLowerCase().includes("recurso não encontrado")) {
    errorMessage = "O recurso não foi encontrado. Verifique os dados fornecidos.";
  } else if (errorMsg.toLowerCase().includes("débitos ativos")) {
    errorMessage = "Esta conta ainda possui débitos automáticos ativos. Cancele-os primeiro para desativar a conta.";
  } else if (errorMsg.toLowerCase().includes("cliente não encontrado")) {
    errorMessage = "Cliente não encontrado para o CPF informado.";
  } else if (errorMsg.toLowerCase().includes("saldo inválido") || errorMsg.toLowerCase().includes("saldo insuficiente")) {
    errorMessage = "Saldo insuficiente para realizar esta operação.";
  } else if (errorMsg) {
    let cleanMessage = errorMsg.replace(/^(Erro ao processar transação: |Falha na validação dos dados: |Erro: )/i, '').trim();
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    errorMessage = cleanMessage.length > 5 ? cleanMessage : errorMessage;
  }
  return errorMessage;
};


export function AutoDebit() {
  const [numeroConta, setNumeroConta] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [debitData, setDebitData] = useState({
    diaAgendado: "",
    tipoServico: "" as TipoServico | "",
    frequencia: "" as FrequenciaDebito | "",
    identificadorConvenio: "",
    descricao: "",
  })
  const [debitos, setDebitos] = useState<DebitoAutomaticoResponse[]>([])
  const [showDebitos, setShowDebitos] = useState(false)
  const [loading, setLoading] = useState(false)

  // NOVOS ESTADOS para o Modal de Confirmação de Cancelamento e Feedback
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [debitToCancel, setDebitToCancel] = useState<number | null>(null)
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


  const searchAccount = async () => {
    if (!numeroConta) {
      showFeedback("Atenção", "Por favor, informe o número da conta para continuar.", "error");
      return
    }

    setLoading(true)
    try {
      const numeroLimpo = numeroConta.replace(/\D/g, "")
      const numeroFormatado = formatarNumeroConta(numeroLimpo)
      const conta = await api.contas.buscarPorNumeroConta(numeroFormatado)
      setAccountData(conta)
    } catch (error: any) {
      setAccountData(null)
      showFeedback("Erro ao Buscar Conta", `${formatErrorMessage(error)}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const consultarDebitos = async () => {
    if (!accountData) {
      showFeedback("Atenção", "Por favor, busque uma conta primeiro.", "error");
      return
    }

    setLoading(true)
    try {
      const todosDebitos = await api.debitosAutomaticos.listarTodos()
      const debitosDaConta = todosDebitos.filter((d) => d.contaId === accountData.id)
      setDebitos(debitosDaConta)
      setShowDebitos(true)
    } catch (error: any) {
      showFeedback("Erro ao Consultar", `Houve um problema ao buscar a lista de débitos: ${formatErrorMessage(error)}.`, "error");
    } finally {
      setLoading(false)
    }
  }

  // Função para abrir o modal de confirmação
  const handleCancelClick = (debitoId: number) => {
    setDebitToCancel(debitoId)
    setShowCancelModal(true)
  }

  // Função para confirmar e executar o cancelamento (substitui o 'confirm')
  const handleCancelConfirmation = async () => {
    if (!debitToCancel) return

    setLoading(true)
    try {
      // Chama o endpoint de cancelamento
      await api.debitosAutomaticos.cancelar(debitToCancel)

      showFeedback("Cancelamento Concluído", "Sucesso! O débito automático foi cancelado e não será mais cobrado da sua conta.", "success");

      // Reconsulta a lista de débitos para atualizar o status na tela
      await consultarDebitos()
      setDebitToCancel(null)
      setShowCancelModal(false)
    } catch (error: any) {
      console.error("Erro completo da API ao cancelar débito:", error); // LOG DE DIAGNÓSTICO
      showFeedback("Erro ao Cancelar", `Erro ao cancelar débito: ${formatErrorMessage(error)}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !accountData ||
      !debitData.diaAgendado ||
      !debitData.tipoServico ||
      !debitData.frequencia ||
      !debitData.identificadorConvenio
    ) {
      showFeedback("Atenção", "Por favor, preencha todos os campos obrigatórios.", "error");
      return
    }

    setLoading(true)
    try {
      await api.debitosAutomaticos.criar({
        contaId: accountData.id,
        diaAgendado: Number.parseInt(debitData.diaAgendado),
        tipoServico: debitData.tipoServico as TipoServico,
        frequencia: debitData.frequencia as FrequenciaDebito,
        identificadorConvenio: debitData.identificadorConvenio,
        descricao: debitData.descricao,
      })

      showFeedback("Cadastrado com Sucesso!", "Débito automático cadastrado com sucesso! Suas contas serão pagas automaticamente. Você está no controle!", "success");

      // Reset após o sucesso
      setNumeroConta("")
      setAccountData(null)
      setDebitData({
        diaAgendado: "",
        tipoServico: "" as TipoServico | "",
        frequencia: "" as FrequenciaDebito | "",
        identificadorConvenio: "",
        descricao: "",
      })
      setShowDebitos(false)
    } catch (error: any) {
      showFeedback("Falha no Cadastro", `Falha ao cadastrar: ${formatErrorMessage(error)}.`, "error");
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Repeat className="w-5 h-5" />
            <span>Débito Automático</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Busca por Conta */}
          <div className="form-section p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Buscar Conta</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="numeroConta">Número da Conta</Label>
                <Input
                  id="numeroConta"
                  value={numeroConta}
                  onChange={(e) => setNumeroConta(formatarNumeroConta(e.target.value))}
                  placeholder="000000-0"
                  maxLength={8}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={searchAccount} className="flex items-center space-x-2" disabled={loading}>
                  <Search className="w-4 h-4" />
                  <span>{loading ? "Buscando..." : "Buscar"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Dados da Conta */}
          {accountData && (
            <div>
              <div className="form-section p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-primary">Dados da Conta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Número da Conta</Label>
                    <Input value={accountData.numeroConta} disabled />
                  </div>
                  <div>
                    <Label>Agência</Label>
                    <Input value={accountData.agencia} disabled />
                  </div>
                  <div>
                    <Label>Tipo de Conta</Label>
                    <Input value={accountData.tipoConta} disabled />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={consultarDebitos} className="flex items-center space-x-2" disabled={loading}>
                    <List className="w-4 h-4" />
                    <span>Consultar Débitos</span>
                  </Button>
                </div>
              </div>

              {/* Lista de Débitos */}
              {showDebitos && (
                <div className="form-section p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Débitos Cadastrados</h3>
                  {debitos.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum débito automático cadastrado para esta conta.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {debitos.map((debito) => (
                        <div key={debito.id} className="border rounded-lg p-4 flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-semibold">{debito.tipoServico}</p>
                            <p className="text-sm text-muted-foreground">
                              Dia: {debito.diaAgendado} | Frequência: {debito.frequencia}
                            </p>
                            <p className="text-sm text-muted-foreground">Convênio: {debito.identificadorConvenio}</p>
                            {debito.descricao && <p className="text-sm">{debito.descricao}</p>}
                            <p className="text-sm">
                              Status:{" "}
                              {/* CORREÇÃO: Usando comparação robusta e ajustando cores */}
                              <span className={
                                debito.status?.trim().toUpperCase() === "ATIVO"
                                  ? "text-yellow-600 font-medium"
                                  : debito.status?.trim().toUpperCase() === "CANCELADO"
                                    ? "text-red-600 font-medium"
                                    : "text-green-600 font-medium" // Para SUSPENSO ou ERRO_PROCESSAMENTO
                              }>
                                {debito.status}
                              </span>
                            </p>
                          </div>
                          {/* O botão de cancelar só aparece se o status for ATIVO */}
                          {debito.status?.trim().toUpperCase() === "ATIVO" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelClick(debito.id)}
                              disabled={loading}
                              className="flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Cancelar</span>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Cadastro de Débito */}
              <form onSubmit={handleSubmit}>
                <div className="form-section p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-primary">Cadastrar Novo Débito</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="diaAgendado">Dia Agendado (1-28) *</Label>
                      <Input
                        id="diaAgendado"
                        type="number"
                        min="1"
                        max="28"
                        value={debitData.diaAgendado}
                        onChange={(e) => setDebitData({ ...debitData, diaAgendado: e.target.value })}
                        placeholder="Dia do mês"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                      <Select
                        value={debitData.tipoServico}
                        onValueChange={(value) => setDebitData({ ...debitData, tipoServico: value as TipoServico })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TipoServico.ENERGIA}>Energia Elétrica</SelectItem>
                          <SelectItem value={TipoServico.AGUA_SANEAMENTO}>Água e Saneamento</SelectItem>
                          <SelectItem value={TipoServico.TELEFONIA_FIXA_MOVEL}>Telefonia Fixa/Móvel</SelectItem>
                          <SelectItem value={TipoServico.INTERNET_TV}>Internet e TV</SelectItem>
                          <SelectItem value={TipoServico.IPVA}>IPVA</SelectItem>
                          <SelectItem value={TipoServico.OUTROS}>Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="frequencia">Frequência *</Label>
                      <Select
                        value={debitData.frequencia}
                        onValueChange={(value) => setDebitData({ ...debitData, frequencia: value as FrequenciaDebito })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FrequenciaDebito.SEMANAL}>Semanal</SelectItem>
                          <SelectItem value={FrequenciaDebito.MENSAL}>Mensal</SelectItem>
                          <SelectItem value={FrequenciaDebito.ANUAL}>Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="identificadorConvenio">Identificador do Convênio *</Label>
                      <Input
                        id="identificadorConvenio"
                        value={debitData.identificadorConvenio}
                        onChange={(e) => setDebitData({ ...debitData, identificadorConvenio: e.target.value })}
                        placeholder="Código fornecido pela empresa"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Input
                        id="descricao"
                        value={debitData.descricao}
                        onChange={(e) => setDebitData({ ...debitData, descricao: e.target.value })}
                        placeholder="Ex: Conta de luz do mês"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNumeroConta("")
                      setAccountData(null)
                      setDebitData({
                        diaAgendado: "",
                        tipoServico: "" as TipoServico | "",
                        frequencia: "" as FrequenciaDebito | "",
                        identificadorConvenio: "",
                        descricao: "",
                      })
                      setShowDebitos(false)
                    }}
                    disabled={loading}
                  >
                    Limpar
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading || !accountData}>
                    {loading ? "Cadastrando..." : "Cadastrar Débito"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirmar Cancelamento</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Tem certeza que deseja cancelar este débito automático? Ele não será mais executado.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              *Você precisará reativá-lo manualmente se mudar de ideia.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={loading}>
              <X className="w-4 h-4 mr-2" /> Manter Débito
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirmation}
              disabled={loading}
            >
              {loading ? "Cancelando..." : "Sim, Cancelar Agora"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo Modal de Feedback (Sucesso/Erro) */}
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
  )
}