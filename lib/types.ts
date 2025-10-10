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
  SAQUE = "SAQUE",
  DEPOSITO = "DEPOSITO",
  TRANSFERENCIA = "TRANSFERENCIA",
  SAQUE_INTERNACIONAL = "SAQUE_INTERNACIONAL",
  DEPOSITO_INTERNACIONAL = "DEPOSITO_INTERNACIONAL",
  TRANSFERENCIA_INTERNACIONAL = "TRANSFERENCIA_INTERNACIONAL",
}

export enum TipoEndereco {
  PROPRIO = "PROPRIO",
  ALUGADO = "ALUGADO",
}

export enum StatusConta {
  ATIVA = "ATIVA",
  EXCLUIDA = "EXCLUIDA",
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
  senha: string
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
  salarioMensal: number
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
  cidade: string
  uf: string
  tipoEndereco: string
}

export interface ClienteUpdateRequest {
  nomeCompleto?: string
  email?: string
  dataNascimento?: string
  rg?: string
  dataEmissaoDocumento?: string
  estadoCivil?: string
  nomeMae?: string
  nomePai?: string
  nomeSocial?: string
  profissao?: string
  empresaAtual?: string
  cargo?: string
  salarioMensal?: number
  tempoEmprego?: number
  patrimonioEstimado?: number
  possuiRestricoesBancarias?: boolean
  ePpe?: boolean
}

export interface EnderecoRequest {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
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
  cidade?: string
  estado?: string
  tipoEndereco?: string
}

export interface ContaCorrenteRequest {
  numeroConta: string
  agencia: string
  titularIds: number[]
  limiteChequeEspecial: number
}

export interface ContaPoupRequest {
  numeroConta: string
  agencia: string
  titularIds: number[]
}

export interface ContaJovemRequest {
  numeroConta: string
  agencia: string
  titularIds: number[]
  responsavelId: number
}

export interface ContaGlobalRequest {
  numeroConta: string
  agencia: string
  titularIds: number[]
}

export interface ContaUpdateRequest {
  numeroConta?: string
  agencia?: string
  cpf: string
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
  salarioMensal: number
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
  titularIds: number[]
  statusConta: StatusConta
  tipoConta: string
}

export interface ContaPoupResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  diaAniversario: number
  rendimento: number
  tipoConta: string
  titularIds: number[]
  statusConta: StatusConta
}

export interface ContaJovemResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  responsavelId: number
  titularIds: number[]
  statusConta: StatusConta
  tipoConta: string
}

export interface ContaGlobalResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  saldoDolares: number
  codigoSwift: string
  titularIds: number[]
  statusConta: StatusConta
  tipoConta: string
}

export interface ContaUpdateResponse {
  agencia: string
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
