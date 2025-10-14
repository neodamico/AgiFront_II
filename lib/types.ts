// ============= ENUMS =============
export enum UserRole {
  GERENTE = "GERENTE",
  CLIENTE = "CLIENTE",
}

export enum TipoTelefone {
  CELULAR = "CELULAR",
  FIXO = "FIXO",
  COMERCIAL = "COMERCIAL",
}

export enum TipoTransacao {
  DEPOSITO = "DEPOSITO",
  SAQUE = "SAQUE",
  TRANSFERENCIA = "TRANSFERENCIA",
  TRANSFERENCIA_ENVIADA = "TRANSFERENCIA_ENVIADA",
  TRANSFERENCIA_RECEBIDA = "TRANSFERENCIA_RECEBIDA",
}

export enum TipoEndereco {
  PROPRIO = "PROPRIO",
  ALUGADO = "ALUGADO",
}

export enum StatusConta {
  ATIVA = "ATIVA",
  EXCLUIDA = "EXCLUIDA",
}

export enum SegmentoCliente {
  CLASS = "CLASS",
  ADVANCED = "ADVANCED",
  PREMIUM = "PREMIUM",
}

export enum StatusDebito {
  ATIVO = "ATIVO",
  SUSPENSO = "SUSPENSO",
  CANCELADO = "CANCELADO",
  ERRO_PROCESSAMENTO = "ERRO_PROCESSAMENTO",
}

export enum TipoServico {
  ENERGIA = "ENERGIA",
  AGUA_SANEAMENTO = "AGUA_SANEAMENTO",
  TELEFONIA_FIXA_MOVEL = "TELEFONIA_FIXA_MOVEL",
  INTERNET_TV = "INTERNET_TV",
  IPVA = "IPVA",
  OUTROS = "OUTROS",
}

export enum FrequenciaDebito {
  SEMANAL = "SEMANAL",
  MENSAL = "MENSAL",
  ANUAL = "ANUAL",
}

// ============= DTOs DE REQUEST =============

export interface LoginRequest {
  gerenteId: number
  senha: string
}

export interface GerenteRequest {
  nome: string
  senha: string
  email: string
  matricula: string
}

export interface ClienteRequest {
  nomeCompleto: string
  email: string
  cpf: string
  gerenteId?: number
  dataNascimento: string // formato: YYYY-MM-DD
  rg: string
  dataEmissaoDocumento: string // formato: YYYY-MM-DD
  estadoCivil: string
  nomeMae: string
  nomePai?: string
  nomeSocial?: string
  profissao: string
  empresaAtual: string
  cargo: string
  rendaMensal: number
  tempoEmprego: number
  patrimonioEstimado?: number
  possuiRestricoesBancarias: boolean
  ePpe: boolean
  role: string
  ddi: string
  ddd: string
  numeroTelefone: string
  tipoTelefone: TipoTelefone
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  uf: string
  tipoEndereco: string
}

export interface ClienteUpdateRequest {
  id?: number
  nomeCompleto?: string
  email?: string
  cpf?: string
  dataNascimento?: string
  rg?: string
  dataEmissaoDocumento?: string
  nomePai?: string
  nomeMae?: string
  estadoCivil?: string
  nomeSocial?: string
  profissao?: string
  empresaAtual?: string
  cargo?: string
  rendaMensal?: number
  tempoEmprego?: number
  patrimonioEstimado?: number
  possuiRestricoesBancarias?: boolean
  ePpe?: boolean
  role?: UserRole
  enderecos?: EnderecoResponse[]
  telefoneResponse?: TelefoneResponse
}

export interface EnderecoRequest {
  idEndereco?: number // Adicionado para atualização de endereços existentes
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  tipoEndereco: string
  clienteId: number
}

export interface EnderecoUpdateRequest {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  tipoEndereco?: string
}

export interface ContaCorrenteRequest {
  agencia: string
  titularCpfs: string[]
  senha: string
  limiteChequeEspecial?: number
}

export interface ContaPoupRequest {
  agencia: string
  titularCpfs: string[]
  senha: string
}

export interface ContaJovemRequest {
  agencia: string
  titularCpfs: string[]
  senha: string
  numeroContaResponsavel: string
}

export interface ContaGlobalRequest {
  agencia: string
  titularCpfs: string[]
  senha: string
}

export interface ContaUpdateRequest {
  numeroConta?: string
  agencia?: string
  cpf: string
}

export interface TransferenciaRequest {
  contaOrigemId: number
  contaDestinoId: number
  valor: number
  senha: string
  motivoMovimentacao?: string
}

export interface DepositoRequest {
  contaId: number
  valor: number
  senha: string
  motivoMovimentacao?: string
}

export interface SaqueRequest {
  contaId: number
  valor: number
  senha: string
  motivoMovimentacao?: string
}

export interface SaqueInternacionalRequest {
  contaId: number
  valorDolares: number
  motivoMovimentacao?: string
}

export interface DepositoInternacionalRequest {
  contaId: number
  valorDolares: number
  motivoMovimentacao?: string
}

export interface DebitoAutomaticoRequest {
  contaId: number
  diaAgendado: number // 1-28
  tipoServico: TipoServico
  frequencia: FrequenciaDebito // Mudado de string para enum FrequenciaDebito
  identificadorConvenio: string
  descricao?: string
}

// ============= DTOs DE RESPONSE =============

export interface GerenteResponse {
  gerenteId: number
  nome: string
  email: string
  matricula: string
}

export interface ClienteResponse {
  id: number
  nomeCompleto: string
  email: string
  cpf: string
  dataNascimento: string
  rg: string
  dataEmissaoDocumento: string
  nomePai: string
  nomeMae: string
  estadoCivil: string
  nomeSocial: string | null
  profissao: string
  empresaAtual: string
  cargo: string
  rendaMensal: number
  tempoEmprego: number
  patrimonioEstimado: number
  possuiRestricoesBancarias: boolean
  ePpe: boolean
  role: UserRole
  enderecos: EnderecoResponse[]
  telefoneResponse: TelefoneResponse
}

export interface EnderecoResponse {
  idEndereco: number
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  tipoEndereco: string
  clienteId: number
}

export interface ContaCorrenteResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  limiteChequeEspecial: number
  titularCpfs: string[]
  statusConta: StatusConta
  tipoConta: string
  segmentoCliente?: SegmentoCliente;
}

export interface ContaPoupResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  diaAniversario: number
  rendimento: number
  tipoConta: string
  titularCpfs: string[]
  statusConta: StatusConta
  segmentoCliente?: SegmentoCliente
}

export interface ContaJovemResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  numeroContaResponsavel: string
  titularCpfs: string[]
  statusConta: StatusConta
  tipoConta: string
  segmentoCliente?: SegmentoCliente;
}

export interface ContaGlobalResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  saldoDolar: number
  codigoSwift: string
  titularCpfs: string[]
  statusConta: StatusConta
  tipoConta: string
  segmentoCliente?: SegmentoCliente;
}

export interface ContaUpdateResponse {
  agencia: string
}

export interface TransacaoResponse {
  id: number
  nsUnico: string
  tipo: TipoTransacao
  valor: number
  dataHora: string
  contaOrigemId?: number
  numeroContaOrigem?: string
  contaDestinoId?: number
  numeroContaDestino?: string
  gerenteExecutorId: number
  nomeGerenteExecutor: string
  motivoMovimentacao?: string
}

export interface DebitoAutomaticoResponse {
  id: number
  contaId: number
  diaAgendado: number
  frequencia: FrequenciaDebito // Mudado de string para enum FrequenciaDebito
  tipoServico: TipoServico
  status: StatusDebito
  identificadorConvenio: string
  descricao: string
}

export interface ResponsavelTitularDTO {
  id: number
  nome: string
}

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: string
}

// ============= TIPOS AUXILIARES =============

export interface Telefone {
  ddi: string
  ddd: string
  numero: string
  tipoTelefone: TipoTelefone
}

export interface Endereco {
  idEndereco?: number
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  tipoEndereco: string
  clienteId?: number
}

export interface TelefoneResponse {
  ddi: string
  ddd: string
  numero: string
  tipoTelefone: TipoTelefone
}

export type ContaResponse = ContaCorrenteResponse | ContaPoupResponse | ContaJovemResponse | ContaGlobalResponse

export interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: Record<string, number>
}
