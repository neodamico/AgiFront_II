"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserX, Search, AlertTriangle } from "lucide-react"
import { contaAPI, formatarNumeroConta } from "@/lib/api"

export function AccountClosure() {
  const [numeroConta, setNumeroConta] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [senha, setSenha] = useState("")
  const [canClose, setCanClose] = useState(false)
  const [loading, setLoading] = useState(false)

  const searchAccount = async () => {
    if (!numeroConta) {
      alert("Por favor, informe o número da conta")
      return
    }

    setLoading(true)
    try {
      const numeroLimpo = numeroConta.replace(/\D/g, "")
      const numeroFormatado = formatarNumeroConta(numeroLimpo)
      const conta = await contaAPI.buscarPorNumeroConta(numeroFormatado)
      setAccountData(conta)

      const saldoZerado = (conta.saldo || conta.saldoDolar || 0) === 0
      const contaAtiva = conta.statusConta === "ATIVA"
      setCanClose(saldoZerado && contaAtiva)
    } catch (error: any) {
      console.error("Erro ao buscar conta:", error)
      alert(`Erro ao buscar conta: ${error.message}`)
      setAccountData(null)
      setCanClose(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountData || !senha) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!canClose) {
      alert("Não é possível encerrar a conta. Verifique se o saldo está zerado e a conta está ativa.")
      return
    }

    setLoading(true)
    try {
      await contaAPI.desativar(accountData.numeroConta)
      alert(`Conta ${accountData.numeroConta} encerrada com sucesso! Status alterado para EXCLUIDA.`)

      // Reset
      setNumeroConta("")
      setAccountData(null)
      setSenha("")
      setCanClose(false)
    } catch (error: any) {
      console.error("Erro ao encerrar conta:", error)
      alert(`Erro ao encerrar conta: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatarSaldo = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  return (
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
              <div>
                <Label>Saldo Atual</Label>
                <Input
                  value={formatarSaldo(accountData.saldo || accountData.saldoDolar || 0)}
                  disabled
                  className={
                    (accountData.saldo || accountData.saldoDolar || 0) === 0 ? "text-green-600" : "text-red-600"
                  }
                />
              </div>
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
                <Input value={accountData.titularCpfs?.size || 0} disabled />
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
                className={(accountData.saldo || accountData.saldoDolar || 0) === 0 ? "text-green-600" : "text-red-600"}
              >
                {(accountData.saldo || accountData.saldoDolar || 0) === 0 ? "✓" : "✗"} Saldo zerado:{" "}
                {(accountData.saldo || accountData.saldoDolar || 0) === 0 ? "Sim" : "Não"}
              </p>
              <p className={accountData.statusConta === "ATIVA" ? "text-green-600" : "text-red-600"}>
                {accountData.statusConta === "ATIVA" ? "✓" : "✗"} Conta ativa:{" "}
                {accountData.statusConta === "ATIVA" ? "Sim" : "Não"}
              </p>
            </div>
            {!canClose && (
              <p className="text-red-600 text-sm mt-2">
                Para encerrar a conta, é necessário zerar o saldo e a conta deve estar ativa.
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
                  placeholder="Digite a senha do cliente"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Ao encerrar a conta, o status será alterado para EXCLUIDA mas os dados permanecerão no banco de dados.
              </p>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNumeroConta("")
                  setAccountData(null)
                  setSenha("")
                  setCanClose(false)
                }}
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
  )
}
