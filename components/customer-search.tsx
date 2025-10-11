"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, User, FileText, MapPin, Phone, Briefcase } from "lucide-react"
import { clienteAPI, validarCPF, formatarCPF, formatarTelefone } from "@/lib/api"
import type { ClienteResponse, ClienteUpdateRequest } from "@/lib/types"

export function CustomerSearch() {
  const [searchCpf, setSearchCpf] = useState("")
  const [cliente, setCliente] = useState<ClienteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<ClienteUpdateRequest>({
    nomeCompleto: "",
    email: "",
    dataNascimento: "",
    rg: "",
    dataEmissaoDocumento: "",
    estadoCivil: "",
    nomeMae: "",
    nomePai: "",
    nomeSocial: "",
    profissao: "",
    empresaAtual: "",
    cargo: "",
    salarioMensal: 0,
    tempoEmprego: 0,
    patrimonioEstimado: 0,
    possuiRestricoesBancarias: false,
    ePpe: false,
    enderecos: [],
  })

  const safeDate = (value: string | undefined) =>
    value ? new Date(value).toLocaleDateString("pt-BR") : "Não informado"

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCpf = searchCpf.replace(/\D/g, "")

    if (!validarCPF(cleanCpf)) {
      alert("CPF inválido!")
      return
    }

    setLoading(true)
    try {
      const clienteEncontrado = await clienteAPI.buscarPorCpf(cleanCpf)

      if (clienteEncontrado) {
        setCliente(clienteEncontrado)
        setEditData({
          nomeCompleto: clienteEncontrado.nomeCompleto,
          email: clienteEncontrado.email,
          dataNascimento: clienteEncontrado.dataNascimento,
          rg: clienteEncontrado.rg,
          dataEmissaoDocumento: clienteEncontrado.dataEmissaoDocumento,
          estadoCivil: clienteEncontrado.estadoCivil,
          nomeMae: clienteEncontrado.nomeMae,
          nomePai: clienteEncontrado.nomePai || "",
          nomeSocial: clienteEncontrado.nomeSocial || "",
          profissao: clienteEncontrado.profissao,
          empresaAtual: clienteEncontrado.empresaAtual,
          cargo: clienteEncontrado.cargo,
          salarioMensal: clienteEncontrado.salarioMensal ?? 0,
          tempoEmprego: clienteEncontrado.tempoEmprego ?? 0,
          patrimonioEstimado: clienteEncontrado.patrimonioEstimado ?? 0,
          possuiRestricoesBancarias: clienteEncontrado.possuiRestricoesBancarias,
          ePpe: clienteEncontrado.ePpe,
          enderecos: clienteEncontrado.enderecos || [],
        })
      } else {
        alert("Cliente não encontrado!")
        setCliente(null)
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error)
      alert(`Erro ao buscar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente) return

    setLoading(true)
    try {
      const enderecosParaAtualizar = cliente.enderecos.map((endereco) => ({
        idEndereco: endereco.idEndereco,
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
        tipoEndereco: endereco.tipoEndereco,
        clienteId: cliente.id,
      }))

      const clienteAtualizado = await clienteAPI.atualizar(cliente.id, {
        ...editData,
        enderecos: enderecosParaAtualizar,
      })

      setCliente(clienteAtualizado)
      setEditing(false)
      alert("Cliente atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      alert(`Erro ao atualizar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    if (cliente) {
      setEditData({
        nomeCompleto: cliente.nomeCompleto,
        email: cliente.email,
        dataNascimento: cliente.dataNascimento,
        rg: cliente.rg,
        dataEmissaoDocumento: cliente.dataEmissaoDocumento,
        estadoCivil: cliente.estadoCivil,
        nomeMae: cliente.nomeMae,
        nomePai: cliente.nomePai || "",
        nomeSocial: cliente.nomeSocial || "",
        profissao: cliente.profissao,
        empresaAtual: cliente.empresaAtual,
        cargo: cliente.cargo,
        salarioMensal: cliente.salarioMensal ?? 0,
        tempoEmprego: cliente.tempoEmprego ?? 0,
        patrimonioEstimado: cliente.patrimonioEstimado ?? 0,
        possuiRestricoesBancarias: cliente.possuiRestricoesBancarias,
        ePpe: cliente.ePpe,
        enderecos: cliente.enderecos || [],
      })
    }
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Formulário de busca */}
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <Search className="w-5 h-5" />
            <span>Consultar Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="searchCpf">CPF do Cliente</Label>
                <Input
                  id="searchCpf"
                  value={searchCpf}
                  onChange={(e) => setSearchCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      {cliente && (
        <Card className="banking-terminal">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-primary">
                <User className="w-5 h-5" />
                <span>Dados do Cliente</span>
              </div>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-6">
                {/* Dados Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Dados Pessoais</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">ID</Label>
                      <p className="text-base mt-1">{cliente.id}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Nome Completo</Label>
                      <p className="text-base mt-1">{cliente.nomeCompleto}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Nome Social</Label>
                      <p className="text-base mt-1">{cliente.nomeSocial || "Não informado"}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">CPF</Label>
                      <p className="text-base mt-1">{formatarCPF(cliente.cpf)}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">RG</Label>
                      <p className="text-base mt-1">{cliente.rg}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Data Emissão RG</Label>
                      <p className="text-base mt-1">{safeDate(cliente.dataEmissaoDocumento)}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Data de Nascimento</Label>
                      <p className="text-base mt-1">{safeDate(cliente.dataNascimento)}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Estado Civil</Label>
                      <p className="text-base mt-1">{cliente.estadoCivil}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Email</Label>
                      <p className="text-base mt-1">{cliente.email}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Nome da Mãe</Label>
                      <p className="text-base mt-1">{cliente.nomeMae}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Nome do Pai</Label>
                      <p className="text-base mt-1">{cliente.nomePai || "Não informado"}</p>
                    </div>
                  </div>
                </div>

                {/* Dados Profissionais */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Dados Profissionais</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Profissão</Label>
                      <p className="text-base mt-1">{cliente.profissao}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Empresa Atual</Label>
                      <p className="text-base mt-1">{cliente.empresaAtual}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Cargo</Label>
                      <p className="text-base mt-1">{cliente.cargo}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Salário Mensal</Label>
                      <p className="text-base mt-1">
                        R$ {(cliente.salarioMensal ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Tempo de Emprego (meses)</Label>
                      <p className="text-base mt-1">{cliente.tempoEmprego ?? 0}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Patrimônio Estimado</Label>
                      <p className="text-base mt-1">
                        R$ {(cliente.patrimonioEstimado ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informações Bancárias */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Informações Bancárias</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Possui Restrições Bancárias</Label>
                      <p className="text-base mt-1">{cliente.possuiRestricoesBancarias ? "Sim" : "Não"}</p>
                    </div>
                    <div className="form-section p-3 rounded-lg">
                      <Label className="text-sm font-semibold">Pessoa Politicamente Exposta (PPE)</Label>
                      <p className="text-base mt-1">{cliente.ePpe ? "Sim" : "Não"}</p>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                {cliente.telefoneResponse && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Contato</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">Telefone</Label>
                        <p className="text-base mt-1">
                          +{cliente.telefoneResponse.ddi}{" "}
                          {formatarTelefone(cliente.telefoneResponse.ddd, cliente.telefoneResponse.numero)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{cliente.telefoneResponse.tipoTelefone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Endereços */}
                {cliente.enderecos && cliente.enderecos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Endereços</span>
                    </h3>
                    <div className="space-y-3">
                      {cliente.enderecos.map((endereco) => (
                        <div key={endereco.idEndereco} className="form-section p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-semibold">{endereco.tipoEndereco}</Label>
                          </div>
                          <p className="text-base">
                            {endereco.logradouro}, {endereco.numero}
                            {endereco.complemento && ` - ${endereco.complemento}`}
                          </p>
                          <p className="text-base">
                            {endereco.cidade} - {endereco.estado}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">CEP: {endereco.cep}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Aqui vai seu formulário de edição (não mudei nada, apenas certifique-se de que números e datas estão corretos) */
              <form onSubmit={handleUpdate} className="space-y-6">{/* ...seu código de edição... */}</form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
