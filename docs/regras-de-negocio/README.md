# Regras de Negócio e Checklist de Conformidade (Back-end & Front-end)

Este diretório contém a documentação técnica aprofundada de cada regra de negócio do sistema da **Clínica Bem Viver**, acompanhada de checklists de conformidade e matriz de rastreabilidade entre Back-end (`apps/api`) e Front-end (`apps/web`).

---

## 1. Documentos Específicos por Regra

| Código | Regra de Negócio | Documento Detalhado |
| :--- | :--- | :--- |
| **RN01** | Horário de expediente (Seg-Sex, 8h-18h) e almoço (12h-13h) | [`RN01-horario-expediente-e-almoco.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN01-horario-expediente-e-almoco.md) |
| **RN02** | Fuso horário oficial (`America/Recife`) e grade em slots de 30 minutos | [`RN02-fuso-horario-e-grade-30min.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md) |
| **RN03** | Tipos de consulta e duração: Primeira consulta (60min) e Retorno (30min) | [`RN03-duracao-consultas-e-tipos.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md) |
| **RN04** | Exclusividade (1 paciente por vez), sem encaixes e prevenção de conflitos | [`RN04-exclusividade-atendimento-e-conflitos.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md) |
| **RN05** | Cancelamento a qualquer momento, soft delete e liberação imediata do slot | [`RN05-cancelamento-de-consultas.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md) |
| **RN06** | Perfis de acesso e RBAC (`paciente`, `recepcao`, `profissional`) | [`RN06-perfis-e-permissoes-rbac.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md) |
| **RN07** | Bloqueio de folgas do profissional e preservação de consultas prévias | [`RN07-bloqueio-de-folgas.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md) |
| **RN08** | Registro de faltas pela recepção pós-horário e restrições operacionais | [`RN08-registro-de-faltas-e-restricoes.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md) |

---

## 2. Matriz de Rastreabilidade (Requisitos -> Código -> Testes)

| Regra | Arquivos Back-end | Componentes / Hooks Front-end | Testes Automatizados |
| :--- | :--- | :--- | :--- |
| **RN01** | `apps/api/src/agenda.ts`<br>`packages/shared/src/index.ts` | `SeletorData`<br>`SeletorHorario` | `apps/api/test/profissionais.test.ts` |
| **RN02** | `apps/api/src/agenda.ts`<br>`packages/shared/src/index.ts` | `AgendaDoDia`<br>`lib/formato.ts` | `apps/web/test/agendaDoDia.test.tsx` |
| **RN03** | `apps/api/src/rotas/consultas.ts`<br>`apps/api/src/agenda.ts` | `AgendaDoDia/schema.ts`<br>`MarcarConsulta` | `apps/web/test/agendaDoDia.test.tsx` |
| **RN04** | `apps/api/src/agenda.ts`<br>`apps/api/src/rotas/consultas.ts` | `useAgenda`<br>`AgendaDoDia` | `apps/web/test/agendaDoDia.test.tsx` |
| **RN05** | `apps/api/src/rotas/consultas.ts` | `useMinhasConsultas`<br>`MinhasConsultas`<br>`AgendaDoDia` | `apps/web/test/minhasConsultas.test.tsx`<br>`apps/web/test/agendaDoDia.test.tsx` |
| **RN06** | `apps/api/src/auth.ts`<br>`apps/api/src/rotas/*` | `apps/web/src/middleware.ts`<br>`apps/web/src/lib/sessao.ts` | `apps/api/test/auth.test.ts`<br>`apps/web/test/middleware.test.ts`<br>`apps/web/test/login.test.tsx` |
| **RN07** | `apps/api/src/rotas/profissionais.ts` | `SeletorProfissional`<br>`AgendaDoDia` | `apps/api/test/profissionais.test.ts`<br>`apps/web/test/recepcao.test.tsx` |
| **RN08** | `apps/api/src/rotas/consultas.ts` | `TabelaConsultas`<br>`AgendaDoDia` | `apps/web/test/agendaDoDia.test.tsx` |

---

## 3. Checklist Consolidado do Back-end

- [x] **Expediente e Turnos**: Validação de dias úteis e bloqueio de horários no almoço (12h-13h) e fora das 8h-18h.
- [x] **Fuso Horário Canônico**: Cálculos e timestamps sincronizados com o fuso `America/Recife`.
- [x] **Duração por Tipo**: Cálculo preciso de término (60min para primeira consulta, 30min para retorno).
- [x] **Prevenção de Colisões**: Algoritmo `temConflito` impedindo sobreposição de consultas de um mesmo profissional.
- [x] **Cancelamento Não-Destrutivo**: Soft delete com `status = 'cancelada'`, timestamp `canceladaEm` e liberação imediata do slot.
- [x] **Controle de Acesso RBAC**: Verificação estrita de perfil com middleware `permitir()` e validação de posse (`pacienteId`, `profissionalId`).
- [x] **Gestão de Folgas**: Rota para registro de folga pelo médico, preservação de consultas já marcadas e bloqueio de novos agendamentos (`409 Conflict`).
- [x] **Faltas Controladas**: Bloqueio de registro de falta antes do horário da consulta ou por perfis que não sejam `recepcao`.
- [x] **Suíte de Testes da API**: 100% de testes passando no Vitest (`auth`, `profissionais`, `integracoes`).

---

## 4. Checklist Consolidado do Front-end

- [x] **Proteção de Rotas com Edge Middleware**: Redirecionamento por perfil e proteção de páginas restritas via Next.js Middleware.
- [x] **Camada de Serviços Centralizada**: Eliminação de chamadas `api()` avulsas; uso exclusivo da camada tipada `@/services`.
- [x] **Gerenciamento de Estado com TanStack Query**: Cache declarativo, refetch automático e invalidação de cache nas mutations.
- [x] **Formulários e Validação Forte**: Adoção de **React Hook Form + Zod** em todos os formulários com feedback de erro amigável.
- [x] **Correção de Timezone**: Utilização de `{ timeZone: "UTC" }` ao formatar datas ISO pura, sanando o bug de D-1 no cliente.
- [x] **Atomic Design Consistente**:
  - Átomos: `Button`, `Input`, `Select`, `Card`, `Alert`, `Skeleton`.
  - Moléculas: `Field`, `SeletorProfissional`, `SeletorData`, `SeletorHorario`, `CartaoConsulta`, `SemProfissionalSelecionado`.
  - Organismos: `FormularioLogin`, `RecepcaoSkeleton`, `MinhasConsultasSkeleton`, `AgendaDoDia`, `MarcarConsulta`, `MinhasConsultas`, `TabelaConsultas`.
- [x] **Estados de Carregamento Acessíveis**: Componentes de esqueleto (`RecepcaoSkeleton`, `MinhasConsultasSkeleton`) para evitar layout shifts e bugs de carregamento infinito.
- [x] **Estados Vazios Contextuais**: Exibição de `<SemProfissionalSelecionado />` quando não há médico escolhido e mensagem amigável no paciente sem consultas.
- [x] **Suíte de Testes do Frontend**: 100% de aprovação nos testes com React Testing Library e Vitest.

---

## 5. Resolução dos Relatos da Clínica

| Relato da Clínica | Causa Raiz Identificada | Regra Relacionada | Solução Aplicada |
| :--- | :--- | :---: | :--- |
| *“Na tela dela a consulta aparece na quarta. Na recepção, na terça.”* | Conversão de string de data UTC para fuso local retrocedendo 3 horas (D-1). | **RN02** | Formatação com `timeZone: "UTC"` explícito. |
| *“Doutor ficou com dois pacientes no mesmo horário.”* | Sobreposição não detectada quando consultas de 60min cruzavam com slots de 30min. | **RN03** / **RN04** | Algoritmo de intersecção de intervalos `inicioNovo < fimM && fimNovo > inicioM`. |
| *“Quando alguém cancela, ninguém mais consegue marcar naquele horário.”* | Query de verificação de conflitos incluía consultas com `status = 'cancelada'`. | **RN05** | Filtro estrito `status = 'agendada'` na checagem de disponibilidade. |
| *“Troco de profissional e continua aparecendo a agenda do anterior.”* | Estado desatualizado em `useState`/`useEffect` sem controle de cache. | **RN06** | Query chaveada por `['agenda', profissionalId, data]` no TanStack Query. |
| *“Paciente novo disse que a tela fica só carregando.”* | Verificação `consultas.length === 0` retornando "Carregando..." indefinidamente. | **RN06** | Separação de `carregando` (TanStack Query) e estado vazio com Skeleton. |
| *“Duas pessoas marcaram o mesmo horário.”* | Concorrência entre requisições paralelas sem validação atômica. | **RN04** | Validação centralizada com checagem de conflito e retorno `409 Conflict`. |
