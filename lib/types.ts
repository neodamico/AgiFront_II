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
  nome: string
  senha: string
  email: string
  cpf: string
  gerenteId?: number
  // Telefone embutido
  ddi: string
  ddd: string
  numeroTelefone: string
  tipoTelefone: TipoTelefone
  // Endereço embutido
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  cidade: string
  uf: string
  tipoEndereco: string
}

export interface ClienteUpdateRequest {
  nome?: string
  email?: string
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
  saldo: number
  titularIds: number[]
  limiteChequeEspecial: number
}

export interface ContaPoupRequest {
  numeroConta: string
  agencia: string
  saldo: number
  titularIds: number[]
  diaAniversario: number
}

export interface ContaJovemRequest {
  numeroConta: string
  agencia: string
  saldo: number
  titularIds: number[]
  responsavelId: number
}

export interface ContaGlobalRequest {
  numeroConta: string
  agencia: string
  saldoDolares: number
  titularIds: number[]
  codigoSwift: string
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
  nome: string
  email: string
  cpf: string
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
}

export interface ContaPoupResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  diaAniversario: number
  rendimento: number
  titularIds: number[]
}

export interface ContaJovemResponse {
  id: number
  numeroConta: string
  agencia: string
  saldo: number
  responsavelTitularDTO: ResponsavelTitularDTO
  titularIds: number[]
}

export interface ContaGlobalResponse {
  id: number
  numeroConta: string
  agencia: string
  saldoDolares: number
  codigoSwift: string
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
