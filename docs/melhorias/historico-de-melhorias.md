# Histórico Consolidado de Melhorias do Projeto

Este documento registra todas as melhorias técnicas, arquiteturais e correções implementadas no monorepo (**`apps/api`** e **`apps/web`**), servindo como registro contínuo de evolução do projeto.

> **Regra do Projeto**: A cada nova alteração ou funcionalidade implementada no código, a documentação correspondente em `docs/` deve ser atualizada imediatamente.

---

## Índice

1. [Infraestrutura e Banco de Dados](#1-infraestrutura-e-banco-de-dados)
2. [Backend (`apps/api`)](#2-backend-appsapi)
3. [Camada de Serviços do Frontend (`apps/web/src/services`)](#3-camada-de-serviços-do-frontend-appswebsrcservices)
4. [Autenticação, Sessão e Middleware de Rotas](#4-autenticação-sessão-e-middleware-de-rotas)
5. [Atomic Design e Novos Componentes](#5-atomic-design-e-novos-componentes)
6. [Fluxo da Recepção e Agendamento](#6-fluxo-da-recepção-e-agendamento)
7. [Correções de Bugs Relevantes](#7-correções-de-bugs-relevantes)
8. [Qualidade de Código e Cobertura de Testes](#8-qualidade-de-código-e-cobertura-de-testes)

---

## 1. Infraestrutura e Banco de Dados

- **Desconflito de Porta do PostgreSQL (`5434:5432`)**:
  - **Problema**: Ambientes de desenvolvimento frequentemente possuem instâncias locais do PostgreSQL rodando na porta padrão `5432`, gerando conflito ao subir o `docker-compose.yml`.
  - **Melhoria**: O mapeamento de porta do PostgreSQL no `docker-compose.yml` e na variável `DATABASE_URL` do `apps/api/.env` foi alterado para a porta `5434`.

---

## 2. Backend (`apps/api`)

### Evolução da Rota `GET /profissionais`
- **Filtros por Query Params (`data` e `profissionalId`)**:
  - Anteriormente, a rota retornava todos os profissionais sem distinção de data ou disponibilidade.
  - Implementado suporte aos parâmetros:
    - `?data=YYYY-MM-DD`: Realiza consulta à tabela `folga` do Prisma para verificar se o profissional está de folga no dia informado. Retorna o campo booleano `folga: true/false` em cada profissional.
    - `?profissionalId=...`: Permite filtrar por um profissional específico diretamente pela rota.
- **Validação de Formato de Data**:
  - Validação da data informada via utilitário `dataValida(data)` retornando `400 Bad Request` caso a string não siga o padrão `AAAA-MM-DD`.
- **Testes de Integração**:
  - Adicionados testes em `apps/api/test/profissionais.test.ts` cobrindo o retorno com e sem query param de data e a detecção de folga.

---

## 3. Camada de Serviços do Frontend (`apps/web/src/services`)

Criada uma camada de serviços fortemente tipada para centralizar todas as chamadas HTTP da aplicação, eliminando chamadas avulsas de `api()` espalhadas em componentes:

```text
apps/web/src/services/
├── auth/
│   ├── authService.ts          # fazerLogin()
│   └── types.ts                # CredenciaisLogin, RespostaLogin
├── profissionais/
│   ├── profissionaisService.ts # listarProfissionais(), buscarAgenda(), buscarHorarios(), bloquearDia()
│   └── types.ts                # ListarProfissionaisParams, RespostaHorarios, RespostaFolga
├── consultas/
│   ├── consultasService.ts     # listarMinhasConsultas(), agendarConsulta(), cancelarConsulta(), registrarFalta()
│   └── types.ts                # CriarConsultaParams, StatusConsulta, TipoConsulta
├── pacientes/
│   ├── pacientesService.ts     # listarPacientes()
│   └── types.ts                # Paciente
└── integracoes/
    ├── integracoesService.ts   # exportarAgendaCsv(), obterResumoDiario()
    └── types.ts                # IntegracoesParams
```

---

## 4. Autenticação, Sessão e Middleware de Rotas

- **Next.js Edge Middleware ([`apps/web/src/middleware.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/middleware.ts))**:
  - Controle de Acesso Baseado em Funções (RBAC) no nível de borda (Edge).
  - Rotas públicas (`/login`) redirecionam para a área logada correspondente caso o usuário já possua sessão ativa.
  - Rotas privadas (`/recepcao`, `/profissional`, `/paciente`) validam a presença da sessão e o perfil do usuário:
    - `/recepcao` exclusivo para perfil `recepcao`.
    - `/profissional` exclusivo para perfil `profissional`.
    - `/paciente` exclusivo para perfil `paciente`.
  - Usuários não autorizados são redirecionados para `/login` ou para sua área correspondente.
- **Sessão Híbrida ([`apps/web/src/lib/sessao.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/sessao.ts))**:
  - Armazenamento em `localStorage` para compatibilidade com SPA e leitura de sessão no client.
  - Gravação automática em cookie `bemviver_sessao` com flag `SameSite=Lax` para permitir que o Next.js Middleware leia a sessão de forma síncrona sem roundtrip adicional.
- **Refatoração do [FormularioLogin](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/FormularioLogin/formularioLogin.tsx)**:
  - Migração de `useState` manuais para **React Hook Form + Zod** ([`schema.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/FormularioLogin/schema.ts)).
  - Hook customizado [`useLogin`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useLogin.ts) utilizando mutation do **TanStack Query**.

---

## 5. Atomic Design e Novos Componentes

Seguindo estritamente a hierarquia do Atomic Design e as convenções do projeto:

### 5.1 Átomos (`components/atoms`)
- **[Skeleton](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/atoms/Skeleton/skeleton.tsx)**:
  - Componente para carregamento progressivo com animação `animate-pulse`.
  - Variantes suportadas: `texto`, `circular`, `retangular`.

### 5.2 Moléculas (`components/molecules`)
- **[SeletorProfissional](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorProfissional/seletorProfissional.tsx)**:
  - Dropdown com identificação de especialidade e indicador de folga `(Folga)`.
  - Integração facilitada com `react-hook-form` via props `valor`, `onChange` e `erro`.
- **[SeletorData](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorData/seletorData.tsx)**:
  - Input tipo data com validação de formato e acessibilidade.
- **[SemProfissionalSelecionado](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado.tsx)**:
  - Estado vazio (*empty state*) elegante, exibido quando nenhum profissional foi escolhido no filtro superior da recepção.

### 5.3 Organismos (`components/organisms`)
- **[RecepcaoSkeleton](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/RecepcaoSkeleton/recepcaoSkeleton.tsx)**:
  - Estrutura completa de esqueleto para a página de recepção (filtros + tabela de agenda + cartão lateral de agendamento).
- **[MinhasConsultasSkeleton](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultasSkeleton/minhasConsultasSkeleton.tsx)**:
  - Esqueleto para o carregamento da lista de consultas do paciente (título, botão e cartões com linhas pulsantes de detalhes).
- **[AgendaDoDia](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx)**:
  - Refatorado para **TanStack Query + React Hook Form + Zod**.
- **[MarcarConsulta](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MarcarConsulta/marcarConsulta.tsx)**:
  - Refatorado com Zod e React Hook Form, integrado ao hook `useAgenda`.

---

## 6. Fluxo da Recepção e Agendamento

### Hook [`useFiltroRecepcao`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useFiltroRecepcao.ts)
- Gerenciamento unificado dos filtros de data e profissional com `react-hook-form` e `zodResolver`.
- Sincronização automática da busca de profissionais via TanStack Query (`useProfissionais`) com base na data selecionada.

### Hook [`useAgenda`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgenda.ts)
- Busca reativa da agenda com chave `['agenda', profissionalId, data]`.
- Mutações integradas com invalidação automática de cache:
  - `cancelarConsulta`: POST para `/consultas/:id/cancelar`.
  - `registrarFalta`: POST para `/consultas/:id/falta`.
  - `agendarConsulta`: POST para `/consultas`.
- Estados de loading nos botões (`cancelando`, `registrandoFalta`, `agendando`).

### Fluxo na Página de Recepção ([`RecepcaoPage`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/page.tsx))
1. Se os dados dos profissionais estão carregando -> Exibe `<RecepcaoSkeleton />`.
2. Se nenhum profissional está selecionado -> Exibe `<SemProfissionalSelecionado />`.
3. Se um profissional está selecionado -> Renderiza `<AgendaDoDia />` com a grade do dia e o formulário de agendamento.

### Fluxo na Área do Paciente ([`MinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx) e [`AgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx))
- **Hook [`useMinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useMinhasConsultas.ts)**:
  - Busca as consultas do paciente autenticado via `consultasService.listarMinhasConsultas()` com a chave de cache `['consultas', 'minhas']`.
  - Mutation reativa para `cancelarConsulta` com invalidação automática de cache pós-sucesso.
- **Hook [`useHorarios`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useHorarios.ts)**:
  - Consulta reativa dos horários livres via `profissionaisService.buscarHorarios(profissionalId, data, tipo)` com chave `['horarios', profissionalId, data, tipo]`.
- **Hook [`useAgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgendarConsulta.ts)**:
  - Mutation para agendamento de consulta via `consultasService.agendarConsulta()`, invalidando automaticamente as consultas do paciente e a agenda do profissional.
- **Refatoração do Organismo [`AgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx)**:
  - Migração de múltiplos `useState`/`useEffect` manuais para **React Hook Form + Zod** ([`agendarConsultaPacienteSchema`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/schema.ts)).
  - Atualização dinâmica dos horários disponíveis com base na combinação de profissional, data e tipo de consulta.
  - Limpeza automática do horário selecionado ao alterar o profissional, data ou tipo.
- **Carregamento Visual com Skeleton**:
  - Enquanto `carregando` for verdadeiro em `MinhasConsultas`, renderiza `<MinhasConsultasSkeleton />` garantindo uma transição visual suave, sem layout shifts.
- **Resolução de Bug de Loading Infinito**:
  - Anteriormente, o componente utilizava `if (consultas.length === 0) return <p>Carregando...</p>`, o que fazia com que pacientes sem consultas agendadas ficassem eternamente presos na mensagem de carregamento.
  - Ajustado para distinguir o estado real de carregamento (`carregando`) da lista vazia (`consultas.length === 0`), exibindo mensagem clara: *"Você não possui consultas agendadas no momento."*.

---

## 7. Correções de Bugs Relevantes

### Bug de Fuso Horário no Título da Agenda (`timeZone: "UTC"`)
- **Sintoma**: Strings ISO de data pura (`"2026-10-15"`) geradas pelo backend eram convertidas para objeto `Date` em UTC (`2026-10-15T00:00:00.000Z`). Ao chamar `.toLocaleDateString("pt-BR")` no navegador de clientes em UTC-3, a data retrocedia para as 21:00 do dia anterior, exibindo **14/10 (quarta-feira)** em vez de **15/10 (quinta-feira)**.
- **Correção**: Inclusão de `{ timeZone: "UTC" }` nas opções do formatador de data em `agendaDoDia.tsx`.

### Bug de Carregamento Infinito em Minhas Consultas
- **Sintoma**: Paciente sem consultas ficava preso na mensagem "Carregando suas consultas...".
- **Correção**: Separação do estado `carregando` (do TanStack Query) da verificação de tamanho do array.

---

## 8. Qualidade de Código e Cobertura de Testes

Todas as alterações contam com validação contínua nos scripts do projeto:
- `npm run typecheck`: **0 erros de TypeScript** em todos os workspaces (`@bemviver/shared`, `@bemviver/api`, `@bemviver/web`).
- `npm run lint`: **0 advertências ou erros no ESLint**.
- Testes automatizados com Vitest:
  - Backend: [`test/auth.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/auth.test.ts), [`test/profissionais.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/profissionais.test.ts), [`test/integracoes.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/integracoes.test.ts).
  - Frontend: [`test/login.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/login.test.tsx), [`test/middleware.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/middleware.test.ts), [`test/recepcao.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/recepcao.test.tsx), [`test/agendaDoDia.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendaDoDia.test.tsx), [`test/minhasConsultas.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/minhasConsultas.test.tsx), [`test/agendarConsulta.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendarConsulta.test.tsx).
