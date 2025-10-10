"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign } from "lucide-react"
import { api } from "@/lib/api"

export function BankingTransactions() {
  const [transactionData, setTransactionData] = useState({
    tipoTransacao: "",
    contaId: "",
    valor: "",
    contaDestinoId: "", // Para transferências
    motivoMovimentacao: "",
  })

  const [senha, setSenha] = useState("")

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionData.tipoTransacao || !transactionData.contaId || !transactionData.valor) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)

    try {
      const gerenteId = localStorage.getItem("gerenteId")
      if (!gerenteId) {
        alert("Erro: Gerente não identificado. Faça login novamente.")
        return
      }

      const valor = Number.parseFloat(transactionData.valor)
      const contaId = Number.parseInt(transactionData.contaId)

      let response

      switch (transactionData.tipoTransacao) {
        case "saque":
          response = await api.transacoes.realizarSaque(
            {
              contaId,
              valor,
              senha,
              motivoMovimentacao: transactionData.motivoMovimentacao,
            },
            Number.parseInt(gerenteId),
          )
          alert(`Saque de R$ ${valor.toFixed(2)} realizado com sucesso!\nNSU: ${response.nsUnico}`)
          break

        case "deposito":
          response = await api.transacoes.realizarDeposito(
            {
              contaId,
              valor,
              senha,
              motivoMovimentacao: transactionData.motivoMovimentacao,
            },
            Number.parseInt(gerenteId),
          )
          alert(`Depósito de R$ ${valor.toFixed(2)} realizado com sucesso!\nNSU: ${response.nsUnico}`)
          break

        case "transferencia":
          if (!transactionData.contaDestinoId) {
            alert("Por favor, informe a conta de destino")
            return
          }
          response = await api.transacoes.realizarTransferencia(
            {
              contaOrigemId: contaId,
              contaDestinoId: Number.parseInt(transactionData.contaDestinoId),
              valor,
              senha,
              motivoMovimentacao: transactionData.motivoMovimentacao,
            },
            Number.parseInt(gerenteId),
          )
          alert(`Transferência de R$ ${valor.toFixed(2)} realizada com sucesso!\nNSU: ${response.nsUnico}`)
          break
      }

      // Reset
      setTransactionData({
        tipoTransacao: "",
        contaId: "",
        valor: "",
        contaDestinoId: "",
        motivoMovimentacao: "",
      })
    } catch (error: any) {
      alert(`Erro ao processar transação: ${error.message || "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const isTransfer = transactionData.tipoTransacao === "transferencia"

  return (
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
              <div>
                <Label htmlFor="contaId">ID da Conta *</Label>
                <Input
                  id="contaId"
                  type="number"
                  value={transactionData.contaId}
                  onChange={(e) => setTransactionData({ ...transactionData, contaId: e.target.value })}
                  placeholder="ID da conta"
                  required
                />
              </div>
              {isTransfer && (
                <div>
                  <Label htmlFor="contaDestinoId">ID da Conta de Destino *</Label>
                  <Input
                    id="contaDestinoId"
                    type="number"
                    value={transactionData.contaDestinoId}
                    onChange={(e) => setTransactionData({ ...transactionData, contaDestinoId: e.target.value })}
                    placeholder="ID da conta destino"
                    required
                  />
                </div>
              )}
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
              <div className="md:col-span-2">
                <Label htmlFor="motivoMovimentacao">Motivo da Movimentação</Label>
                <Input
                  id="motivoMovimentacao"
                  value={transactionData.motivoMovimentacao}
                  onChange={(e) => setTransactionData({ ...transactionData, motivoMovimentacao: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setTransactionData({
                  tipoTransacao: "",
                  contaId: "",
                  valor: "",
                  contaDestinoId: "",
                  motivoMovimentacao: "",
                })
              }
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Processando..." : "Processar Transação"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
