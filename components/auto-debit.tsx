"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Repeat, Search } from "lucide-react"
import { api } from "@/lib/api"
import { TipoServico } from "@/lib/types"

export function AutoDebit() {
  const [contaId, setContaId] = useState("")
  const [accountData, setAccountData] = useState<any>(null)
  const [debitData, setDebitData] = useState({
    diaAgendado: "",
    tipoServico: "" as TipoServico | "",
    frequencia: "" as "SEMANAL" | "MENSAL" | "ANUAL" | "",
    identificadorConvenio: "",
    descricao: "",
  })
  const [loading, setLoading] = useState(false)

  const searchAccount = async () => {
    if (!contaId) {
      alert("Por favor, informe o ID da conta")
      return
    }

    setLoading(true)
    try {
      const conta = await api.contas.buscarPorId(Number.parseInt(contaId))
      setAccountData(conta)
    } catch (error: any) {
      alert(`Erro ao buscar conta: ${error.message || "Conta não encontrada"}`)
      setAccountData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !accountData ||
      !debitData.diaAgendado ||
      !debitData.tipoServico ||
      !debitData.frequencia ||
      !debitData.identificadorConvenio
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)
    try {
      await api.debitosAutomaticos.criar({
        contaId: accountData.id,
        diaAgendado: Number.parseInt(debitData.diaAgendado),
        tipoServico: debitData.tipoServico as TipoServico,
        frequencia: debitData.frequencia as "SEMANAL" | "MENSAL" | "ANUAL",
        identificadorConvenio: debitData.identificadorConvenio,
        descricao: debitData.descricao,
      })

      alert("Débito automático cadastrado com sucesso!")

      // Reset
      setContaId("")
      setAccountData(null)
      setDebitData({
        diaAgendado: "",
        tipoServico: "",
        frequencia: "",
        identificadorConvenio: "",
        descricao: "",
      })
    } catch (error: any) {
      alert(`Erro ao cadastrar débito automático: ${error.message || "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
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
              <Label htmlFor="contaId">ID da Conta</Label>
              <Input
                id="contaId"
                type="number"
                value={contaId}
                onChange={(e) => setContaId(e.target.value)}
                placeholder="ID da conta"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchAccount} className="flex items-center space-x-2" disabled={loading}>
                <Search className="w-4 h-4" />
                <span>{loading ? "Buscando..." : "Buscar"}</span>
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
                <Label>Agência</Label>
                <Input value={accountData.agencia} disabled />
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
                  <Label htmlFor="diaAgendado">Dia Agendado (1-28) *</Label>
                  <Input
                    id="diaAgendado"
                    type="number"
                    min="1"
                    max="28"
                    value={debitData.diaAgendado}
                    onChange={(e) => setDebitData({ ...debitData, diaAgendado: e.target.value })}
                    placeholder="Dia do mês"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                  <Select
                    value={debitData.tipoServico}
                    onValueChange={(value) => setDebitData({ ...debitData, tipoServico: value as TipoServico })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TipoServico.ENERGIA}>Energia Elétrica</SelectItem>
                      <SelectItem value={TipoServico.AGUA_SANEAMENTO}>Água e Saneamento</SelectItem>
                      <SelectItem value={TipoServico.TELEFONIA_FIXA_MOVEL}>Telefonia Fixa/Móvel</SelectItem>
                      <SelectItem value={TipoServico.INTERNET_TV}>Internet e TV</SelectItem>
                      <SelectItem value={TipoServico.IPVA}>IPVA</SelectItem>
                      <SelectItem value={TipoServico.OUTROS}>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequencia">Frequência *</Label>
                  <Select
                    value={debitData.frequencia}
                    onValueChange={(value) =>
                      setDebitData({ ...debitData, frequencia: value as "SEMANAL" | "MENSAL" | "ANUAL" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                      <SelectItem value="MENSAL">Mensal</SelectItem>
                      <SelectItem value="ANUAL">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="identificadorConvenio">Identificador do Convênio *</Label>
                  <Input
                    id="identificadorConvenio"
                    value={debitData.identificadorConvenio}
                    onChange={(e) => setDebitData({ ...debitData, identificadorConvenio: e.target.value })}
                    placeholder="Código fornecido pela empresa"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={debitData.descricao}
                    onChange={(e) => setDebitData({ ...debitData, descricao: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContaId("")
                  setAccountData(null)
                  setDebitData({
                    diaAgendado: "",
                    tipoServico: "",
                    frequencia: "",
                    identificadorConvenio: "",
                    descricao: "",
                  })
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar Débito Automático"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
