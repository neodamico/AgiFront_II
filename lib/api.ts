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
} from "./types"

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
    const error = await response.text()
    throw new Error(error || `HTTP error! status: ${response.status}`)
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

  // Buscar conta por número
  buscarPorNumero: async (numeroConta: string): Promise<any> => {
    return fetchAPI<any>(`/contas/numero/${numeroConta}`, {
      method: "GET",
    })
  },

  // Atualizar conta
  atualizar: async (id: number, data: ContaUpdateRequest): Promise<ContaUpdateResponse> => {
    return fetchAPI<ContaUpdateResponse>(`/contas/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Deletar conta
  deletar: async (id: number): Promise<void> => {
    return fetchAPI<void>(`/contas/${id}`, {
      method: "DELETE",
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
