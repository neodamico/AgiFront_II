"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Repeat, Search } from "lucide-react"

export function AutoDebit() {
  const [numeroConta, setNumeroConta] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [debitData, setDebitData] = useState({
    servico: "",
    codigoCliente: "",
    senha: "",
  })

  const searchAccount = () => {
    if (numeroConta) {
      // Simulação de busca por conta
      setAccountData({
        numeroConta: numeroConta,
        titular: "João Silva Santos",
        tipoConta: "Conta Corrente",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountData || !debitData.servico || !debitData.codigoCliente || !debitData.senha) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }
    alert("Débito automático cadastrado com sucesso!")
    // Reset
    setNumeroConta("")
    setAccountData(null)
    setDebitData({ servico: "", codigoCliente: "", senha: "" })
  }

  return (
    <Card className="banking-terminal">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Repeat className="w-5 h-5" />
          <span>Cadastro de Débito Automático</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
          </div>
        )}

        {/* Cadastro de Débito */}
        {accountData && (
          <form onSubmit={handleSubmit}>
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Dados do Débito Automático</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="servico">Serviço *</Label>
                  <Select
                    value={debitData.servico}
                    onValueChange={(value) => setDebitData({ ...debitData, servico: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agua">Água</SelectItem>
                      <SelectItem value="luz">Luz</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                      <SelectItem value="gas">Gás</SelectItem>
                      <SelectItem value="cartao-credito">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="codigoCliente">Código do Cliente *</Label>
                  <Input
                    id="codigoCliente"
                    value={debitData.codigoCliente}
                    onChange={(e) => setDebitData({ ...debitData, codigoCliente: e.target.value })}
                    placeholder="Código fornecido pela empresa"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="senha">Senha do Cliente *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={debitData.senha}
                    onChange={(e) => setDebitData({ ...debitData, senha: e.target.value })}
                    placeholder="Digite a senha do cliente"
                    required
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
                  setDebitData({ servico: "", codigoCliente: "", senha: "" })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Cadastrar Débito Automático
              </Button>
            </div>
          </form>
        )}

        {/* Confirmação */}
        {accountData && debitData.servico && debitData.codigoCliente && (
          <div className="bg-secondary/10 p-4 rounded-lg border border-secondary">
            <h4 className="font-semibold text-primary mb-2">Resumo do Cadastro</h4>
            <p>
              <strong>Conta:</strong> {accountData.numeroConta}
            </p>
            <p>
              <strong>Titular:</strong> {accountData.titular}
            </p>
            <p>
              <strong>Serviço:</strong> {debitData.servico}
            </p>
            <p>
              <strong>Código do Cliente:</strong> {debitData.codigoCliente}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
