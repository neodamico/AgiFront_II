"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Edit, User, Mail, FileText } from "lucide-react"
import { clienteAPI, validarCPF, formatarCPF } from "@/lib/api"
import type { ClienteResponse, ClienteUpdateRequest } from "@/lib/types"

export function CustomerSearch() {
  const [searchCpf, setSearchCpf] = useState("")
  const [cliente, setCliente] = useState<ClienteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<ClienteUpdateRequest>({
    nome: "",
    email: "",
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanCpf = searchCpf.replace(/\D/g, "")

    if (!validarCPF(cleanCpf)) {
      alert("CPF inválido!")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Buscando cliente por CPF:", cleanCpf)
      const clienteEncontrado = await clienteAPI.buscarPorCpf(cleanCpf)

      if (clienteEncontrado) {
        console.log("[v0] Cliente encontrado:", clienteEncontrado)
        setCliente(clienteEncontrado)
        setEditData({
          nome: clienteEncontrado.nome,
          email: clienteEncontrado.email,
        })
      } else {
        alert("Cliente não encontrado!")
        setCliente(null)
      }
    } catch (error) {
      console.error("[v0] Erro ao buscar cliente:", error)
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
      console.log("[v0] Atualizando cliente:", cliente.id, editData)
      const clienteAtualizado = await clienteAPI.atualizar(cliente.id, editData)
      console.log("[v0] Cliente atualizado:", clienteAtualizado)

      setCliente(clienteAtualizado)
      setEditing(false)
      alert("Cliente atualizado com sucesso!")
    } catch (error) {
      console.error("[v0] Erro ao atualizar cliente:", error)
      alert(`Erro ao atualizar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    if (cliente) {
      setEditData({
        nome: cliente.nome,
        email: cliente.email,
      })
    }
    setEditing(false)
  }

  return (
    <div className="space-y-6">
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-section p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">ID</Label>
                    </div>
                    <p className="text-lg">{cliente.id}</p>
                  </div>

                  <div className="form-section p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">Nome</Label>
                    </div>
                    <p className="text-lg">{cliente.nome}</p>
                  </div>

                  <div className="form-section p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">Email</Label>
                    </div>
                    <p className="text-lg">{cliente.email}</p>
                  </div>

                  <div className="form-section p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <Label className="text-sm font-semibold">CPF</Label>
                    </div>
                    <p className="text-lg">{formatarCPF(cliente.cpf)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editNome">Nome *</Label>
                    <Input
                      id="editNome"
                      value={editData.nome}
                      onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="editEmail">Email *</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={loading}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
