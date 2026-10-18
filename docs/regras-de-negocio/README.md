# Regras de Negócio e Checklist de Conformidade (Back-end & Front-end)

Este diretório contém a documentação técnica aprofundada de todas as regras de negócio do sistema da **Clínica Bem Viver**, acompanhada de checklists de conformidade e matriz de rastreabilidade completa entre Back-end (`apps/api`) e Front-end (`apps/web`).

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
| **RN09** | Confirmação de presença pelo paciente e visibilidade operacional | [`RN09-confirmacao-presenca-paciente.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN09-confirmacao-presenca-paciente.md) |
| **RN10** | Remarcação de consultas pelo paciente e recepção | [`RN10-remarcacao-de-consultas.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN10-remarcacao-de-consultas.md) |
| **RN11** | Lista de espera para horários que forem desocupados | [`RN11-lista-de-espera-vagas-liberadas.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN11-lista-de-espera-vagas-liberadas.md) |
| **RN12** | Bloqueio de agenda por período (férias, recessos e licenças) | [`RN12-bloqueio-agenda-por-periodo.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN12-bloqueio-agenda-por-periodo.md) |
| **RN13** | Relatório de faltas e métricas analíticas de absenteísmo | [`RN13-relatorio-faltas-e-absenteismo.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN13-relatorio-faltas-e-absenteismo.md) |
| **RN14** | Lembrete automático de consultas 24h antes (n8n / fila BullMQ) | [`RN14-lembrete-automatico-consultas.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN14-lembrete-automatico-consultas.md) |
| **RN15** | Histórico e linha do tempo de consultas do paciente | [`RN15-historico-consultas-paciente.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN15-historico-consultas-paciente.md) |
| **RN16** | Busca e filtragem de médicos por especialidade | [`RN16-busca-profissionais-por-especialidade.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN16-busca-profissionais-por-especialidade.md) |
| **RN17** | Exportação da agenda do dia e relatórios em PDF corporativo | [`RN17-exportacao-agenda-pdf.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN17-exportacao-agenda-pdf.md) |
| **RN18** | Concorrência atômica e prevenção de condições de corrida | [`RN18-concorrencia-atomica-agendamentos.md`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN18-concorrencia-atomica-agendamentos.md) |

---

## 2. Matriz de Rastreabilidade (Requisitos -> Código -> Testes)

| Regra | Arquivos Back-end | Componentes / Hooks Front-end | Testes Automatizados |
| :--- | :--- | :--- | :--- |
| **RN01** | `apps/api/src/agenda.ts`<br>`packages/shared/src/index.ts` | `AppointmentDatePicker`<br>`TimeSlotGrid` | `apps/api/test/profissionais.test.ts` |
| **RN02** | `apps/api/src/agenda.ts`<br>`packages/shared/src/index.ts` | `ScheduleDateNav`<br>`lib/formato.ts` | `apps/web/test/doctor-features.test.tsx` |
| **RN03** | `apps/api/src/rotas/consultas.ts`<br>`apps/api/src/agenda.ts` | `ConsultationTypeSelector`<br>`AgendarConsulta` | `apps/web/test/patient-features.test.tsx` |
| **RN04** | `apps/api/src/agenda.ts`<br>`apps/api/src/modules/consultas` | `usePatientSchedule`<br>`TimeSlotGrid` | `apps/api/test/integracoes.test.ts` |
| **RN05** | `apps/api/src/modules/consultas` | `CancelAppointmentModal`<br>`usePatientAppointments` | `apps/web/test/patient-features.test.tsx` |
| **RN06** | `apps/api/src/middlewares/authMiddleware.ts` | `apps/web/src/middleware.ts`<br>`AppShell` | `apps/api/test/auth.test.ts`<br>`apps/web/test/middleware.test.ts` |
| **RN07** | `apps/api/src/modules/profissionais` | `BlockDayAction`<br>`DoctorScheduleBoard` | `apps/api/test/profissionais.test.ts` |
| **RN08** | `apps/api/src/modules/consultas` | `ScheduleAppointmentsTable` | `apps/api/test/consultas.test.ts` |
| **RN09** | `apps/api/src/modules/consultas` | `AppointmentCard`<br>`usePatientAppointments` | `apps/api/test/features/feat-02-confirmacao-presenca.test.ts` |
| **RN10** | `apps/api/src/modules/consultas` | `ModalRemarcarConsulta`<br>`useRemarcarConsulta` | `apps/api/test/features/feat-03-remarcacao.test.ts` |
| **RN11** | `apps/api/src/modules/listaEspera` | `TimeSlotGrid`<br>`TabelaConsultas` | `apps/api/test/features/feat-04-lista-espera.test.ts` |
| **RN12** | `apps/api/src/modules/profissionais` | `BlockPeriodModal`<br>`useDoctorSchedule` | `apps/api/test/features/feat-05-bloqueio-periodo.test.ts` |
| **RN13** | `apps/api/src/modules/relatorios` | `AbsenceReportBoard`<br>`RepeatOffendersTable` | `apps/api/test/features/feat-06-relatorio-faltas.test.ts` |
| **RN14** | `apps/api/src/modules/integracoes` | `n8n/lembrete.json`<br>`emailWorker.ts` | `apps/api/test/features/feat-01-lembrete-n8n.test.ts` |
| **RN15** | `apps/api/src/modules/pacientes` | `PatientAppointmentsList` | `apps/api/test/features/feat-07-historico-consultas.test.ts` |
| **RN16** | `apps/api/src/modules/profissionais` | `SpecialtySelector`<br>`DoctorSelector` | `apps/api/test/features/feat-08-busca-especialidade.test.ts` |
| **RN17** | `apps/api/src/modules/relatorios` | `BotaoExportarPdf`<br>`useExportarPdf` | `apps/api/test/features/feat-09-geracao-pdf-worker.test.ts` |
| **RN18** | `apps/api/src/modules/consultas` | `PatientScheduleForm`<br>`Toast` | `apps/api/test/performance.test.ts` |

---

## 3. Checklist Consolidado do Back-end

- [x] **Expediente e Turnos (RN01)**: Validação de dias úteis e bloqueio de horários no almoço (12h-13h) e fora das 8h-18h.
- [x] **Fuso Horário Canônico (RN02)**: Cálculos e timestamps sincronizados com o fuso `America/Recife`.
- [x] **Duração por Tipo (RN03)**: Cálculo preciso de término (60min para primeira consulta, 30min para retorno).
- [x] **Prevenção de Colisões (RN04)**: Algoritmo `temConflito` impedindo sobreposição de consultas de um mesmo profissional.
- [x] **Cancelamento Não-Destrutivo (RN05)**: Soft delete com `status = 'cancelada'`, timestamp `canceladaEm` e liberação imediata do slot.
- [x] **Controle de Acesso RBAC (RN06)**: Verificação estrita de perfil com middleware `permitir()` e validação de posse (`pacienteId`, `profissionalId`).
- [x] **Gestão de Folgas (RN07)**: Rota para registro de folga pelo médico, preservação de consultas já marcadas e bloqueio de novos agendamentos (`409 Conflict`).
- [x] **Faltas Controladas (RN08)**: Bloqueio de registro de falta antes do horário da consulta ou por perfis que não sejam `recepcao`.
- [x] **Confirmação de Presença (RN09)**: Endpoint `POST /consultas/:id/confirmar`, idempotência e gravação de `confirmadaEm`.
- [x] **Remarcação Atômica (RN10)**: Endpoint `PATCH /consultas/:id/remarcar` com liberação do horário antigo, reserva do novo e reset de confirmação.
- [x] **Lista de Espera Reativa (RN11)**: Gestão de candidatos por turno e notificação assíncrona pós-cancelamento/remarcação via BullMQ.
- [x] **Bloqueio por Período (RN12)**: Endpoint em lote `POST /profissionais/:id/folgas/periodo` para férias e recesso, com invalidação no Redis.
- [x] **Relatório de Absenteísmo (RN13)**: Endpoint agregador com paginação (`skip`/`take`), métricas de evasão e cache no Redis.
- [x] **Lembretes 24h com n8n (RN14)**: Endpoint seguro com header `x-chave-integracao` e despacho diário via Mailpit.
- [x] **Histórico de Consultas (RN15)**: Segregação entre consultas ativas e passadas com ordenação cronológica decrescente.
- [x] **Busca por Especialidade (RN16)**: Filtragem insensível a maiúsculas/acentos e exclusão de profissionais em folga na data.
- [x] **Exportação de PDFs Assíncrona (RN17)**: Fila BullMQ com Puppeteer retornando HTTP 202 com `jobId` e download autenticado.
- [x] **Concorrência Atômica (RN18)**: Prevenção de race condition via transação serializada Prisma e retorno HTTP 409 Conflict.
- [x] **Suíte de Testes da API**: 100% de testes passando no Vitest (auth, profissionais, consultas, integrações, relatórios e performance).

---

## 4. Checklist Consolidado do Front-end

- [x] **Proteção de Rotas com Edge Middleware (RN06)**: Redirecionamento por perfil e proteção de páginas restritas via Next.js Middleware.
- [x] **Separação Arquitetural FSD (Feature-Sliced Design)**: Organização rígida em `shared/ui`, `entities`, `features`, `widgets` e `views`.
- [x] **Teto Estrito de 120 Linhas**: 100% dos componentes e hooks estruturados em arquivos pequenos, desacoplados e de alta coesão.
- [x] **Gerenciamento de Estado com TanStack Query**: Cache declarativo, refetch automático, prefetch e invalidação de cache nas mutations.
- [x] **Formulários e Validação Forte**: Adoção de **React Hook Form + Zod** em todos os formulários com feedback de erro em tempo real.
- [x] **Correção de Timezone (RN02)**: Utilização de `{ timeZone: "UTC" }` ao formatar datas ISO pura, sanando o bug de D-1 no cliente.
- [x] **Acessibilidade WCAG 2.1/2.2 AA**:
  - Touch targets mínimos de 44px (`min-h-11`).
  - Foco retido em modais com fechamento por ESC e backdrop.
  - Anéis de foco destacados (`focus-visible:ring-2 focus-visible:ring-teal-500`).
  - Semântica ARIA (`role="alert"`, `role="status"`, `role="dialog"`).
- [x] **Design System e Storybook**: Stories visuais documentadas para átomos, moléculas e organismos.
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
| *“Duas pessoas marcaram o mesmo horário.”* | Concorrência entre requisições paralelas sem validação atômica. | **RN18** | Transação atômica serializada no banco e retorno `409 Conflict`. |
| *“Estamos perdendo dinheiro com cancelamentos no mesmo dia.”* | Pacientes desistindo em cima da hora sem tempo para remanejamento manual. | **RN09** / **RN11** / **RN14** | Confirmação de presença prévia, lembretes automáticos e lista de espera reativa. |
| *“A recepção precisa conseguir encaixar urgências.”* | Desejo de sobrepor atendimentos no mesmo slot. | **RN04** | Manutenção estrita da exclusividade médica e uso de slots desocupados imediatos. |
| *“Médico vai tirar folga na sexta e tem pacientes marcados.”* | Incerteza sobre consultas já existentes. | **RN07** / **RN12** | Preservação total das consultas marcadas com aviso em destaque para contato manual. |
| *“Tem paciente que falta toda semana.”* | Ausência de visibilidade sobre pacientes reincidentes. | **RN08** / **RN13** | Relatório analítico com ranking de reincidentes e taxa de absenteísmo sem punição arbitrária. |
