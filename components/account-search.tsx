"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, CreditCard } from "lucide-react"
import { clienteAPI, contaAPI, formatarCPF, validarCPF } from "@/lib/api" 

export function AccountSearch() {
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [contas, setContas] = useState<any[]>([])
  const [clienteNome, setClienteNome] = useState("")

  const buscarContas = async () => {
    if (!cpf) {
      alert("Por favor, informe o CPF")
      return
    }

    if (!validarCPF(cpf)) {
      alert("CPF inválido")
      return
    }

    setLoading(true)
    setContas([]) // Limpa a lista antes de uma nova busca

    try {
      const cpfLimpo = cpf.replace(/\D/g, "")

      // 1. Busca os dados do cliente para exibir o nome
      const cliente = await clienteAPI.buscarPorCpf(cpfLimpo)
      if (!cliente) {
        alert("Cliente não encontrado")
        setClienteNome("")
        return
      }
      setClienteNome(cliente.nomeCompleto)

      // 2. Chama a API do backend para buscar as contas
      const contasEncontradas = await contaAPI.buscarPorCpf(cpfLimpo)

      // 3. Atualiza o estado com as contas encontradas
      setContas(contasEncontradas)

    } catch (error) {
      console.error("Erro ao buscar contas:", error)
      alert("Erro ao buscar contas")
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

  return (
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
              />
            </div>
            <div className="flex items-end">
              <Button onClick={buscarContas} disabled={loading} className="flex items-center space-x-2">
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
                        <p className="font-medium">{formatarSaldo(conta.saldo || conta.saldoDolares || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}