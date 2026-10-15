# Padrões de Desenvolvimento e Nomenclatura

Este documento detalha a arquitetura, convenções de código, nomenclaturas e padrões adotados no projeto **Clínica Bem Viver**, abrangendo `apps/api`, `apps/web` e o pacote compartilhado `packages/shared`.

---

## 1. Visão Geral da Arquitetura (Monorepo)

O projeto é estruturado como um monorepo via **npm workspaces**:

```text
├── apps/
│   ├── api/          # Backend Node.js / Express 5 + Prisma 7 (PostgreSQL)
│   └── web/          # Frontend Next.js 16 (App Router) + React 19 + Tailwind CSS 4
├── packages/
│   └── shared/       # Tipos, constantes de negócio e utilitários puros compartilhados
├── docs/             # Documentações técnicas do projeto
├── docker-compose.yml# Serviços de infraestrutura local (PostgreSQL, Mailpit, n8n)
└── package.json      # Scripts raiz e dependências globais de tipagem/lint
```

### Princípios Gerais
- **Domínio em Português**: Nomes de entidades, variáveis de negócio, rotas e mensagens ao usuário são intencionalmente escritos em **português**, tornando o código autoexplicativo e alinhado com as regras do desafio.
- **Termos Técnicos em Inglês**: Padrões da indústria e bibliotecas mantêm a terminologia padrão em inglês (ex.: `request`, `response`, `router`, `token`, `payload`, `props`, `className`, `jwt`).
- **Compartilhamento de Código**: Regras de negócio universais (fuso horário, duração de consultas, cálculo de grade) residem em `@bemviver/shared` para evitar duplicação entre frontend e backend.

---

## 2. Convenções de Nomenclatura

### 2.1 Arquivos e Diretórios

| Escopo | Padrão | Exemplo |
| :--- | :--- | :--- |
| **Pastas de Componentes (Web)** | `PascalCase` | `components/atoms/Button/`, `components/organisms/AgendaDoDia/` |
| **Arquivos de Componentes (Web)** | `camelCase.tsx` | `button.tsx`, `agendaDoDia.tsx`, `tabelaConsultas.tsx` |
| **Tipos de Componentes (Web)** | `types.ts` junto ao componente | `components/atoms/Button/types.ts` |
| **Páginas e Rotas (Web)** | Convenção Next.js App Router | `app/page.tsx`, `app/paciente/page.tsx`, `app/layout.tsx` |
| **Módulos da API (Backend)** | `kebab-case` ou palavra única | `app.ts`, `agenda.ts`, `auth.ts`, `prisma.ts` |
| **Rotas da API (Backend)** | `kebab-case` ou palavra única | `rotas/consultas.ts`, `rotas/profissionais.ts` |
| **Arquivos de Teste** | `*.test.ts` (API) ou `*.test.tsx` (Web) | `auth.test.ts`, `login.test.tsx` |

### 2.2 Identificadores no Código

| Tipo | Convenção | Idioma | Exemplos |
| :--- | :--- | :--- | :--- |
| **Funções e Métodos** | `camelCase` | Português | `validarHorario()`, `horariosDisponiveis()`, `lerSessao()`, `criarUsuario()` |
| **Variáveis e Parâmetros** | `camelCase` | Português | `profissionalId`, `data`, `hora`, `consulta`, `marcadas` |
| **Interfaces e Types** | `PascalCase` | Português | `Consulta`, `Usuario`, `Perfil`, `Agenda`, `ButtonProps` |
| **Constantes e Configs Globais** | `UPPER_SNAKE_CASE` | Português/Técnico | `FUSO`, `GRADE`, `EXPEDIENTE`, `DURACAO_MINUTOS`, `CHAVE_SESSAO` |
| **Componentes React** | `PascalCase` | Português / Inglês técnico | `Button`, `AgendaDoDia`, `AreaTemplate`, `MarcarConsulta` |
| **Hooks React** | `useCamelCase` | Português | `useSessao()` |
| **Callbacks e Eventos Props** | Prefixo `on` + `PascalCase` | Português / Inglês | `onMarcada`, `onClick`, `onChange` |

---

## 3. Padrões do Backend (`apps/api`)

### 3.1 Tecnologias
- **Express 5**: Servidor HTTP minimalista e tipado.
- **Prisma 7 com `@prisma/adapter-pg`**: Driver PostgreSQL nativo de alta performance.
- **Node.js Crypto nativo**: Hashing com `scryptSync` e verificação em tempo constante (`timingSafeEqual`).
- **JSON Web Token (`jsonwebtoken`)**: Autenticação stateless via Bearer Token.

### 3.2 Estrutura de Pastas
```text
apps/api/
├── prisma/
│   ├── schema.prisma         # Modelos de dados e enums
│   ├── migrations/           # Histórico de migrações SQL versionadas
│   └── seed.ts               # População determinística e idempotente do banco
├── src/
│   ├── rotas/                # Handlers modulares do Express (um arquivo por entidade)
│   │   ├── auth.ts           # Login (/auth/login)
│   │   ├── consultas.ts      # Agendamento, cancelamento, faltas (/consultas)
│   │   ├── integracoes.ts    # Webhooks para automações externas (/integracoes)
│   │   ├── pacientes.ts      # Listagem de pacientes (/pacientes)
│   │   └── profissionais.ts  # Grade e agenda de médicos (/profissionais)
│   ├── agenda.ts             # Regras de negócio puras (validação, sobreposição, grades)
│   ├── app.ts                # Configuração e middlewares do Express
│   ├── auth.ts               # Criptografia, geração e validação de JWT, middlewares RBAC
│   ├── index.ts              # Ponto de entrada (subida do servidor HTTP na porta 3333)
│   └── prisma.ts             # Instância única compartilhada do cliente Prisma
└── test/
    ├── ajuda.ts              # Helpers de teste (criação de usuários com token pronto)
    ├── preparar-banco.ts     # Script de bootstrap do banco de testes
    └── *.test.ts             # Testes de integração com Vitest e Supertest
```

### 3.3 Autenticação e Controle de Acesso (RBAC)
- **Extensão de Tipagem do Express**:
  ```ts
  declare module 'express-serve-static-core' {
    interface Request {
      usuario: Usuario
    }
  }
  ```
- **Middleware `autenticar`**: Extrai o token `Bearer`, verifica a assinatura JWT e injeta `req.usuario`.
- **Middleware `permitir(...perfis: Perfil[])`**: Bloqueia acessos indevidos retornando `403`:
  ```ts
  rotasConsultas.post('/:id/falta', permitir('recepcao'), async (req, res) => { ... })
  ```

### 3.4 Padrão de Status HTTP e Respostas
- `200 OK`: Consulta bem-sucedida ou mutação simples.
- `201 Created`: Criação bem-sucedida de recurso (ex.: agendamento).
- `400 Bad Request`: Parâmetros inválidos ou corpo da requisição ausente/malformado. Formato `{ erro: string }`.
- `401 Unauthorized`: Token ausente ou expirado. Formato `{ erro: string }`.
- `403 Forbidden`: Perfil do usuário autenticado não possui permissão para a ação.
- `404 Not Found`: Recurso não encontrado.
- `409 Conflict`: Conflito de regra de negócio (ex.: horário ocupado, profissional de folga, status inválido).
- `500 Internal Server Error`: Erros inesperados capturados pelo middleware central de erro.

---

## 4. Padrões do Frontend (`apps/web`)

### 4.1 Tecnologias
- **Next.js 16 (App Router)**: Roteamento baseado no sistema de arquivos.
- **React 19**: Componentes de função modernos e hooks nativos.
- **Tailwind CSS 4**: Estilização com utility-first classes sem arquivos CSS espalhados.

### 4.2 Arquitetura de Componentes (Atomic Design)
A estrutura em `src/components/` segue a divisão por níveis de responsabilidade:

```text
src/components/
├── atoms/        # Componentes base, sem regra de negócio (Button, Input, Select, Card, Alert)
├── molecules/    # Junções simples de átomos (Field = label + input, CartaoConsulta, SeletorHorario)
├── organisms/    # Blocos funcionais com regras de negócio ou chamadas de API (AgendaDoDia, TabelaConsultas)
└── templates/    # Estruturas estruturais e layouts de página (AreaTemplate, AuthTemplate)
```

#### Regras por Componente:
1. **Pasta Dedicada**: Cada componente fica em sua própria pasta com o nome em `PascalCase`.
2. **Separação de Tipos**: Props e variantes sempre ficam em `types.ts` dentro da pasta do componente.
3. **Variantes e Tamanhos com Mapas Estáticos**:
   ```ts
   const VARIANTES: Record<VarianteBotao, string> = {
     primario: 'bg-teal-700 text-white hover:bg-teal-800',
     secundario: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
     perigo: 'bg-red-700 text-white hover:bg-red-800',
   }
   ```

### 4.3 Organização das Rotas (App Router)
As rotas são organizadas por perfil de usuário:

- `/`: Login geral (`app/page.tsx`)
- `/paciente`: Painel do paciente e consultas marcadas (`app/paciente/page.tsx`)
- `/paciente/agendar`: Fluxo de autoagendamento (`app/paciente/agendar/page.tsx`)
- `/recepcao`: Painel da recepcionista com visão completa e marcação para terceiros (`app/recepcao/page.tsx`)
- `/profissional`: Agenda do médico/especialista com visualização diária (`app/profissional/page.tsx`)

### 4.4 Gerenciamento de Sessão, Cookies e Middleware
- **Sincronização Híbrida (Cookie + LocalStorage)**: Ao realizar login (`salvarSessao`), a sessão é gravada tanto no `localStorage` quanto em cookie (`bemviver-sessao`, `SameSite=Lax`, expiração de 8h). No logout (`encerrarSessao`), ambos são limpos.
- **Middleware de Rotas (`src/middleware.ts`)**:
  - **Rotas Públicas** (`/`): Usuários já autenticados são redirecionados automaticamente para a respectiva área (`/${perfil}`), eliminando *flashes* de tela e a necessidade de `useEffect` de redirecionamento no cliente.
  - **Rotas Privadas** (`/paciente/*`, `/recepcao/*`, `/profissional/*`): Usuários não autenticados são interceptados antes da renderização e redirecionados para `/`. Usuários autenticados tentando acessar áreas de outro perfil são redirecionados para sua área correspondente.
- **Prevenção de Hydration Mismatch**: O hook `useSessao()` utiliza `useSyncExternalStore` para retornar `undefined` durante a renderização no servidor e carregar o estado sincronizado no navegador sem disparar erros de hidratação.

### 4.5 Comunicação com a API (`lib/api.ts`)
A função auxiliar tipada `api<T>()`:
- Encaminha chamadas relativas (ex.: `/profissionais`) para o proxy do Next.js `/api/*`.
- Injeta automaticamente o header `Authorization: Bearer <token>` quando há sessão ativa.
- Em caso de resposta `401 Unauthorized`, limpa a sessão local automaticamente.
- Deserializa e lança exceções com a mensagem amigável enviada pelo backend (`erro`).

---

## 5. Pacote Compartilhado (`packages/shared`)

O pacote `@bemviver/shared` serve de "fonte única da verdade" para contratos e regras temporais:

1. **Tipos de Domínio**:
   - `Perfil`: `'paciente' | 'recepcao' | 'profissional'`
   - `TipoConsulta`: `'primeira' | 'retorno'` (duração: 60 min vs 30 min)
   - `StatusConsulta`: `'agendada' | 'cancelada' | 'realizada' | 'faltou'`
   - Interfaces: `Usuario`, `Profissional`, `Paciente`, `Consulta`, `Agenda`.
2. **Constantes de Negócio**:
   - `FUSO = 'America/Recife'` (garante consistência temporal independente do servidor ou máquina local).
   - `DURACAO_MINUTOS`: Dicionário com tempo exato por modalidade.
   - `EXPEDIENTE`: Intervalos de atendimento da clínica (8h às 12h e 13h às 18h).
   - `GRADE`: Array ordenado com todos os slots válidos de 30 minutos.
3. **Funções Puras de Conversão**:
   - `paraMinutos(hora: string)` e `paraHora(minutos: number)`
   - `hojeEmRecife(agora?: Date)`

---

## 6. Padrões de Testes

- **Runner**: [Vitest](https://vitest.dev/) em todos os pacotes.
- **Testes de Integração da API**:
  - Testam endpoints reais via `supertest`.
  - Utilizam o helper `criarUsuario(perfil, nome)` para gerar usuário no banco de teste e já retornar o token formatado para o header `Authorization`.
  - Banco de dados isolado (`bemviver_teste`).
- **Testes de Componentes e Telas Web**:
  - Utilizam `@testing-library/react` com `@testing-library/dom` e `jsdom`.
  - Chamadas de rede mockadas via helper `simularApi(...)`.
  - Verificação de acessibilidade e interações de usuário (`getByRole`, `getByLabelText`, `fireEvent`).
