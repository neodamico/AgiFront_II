"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, FileText } from "lucide-react"
import { api } from "@/lib/api"
import type { TransacaoResponse } from "@/lib/types"

export function BankingTransactions() {
  const [transactionData, setTransactionData] = useState({
    tipoTransacao: "",
    numeroConta: "",
    valor: "",
    numeroContaDestino: "",
    motivoMovimentacao: "",
    senha: "", // ✅ campo adicionado
  })

  const [saldo, setSaldo] = useState<number | null>(null)
  const [extrato, setExtrato] = useState<TransacaoResponse[]>([])
  const [showExtrato, setShowExtrato] = useState(false)
  const [loading, setLoading] = useState(false)

  const consultarSaldo = async () => {
    if (!transactionData.numeroConta) {
      alert("Por favor, informe o número da conta")
      return
    }

    setLoading(true)
    try {
      const saldoAtual = await api.contas.consultarSaldo(transactionData.numeroConta)
      setSaldo(saldoAtual)
    } catch (error: any) {
      alert(`Erro ao consultar saldo: ${error.message || "Erro desconhecido"}`)
      setSaldo(null)
    } finally {
      setLoading(false)
    }
  }

  const consultarExtrato = async () => {
    if (!transactionData.numeroConta) {
      alert("Por favor, informe o número da conta")
      return
    }

    setLoading(true)
    try {
      const conta = await api.contas.buscarPorNumeroConta(transactionData.numeroConta)
      const extratoData = await api.transacoes.buscarExtrato(conta.id)
      setExtrato(extratoData)
      setShowExtrato(true)
    } catch (error: any) {
      alert(`Erro ao consultar extrato: ${error.message || "Erro desconhecido"}`)
      setExtrato([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transactionData.tipoTransacao || !transactionData.numeroConta || !transactionData.valor) {
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
      const conta = await api.contas.buscarPorNumeroConta(transactionData.numeroConta)
      let response

      switch (transactionData.tipoTransacao) {
        case "saque":
          response = await api.transacoes.realizarSaque(
            {
              contaId: conta.id,
              valor,
              senha: transactionData.senha,
              motivoMovimentacao: transactionData.motivoMovimentacao,
            },
            Number.parseInt(gerenteId),
          )
          alert(`Saque de R$ ${valor.toFixed(2)} realizado com sucesso!\nNSU: ${response.nsUnico}`)
          break

        case "deposito":
          response = await api.transacoes.realizarDeposito(
            {
              contaId: conta.id,
              valor,
              motivoMovimentacao: transactionData.motivoMovimentacao,
              senha: transactionData.senha || "", // ✅ evita erro de tipo
            },
            Number.parseInt(gerenteId),
          )
          alert(`Depósito de R$ ${valor.toFixed(2)} realizado com sucesso!\nNSU: ${response.nsUnico}`)
          break

        case "transferencia":
          if (!transactionData.numeroContaDestino) {
            alert("Por favor, informe a conta de destino")
            return
          }
          const contaDestino = await api.contas.buscarPorNumeroConta(transactionData.numeroContaDestino)
          response = await api.transacoes.realizarTransferencia(
            {
              contaOrigemId: conta.id,
              contaDestinoId: contaDestino.id,
              valor,
              senha: transactionData.senha,
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
        numeroConta: "",
        valor: "",
        numeroContaDestino: "",
        motivoMovimentacao: "",
        senha: "",
      })
      setSaldo(null)
      setShowExtrato(false)
    } catch (error: any) {
      alert(`Erro ao processar transação: ${error.message || "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const isTransfer = transactionData.tipoTransacao === "transferencia"
  const isSaque = transactionData.tipoTransacao === "saque"

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
                <Label htmlFor="numeroConta">Número da Conta *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="numeroConta"
                    value={transactionData.numeroConta}
                    onChange={(e) => setTransactionData({ ...transactionData, numeroConta: e.target.value })}
                    placeholder="000000-0"
                    required
                  />
                  {isSaque && (
                    <Button type="button" onClick={consultarSaldo} disabled={loading} size="sm">
                      Ver Saldo
                    </Button>
                  )}
                </div>
                {saldo !== null && isSaque && (
                  <p className="text-sm mt-1 text-green-600">
                    Saldo disponível: R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>

              {isTransfer && (
                <div>
                  <Label htmlFor="numeroContaDestino">Número da Conta de Destino *</Label>
                  <Input
                    id="numeroContaDestino"
                    value={transactionData.numeroContaDestino}
                    onChange={(e) => setTransactionData({ ...transactionData, numeroContaDestino: e.target.value })}
                    placeholder="000000-0"
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

              {(isSaque || isTransfer) && (
                <div>
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={transactionData.senha}
                    onChange={(e) => setTransactionData({ ...transactionData, senha: e.target.value })}
                    placeholder="Digite a senha da conta"
                    required
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="motivoMovimentacao">Motivo da Movimentação</Label>
                <Input
                  id="motivoMovimentacao"
                  value={transactionData.motivoMovimentacao}
                  onChange={(e) => setTransactionData({ ...transactionData, motivoMovimentacao: e.target.value })}
                  placeholder="Opcional (obrigatório para valores acima de R$ 10.000)"
                />
              </div>
            </div>
          </div>

          {/* Extrato */}
          {transactionData.numeroConta && (
            <div className="form-section p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Extrato Bancário</h3>
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
              {showExtrato && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {extrato.length === 0 ? (
                    <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
                  ) : (
                    extrato.map((transacao) => (
                      <div key={transacao.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{transacao.tipo}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(transacao.dataHora).toLocaleString("pt-BR")}
                            </p>
                            {transacao.motivoMovimentacao && <p className="text-sm">{transacao.motivoMovimentacao}</p>}
                            <p className="text-xs text-muted-foreground">NSU: {transacao.nsUnico}</p>
                          </div>
                          <p
                            className={`font-bold ${
                              transacao.tipo.includes("RECEBIDA") || transacao.tipo === "DEPOSITO"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transacao.tipo.includes("RECEBIDA") || transacao.tipo === "DEPOSITO" ? "+" : "-"}R${" "}
                            {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTransactionData({
                  tipoTransacao: "",
                  numeroConta: "",
                  valor: "",
                  numeroContaDestino: "",
                  motivoMovimentacao: "",
                  senha: "",
                })
                setSaldo(null)
                setShowExtrato(false)
              }}
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
