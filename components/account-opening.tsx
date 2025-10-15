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
import { CreditCard, Search, Plus, X, AlertTriangle, CheckCircle } from "lucide-react";
import { clienteAPI, contaAPI, validarCPF, formatarCPF } from "@/lib/api";
import type { ClienteResponse } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// --- Tipo para o modal de feedback ---
interface FeedbackState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

// --- Funções Auxiliares ---
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente.";
  let errorMsg = error?.message || "";

  if (errorMsg.includes("404") || errorMsg.toLowerCase().includes("not found")) {
    errorMessage = "Cliente não encontrado com o CPF informado.";
  } else if (errorMsg.toLowerCase().includes("limite do cheque especial")) {
    errorMessage = "Valor inválido para o limite de cheque especial.";
  } else if (errorMsg.toLowerCase().includes("senha")) {
    errorMessage = "A senha deve conter no mínimo 6 caracteres.";
  } else if (errorMsg) {
    let cleanMessage = errorMsg.replace(/^(Erro ao criar conta: |Falha na validação dos dados: |Erro: )/i, '').trim();
    cleanMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
    errorMessage = cleanMessage.length > 5 ? cleanMessage : errorMessage;
  }
  return errorMessage;
};

export function AccountOpening() {
  const [cpf, setCpf] = useState("");
  const [cpfConjuge, setCpfConjuge] = useState("");
  const [clientes, setClientes] = useState<ClienteResponse[]>([]);
  const [tipoConta, setTipoConta] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    title: "",
    message: "",
    type: 'success',
  });

  const [contaData, setContaData] = useState({
    agencia: "0001",
    senha: "",
    limiteChequeEspecial: "",
    numeroContaResponsavel: "",
  });

  // Exibe o modal de feedback
  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ show: true, title, message, type });
  };

  const buscarCliente = async () => {
    if (!cpf) {
      showFeedback("Erro de Validação", "Por favor, informe o CPF.", "error");
      return;
    }

    if (!validarCPF(cpf)) {
      showFeedback("Erro de Validação", "CPF inválido.", "error");
      return;
    }

    setLoading(true);
    try {
      const cliente = await clienteAPI.buscarPorCpf(cpf.replace(/\D/g, ""));
      if (cliente) {
        setClientes([cliente]);
        showFeedback("Sucesso", `Cliente ${cliente.nomeCompleto} encontrado.`, "success");
      } else {
        showFeedback("Cliente Não Encontrado", "Nenhum cliente foi encontrado com o CPF informado.", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      showFeedback("Erro na Busca", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const adicionarConjuge = async () => {
    if (!cpfConjuge) {
      showFeedback("Erro de Validação", "Por favor, informe o CPF do segundo titular.", "error");
      return;
    }

    if (!validarCPF(cpfConjuge)) {
      showFeedback("Erro de Validação", "CPF do segundo titular inválido.", "error");
      return;
    }

    setLoading(true);
    try {
      const cliente = await clienteAPI.buscarPorCpf(
        cpfConjuge.replace(/\D/g, "")
      );
      if (cliente) {
        if (clientes.find((c) => c.id === cliente.id)) {
          showFeedback("Atenção", "Cliente já adicionado como titular.", "error");
          return;
        }
        setClientes([...clientes, cliente]);
        setCpfConjuge("");
        showFeedback("Sucesso", `Titular adicional ${cliente.nomeCompleto} adicionado.`, "success");
      } else {
        showFeedback("Cliente Não Encontrado", "Nenhum cliente foi encontrado com o CPF informado.", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      showFeedback("Erro na Busca", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const removerCliente = (id: number) => {
    if (clientes.length === 1) {
      showFeedback("Atenção", "É necessário pelo menos um titular para abrir uma conta.", "error");
      return;
    }
    setClientes(clientes.filter((c) => c.id !== id));
    showFeedback("Removido", "Titular removido com sucesso.", "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (clientes.length === 0) {
      showFeedback("Erro de Validação", "Adicione pelo menos um titular para abrir a conta.", "error");
      return;
    }

    if (!tipoConta) {
      showFeedback("Erro de Validação", "Selecione o tipo de conta que deseja abrir.", "error");
      return;
    }

    if (!contaData.senha || contaData.senha.length < 6) {
      showFeedback("Erro de Validação", "A senha deve conter no mínimo 6 caracteres.", "error");
      return;
    }

    setLoading(true);
    try {
      const titularCpfs = clientes.map((c) => c.cpf);
      let numeroNovaConta;

      switch (tipoConta) {
        case "corrente":
          if (!contaData.limiteChequeEspecial) {
            showFeedback("Erro de Validação", "Informe o limite do cheque especial.", "error");
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
          numeroNovaConta = contaCorrente.numeroConta;
          break;

        case "poupanca":
          const contaPoupanca = await contaAPI.criarContaPoupanca({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
          });
          numeroNovaConta = contaPoupanca.numeroConta;
          break;

        case "jovem":
          if (!contaData.numeroContaResponsavel) {
            showFeedback("Erro de Validação", "Informe o número da conta do responsável.", "error");
            return;
          }
          const contaJovem = await contaAPI.criarContaJovem({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
            numeroContaResponsavel: contaData.numeroContaResponsavel,
          });
          numeroNovaConta = contaJovem.numeroConta;
          break;

        case "global":
          const contaGlobal = await contaAPI.criarContaGlobal({
            agencia: contaData.agencia,
            titularCpfs,
            senha: contaData.senha,
          });
          numeroNovaConta = contaGlobal.numeroConta;
          break;
      }

      showFeedback("Conta Criada com Sucesso!", `A nova conta ${numeroNovaConta} foi aberta para o(s) cliente(s) ${clientes.map(c => c.nomeCompleto).join(', ')}.`, "success");

      // Reset
      setCpf("");
      setCpfConjuge("");
      setClientes([]);
      setTipoConta("");
      setContaData({
        agencia: "0001",
        senha: "",
        limiteChequeEspecial: "",
        numeroContaResponsavel: "",
      });
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      showFeedback("Falha ao Criar Conta", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                    <Label htmlFor="numeroContaResponsavel">
                      Número da Conta do Responsável *
                    </Label>
                    <Input
                      id="numeroContaResponsavel"
                      value={contaData.numeroContaResponsavel}
                      onChange={(e) =>
                        setContaData({
                          ...contaData,
                          numeroContaResponsavel: e.target.value,
                        })
                      }
                      placeholder="Número da conta"
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
                      numeroContaResponsavel: "",
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

      {/* Modal de Feedback (Sucesso/Erro) */}
      <Dialog open={feedback.show} onOpenChange={(open) => setFeedback({ ...feedback, show: open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <span>{feedback.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {feedback.message}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setFeedback({ ...feedback, show: false })} className={feedback.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}