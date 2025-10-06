"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserX, Search, AlertTriangle } from "lucide-react"

export function AccountClosure() {
  const [numeroConta, setNumeroConta] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [senha, setSenha] = useState("")
  const [canClose, setCanClose] = useState(false)

  const searchAccount = () => {
    if (numeroConta) {
      // Simulação de busca por conta
      const mockAccount = {
        numeroConta: numeroConta,
        titular: "João Silva Santos",
        tipoConta: "Conta Corrente",
        saldo: 0.0,
        debitosAutomaticos: 0,
        status: "Ativa",
      }

      setAccountData(mockAccount)
      // Verifica se pode encerrar (saldo zerado e sem débitos)
      setCanClose(mockAccount.saldo === 0 && mockAccount.debitosAutomaticos === 0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountData || !senha) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    if (!canClose) {
      alert(
        "Não é possível encerrar a conta. Verifique se o saldo está zerado e não há débitos automáticos cadastrados.",
      )
      return
    }

    alert(`Conta ${accountData.numeroConta} encerrada com sucesso!`)
    // Reset
    setNumeroConta("")
    setAccountData(null)
    setSenha("")
    setCanClose(false)
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
                onChange={(e) => setNumeroConta(e.target.value)}
                placeholder="000000"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchAccount} className="flex items-center space-x-2">
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
                <Label>Titular</Label>
                <Input value={accountData.titular} disabled />
              </div>
              <div>
                <Label>Tipo de Conta</Label>
                <Input value={accountData.tipoConta} disabled />
              </div>
              <div>
                <Label>Saldo Atual</Label>
                <Input
                  value={`R$ ${accountData.saldo.toFixed(2)}`}
                  disabled
                  className={accountData.saldo === 0 ? "text-success" : "text-destructive"}
                />
              </div>
              <div>
                <Label>Débitos Automáticos</Label>
                <Input
                  value={accountData.debitosAutomaticos}
                  disabled
                  className={accountData.debitosAutomaticos === 0 ? "text-success" : "text-destructive"}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Input value={accountData.status} disabled />
              </div>
            </div>
          </div>
        )}

        {/* Verificação de Encerramento */}
        {accountData && (
          <div
            className={`p-4 rounded-lg border ${canClose ? "bg-success/10 border-success" : "bg-destructive/10 border-destructive"}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${canClose ? "text-success" : "text-destructive"}`} />
              <h4 className={`font-semibold ${canClose ? "text-success" : "text-destructive"}`}>
                {canClose ? "Conta pode ser encerrada" : "Conta não pode ser encerrada"}
              </h4>
            </div>
            <div className="text-sm space-y-1">
              <p className={accountData.saldo === 0 ? "text-success" : "text-destructive"}>
                ✓ Saldo zerado: {accountData.saldo === 0 ? "Sim" : "Não"}
              </p>
              <p className={accountData.debitosAutomaticos === 0 ? "text-success" : "text-destructive"}>
                ✓ Sem débitos automáticos: {accountData.debitosAutomaticos === 0 ? "Sim" : "Não"}
              </p>
            </div>
            {!canClose && (
              <p className="text-destructive text-sm mt-2">
                Para encerrar a conta, é necessário zerar o saldo e cancelar todos os débitos automáticos.
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
              <Button type="submit" variant="destructive">
                Encerrar Conta
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
