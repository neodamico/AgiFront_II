"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Search, Plus, X } from "lucide-react";
import { clienteAPI, contaAPI, validarCPF, formatarCPF } from "@/lib/api";
import type { ClienteResponse } from "@/lib/types";

export function AccountOpening() {
  const [cpf, setCpf] = useState("");
  const [cpfConjuge, setCpfConjuge] = useState("");
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [tipoConta, setTipoConta] = useState("");
  const [loading, setLoading] = useState(false);

  const [contaData, setContaData] = useState({
    agencia: "0001",
    senha: "",
    limiteChequeEspecial: "",
    responsavelId: "", // Mudado de responsavelId para responsavelContaId
  });

  const buscarCliente = async () => {
    if (!cpf) {
      alert("Por favor, informe o CPF");
      return;
    }

    if (!validarCPF(cpf)) {
      alert("CPF inválido");
      return;
    }

    setLoading(true);
    try {
      const cliente = await clienteAPI.buscarPorCpf(cpf.replace(/\D/g, ""));
      if (cliente) {
        setClientes([cliente]);
      } else {
        alert("Cliente não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro ao buscar cliente");
    } finally {
      setLoading(false);
    }
  };

  const adicionarConjuge = async () => {
    if (!cpfConjuge) {
      alert("Por favor, informe o CPF do cônjuge");
      return;
    }

    if (!validarCPF(cpfConjuge)) {
      alert("CPF do cônjuge inválido");
      return;
    }

    setLoading(true);
    try {
      const cliente = await clienteAPI.buscarPorCpf(
        cpfConjuge.replace(/\D/g, "")
      );
      if (cliente) {
        if (clientes.find((c) => c.id === cliente.id)) {
          alert("Cliente já adicionado");
          return;
        }
        setClientes([...clientes, cliente]);
        setCpfConjuge("");
      } else {
        alert("Cliente não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      alert("Erro ao buscar cliente");
    } finally {
      setLoading(false);
    }
  };

  const removerCliente = (id: number) => {
    if (clientes.length === 1) {
      alert("É necessário pelo menos um titular");
      return;
    }
    setClientes(clientes.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clientes.length === 0) {
      alert("Adicione pelo menos um titular");
      return;
    }

    if (!tipoConta) {
      alert("Selecione o tipo de conta");
      return;
    }

    if (!contaData.senha || contaData.senha.length < 6) {
      alert("Informe uma senha com pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const titularCpfs = clientes.map((c) => c.cpf);

      switch (tipoConta) {
        case "corrente":
          if (!contaData.limiteChequeEspecial) {
            alert("Informe o limite do cheque especial");
            return;
          }
          const contaCorrente = await contaAPI.criarContaCorrente({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
            limiteChequeEspecial: Number.parseFloat(
              contaData.limiteChequeEspecial
            ),
          });
          alert(
            `Conta Corrente ${contaCorrente.numeroConta} criada com sucesso!`
          );
          break;

        case "poupanca":
          const contaPoupanca = await contaAPI.criarContaPoupanca({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
          });
          alert(
            `Conta Poupança ${contaPoupanca.numeroConta} criada com sucesso!`
          );
          break;
          
        case "jovem":
          if (!contaData.responsavelId) {
            alert("Informe o ID do responsável");
            return;
          }
          const contaJovem = await contaAPI.criarContaJovem({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
            responsavelId: Number.parseInt(contaData.responsavelId), // Alterado para responsavelId
          });
          alert(`Conta Jovem ${contaJovem.numeroConta} criada com sucesso!`);
          break;

        case "global":
          const contaGlobal = await contaAPI.criarContaGlobal({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
          });
          alert(
            `Conta Internacional ${contaGlobal.numeroConta} criada com sucesso!`
          );
          break;
      }

      // Reset
      setCpf("");
      setCpfConjuge("");
      setClientes([]);
      setTipoConta("");
      setContaData({
        agencia: "0001",
        senha: "",
        limiteChequeEspecial: "",
        responsavelId: "", // Mudado de responsavelId para responsavelContaId
      });
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      alert(`Erro ao criar conta: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Buscar Cliente Titular
          </h3>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="cpf">CPF do Cliente</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(formatarCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={buscarCliente}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Titulares */}
        {clientes.length > 0 && (
          <div className="form-section p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Titulares da Conta {clientes.length > 1 && "(Conta Conjunta)"}
            </h3>
            <div className="space-y-3">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{cliente.nomeCompleto}</p>
                    <p className="text-sm text-muted-foreground">
                      CPF: {formatarCPF(cliente.cpf)}
                    </p>
                  </div>
                  {clientes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerCliente(cliente.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Adicionar Cônjuge para Conta Conjunta */}
            <div className="mt-4 pt-4 border-t">
              <Label htmlFor="cpfConjuge">
                Adicionar Titular (Conta Conjunta)
              </Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="cpfConjuge"
                  value={cpfConjuge}
                  onChange={(e) => setCpfConjuge(formatarCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <Button
                  type="button"
                  onClick={adicionarConjuge}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Abertura de Conta */}
        {clientes.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="form-section p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Dados da Conta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="agencia">Agência *</Label>
                  <Input
                    id="agencia"
                    value={contaData.agencia}
                    onChange={(e) =>
                      setContaData({ ...contaData, agencia: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipoConta">Tipo de Conta *</Label>
                  <Select value={tipoConta} onValueChange={setTipoConta}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupanca">Conta Poupança</SelectItem>
                      <SelectItem value="jovem">Conta Jovem</SelectItem>
                      <SelectItem value="global">
                        Conta Internacional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="senha">Senha da Conta *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={contaData.senha}
                    onChange={(e) =>
                      setContaData({ ...contaData, senha: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Campos específicos por tipo de conta */}
              {tipoConta === "corrente" && (
                <div>
                  <Label htmlFor="limiteChequeEspecial">
                    Limite Cheque Especial (R$)
                  </Label>
                  <Input
                    id="limiteChequeEspecial"
                    type="number"
                    step="0.01"
                    value={contaData.limiteChequeEspecial}
                    onChange={(e) =>
                      setContaData({
                        ...contaData,
                        limiteChequeEspecial: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

              {tipoConta === "jovem" && (
                <div>
                  <Label htmlFor="responsavelContaId">
                    ID da Conta do Responsável *
                  </Label>
                  <Input
                    id="responsavelContaId"
                    type="number"
                    value={contaData.responsavelId}
                    onChange={(e) =>
                      setContaData({
                        ...contaData,
                        responsavelId: e.target.value,
                      })
                    }
                    placeholder="ID da conta (não do cliente)"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCpf("");
                  setCpfConjuge("");
                  setClientes([]);
                  setTipoConta("");
                  setContaData({
                    agencia: "0001",
                    senha: "",
                    limiteChequeEspecial: "",
                    responsavelId: "", // Mudado de responsavelId para responsavelContaId
                  });
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? "Criando..." : "Criar Conta"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
