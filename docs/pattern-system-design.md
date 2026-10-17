# Padrões e Arquitetura

OBS: SEMPRE USE INGLES NO CODIGO
OBS 2: SIGA AS RISCAS O PADRAO

---

> **Observação Geral:** Este projeto adota a arquitetura **Feature-Sliced Design (FSD)** integrada ao **Atomic Design** no Storybook, utilizando a stack **React 19, Vite 7, TailwindCSS 4, TanStack Query, React Hook Form, Zod e Biome**. Todos os desenvolvimentos e refatorações devem seguir rigorosamente as diretrizes abaixo.

---

### 0. Feature-Sliced Design (FSD) & Atomic Design no Storybook

- **Estrutura de Camadas FSD (`src/`)**:
  - `app/`: Configurações globais, providers e rotas (`app/router/`).
  - `pages/`: Páginas do sistema associadas às rotas do backoffice (composição de widgets e templates).
  - `widgets/`: Blocos compostos autônomos que agrupam features e entidades (ex: `widgets/layout`, `widgets/accounts`, `widgets/contracts`).
  - `features/`: Casos de uso do usuário com valor de negócio (ex: `features/auth`, `features/client-form`).
  - `entities/`: Modelos e regras de domínio (ex: `entities/account`, `entities/contract`, `entities/audit`).
  - `shared/`: Componentes agnósticos de domínio, utilitários, hooks e design system (`shared/ui`, `shared/api`, `shared/lib`).
- **Atomic Design no Storybook (`src/shared/ui/*.stories.tsx`)**:
  - `Design System/Atoms/`: Elementos fundamentais indivisíveis (`Typography`, `Button`, `Input`, `Badge`, `Skeleton`, `Avatar`).
  - `Design System/Molecules/`: Combinação de átomos com função direta (`FormField`, `PasswordField`, `MetricCard`, `Pagination`, `Select`).
  - `Design System/Organisms/`: Blocos compostos maiores e interativos (`FileUploadZone`, `StepLayoutFormClient`).
- **Regra de Ouro**: Elementos visuais recorrentes de formulário ou UI **devem** ser componentizados e consumidos de `src/shared/ui/` para evitar duplicação de marcação ou estilos arbitrários.

---

### 1. Modais Isolados e Acessíveis

- Todo modal deve residir em arquivo dedicado dentro da sua respectiva feature ou widget (ex: `src/pages/customer-requests/ui/organisms/request-details-modal.tsx`).
- Requisitos obrigatórios de acessibilidade:
  - Suporte a fechamento ao clicar no backdrop (`overlay`).
  - Suporte a fechamento via tecla `ESC` (`keydown listener`).
  - Foco inicial adequado no primeiro elemento interativo.
  - Bloqueio de scroll do body enquanto o modal estiver aberto.
  - Limite vertical respeitando a viewport com rolagem interna suave (`max-h-[90vh] overflow-y-auto`).

---

### 2. Nomenclatura e Convenções de Arquivos

- **Pastas e Arquivos de Componentes**: Padrão `kebab-case`:
  - Ex: `src/shared/ui/password-field.tsx`, `src/features/auth/ui/auth-form.tsx`.
- **Custom Hooks**: Prefixo `use` em `camelCase` ou `kebab-case` padronizado:
  - Ex: `useLoginForm.ts`, `use-translate.ts`, `useAccounts.ts`.
- **Schemas de Validação Zod**:
  - Ex: `login-schema.ts`, `create-client-schema.ts`.
- **Tipagem TypeScript**:
  - Interfaces exportadas explicitamente nos arquivos de modelo (`types.ts`, `model/*.ts`) sem o uso de `any`.

---

### 3. Formulários, Schemas e Custom Hooks

- Formulários **devem** utilizar **React Hook Form** integrado com **Zod** via `@hookform/resolvers/zod`.
- **Separação Obrigatória de Responsabilidades**:
  1. **Schema Zod**: Validações estritas de tamanho, formato de e-mail, senhas e campos obrigatórios (`*.schema.ts`).
  2. **Custom Hook**: Isole o formulário, mutations assíncronas e tratamentos de resposta em um hook dedicado (`useLoginForm.ts`).
  3. **Componente de UI**: Focado exclusivamente na renderização e apresentação visual (`auth-form.tsx`).
- **Feedback de Validação & Banner de Erro Global**:
  - Erros de campo devem ser repassados para `FormField` e `PasswordField` através da prop `errorText`.
  - Falhas gerais de autenticação ou de API capturadas no hook devem registrar erro via `form.setError("root", { message })` e ser exibidas visualmente com banner acessível (`role="alert"` e `aria-live="polite"`).

---

### 4. Gerenciamento de Estado de Servidor (TanStack Query)

- Utilizar **TanStack Query** (`@tanstack/react-query`) para todas as chamadas assíncronas (`useQuery` e `useMutation`).
- **Invalidação de Cache Obrigatória**:
  - Toda mutação (criação, atualização, alteração de status ou exclusão) deve invalidar a query correspondente no callback `onSuccess`:
    ```ts
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
    ```
  - **É estritamente proibido** utilizar recarregamento forçado de página (`window.location.reload()`) para sincronização de estado.

---

### 5. Camada de Serviços e Comunicação com API (`shared/api`, `entities/*/api`)

- As requisições HTTP devem ser centralizadas utilizando a instância de `httpClient` (`src/shared/api/httpClient.ts`).
- Contratos de tipos estritos para todos os endpoints, incluindo tipagem de resposta paginada e tratamento de erros do Axios.
- Gerenciamento de tokens sensíveis (JWT e refresh token) via headers e interceptors do Axios com renovação automática de sessão em status `401 Unauthorized`.

---

### 6. Feedback Visual e Estados Assíncronos

- **Skeletons**: Criar e utilizar skeletons dedicados (`src/shared/ui/skeleton.tsx`) para todas as telas, cards de KPI e tabelas enquanto `isLoading` for verdadeiro.
- **Empty States**: Listagens e tabelas vazias devem exibir ícone temático, mensagem clara e botão de ação primária (CTA) quando aplicável.
- **Notificações (Toasts)**: Notificar o usuário com a biblioteca **Sonner** (`toast.success`, `toast.error`, `toast.info`).
- **Prevenção de Duplo Envio**: Botões de submissão devem receber `isLoading={isSubmitting}` e desabilitar cliques repetidos durante a mutação.

---

### 7. Centralização de Formatações e Utilitários (`shared/lib/format/`)

- Funções de máscara e conversão devem residir em arquivos utilitários centralizados em `src/shared/lib/format/`:
  - Moeda BRL: `formatCurrency(val)` ou `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`.
  - Documentos: formatação de CPF e CNPJ.
  - Datas e Horários: formatação padronizada para o padrão pt-BR (`DD/MM/YYYY HH:mm`).
- Proibida a replicação de lógicas de formatação inline ou regex soltos em múltiplos componentes.

---

### 8. Roteamento e Lazy Loading de Páginas

- Rotas organizadas via **React Router v7** em `src/app/router/`.
- Páginas não críticas ou rotas protegidas devem ser importadas via `lazy()` com `<Suspense fallback={<LoadingSpinner />}>` para garantir code splitting e manter o bundle inicial otimizado.

---

### 9. Design System, Tokens e Padronização Tipográfica

- **Padronização Oficial de Títulos e Subtítulos**:
  - Todas as páginas e blocos de conteúdo devem utilizar o componente centralizado `Typography` (`src/shared/ui/typography.tsx`):
    - **Page Title (`variant="title"` ou `variant="page-title"`):** `text-3xl font-bold text-gray-900 mb-1 tracking-tight` (renderizado como `h1` semântico).
    - **Page Subtitle (`variant="subtitle"` ou `variant="page-subtitle"`):** `text-gray-500 text-sm` (renderizado como `p`).
- **Consistência de Cores no TailwindCSS 4**:
  - Utilizar os tokens semânticos declarados em `@theme` (`primary` `#4bb2f2`, `background` `#f8fafc`, `surface`, `error`).
  - **Proibido** o uso de cores hexadecimais arbitrárias soltas (ex: `[#4bb2f2]`, `[#f8fafc]`) quando houver token semântico correspondente.

---

### 10. Princípios SOLID e Clean Code

- **Single Responsibility (SRP)**: Cada componente, hook e utilitário deve ter uma única responsabilidade clara.
- **Tipagem Estrita**: Nenhuma utilização de `any` ou type assertions inseguras (`as unknown as Type`).
- **Desacoplamento**: Lógica de regras de negócio, formatação de dados e chamadas de API devem residir em hooks e services, mantendo o JSX focado na renderização.

---

### 11. Princípio DRY & Proibição de Código Repetido

- **Extração Obrigatória**:
  - Quando um elemento visual ou padrão de bloco (ex: card de métrica, linha de status, item de lista) se repetir 2 ou mais vezes, deve ser extraído para um átomo ou molécula em `src/shared/ui/`.
- **Coleções e Mapeamentos**:
  - Telas com múltiplos cards ou indicadores devem declarar estruturas de dados tipadas e renderizar via `.map()`, garantindo manutenção centralizada.

---

### 12. Rastreabilidade de Bugs & Auditoria Visual (`docs/bug-traceability/`)

- Cada tela da aplicação possui um documento de auditoria dedicado em `docs/bug-traceability/T-XX-*.md`.
- Antes de considerar uma tela como aprovada, ela deve ser rigorosamente inspecionada conforme os 4 breakpoints e critérios de acessibilidade:
  - **Mobile Web (360px a 390px)**: Sem scroll horizontal, paddings mínimos de 16px, cards fluidos e formulários adaptados.
  - **Tablet (768px a 820px)**: Grids em 2 colunas harmônicas, tabelas com scroll horizontal suave (`overflow-x-auto`).
  - **Desktop Padrão (1024px a 1366px)**: Proporção equilibrada entre sidebar e conteúdo principal, alinhamento centralizado.
  - **Desktop Ultrawide (1440px+)**: Limitação de largura máxima (`max-w-7xl` ou `max-w-[1100px]`), sem quebras assimétricas.
- Todo bug detectado deve ser catalogado na seção `Registro de Bugs Encontrados nesta Tela` no formato:

  ```markdown
  ### [BUG-T-XX-001] Título Resumido da Falha

  - **Resolução / Dispositivo:** ...
  - **Severidade:** Baixa | Média | Alta | Crítica
  - **Status:** 🔴 Aberto | 🟡 Em Correção | 🟢 Resolvido
  - **Comportamento Anterior:** ...
  - **Comportamento Corrigido:** ...
  ```

---

### 13. Priorização Mobile-First e Usabilidade Tátil

- **Filosofia Mobile-First no Tailwind**:
  - As classes base sempre definem o comportamento mobile (`w-full`, `p-4`, `flex-col`), enquanto modificadores progressivos (`sm:`, `md:`, `lg:`, `xl:`) expandem para telas maiores.
- **Área de Toque Mínima (Touch Targets)**:
  - Todos os botões, ícones clicáveis e itens de navegação devem respeitar a dimensão mínima recomendada de **44x44px** (WCAG / Apple HIG) ou possuir padding tátil suficiente para evitar toques acidentais.
- **Prevenção de Estouro de Viewport (`overflow-x: hidden`)**:
  - Telas nunca devem gerar rolagem horizontal involuntária em smartphones.
  - Proibido o uso de larguras mínimas fixas em pixels (`min-w-[600px]`) diretamente no layout principal sem container com `overflow-x-auto`.
