"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, CreditCard, AlertTriangle, CheckCircle, DollarSign } from "lucide-react"
import { clienteAPI, contaAPI, formatarCPF, validarCPF } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// --- Tipo para o modal de feedback ---
interface FeedbackState {
  show: boolean
  title: string
  message: string
  type: 'success' | 'error'
}

// --- Funções Auxiliares de Formatação (pode ser movida para um arquivo de utilitários) ---
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente."
  let errorMsg = error?.message || ""

  if (errorMsg.includes("404") || errorMsg.toLowerCase().includes("not found")) {
    errorMessage = "Cliente ou conta não encontrados com o CPF/número de conta informado."
  } else if (errorMsg) {
    let cleanMessage = errorMsg.replace(/^(Erro ao buscar contas: |Erro: )/i, '').trim()
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1)
    errorMessage = cleanMessage.length > 5 ? cleanMessage : errorMessage
  }
  return errorMessage
}

export function AccountSearch() {
  const [cpf, setCpf] = useState("")
  const [numeroConta, setNumeroConta] = useState("")
  const [loading, setLoading] = useState(false)
  const [contas, setContas] = useState<any[]>([])
  const [clienteNome, setClienteNome] = useState("")
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    title: "",
    message: "",
    type: 'success',
  })

  // Exibe o modal de feedback
  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ show: true, title, message, type })
  }

  const buscarContasPorCpf = async () => {
    if (!cpf) {
      showFeedback("Erro de Validação", "Por favor, informe o CPF.", "error")
      return
    }

    if (!validarCPF(cpf)) {
      showFeedback("Erro de Validação", "CPF inválido.", "error")
      return
    }

    setLoading(true)
    setContas([])
    setClienteNome("")
    setNumeroConta("")

    try {
      const cpfLimpo = cpf.replace(/\D/g, "")

      const cliente = await clienteAPI.buscarPorCpf(cpfLimpo)
      if (!cliente) {
        showFeedback("Cliente Não Encontrado", "Nenhum cliente foi encontrado com o CPF informado.", "error")
        return
      }
      setClienteNome(cliente.nomeCompleto)

      const contasEncontradas = await contaAPI.buscarPorCpf(cpfLimpo)
      
      const contasComDetalhes = await Promise.all(
        contasEncontradas.map(async (conta: any) => {
          if (conta.tipoConta === 'JOVEM') {
            try {
              const responsavelConta = await contaAPI.buscarPorId(conta.responsavelContaId);
              const responsavelTitular = await clienteAPI.buscarPorCpf(responsavelConta.titularCpfs[0]);
              const nomeResponsavel = responsavelTitular ? responsavelTitular.nomeCompleto : "Responsável não encontrado";
              return {
                ...conta,
                nomeResponsavel: nomeResponsavel,
              };
            } catch (error) {
              console.error("Erro ao buscar responsável da conta jovem:", error);
              return {
                ...conta,
                nomeResponsavel: "Não encontrado",
              };
            }
          }
          return conta;
        })
      );
      
      setContas(contasComDetalhes)

      if (contasComDetalhes.length > 0) {
        showFeedback("Busca Concluída", `Foram encontradas ${contasComDetalhes.length} conta(s) para o cliente ${cliente.nomeCompleto}.`, "success")
      } else {
        showFeedback("Busca Concluída", `Nenhuma conta foi encontrada para o cliente ${cliente.nomeCompleto}.`, "success")
      }

    } catch (error) {
      console.error("Erro ao buscar contas:", error)
      showFeedback("Erro na Busca", formatErrorMessage(error), "error")
      setContas([])
    } finally {
      setLoading(false)
    }
  }

  const buscarContaPorNumero = async () => {
    if (!numeroConta) {
      showFeedback("Erro de Validação", "Por favor, informe o número da conta.", "error")
      return
    }

    setLoading(true)
    setContas([])
    setClienteNome("")
    setCpf("")

    try {
      const contaEncontrada = await contaAPI.buscarPorNumeroConta(numeroConta)
      
      const titularPrincipal = contaEncontrada.titularCpfs[0]
      const cliente = await clienteAPI.buscarPorCpf(titularPrincipal.replace(/\D/g, ""))

      let contaComDetalhes = contaEncontrada;

      if (contaEncontrada.tipoConta === 'JOVEM') {
        const responsavelConta = await contaAPI.buscarPorId(contaEncontrada.responsavelContaId);
        const responsavelTitular = await clienteAPI.buscarPorCpf(responsavelConta.titularCpfs[0]);
        const nomeResponsavel = responsavelTitular ? responsavelTitular.nomeCompleto : "Responsável não encontrado";
        contaComDetalhes = {
          ...contaEncontrada,
          nomeResponsavel: nomeResponsavel,
        };
      }
      
      if (cliente && cliente.nomeCompleto) {
        setClienteNome(cliente.nomeCompleto)
      } else {
        setClienteNome("")
      }

      setContas([contaComDetalhes])

      showFeedback("Busca Concluída", `Detalhes da conta ${contaEncontrada.numeroConta} encontrados.`, "success")

    } catch (error) {
      console.error("Erro ao buscar conta por número:", error)
      showFeedback("Erro na Busca", formatErrorMessage(error), "error")
      setContas([])
    } finally {
      setLoading(false)
    }
  }

  const formatarSaldo = (saldo: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(saldo)
  }

  const formatarSaldoDolar = (saldo: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(saldo)
  }

  const formatarTaxaManutencao = (taxa: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(taxa)
  }

  return (
    <>
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <CreditCard className="w-5 h-5" />
            <span>Consultar Contas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Busca por CPF */}
          <div className="form-section p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Buscar por CPF</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="cpf">CPF do Cliente</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={buscarContasPorCpf} disabled={loading} className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Nova Seção: Busca por Número da Conta */}
          <div className="form-section p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Buscar por Número da Conta</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="numeroConta">Número da Conta</Label>
                <Input
                  id="numeroConta"
                  value={numeroConta}
                  onChange={(e) => setNumeroConta(e.target.value)}
                  placeholder="000000-0"
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={buscarContaPorNumero} disabled={loading} className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          {clienteNome && (
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Cliente: {clienteNome}</h3>

              {contas.length === 0 ? (
                <p className="text-muted-foreground">Nenhuma conta encontrada para este cliente.</p>
              ) : (
                <div className="space-y-4">
                  {contas.map((conta) => (
                    <div key={conta.id} className="p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Número da Conta</Label>
                          <p className="font-medium">{conta.numeroConta}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Agência</Label>
                          <p className="font-medium">{conta.agencia}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Tipo</Label>
                          <p className="font-medium">{conta.tipoConta}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Status</Label>
                          <p
                            className={`font-medium ${conta.statusConta === "ATIVA" ? "text-green-600" : "text-red-600"}`}
                          >
                            {conta.statusConta}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Saldo</Label>
                          <p className="font-medium">{formatarSaldo(conta.saldo)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Segmento</Label>
                          <p className="font-medium">{conta.segmentoCliente}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Taxa de Manutenção</Label>
                          <p className="font-medium">{formatarTaxaManutencao(conta.taxaManutencao)}</p>
                        </div>
                        
                        {/* Atributos Específicos da Conta Corrente */}
                        {conta.tipoConta === 'CORRENTE' && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Limite Cheque Especial</Label>
                            <p className="font-medium">{formatarSaldo(conta.limiteChequeEspecial)}</p>
                          </div>
                        )}

                        {/* Atributos Específicos da Conta Poupança */}
                        {conta.tipoConta === 'POUPANCA' && (
                          <>
                            <div>
                              <Label className="text-xs text-muted-foreground">Rendimento</Label>
                              <p className="font-medium">{conta.rendimento}% ao mês</p>
                            </div>
                          </>
                        )}
                        
                        {/* Atributos Específicos da Conta Jovem */}
                        {conta.tipoConta === 'JOVEM' && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Responsável</Label>
                            <p className="font-medium">{conta.nomeResponsavel}</p>
                          </div>
                        )}
                        
                        {/* Atributos Específicos da Conta Global */}
                        {conta.tipoConta === 'GLOBAL' && (
                          <>
                            <div>
                              <Label className="text-xs text-muted-foreground">Saldo em Dólar</Label>
                              <p className="font-medium">{formatarSaldoDolar(conta.saldoDolar)}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Código Swift</Label>
                              <p className="font-medium">{conta.codigoSwift}</p>
                            </div>
                          </>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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