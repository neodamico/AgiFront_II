"use client";

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, MapPin, Phone, Briefcase, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { clienteAPI, enderecoAPI, validarCPF, formatarCPF } from "@/lib/api"
import type { TipoTelefone, ClienteRequest } from "@/lib/types"

// Tipagem para o estado de feedback
type FeedbackType = 'success' | 'error' | 'warning';

interface Feedback {
  title: string;
  message: string;
  type: FeedbackType;
}

// Componente para exibir o feedback na tela (estilizado com Tailwind para aparecer no canto superior direito)
const FeedbackMessage: React.FC<{ feedback: Feedback | null, onClose: () => void }> = ({ feedback, onClose }) => {
  if (!feedback) return null;

  let classes = "";
  let Icon = AlertTriangle; // Default icon

  switch (feedback.type) {
    case 'success':
      classes = "bg-green-100 border-green-400 text-green-700";
      Icon = CheckCircle;
      break;
    case 'error':
      classes = "bg-red-100 border-red-400 text-red-700";
      Icon = XCircle;
      break;
    case 'warning':
      classes = "bg-yellow-100 border-yellow-400 text-yellow-700";
      Icon = AlertTriangle;
      break;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 border-l-4 rounded-md shadow-lg transition-opacity duration-300 ease-in-out ${classes}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{feedback.title}</p>
          <p className="text-sm">{feedback.message}</p>
        </div>
        <button onClick={onClose} className="ml-auto focus:outline-none p-1 rounded-full hover:bg-opacity-75 transition-colors">
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


export function CustomerRegistration() {
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: "",
    sobrenome: "",
    dataNascimento: "",
    dataEmissaoDocumento: "",
    sexo: "",
    tipoDocumento: "",
    numeroDocumento: "",
    cpf: "",
    nomeSocial: "",
    nomePai: "",
    nomeMae: "",
    email: "",
    estadoCivil: "",
    nomeConjuge: "",
    dataNascConjuge: "",
    cpfConjuge: "",

    // Dados profissionais
    profissao: "",
    empresaAtual: "",
    cargo: "",
    rendaMensal: "",
    tempoEmprego: "",
    patrimonioEstimado: "",
    restricoesBancarias: false,
    ppe: false,

    // Endereço
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    tipoEndereco: "",

    // Telefone
    ddi: "+55",
    ddd: "",
    numeroTelefone: "",
    tipoTelefone: "",
  });

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", type: "success" });

  // Função para exibir o feedback
  const showFeedback = (title: string, message: string, type: FeedbackType) => {
    setFeedback({ title, message, type });
    setTimeout(() => setFeedback(null), 3000); // Limpa a mensagem após 3 segundos
  };

  // Função para exibir o modal
  const showFriendlyModal = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

  const handleCPFChange = (value: string) => {
    setFormData({ ...formData, cpf: value });
    const cleanCPF = value.replace(/\D/g, "");
    if (cleanCPF.length === 11) {
      setCpfValid(validarCPF(value));
    } else {
      setCpfValid(null);
    }
  };

  const handleCancel = () => {
    // Reseta todos os estados do formulário para seus valores iniciais
    setFormData({
      // Dados pessoais
      nome: "",
      sobrenome: "",
      dataNascimento: "",
      dataEmissaoDocumento: "",
      sexo: "",
      tipoDocumento: "",
      numeroDocumento: "",
      cpf: "",
      nomeSocial: "",
      nomePai: "",
      nomeMae: "",
      email: "",
      estadoCivil: "",
      nomeConjuge: "",
      dataNascConjuge: "",
      cpfConjuge: "",
      // Dados profissionais
      profissao: "",
      empresaAtual: "",
      cargo: "",
      rendaMensal: "",
      tempoEmprego: "",
      patrimonioEstimado: "",
      restricoesBancarias: false,
      ppe: false,
      // Endereço
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      tipoEndereco: "",
      // Telefone
      ddi: "+55",
      ddd: "",
      numeroTelefone: "",
      tipoTelefone: "",
    });

    // Reseta outros estados relevantes
    setArquivo(null);
    setCpfValid(null);
    setLoading(false);
    setLoadingCep(false);

    // Fecha o modal de feedback, se estiver aberto
    setShowModal(false);
  };

  const handleCepChange = async (value: string) => {
    setFormData({ ...formData, cep: value });
    const cleanCep = value.replace(/\D/g, "");

    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        console.log("[v0] Buscando CEP:", cleanCep);
        const response = await enderecoAPI.buscarPorCep(cleanCep);
        console.log("[v0] Resposta do CEP:", response);

        if (response && !response.erro) {
          setFormData(prev => ({
            ...prev,
            cep: value,
            logradouro: response.logradouro || "",
            bairro: response.bairro || "",
            cidade: response.localidade || "",
            estado: response.uf || "",
          }));
          showFeedback("Busca de CEP", "Endereço preenchido automaticamente.", "success");
        } else {
          showFeedback("Aviso", "CEP encontrado, mas sem dados de logradouro. Preencha manualmente.", "warning");
        }
      } catch (error) {
        console.error("[v0] Erro ao buscar CEP:", error);
        showFeedback("Erro de Conexão", "Não foi possível buscar o CEP automaticamente. Verifique sua conexão ou preencha manualmente.", "error");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null); // Limpa mensagens anteriores

    if (!cpfValid) {
      showFriendlyModal("Erro de Validação", "O CPF inserido é inválido. Por favor, verifique e tente novamente.", "error");
      return;
    }

    if (
      !formData.nome || !formData.sobrenome || !formData.dataNascimento ||
      !formData.cpf || !formData.email || !formData.cep || !formData.numeroTelefone ||
      !formData.profissao || !formData.empresaAtual || !formData.cargo ||
      !formData.rendaMensal || !formData.tempoEmprego || !formData.tipoDocumento ||
      !formData.numeroDocumento || !formData.dataEmissaoDocumento ||
      !formData.estadoCivil || !formData.nomeMae || !formData.logradouro ||
      !formData.numero || !formData.bairro || !formData.cidade ||
      !formData.estado || !formData.tipoEndereco || !formData.ddd ||
      !formData.tipoTelefone
    ) {
      showFriendlyModal("Atenção", "Por favor, preencha todos os campos obrigatórios marcados com (*).", "error");
      return;
    }

    setLoading(true);

    try {
      console.log("[v1] Criando cliente com arquivo(multipart/form-data)...");

      const gerenteId = localStorage.getItem("gerenteId");

      if (!gerenteId) {
        showFriendlyModal("Erro de Autenticação", "Não foi possível identificar o gerente. Por favor, faça login novamente.", "error");
        setLoading(false);
        return;
      }

      const clienteData: ClienteRequest = {
        nomeCompleto: `${formData.nome} ${formData.sobrenome}`,
        email: formData.email,
        cpf: formData.cpf.replace(/\D/g, ""),
        gerenteId: Number(gerenteId),
        dataNascimento: formData.dataNascimento,
        dataEmissaoDocumento: formData.dataEmissaoDocumento,
        rg: formData.numeroDocumento,
        estadoCivil: formData.estadoCivil.toUpperCase(),
        nomeMae: formData.nomeMae,
        nomePai: formData.nomePai || "",
        nomeSocial: formData.nomeSocial || "",
        profissao: formData.profissao,
        empresaAtual: formData.empresaAtual,
        cargo: formData.cargo,
        rendaMensal: Number(formData.rendaMensal),
        tempoEmprego: Number(formData.tempoEmprego),
        patrimonioEstimado: formData.patrimonioEstimado ? Number(formData.patrimonioEstimado) : 0,
        possuiRestricoesBancarias: formData.restricoesBancarias,
        ePpe: formData.ppe,
        role: "CLIENTE",
        ddi: formData.ddi,
        ddd: formData.ddd,
        numeroTelefone: formData.numeroTelefone,
        tipoTelefone: formData.tipoTelefone.toUpperCase() as TipoTelefone,
        cep: formData.cep.replace(/\D/g, ""),
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento || "",
        bairro: formData.bairro || "",
        cidade: formData.cidade,
        uf: formData.estado,
        tipoEndereco: formData.tipoEndereco.toUpperCase(),
      }

      const formDataToSend = new FormData()
      formDataToSend.append("cliente", new Blob([JSON.stringify(clienteData)], { type: "application/json" }))
      if (arquivo) {
        formDataToSend.append("arquivo", arquivo)
      }

      const response = await fetch(`http://localhost:8080/api/v1/clientes`, {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorText = await response.text();
        let message = "Ocorreu um erro ao tentar cadastrar o cliente. Por favor, tente novamente.";

        if (errorText.includes("CPF já cadastrado")) {
          message = "Este CPF já está cadastrado em nossa base de dados. Por favor, verifique o CPF ou entre em contato com o suporte.";
        } else if (errorText.includes("Email já cadastrado")) {
          message = "Este e-mail já está em uso por outro cliente.";
        } else if (errorText.includes("RG já cadastrado")) {
          message = "Este RG já está cadastrado em nossa base de dados.";
        }

        throw new Error(message);
      }

      const clienteResponse = await response.json();

      console.log("[v1] Cliente criado:", clienteResponse);
      showFriendlyModal("Sucesso no Cadastro", `O cliente ${clienteResponse.nomeCompleto} foi cadastrado com sucesso!`, "success");

      setFormData({
        nome: "",
        sobrenome: "",
        dataNascimento: "",
        dataEmissaoDocumento: "",
        sexo: "",
        tipoDocumento: "",
        numeroDocumento: "",
        cpf: "",
        nomeSocial: "",
        nomePai: "",
        nomeMae: "",
        email: "",
        estadoCivil: "",
        nomeConjuge: "",
        dataNascConjuge: "",
        cpfConjuge: "",
        profissao: "",
        empresaAtual: "",
        cargo: "",
        rendaMensal: "",
        tempoEmprego: "",
        patrimonioEstimado: "",
        restricoesBancarias: false,
        ppe: false,
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        tipoEndereco: "",
        ddi: "+55",
        ddd: "",
        numeroTelefone: "",
        tipoTelefone: "",
      })
      setArquivo(null)
      setCpfValid(null)
    } catch (error: any) {
      console.error("[v1] Erro ao cadastrar cliente:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado. Por favor, tente novamente.";
      showFriendlyModal("Falha no Cadastro", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <FeedbackMessage feedback={feedback} onClose={() => setFeedback(null)} />
      <Card className="banking-terminal">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-primary">
            <User className="w-5 h-5" />
            <span>Cadastro de Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="sobrenome">Sobrenome *</Label>
                  <Input
                    id="sobrenome"
                    value={formData.sobrenome}
                    onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeSocial">Nome Social</Label>
                  <Input
                    id="nomeSocial"
                    value={formData.nomeSocial}
                    onChange={(e) => setFormData({ ...formData, nomeSocial: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="nomePai">Nome do Pai</Label>
                  <Input
                    id="nomePai"
                    value={formData.nomePai}
                    onChange={(e) => setFormData({ ...formData, nomePai: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeMae">Nome da Mãe *</Label>
                  <Input
                    id="nomeMae"
                    value={formData.nomeMae}
                    onChange={(e) => setFormData({ ...formData, nomeMae: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo}
                    onValueChange={(value) => setFormData({ ...formData, sexo: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rg">RG</SelectItem>
                      <SelectItem value="cnh">CNH</SelectItem>
                      <SelectItem value="passaporte">Passaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numeroDocumento">Número do Documento *</Label>
                  <Input
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="dataEmissaoDocumento">Data de Emissão do Documento *</Label>
                  <Input
                    id="dataEmissaoDocumento"
                    type="date"
                    value={formData.dataEmissaoDocumento}
                    onChange={(e) => setFormData({ ...formData, dataEmissaoDocumento: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="arquivo">Documento (RG / CNH / Passaporte) *</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  {arquivo && (
                    <p className="text-sm text-gray-500 mt-1">
                      Arquivo selecionado: {arquivo.name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={cpfValid === false ? "border-destructive" : cpfValid === true ? "border-green-500" : ""}
                    required
                    maxLength={14}
                    disabled={loading}
                  />
                  {cpfValid === false && <p className="text-destructive text-sm mt-1">CPF inválido</p>}
                  {cpfValid === true && <p className="text-green-600 text-sm mt-1">CPF válido</p>}
                </div>
                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="estadoCivil">Estado Civil *</Label>
                  <Select
                    value={formData.estadoCivil}
                    onValueChange={(value) => setFormData({ ...formData, estadoCivil: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      <SelectItem value="uniao-estavel">União Estável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(formData.estadoCivil === "casado" || formData.estadoCivil === "uniao-estavel") && (
                  <>
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                      <div>
                        <Label htmlFor="nomeConjuge">Nome do Cônjuge</Label>
                        <Input
                          id="nomeConjuge"
                          value={formData.nomeConjuge}
                          onChange={(e) => setFormData({ ...formData, nomeConjuge: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dataNascConjuge">Data Nasc. Cônjuge</Label>
                        <Input
                          id="dataNascConjuge"
                          type="date"
                          value={formData.dataNascConjuge}
                          onChange={(e) => setFormData({ ...formData, dataNascConjuge: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpfConjuge">CPF do Cônjuge</Label>
                        <Input
                          id="cpfConjuge"
                          value={formData.cpfConjuge}
                          onChange={(e) => setFormData({ ...formData, cpfConjuge: e.target.value })}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Dados Profissionais</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="profissao">Profissão *</Label>
                  <Input
                    id="profissao"
                    value={formData.profissao}
                    onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="empresaAtual">Empresa Atual *</Label>
                  <Input
                    id="empresaAtual"
                    value={formData.empresaAtual}
                    onChange={(e) => setFormData({ ...formData, empresaAtual: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="rendaMensal">Salário Mensal *</Label>
                  <Input
                    id="rendaMensal"
                    type="number"
                    value={formData.rendaMensal}
                    onChange={(e) => setFormData({ ...formData, rendaMensal: e.target.value })}
                    placeholder="R$ 0,00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="tempoEmprego">Tempo de Emprego (meses) *</Label>
                  <Input
                    id="tempoEmprego"
                    type="number"
                    value={formData.tempoEmprego}
                    onChange={(e) => setFormData({ ...formData, tempoEmprego: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="patrimonioEstimado">Patrimônio Estimado</Label>
                  <Input
                    id="patrimonioEstimado"
                    type="number"
                    value={formData.patrimonioEstimado}
                    onChange={(e) => setFormData({ ...formData, patrimonioEstimado: e.target.value })}
                    placeholder="R$ 0,00"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restricoesBancarias"
                    checked={formData.restricoesBancarias}
                    onCheckedChange={(checked) => setFormData({ ...formData, restricoesBancarias: checked as boolean })}
                    disabled={loading}
                  />
                  <Label htmlFor="restricoesBancarias">Possui restrições bancárias?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ppe"
                    checked={formData.ppe}
                    onCheckedChange={(checked) => setFormData({ ...formData, ppe: checked as boolean })}
                    disabled={loading}
                  />
                  <Label htmlFor="ppe">É pessoa politicamente exposta (PPE)?</Label>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Endereço</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    required
                    disabled={loading || loadingCep}
                  />
                  {loadingCep && <p className="text-sm text-muted-foreground mt-1">Buscando CEP...</p>}
                </div>
                <div>
                  <Label htmlFor="logradouro">Logradouro *</Label>
                  <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipoEndereco">Tipo de Endereço *</Label>
                  <Select
                    value={formData.tipoEndereco}
                    onValueChange={(value) => setFormData({ ...formData, tipoEndereco: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residencial">Residencial</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Telefone */}
            <div className="form-section p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Telefone</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ddd">DDD *</Label>
                  <Input
                    id="ddd"
                    value={formData.ddd}
                    onChange={(e) => setFormData({ ...formData, ddd: e.target.value })}
                    placeholder="11"
                    maxLength={2}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="numeroTelefone">Número *</Label>
                  <Input
                    id="numeroTelefone"
                    value={formData.numeroTelefone}
                    onChange={(e) => setFormData({ ...formData, numeroTelefone: e.target.value })}
                    placeholder="99999-9999"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="tipoTelefone">Tipo *</Label>
                  <Select
                    value={formData.tipoTelefone}
                    onValueChange={(value) => setFormData({ ...formData, tipoTelefone: value })}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celular">Celular</SelectItem>
                      <SelectItem value="fixo">Fixo</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading || !cpfValid}>
                {loading ? "Cadastrando..." : "Cadastrar Cliente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Feedback */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center space-x-2 ${modalContent.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {modalContent.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <span>{modalContent.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {modalContent.message}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)} className={modalContent.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}