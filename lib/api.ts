import type {
  LoginRequest,
  GerenteRequest,
  GerenteResponse,
  ClienteRequest,
  ClienteResponse,
  ClienteUpdateRequest,
  EnderecoRequest,
  EnderecoResponse,
  EnderecoUpdateRequest,
  ViaCepResponse,
  ContaCorrenteRequest,
  ContaCorrenteResponse,
  ContaPoupRequest,
  ContaPoupResponse,
  ContaJovemRequest,
  ContaJovemResponse,
  ContaGlobalRequest,
  ContaGlobalResponse,
  ContaUpdateRequest,
  ContaUpdateResponse,
  TransferenciaRequest,
  TransacaoResponse,
  DepositoRequest,
  SaqueRequest,
  DebitoAutomaticoRequest,
  DebitoAutomaticoResponse,
  SaqueInternacionalRequest,
  DepositoInternacionalRequest,
} from "./types"

// A URL base da sua API real
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

// Função auxiliar para fazer requisições
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  })

  if (!response.ok) {
    // Tenta ler a mensagem de erro do corpo da resposta
    const errorText = await response.text()
    console.error(`Erro na requisição para ${endpoint}: ${response.status} - ${errorText}`)
    throw new Error(errorText || `HTTP error! status: ${response.status}`)
  }

  // Se for 204 No Content, retorna null
  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

// ============= GERENTE API =============
export const gerenteAPI = {
  login: async (data: LoginRequest): Promise<GerenteResponse> => {
    return fetchAPI<GerenteResponse>("/gerentes/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  criar: async (data: GerenteRequest): Promise<GerenteResponse> => {
    return fetchAPI<GerenteResponse>("/gerentes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  listarTodos: async (): Promise<GerenteResponse[]> => {
    return fetchAPI<GerenteResponse[]>("/gerentes", {
      method: "GET",
    })
  },

  buscarPorId: async (id: number): Promise<GerenteResponse> => {
    return fetchAPI<GerenteResponse>(`/gerentes/${id}`, {
      method: "GET",
    })
  },

  atualizar: async (id: number, data: GerenteRequest): Promise<GerenteResponse> => {
    return fetchAPI<GerenteResponse>(`/gerentes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deletar: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/gerentes/${id}`, {
      method: "DELETE",
    })
  },
}

// ============= CLIENTE API =============
export const clienteAPI = {
  criar: async (data: ClienteRequest): Promise<ClienteResponse> => {
    return fetchAPI<ClienteResponse>("/clientes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  listarTodos: async (): Promise<ClienteResponse[]> => {
    return fetchAPI<ClienteResponse[]>("/clientes", {
      method: "GET",
    })
  },

  buscarPorId: async (id: number): Promise<ClienteResponse> => {
    return fetchAPI<ClienteResponse>(`/clientes/${id}`, {
      method: "GET",
    })
  },

  buscarPorCpf: async (cpf: string): Promise<ClienteResponse | undefined> => {
    const clientes = await clienteAPI.listarTodos()
    return clientes.find((c) => c.cpf === cpf)
  },

  atualizar: async (id: number, data: ClienteUpdateRequest): Promise<ClienteResponse> => {
    return fetchAPI<ClienteResponse>(`/clientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deletar: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/clientes/${id}`, {
      method: "DELETE",
    })
  },
}

// ============= ENDEREÇO API =============
export const enderecoAPI = {
  criar: async (data: EnderecoRequest): Promise<EnderecoResponse> => {
    return fetchAPI<EnderecoResponse>("/enderecos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  listarTodos: async (): Promise<EnderecoResponse[]> => {
    return fetchAPI<EnderecoResponse[]>("/enderecos", {
      method: "GET",
    })
  },

  buscarPorId: async (id: number): Promise<EnderecoResponse> => {
    return fetchAPI<EnderecoResponse>(`/enderecos/${id}`, {
      method: "GET",
    })
  },

  buscarPorCep: async (cep: string): Promise<ViaCepResponse> => {
    return fetchAPI<ViaCepResponse>(`/enderecos/cep/${cep}`, {
      method: "GET",
    })
  },

  listarPorCliente: async (clienteId: number): Promise<EnderecoResponse[]> => {
    return fetchAPI<EnderecoResponse[]>(`/enderecos/cliente/${clienteId}`, {
      method: "GET",
    })
  },

  buscarPorClienteETipo: async (clienteId: number, tipoEndereco: string): Promise<EnderecoResponse> => {
    return fetchAPI<EnderecoResponse>(`/enderecos/cliente/${clienteId}/tipo/${tipoEndereco}`, {
      method: "GET",
    })
  },

  atualizar: async (id: number, data: EnderecoUpdateRequest): Promise<EnderecoResponse> => {
    return fetchAPI<EnderecoResponse>(`/enderecos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deletar: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/enderecos/${id}`, {
      method: "DELETE",
    })
  },
}

// ============= CONTA API =============
export const contaAPI = {
  // Conta Corrente
  criarContaCorrente: async (data: ContaCorrenteRequest): Promise<ContaCorrenteResponse> => {
    return fetchAPI<ContaCorrenteResponse>("/contas/corrente", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Conta Poupança
  criarContaPoupanca: async (data: ContaPoupRequest): Promise<ContaPoupResponse> => {
    return fetchAPI<ContaPoupResponse>("/contas/poupanca", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Conta Jovem
  criarContaJovem: async (data: ContaJovemRequest): Promise<ContaJovemResponse> => {
    return fetchAPI<ContaJovemResponse>("/contas/jovem", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Conta Global/Internacional
  criarContaGlobal: async (data: ContaGlobalRequest): Promise<ContaGlobalResponse> => {
    return fetchAPI<ContaGlobalResponse>("/contas/global", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  listarTodas: async (): Promise<any[]> => {
    return fetchAPI<any[]>("/contas", {
      method: "GET",
    })
  },

  buscarPorId: async (contaId: number): Promise<any> => {
    return fetchAPI<any>(`/contas/${contaId}`, {
      method: "GET",
    })
  },

  buscarPorNumeroConta: async (numeroConta: string): Promise<any> => {
    return fetchAPI<any>(`/contas/buscar-numero/${numeroConta}`, {
      method: "GET",
    })
  },

  buscarPorCpf: async (cpf: string): Promise<any[]> => {
    return fetchAPI<any[]>(`/contas/buscar-por-cpf/${cpf}`, {
      method: "GET",
    });
  },

  consultarSaldo: async (numeroConta: string): Promise<number> => {
    const conta = await contaAPI.buscarPorNumeroConta(numeroConta)
    return conta.saldo || 0
  },

  // Atualizar conta
  atualizar: async (id: number, data: ContaUpdateRequest): Promise<ContaUpdateResponse> => {
    return fetchAPI<ContaUpdateResponse>(`/contas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // DESATIVAR CONTA 
  desativar: async (numeroConta: string, senha: string): Promise<any> => {
    return fetchAPI<any>(`/contas/desativar/${numeroConta}`, {
      method: "PUT",
      body: JSON.stringify({ senha: senha }), 
    })
  },
}

// ============= TRANSAÇÃO API =============
export const transacaoAPI = {
  realizarTransferencia: async (data: TransferenciaRequest, gerenteExecutorId: number): Promise<TransacaoResponse> => {
    return fetchAPI<TransacaoResponse>(`/transacoes/transferencia?gerenteExecutorId=${gerenteExecutorId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  realizarDeposito: async (data: DepositoRequest, gerenteExecutorId: number): Promise<TransacaoResponse> => {
    return fetchAPI<TransacaoResponse>(`/transacoes/deposito?gerenteExecutorId=${gerenteExecutorId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  realizarSaque: async (data: SaqueRequest, gerenteExecutorId: number): Promise<TransacaoResponse> => {
    return fetchAPI<TransacaoResponse>(`/transacoes/saque?gerenteExecutorId=${gerenteExecutorId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  realizarSaqueInternacional: async (data: SaqueInternacionalRequest, gerenteExecutorId: number): Promise<TransacaoResponse> => {
    return fetchAPI<TransacaoResponse>(`/transacoes/saque-internacional?gerenteExecutorId=${gerenteExecutorId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  realizarDepositoInternacional: async (data: DepositoInternacionalRequest, gerenteExecutorId: number): Promise<TransacaoResponse> => {
    return fetchAPI<TransacaoResponse>(`/transacoes/deposito-internacional?gerenteExecutorId=${gerenteExecutorId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  buscarExtrato: async (contaId: number): Promise<TransacaoResponse[]> => {
    return fetchAPI<TransacaoResponse[]>(`/transacoes/extrato/${contaId}`, {
      method: "GET",
    })
  },
}

// ============= DÉBITO AUTOMÁTICO API =============
export const debitoAutomaticoAPI = {
  criar: async (data: DebitoAutomaticoRequest): Promise<DebitoAutomaticoResponse> => {
    return fetchAPI<DebitoAutomaticoResponse>("/debitos-automaticos", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  listarTodos: async (): Promise<DebitoAutomaticoResponse[]> => {
    return fetchAPI<DebitoAutomaticoResponse[]>("/debitos-automaticos", {
      method: "GET",
    })
  },

  buscarPorId: async (id: number): Promise<DebitoAutomaticoResponse> => {
    return fetchAPI<DebitoAutomaticoResponse>(`/debitos-automaticos/${id}`, {
      method: "GET",
    })
  },

  cancelar: async (id: number): Promise<DebitoAutomaticoResponse> => {
    return fetchAPI<DebitoAutomaticoResponse>(`/debitos-automaticos/cancelar/${id}`, {
      method: "PATCH",
    })
  },
}

// ============= VALIDAÇÃO CPF =============
export function validarCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, "")

  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  let soma = 0
  let resto

  for (let i = 1; i <= 9; i++) {
    soma += Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }
  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cleanCPF.substring(9, 10))) return false

  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }
  resto = (soma * 10) % 11

  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cleanCPF.substring(10, 11))) return false

  return true
}

// ============= FORMATAÇÃO =============
export function formatarCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, "")
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function formatarTelefone(ddd: string, numero: string): string {
  const cleanNumero = numero.replace(/\D/g, "")
  if (cleanNumero.length === 9) {
    return `(${ddd}) ${cleanNumero.substring(0, 5)}-${cleanNumero.substring(5)}`
  }
  return `(${ddd}) ${cleanNumero.substring(0, 4)}-${cleanNumero.substring(4)}`
}

export function formatarCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, "")
  return cleanCEP.replace(/(\d{5})(\d{3})/, "$1-$2")
}

export function formatarNumeroConta(numeroConta: string): string {
  const cleanNumero = numeroConta.replace(/\D/g, "")
  if (cleanNumero.length <= 6) {
    return cleanNumero
  }
  // Formato: 6 dígitos + hífen + 1 dígito verificador (ex: 123456-7)
  return cleanNumero.replace(/(\d{6})(\d{1})/, "$1-$2")
}

export const api = {
  gerentes: gerenteAPI,
  clientes: clienteAPI,
  enderecos: enderecoAPI,
  contas: contaAPI,
  transacoes: transacaoAPI,
  debitosAutomaticos: debitoAutomaticoAPI,
}
