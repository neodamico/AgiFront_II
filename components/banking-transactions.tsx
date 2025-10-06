"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, ArrowUpDown } from "lucide-react"

export function BankingTransactions() {
  const [transactionData, setTransactionData] = useState({
    tipoTransacao: "",
    numeroConta: "",
    valor: "",
    senha: "",
    contaDestino: "", // Para transferências
  })

  const [exchangeRate] = useState(5.25) // Taxa de câmbio simulada USD/BRL

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !transactionData.tipoTransacao ||
      !transactionData.numeroConta ||
      !transactionData.valor ||
      !transactionData.senha
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const valor = Number.parseFloat(transactionData.valor)
    let message = ""

    switch (transactionData.tipoTransacao) {
      case "saque":
        message = `Saque de R$ ${valor.toFixed(2)} realizado com sucesso!`
        break
      case "deposito":
        message = `Depósito de R$ ${valor.toFixed(2)} realizado com sucesso!`
        break
      case "saque-internacional":
        const valorUSD = valor / exchangeRate
        message = `Saque internacional de US$ ${valorUSD.toFixed(2)} (R$ ${valor.toFixed(2)}) realizado com sucesso!`
        break
      case "deposito-internacional":
        const valorConvertido = valor * exchangeRate
        message = `Depósito internacional de R$ ${valor.toFixed(2)} convertido para US$ ${valorConvertido.toFixed(2)} realizado com sucesso!`
        break
      case "transferencia-internacional":
        const valorTransferencia = valor / exchangeRate
        message = `Transferência internacional de US$ ${valorTransferencia.toFixed(2)} (R$ ${valor.toFixed(2)}) realizada com sucesso!`
        break
    }

    alert(message)
    // Reset
    setTransactionData({
      tipoTransacao: "",
      numeroConta: "",
      valor: "",
      senha: "",
      contaDestino: "",
    })
  }

  const isInternational = transactionData.tipoTransacao?.includes("internacional")
  const isTransfer = transactionData.tipoTransacao === "transferencia-internacional"

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
                    <SelectItem value="saque">Saque de Contas</SelectItem>
                    <SelectItem value="deposito">Depósito em Contas</SelectItem>
                    <SelectItem value="saque-internacional">Saque Internacional (USD → BRL)</SelectItem>
                    <SelectItem value="deposito-internacional">Depósito Internacional (BRL → USD)</SelectItem>
                    <SelectItem value="transferencia-internacional">Transferência Internacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numeroConta">Número da Conta *</Label>
                <Input
                  id="numeroConta"
                  value={transactionData.numeroConta}
                  onChange={(e) => setTransactionData({ ...transactionData, numeroConta: e.target.value })}
                  placeholder="000000"
                  required
                />
              </div>
              {isTransfer && (
                <div>
                  <Label htmlFor="contaDestino">Conta de Destino *</Label>
                  <Input
                    id="contaDestino"
                    value={transactionData.contaDestino}
                    onChange={(e) => setTransactionData({ ...transactionData, contaDestino: e.target.value })}
                    placeholder="000000"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="valor">Valor * {isInternational && "(em Reais)"}</Label>
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
                <Label htmlFor="senha">Senha do Cliente *</Label>
                <Input
                  id="senha"
                  type="password"
                  value={transactionData.senha}
                  onChange={(e) => setTransactionData({ ...transactionData, senha: e.target.value })}
                  placeholder="Digite a senha do cliente"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações de Câmbio */}
          {isInternational && transactionData.valor && (
            <div className="bg-secondary/10 p-4 rounded-lg border border-secondary">
              <h4 className="font-semibold text-primary mb-2 flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4" />
                <span>Conversão de Moeda</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Taxa de Câmbio:</strong> 1 USD = R$ {exchangeRate}
                  </p>
                  <p>
                    <strong>Valor em Reais:</strong> R$ {Number.parseFloat(transactionData.valor || "0").toFixed(2)}
                  </p>
                </div>
                <div>
                  {transactionData.tipoTransacao === "saque-internacional" && (
                    <p>
                      <strong>Valor em Dólares:</strong> US${" "}
                      {(Number.parseFloat(transactionData.valor || "0") / exchangeRate).toFixed(2)}
                    </p>
                  )}
                  {transactionData.tipoTransacao === "deposito-internacional" && (
                    <p>
                      <strong>Valor Convertido:</strong> US${" "}
                      {(Number.parseFloat(transactionData.valor || "0") * exchangeRate).toFixed(2)}
                    </p>
                  )}
                  {transactionData.tipoTransacao === "transferencia-internacional" && (
                    <p>
                      <strong>Valor da Transferência:</strong> US${" "}
                      {(Number.parseFloat(transactionData.valor || "0") / exchangeRate).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setTransactionData({
                  tipoTransacao: "",
                  numeroConta: "",
                  valor: "",
                  senha: "",
                  contaDestino: "",
                })
              }
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Processar Transação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
