"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserX, Search, AlertTriangle, CheckCircle, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// CORREÇÃO DE ERRO: Mudando de alias (@/lib/api) para caminho relativo (../lib/api) para resolver problema de build.
import { contaAPI, formatarNumeroConta } from "../lib/api"

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
      errorMsg = errorJson.message || errorMsg;
    } catch (e) {
      // Ignora se não for JSON válido
    }
  }

  if (errorMsg.toLowerCase().includes("saldo")) {
    errorMessage = "A conta possui saldo positivo ou em cheque especial. Zere o saldo antes de encerrar.";
  } else if (errorMsg.toLowerCase().includes("ativa")) {
    errorMessage = "A conta precisa estar ATIVA para ser encerrada (seu status será mudado para EXCLUIDA).";
  } else if (errorMsg.toLowerCase().includes("senha")) {
    errorMessage = "Senha incorreta. A senha fornecida não corresponde à conta.";
  } else if (errorMsg.toLowerCase().includes("malformado")) {
    errorMessage = "A requisição falhou devido a dados inválidos. Verifique os campos e tente novamente.";
  } else if (errorMsg.length > 5) {
    // Tenta limpar a mensagem de erro padrão da API
    let cleanMessage = errorMsg.replace(/^(Erro: |Falha na validação dos dados: )/i, '').trim();
    errorMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
  }
  return errorMessage;
};


export function AccountClosure() {
  const [numeroConta, setNumeroConta] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [senha, setSenha] = useState("")
  const [canClose, setCanClose] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const resetForm = () => {
    setNumeroConta("");
    setAccountData(null);
    setSenha("");
    setCanClose(false);
  };


  const searchAccount = async () => {
    if (!numeroConta) {
      showFeedback("Erro de Validação", "Por favor, informe o número da conta.", "error");
      return
    }

    setLoading(true)
    try {
      const numeroLimpo = numeroConta.replace(/\D/g, "")
      const numeroFormatado = formatarNumeroConta(numeroLimpo)
      const conta = await contaAPI.buscarPorNumeroConta(numeroFormatado)
      setAccountData(conta)

      // Verifica se o saldo total (incluindo saldoDolar convertido para zero) é zero
      const saldoTotal = (conta.saldo || 0) + (conta.saldoDolar || 0);
      const saldoZerado = saldoTotal === 0;

      const contaAtiva = conta.statusConta === "ATIVA"
      setCanClose(saldoZerado && contaAtiva)
    } catch (error: any) {
      console.error("Erro ao buscar conta:", error)
      showFeedback("Erro ao buscar conta", formatErrorMessage(error), "error");
      setAccountData(null)
      setCanClose(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountData || !senha) {
      showFeedback("Erro de Validação", "Por favor, preencha a senha.", "error");
      return
    }

    if (!canClose) {
      showFeedback("Operação Bloqueada", "Não é possível encerrar a conta. Verifique se o saldo está zerado e a conta está ativa.", "error");
      return
    }

    if (senha.length !== 6 || !/^\d{6}$/.test(senha)) {
      showFeedback("Erro de Validação", "A senha deve conter exatamente 6 dígitos numéricos.", "error");
      return;
    }


    setLoading(true)
    try {
      // CORRIGIDO: Agora passa a senha como segundo argumento
      await contaAPI.desativar(accountData.numeroConta, senha)
      showFeedback(
        "Conta Encerrada com Sucesso",
        `A conta ${accountData.numeroConta} foi encerrada com sucesso! Status alterado para EXCLUIDA.`,
        "success"
      );

      resetForm()
    } catch (error: any) {
      console.error("Erro ao encerrar conta:", error)
      showFeedback("Erro ao encerrar conta", formatErrorMessage(error), "error");
    } finally {
      setLoading(false)
    }
  }

  const formatarSaldo = (valor: number, isDolar: boolean = false) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: isDolar ? "USD" : "BRL",
    }).format(valor)
  }

  // Calcula o saldo total para fins de verificação
  const saldoR = accountData?.saldo || 0;
  const saldoD = accountData?.saldoDolar || 0;
  const saldoTotal = saldoR + saldoD;
  const isGlobal = accountData?.tipoConta === "GLOBAL";


  return (
    <>
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <UserX className="w-5 h-5" />
            <span>Encerramento de Contas</span>
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
                <Button onClick={searchAccount} disabled={loading} className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Dados da Conta */}
          {accountData && (
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Dados da Conta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <Input value={accountData.tipoConta || "N/A"} disabled />
                </div>
                {/* Saldo em R$ */}
                <div>
                  <Label>Saldo (R$)</Label>
                  <Input
                    value={formatarSaldo(saldoR, false)}
                    disabled
                    className={saldoR === 0 ? "text-green-600" : "text-red-600"}
                  />
                </div>
                {/* Saldo em US$ (somente se for Global) */}
                {isGlobal && <div>
                  <Label>Saldo (US$)</Label>
                  <Input
                    value={formatarSaldo(saldoD, true)}
                    disabled
                    className={saldoD === 0 ? "text-green-600" : "text-red-600"}
                  />
                </div>}
                <div>
                  <Label>Status</Label>
                  <Input
                    value={accountData.statusConta || "N/A"}
                    disabled
                    className={accountData.statusConta === "ATIVA" ? "text-green-600" : "text-red-600"}
                  />
                </div>
                <div>
                  <Label>Titulares</Label>
                  <Input value={accountData.titularCpfs?.length || 0} disabled />
                </div>
              </div>
            </div>
          )}

          {/* Verificação de Encerramento */}
          {accountData && (
            <div
              className={`p-4 rounded-lg border ${canClose ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className={`w-5 h-5 ${canClose ? "text-green-600" : "text-red-600"}`} />
                <h4 className={`font-semibold ${canClose ? "text-green-600" : "text-red-600"}`}>
                  {canClose ? "Conta pode ser encerrada" : "Conta não pode ser encerrada"}
                </h4>
              </div>
              <div className="text-sm space-y-1">
                <p
                  className={saldoTotal === 0 ? "text-green-600" : "text-red-600"}
                >
                  {saldoTotal === 0 ? "✓" : "✗"} Saldo zerado (R$ e US$):{" "}
                  {saldoTotal === 0 ? "Sim" : "Não"}
                </p>
                <p className={accountData.statusConta === "ATIVA" ? "text-green-600" : "text-red-600"}>
                  {accountData.statusConta === "ATIVA" ? "✓" : "✗"} Conta ativa:{" "}
                  {accountData.statusConta === "ATIVA" ? "Sim" : "Não"}
                </p>
              </div>
              {!canClose && (
                <p className="text-red-600 text-sm mt-2">
                  Para encerrar a conta, é necessário zerar o saldo (R$ e US$) e a conta deve estar ativa.
                </p>
              )}
            </div>
          )}

          {/* Formulário de Encerramento */}
          {accountData && canClose && (
            <form onSubmit={handleSubmit}>
              <div className="form-section p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-primary">Confirmação de Encerramento</h3>
                <div>
                  <Label htmlFor="senha">Senha do Cliente *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite a senha do cliente (6 dígitos)"
                    required
                    minLength={6}
                    maxLength={6}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Ao encerrar a conta, o status será alterado para **EXCLUIDA** mas os dados permanecerão no banco de dados.
                </p>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} variant="destructive">
                  {loading ? "Encerrando..." : "Encerrar Conta"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

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
  )
}
