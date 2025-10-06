"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Search } from "lucide-react"

export function AccountOpening() {
  const [cpf, setCpf] = useState("")
  const [customerData, setCustomerData] = useState<any>(null)
  const [accountData, setAccountData] = useState({
    numeroConta: "",
    titularidade: "",
    tipoConta: "",
  })

  const searchCustomer = () => {
    // Simulação de busca por CPF
    if (cpf) {
      setCustomerData({
        nome: "João Silva Santos",
        cpf: cpf,
        email: "joao.silva@email.com",
      })
      // Gerar número de conta automaticamente
      const numeroConta = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")
      setAccountData({ ...accountData, numeroConta })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerData || !accountData.tipoConta || !accountData.titularidade) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }
    alert(`Conta ${accountData.numeroConta} criada com sucesso para ${customerData.nome}!`)
    // Reset
    setCpf("")
    setCustomerData(null)
    setAccountData({ numeroConta: "", titularidade: "", tipoConta: "" })
  }

  return (
    <Card className="banking-terminal">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <CreditCard className="w-5 h-5" />
          <span>Abertura de Contas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Busca por CPF */}
        <div className="form-section p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-primary">Buscar Cliente</h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="cpf">CPF do Cliente</Label>
              <Input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
            </div>
            <div className="flex items-end">
              <Button onClick={searchCustomer} className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        {customerData && (
          <div className="form-section p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Nome Completo</Label>
                <Input value={customerData.nome} disabled />
              </div>
              <div>
                <Label>CPF</Label>
                <Input value={customerData.cpf} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={customerData.email} disabled />
              </div>
            </div>
          </div>
        )}

        {/* Dados da Conta */}
        {customerData && (
          <form onSubmit={handleSubmit}>
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Dados da Conta</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numeroConta">Número da Conta</Label>
                  <Input id="numeroConta" value={accountData.numeroConta} disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="titularidade">Titularidade *</Label>
                  <Select
                    value={accountData.titularidade}
                    onValueChange={(value) => setAccountData({ ...accountData, titularidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="conjunta">Conjunta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipoConta">Tipo de Conta *</Label>
                  <Select
                    value={accountData.tipoConta}
                    onValueChange={(value) => setAccountData({ ...accountData, tipoConta: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conta-corrente">Conta Corrente</SelectItem>
                      <SelectItem value="conta-poupanca">Conta Poupança</SelectItem>
                      <SelectItem value="conta-menor">Conta Menor de Idade</SelectItem>
                      <SelectItem value="conta-internacional">Conta Internacional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCpf("")
                  setCustomerData(null)
                  setAccountData({ numeroConta: "", titularidade: "", tipoConta: "" })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Criar Conta
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
