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
import {
  Search,
  Edit,
  User,
  FileText,
  MapPin,
  Phone,
  Briefcase,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  clienteAPI,
  validarCPF,
  formatarCPF,
  formatarTelefone,
} from "@/lib/api";
import type { ClienteResponse, ClienteUpdateRequest } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// --- Tipo para o modal de feedback ---
interface FeedbackState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
}

// --- Função utilitária para formatar mensagens de erro do backend para serem amigáveis ao usuário. ---
const formatErrorMessage = (error: any): string => {
  let errorMessage = "Ocorreu uma falha inesperada. Tente novamente.";
  let errorMsg = error?.message || "";

  if (errorMsg.includes("404") || errorMsg.toLowerCase().includes("not found")) {
    errorMessage = "Cliente não encontrado com o CPF informado.";
  } else if (errorMsg.includes("500") || errorMsg.toLowerCase().includes("falha na comunicacao")) {
    errorMessage = "Falha na comunicação com o servidor. Verifique sua conexão e tente novamente.";
  } else if (errorMsg.toLowerCase().includes("cpf inválido")) {
    errorMessage = "CPF inválido. Verifique o número e tente novamente.";
  } else if (errorMsg.toLowerCase().includes("falha na validacao dos dados")) {
    errorMessage = "Alguns dados fornecidos são inválidos. Por favor, verifique-os e tente novamente.";
  }
  return errorMessage;
};


export function CustomerSearch() {
  const [searchCpf, setSearchCpf] = useState("");
  const [cliente, setCliente] = useState<ClienteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    show: false,
    title: "",
    message: "",
    type: 'success',
  });
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
    rendaMensal: 0,
    tempoEmprego: 0,
    patrimonioEstimado: 0,
    possuiRestricoesBancarias: false,
    ePpe: false,
    enderecos: [],
  });

  // Exibe o modal de feedback
  const showFeedback = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ show: true, title, message, type });
  };

  const safeDate = (value: string | undefined) =>
    value ? new Date(value).toLocaleDateString("pt-BR") : "Não informado";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCpf = searchCpf.replace(/\D/g, "");

    if (!validarCPF(cleanCpf)) {
      showFeedback("Erro de Validação", "CPF inválido. Por favor, verifique o número e tente novamente.", "error");
      return;
    }

    setLoading(true);
    setCliente(null);
    setEditing(false);

    try {
      const clienteEncontrado = await clienteAPI.buscarPorCpf(cleanCpf);

      if (clienteEncontrado) {
        setCliente(clienteEncontrado);
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
          rendaMensal: clienteEncontrado.rendaMensal ?? 0,
          tempoEmprego: clienteEncontrado.tempoEmprego ?? 0,
          patrimonioEstimado: clienteEncontrado.patrimonioEstimado ?? 0,
          possuiRestricoesBancarias:
            clienteEncontrado.possuiRestricoesBancarias,
          ePpe: clienteEncontrado.ePpe,
          enderecos: clienteEncontrado.enderecos || [],
        });
        showFeedback("Cliente Encontrado", `Dados de ${clienteEncontrado.nomeCompleto} carregados com sucesso.`, "success");
      } else {
        showFeedback("Cliente Não Encontrado", "Nenhum cliente foi encontrado com o CPF informado.", "error");
      }
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      showFeedback("Erro na Busca", formatErrorMessage(error), "error");
      setCliente(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;

    setLoading(true);
    try {
      // Pega o primeiro endereço de editData.enderecos (ou objeto padrão se vazio)
      const endereco = editData.enderecos && editData.enderecos.length > 0 ? editData.enderecos[0] : {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        tipoEndereco: "RESIDENCIAL",
        idEndereco: 0,
        clienteId: cliente.id,
      };

      // Constrói o corpo da requisição no formato esperado pela API
      const dadosParaEnviar = {
        ...editData,
        cep: endereco.cep ?? "",
        logradouro: endereco.logradouro ?? "",
        numero: endereco.numero ?? "",
        complemento: endereco.complemento ?? "",
        bairro: endereco.bairro ?? "",
        cidade: endereco.cidade ?? "",
        estado: endereco.estado ?? "",
        tipoEndereco: endereco.tipoEndereco ?? "RESIDENCIAL",
        // Remove a propriedade enderecos para evitar conflito
        enderecos: undefined,
      };

      const clienteAtualizado = await clienteAPI.atualizar(cliente.id, dadosParaEnviar);

      setCliente(clienteAtualizado);
      setEditing(false);
      showFeedback("Atualização Concluída", "Os dados do cliente foram atualizados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      showFeedback("Falha na Atualização", formatErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

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
        rendaMensal: cliente.rendaMensal ?? 0,
        tempoEmprego: cliente.tempoEmprego ?? 0,
        patrimonioEstimado: cliente.patrimonioEstimado ?? 0,
        possuiRestricoesBancarias: cliente.possuiRestricoesBancarias,
        ePpe: cliente.ePpe,
        enderecos: cliente.enderecos || [],
      });
    }
    setEditing(false);
    showFeedback("Edição Cancelada", "Nenhuma alteração foi salva.", "error");
  };

  return (
    <>
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
                    onChange={(e) => setSearchCpf(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    required
                    disabled={loading}
                    maxLength={14}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={loading}
                  >
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
                        <Label className="text-sm font-semibold">
                          Nome Completo
                        </Label>
                        <p className="text-base mt-1">{cliente.nomeCompleto}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Nome Social
                        </Label>
                        <p className="text-base mt-1">
                          {cliente.nomeSocial || "Não informado"}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">CPF</Label>
                        <p className="text-base mt-1">
                          {formatarCPF(cliente.cpf)}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">RG</Label>
                        <p className="text-base mt-1">{cliente.rg}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Data Emissão RG
                        </Label>
                        <p className="text-base mt-1">
                          {safeDate(cliente.dataEmissaoDocumento)}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Data de Nascimento
                        </Label>
                        <p className="text-base mt-1">
                          {safeDate(cliente.dataNascimento)}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Estado Civil
                        </Label>
                        <p className="text-base mt-1">{cliente.estadoCivil}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">Email</Label>
                        <p className="text-base mt-1">{cliente.email}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Nome da Mãe
                        </Label>
                        <p className="text-base mt-1">{cliente.nomeMae}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Nome do Pai
                        </Label>
                        <p className="text-base mt-1">
                          {cliente.nomePai || "Não informado"}
                        </p>
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
                        <Label className="text-sm font-semibold">
                          Empresa Atual
                        </Label>
                        <p className="text-base mt-1">{cliente.empresaAtual}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">Cargo</Label>
                        <p className="text-base mt-1">{cliente.cargo}</p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Salário Mensal
                        </Label>
                        <p className="text-base mt-1">
                          R${" "}
                          {(cliente.rendaMensal ?? 0).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Tempo de Emprego (meses)
                        </Label>
                        <p className="text-base mt-1">
                          {cliente.tempoEmprego ?? 0}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Patrimônio Estimado
                        </Label>
                        <p className="text-base mt-1">
                          R${" "}
                          {(cliente.patrimonioEstimado ?? 0).toLocaleString(
                            "pt-BR",
                            { minimumFractionDigits: 2 }
                          )}
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
                        <Label className="text-sm font-semibold">
                          Possui Restrições Bancárias
                        </Label>
                        <p className="text-base mt-1">
                          {cliente.possuiRestricoesBancarias ? "Sim" : "Não"}
                        </p>
                      </div>
                      <div className="form-section p-3 rounded-lg">
                        <Label className="text-sm font-semibold">
                          Pessoa Politicamente Exposta (PPE)
                        </Label>
                        <p className="text-base mt-1">
                          {cliente.ePpe ? "Sim" : "Não"}
                        </p>
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
                          <Label className="text-sm font-semibold">
                            Telefone
                          </Label>
                          <p className="text-base mt-1">
                            +{cliente.telefoneResponse.ddi}{" "}
                            {formatarTelefone(
                              cliente.telefoneResponse.ddd,
                              cliente.telefoneResponse.numero
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {cliente.telefoneResponse.tipoTelefone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documento RG */}
                  {cliente.documento && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-primary flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>Documento de Identificação</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-section p-3 rounded-lg">
                          <Label className="text-sm font-semibold">
                            Nome do Arquivo
                          </Label>
                          <p className="text-base mt-1">
                            {cliente.documento.nomeArquivo}
                          </p>
                        </div>
                        <div className="form-section p-3 rounded-lg">
                          <Label className="text-sm font-semibold">
                            Tipo de Arquivo
                          </Label>
                          <p className="text-base mt-1">
                            {cliente.documento.tipoArquivo}
                          </p>
                        </div>

                        <div className="form-section p-3 rounded-lg flex items-end">
                          <a
                            href={`http://localhost:8080/api/v1/clientes/${cliente.id}/documento`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={cliente.documento.nomeArquivo}
                          >
                            <Button variant="outline" size="sm">
                              Visualizar / Baixar
                            </Button>
                          </a>
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
                          <div
                            key={endereco.idEndereco}
                            className="form-section p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-semibold">
                                {endereco.tipoEndereco}
                              </Label>
                            </div>
                            <p className="text-base">
                              {endereco.logradouro}, {endereco.numero}
                              {endereco.complemento &&
                                ` - ${endereco.complemento}`}
                            </p>
                            <p className="text-base">
                              {endereco.cidade} - {endereco.estado}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              CEP: {endereco.cep}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* ... Campos de edição (inalterados) ... */}
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>

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