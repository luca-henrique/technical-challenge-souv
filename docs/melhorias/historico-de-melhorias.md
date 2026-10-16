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
  - Backend: [`test/auth.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/auth.test.ts), [`test/profissionais.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/profissionais.test.ts), [`test/integracoes.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/integracoes.test.ts), [`test/rn01-horario-expediente.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn01-horario-expediente.test.ts).
  - Frontend: [`test/login.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/login.test.tsx), [`test/middleware.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/middleware.test.ts), [`test/recepcao.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/recepcao.test.tsx), [`test/agendaDoDia.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendaDoDia.test.tsx), [`test/minhasConsultas.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/minhasConsultas.test.tsx), [`test/agendarConsulta.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/agendarConsulta.test.tsx), [`test/seletorTipoConsulta.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/seletorTipoConsulta.test.tsx).

---

## 9. Implementação da Regra de Negócio RN01 (Expediente e Intervalo de Almoço)

Implementação completa das restrições e validações da [RN01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN01-horario-expediente-e-almoco.md):

- **Centralização das Regras em [`@bemviver/shared`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/packages/shared/src/index.ts)**:
  - Funções reutilizáveis e puras compartilhadas entre API e Web: `diaUtil`, `cabeNoExpediente`, `validarHorario`, `dataValida`, `gradePorTipo` e `instante`.
- **Backend com Zod (`@bemviver/api`)**:
  - Adicionado schema [`criarConsultaSchema`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/schemas/consultaSchema.ts) validando obrigatoriedade, dias úteis, grade de horários, expediente e almoço com mensagens descritivas.
  - Bloqueio de primeira consulta (60min) às 11:30 (invade o almoço das 12h às 13h) e às 17:30 (invade após 18h).
  - Bloqueio de sábados e domingos com a mensagem oficial `"A clínica só atende de segunda a sexta"`.
  - Filtro em `horariosDisponiveis` garantindo que horários incompatíveis não sejam sequer ofertados pela API.
  - 16 testes automatizados cobrindo todos os cenários da RN01 em [`apps/api/test/rn01-horario-expediente.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn01-horario-expediente.test.ts).
- **Frontend com Zod e Bloqueio Proativo (`@bemviver/web`)**:
  - Schema de validação Zod reativo (`mode: 'onChange'`) em [`AgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx).
  - Bloqueio imediato da seleção de horários e do botão de confirmação ao escolher sábado ou domingo.
  - Proteção pré-requisição no hook [`useAgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgendarConsulta.ts) e otimização de chamadas no [`useHorarios`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useHorarios.ts).
  - Atualização do formulário da recepção [`MarcarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MarcarConsulta/marcarConsulta.tsx) para filtrar slots incompatíveis via `gradePorTipo`.

---

## 10. Implementação e Revisão da Regra de Negócio RN02 (Fuso Horário e Grade de 30 Minutos)

Revisão e validação estrita da [RN02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md):

- **Fuso Horário de Referência Canônico (`America/Recife`)**:
  - Constante `FUSO = 'America/Recife'` e função `hojeEmRecife()` garantindo que a data corrente seja sempre extraída no fuso oficial da clínica, independente da localização do servidor ou máquina do cliente.
  - Função `instante(data, hora)` gerando timestamps absolutos com offset `-03:00`, gravados em instantes UTC precisos no banco de dados.
- **Resolução Definitiva do Bug de Regressão de Data (D-1)**:
  - Padronização de [`formatarData`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/formato.ts) utilizando `Date.UTC` e `timeZone: "UTC"`.
  - Atualização de [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx) para usar `formatarData`, eliminando discrepâncias onde a mesma data aparecia em dias diferentes para o paciente e a recepção.
- **Granularidade da Grade de 30 Minutos**:
  - `GRADE` canônica em intervalos de 30 minutos (`08:00`, `08:30`, ..., `17:30`).
  - Correção na listagem de horários livres da API para considerar apenas consultas com `status: 'agendada'`, liberando imediatamente o slot na grade de 30min se uma consulta for cancelada.
- **Cobertura de Testes Automatizados**:
  - Backend: [`apps/api/test/rn02-fuso-horario-e-grade.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn02-fuso-horario-e-grade.test.ts) (7 testes).
  - Frontend: [`apps/web/test/rn02-formato-data-fuso.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn02-formato-data-fuso.test.ts) (4 testes).

## 11. Implementação e Revisão da Regra de Negócio RN03 (Duração de Consultas e Tipos)

Revisão e implementação completa da [RN03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md):

- **Tipos de Consulta e Duração Canônica**:
  - Definição em `@bemviver/shared`:
    - `primeira`: Duração de **60 minutos** (ocupa 2 blocos consecutivos de 30 minutos).
    - `retorno`: Duração de **30 minutos** (ocupa 1 bloco de 30 minutos).
  - `DURACAO_MINUTOS` exportado centralmente (`{ primeira: 60, retorno: 30 }`).
- **Validação de Expediente e Limites de Horário (`cabeNoExpediente`)**:
  - `primeira` (60 min) não pode iniciar às `11:30` (invadiria o almoço 12h-13h) nem às `17:30` (ultrapassaria o encerramento do expediente às 18h).
  - `retorno` (30 min) pode iniciar às `11:30` (termina às 12:00) e às `17:30` (termina às 18:00).
- **Detecção de Conflitos e Sobreposição de Intervalos (`temConflito`)**:
  - Implementação precisa de sobreposição por intervalos de tempo (`iniNova < fimMarcada && fimNova > iniMarcada`).
  - Bloqueio correto de blocos múltiplos:
    - Uma primeira consulta marcada às `09:00` bloqueia tanto as `09:00` quanto as `09:30`.
    - Uma consulta existente às `10:00` impede o agendamento de uma primeira consulta (60 min) às `09:30` (pois iria até as 10:30), mas permite o agendamento de um retorno (30 min) às `09:30`.
- **Interface e Experiência do Usuário (Front-end)**:
  - Adicionado `NOME_TIPO_COM_DURACAO` em `apps/web/src/lib/formato.ts` exibindo rótulos intuitivos como `Primeira consulta (60 min)` e `Retorno (30 min)`.
  - Atualizado formulário de marcação em [`MarcarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MarcarConsulta/marcarConsulta.tsx) e [`AgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx) para filtrar slots dinamicamente de acordo com o tipo selecionado (`gradePorTipo`) e consultar a API com o tipo selecionado.
- **Cobertura de Testes Automatizados**:
  - Backend: [`apps/api/test/rn03-duracao-consultas-e-tipos.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn03-duracao-consultas-e-tipos.test.ts) (8 testes cobrindo durações, conflitos parciais, grade de horários e rota de agendamento).
  - Frontend: [`apps/web/test/rn03-duracao-consultas-e-tipos.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn03-duracao-consultas-e-tipos.test.tsx) (4 testes cobrindo mapeamento de tipos, grade filtrada por duração e integração com o formulário).

## 12. Implementação e Revisão da Regra de Negócio RN04 (Exclusividade de Atendimento e Prevenção de Conflitos)

Revisão e implementação completa da [RN04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md):

- **Isolamento de Concorrência e Prevenção de Race Conditions**:
  - Implementada transação interativa do Prisma com bloqueio consultivo em nível de transação do PostgreSQL ([`pg_advisory_xact_lock`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/controllers/consultasController.ts#L58)) chaveado por `hashtext(profissionalId || '_' || data)`.
  - Garante atomicidade absoluta quando múltiplas requisições chegam simultaneamente para o mesmo profissional e data: a primeira adquire o lock e conclui o agendamento; a subsequente lê a consulta recém-gravada e é rejeitada com `409 Conflict` ("Esse horário já está ocupado").
- **Exclusividade e Defesa em Profundidade em `temConflito`**:
  - Atualizada [`temConflito`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts#L27-L40) para desconsiderar consultas canceladas (`status !== 'cancelada'`), assegurando que horários liberados por cancelamento possam ser reagendados de imediato por outros pacientes.
- **Tratamento Visual no Front-end e Invalidação de Cache**:
  - [`useAgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useAgendarConsulta.ts#L26-L30) atualizado com `onSettled` para revalidar a lista de horários disponíveis mesmo se a mutação falhar com 409, garantindo que o slot ocupado por outrem suma da tela do usuário.
  - [`AgendarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx) limpa o horário selecionado e exibe `<Alert>{erroMutacao}</Alert>` orientando o usuário a escolher um novo horário.
- **Cobertura de Testes Automatizados**:
  - Backend: [`apps/api/test/rn04-exclusividade-e-conflitos.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn04-exclusividade-e-conflitos.test.ts) (7 testes cobrindo colisões matemáticas, exclusão de canceladas, resposta HTTP 409 e teste de concorrência com requisições paralelas via `Promise.all`).
  - Frontend: [`apps/web/test/rn04-exclusividade-e-conflitos.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn04-exclusividade-e-conflitos.test.tsx) (2 testes cobrindo tratamento visual de conflito 409 no paciente e na recepção, invalidação de query e reset do botão).

## 13. Implementação e Revisão da Regra de Negócio RN05 (Cancelamento de Consultas e Liberação de Horário)

Revisão e implementação completa da [RN05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md):

- **Soft Delete e Preservação Histórica**:
  - O cancelamento nunca remove registros fisicamente do banco de dados (`DELETE FROM Consulta` vedado).
  - Atualização do campo `status` para `'cancelada'` e timestamp `canceladaEm` gravado no instante exato.
- **Autorização e Controle de Acesso (RBAC)**:
  - Adicionada validação de posse em [`cancelarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/controllers/consultasController.ts#L110-L113): pacientes são terminantemente impedidos de cancelar consultas de outros pacientes, recebendo `403 Forbidden` (`{ erro: 'Você só pode cancelar suas próprias consultas' }`).
  - Usuários da recepção possuem permissão para cancelar consultas de qualquer paciente.
  - Profissionais são bloqueados pelo middleware de rota (`403 Forbidden`).
- **Validações de Estado e Conflito**:
  - Cancelamento de consulta inexistente retorna `404 Not Found`.
  - Tentativa de cancelar consulta já cancelada ou com falta registrada retorna `409 Conflict` (`{ erro: 'Só é possível cancelar uma consulta agendada' }`).
- **Liberação Imediata de Slot**:
  - Tanto a rota de horários disponíveis (`GET /profissionais/:id/horarios`) quanto o algoritmo de conflito (`temConflito`) desconsideram consultas canceladas, liberando imediatamente o slot na grade para novos agendamentos por qualquer usuário.
- **Interface e Experiência do Usuário (Front-end)**:
  - [`MinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx) e [`CartaoConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx): botão de cancelamento visível apenas em consultas `agendada`, com confirmação inline de segurança antes do disparo.
  - [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx): botão de cancelamento disponível para a recepção em consultas ativas.
  - Invalidação automática dos caches de `['consultas', 'minhas']`, `['agenda']` e `['horarios']` via TanStack Query.
- **Cobertura de Testes Automatizados**:
  - Backend: [`apps/api/test/rn05-cancelamento-de-consultas.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/rn05-cancelamento-de-consultas.test.ts) (7 testes cobrindo cancelamento por paciente/recepção, bloqueio de cancelamento de terceiros, 404, 409 e liberação imediata do slot).
  - Frontend: [`apps/web/test/rn05-cancelamento-de-consultas.test.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/test/rn05-cancelamento-de-consultas.test.tsx) (3 testes cobrindo fluxo com confirmação inline no paciente, tratamento de erro da API e cancelamento na recepção com invalidação).





