

#  AgiFront Project

Bem-vindo ao projeto AgiFront! Este é um guia inicial para configurar e rodar o projeto usando o gerenciador de pacotes `pnpm`.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter o ambiente configurado:

- **Node.js**: Instale a versão LTS disponível em [nodejs.org](https://nodejs.org).  
- **Verificação**: Abra um terminal (Command Prompt no Windows, Terminal no macOS/Linux) e execute:
  ```bash
  node -v
 
  - Se não retornar uma versão (ex.: `v18.x.x`), instale o Node.js primeiro.

---

## 🎉 Passo 1: Instalar o pnpm

Vamos instalar o `pnpm` globalmente para gerenciar as dependências do projeto:

1. Abra o terminal.
2. Execute o comando abaixo para instalar o `pnpm` usando o `npm`:
   ```bash
   npm install -g pnpm
   ```
   - Isso instalará o `pnpm` em todo o sistema. A instalação pode levar alguns segundos.

---

## ✅ Passo 2: Verificar a Instalação

Confirme que o `pnpm` foi instalado corretamente:

- No terminal, execute:
  ```bash
  pnpm -v
  ```
  - Deve retornar a versão do `pnpm` (ex.: `8.x.x` ou superior).
  - **Dica**: Se ocorrer um erro, feche e reabra o terminal (pode ser necessário para atualizar o PATH).

---

## 🛠️ Inicializar um Projeto

Siga estes passos para começar a trabalhar no projeto:

| Passo                | Comando                  | Descrição                                      |
|----------------------|--------------------------|------------------------------------------------|
| **Inicializar**      | `pnpm init`              | Cria um `package.json` para o novo projeto.    |
| **Instalar Dependências** | `pnpm install`       | Instala as dependências listadas no `package.json`. |
| **Iniciar Desenvolvimento** | `pnpm run dev` | Executa o script `dev` (se definido no `package.json`). |

- **Nota**: Ajuste o comando `pnpm run dev` conforme o script definido no seu `package.json` (ex.: `start`, `serve`).

---

## ❓ Dicas e Solução de Problemas

- **Permissões (Linux/macOS)**: Se houver erro de permissão, tente `sudo npm install -g pnpm` (evite se possível, use [nvm](https://github.com/nvm-sh/nvm) para gerenciar Node.js).
- **Windows**: Execute o terminal como administrador, se necessário.
- **Atualizar pnpm**: Para a versão mais recente, use `pnpm add -g pnpm`.
- **Mais ajuda**: Consulte a [documentação oficial do pnpm](https://pnpm.io).

---

