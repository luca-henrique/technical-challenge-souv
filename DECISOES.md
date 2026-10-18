# Decisões

Use uma seção para cada problema investigado ou decisão tomada, copiando o bloco abaixo quantas vezes precisar. Escreva do seu jeito, sem se preocupar com formalidade.

## Título curto do problema ou da decisão

**O que eu vi**

**O que achei que era**

**Como confirmei**

**O que fiz e por quê**

**Como testei**

**O que considerei e descartei**

**Quanto tempo levou**

---

## Lembrete com n8n (bônus, se você fizer)

**Como montei o fluxo**

- Exportado no arquivo `n8n/lembrete.json` e executado no container oficial do n8n (`n8nio/n8n:2.40.3`) via `docker compose --profile n8n up -d` (`npm run n8n`).
- **Nó Schedule Trigger**: Configurado para disparar diariamente às 08:00 (fuso `America/Recife`), com antecedência de 24 horas para as consultas agendadas do dia seguinte.
- **Nó HTTP Request**: Realiza requisição `GET http://host.docker.internal:3333/integracoes/lembretes` autenticado pelo cabeçalho `x-chave-integracao` com a chave do ambiente (`CHAVE_INTEGRACAO`), obtendo a lista de consultas ativas (`status = 'agendada'`).
- **Nó Code (JavaScript)**: Itera pelas consultas e formata a data para o padrão nacional (`DD/MM/AAAA`), o assunto (`Lembrete: Sua consulta na Clínica Bem Viver amanhã às HH:mm`) e gera um template HTML responsivo e com a identidade visual da clínica, informando paciente, médico, especialidade, tipo de consulta e orientações para comparecimento com 15 minutos de antecedência.
- **Nó Send Email (SMTP)**: Conecta-se diretamente ao container do Mailpit (`host: mailpit`, porta `1025`) para despachar os e-mails para `atendimento@clinicabemviver.com.br` -> `pacienteEmail` sem necessidade de SSL/TLS local.

**Como testei**

- **Testes automatizados na API**:
  - `apps/api/test/features/feat-01-lembrete-n8n.test.ts`: 5 testes cobrindo autenticação por `x-chave-integracao` (401 para chave ausente ou inválida), cálculo padrão do dia seguinte (`D+1`), formatação e integridade dos nós e conexões do arquivo exportado `n8n/lembrete.json`.
  - `apps/api/test/integracoes.test.ts`: 3 testes cobrindo filtros de data e exclusão de consultas canceladas.
- **Testes de integração com Mailpit**:
  - Validação via API HTTP do Mailpit (`curl http://localhost:8025/api/v1/messages`) para certificar que o servidor SMTP emula com perfeição o recebimento dos e-mails disparados pelo workflow n8n.

**O que mudaria para usar em produção**

- **Idempotência**: Criação de campo `lembreteEnviadoEm DateTime?` na tabela `consultas` e gravação de timestamp após cada disparo bem-sucedido, garantindo que reexecuções manuais ou retries do n8n não dupliquem e-mails aos pacientes.
- **Canais adicionais (Omnichannel)**: Integração com WhatsApp Business API (Evolution API, Twilio ou Z-API) e SMS para pacientes que não acessam e-mail com frequência.
- **Ações diretas (Magic Links)**: Inclusão de links com tokens JWT de uso único no corpo do e-mail ("Confirmar presença com 1 clique" e "Remarcar consulta"), permitindo ao paciente atualizar o status sem login manual prévio.
- **Observabilidade**: Adição de nó _Error Trigger_ no n8n reportando falhas de conexão ou erros de entrega SMTP para canal de alerta (Slack/Discord/Sentry).

## Envio Assíncrono de E-mails com BullMQ e Nodemailer (Mailpit)

**O que eu vi**
O disparo transacional síncrono de e-mails diretamente nas requisições HTTP (criação de consulta, cancelamento, notificação de fila de espera) adiciona latência de rede na resposta do usuário e falha caso o servidor SMTP esteja temporariamente indisponível.

**O que achei que era**
Disparar `mailTransporter.sendMail()` diretamente dentro das rotas do Express.

**Como confirmei**
Qualquer instabilidade ou lentidão no SMTP atrasa a resposta da API para o paciente. Sem fila, falhas temporárias resultam em perda definitiva de notificações aos pacientes sem política de retry.

**O que fiz e por quê**

1. **Fila BullMQ (`src/infra/jobs/emailQueue.ts`)**: Criada a fila `envio-email` com 3 tentativas automáticas via backoff exponencial e limitação de taxa (máximo de 10 e-mails por segundo).
2. **Worker Dedicado (`src/infra/jobs/emailWorker.ts`)**: Inicializado no boot da API, consumindo a fila e despachando e-mails via Nodemailer conectado ao Mailpit (`localhost:1025`).
3. **Templates HTML Corporativos (`emailTemplates.ts`)**: Templates estilizados para confirmação de agendamento, cancelamento de consulta e aviso de vaga liberada na lista de espera.
4. **Desacoplamento nos Casos de Uso**: `criarConsulta` e `cancelarConsulta` enfileiram o job de forma assíncrona sem travar o retorno HTTP para o cliente.

**Como testei**

- Testes automatizados em `apps/api/test/features/feat-email-worker.test.ts` validando templates e integridade da fila no Redis.
- Suíte completa de 10 arquivos e 43 testes da API passando com 100% de sucesso.

**O que considerei e descartei**

- Envio síncrono no Express: Descartado por bloquear o Event Loop e impactar o SLA de resposta.

**Quanto tempo levou**
30 minutos.

---

## Geração de PDF com Worker em Background usando BullMQ e Redis (FEAT-09)

**O que eu vi**
A impressão e exportação física de relatórios (Agenda do Dia e Relatório de Absenteísmo) é uma contingência operacional vital para clínicas médicas. A compilação de documentos e renderização de layouts visuais complexos é computacionalmente intensiva (Chromium headless com Puppeteer), podendo bloquear o Event Loop do Express caso executada de forma síncrona na thread HTTP principal.

**O que achei que era**
Execução puramente client-side com `window.print()` era simples, porém vulnerável a inconsistências entre navegadores e sistemas operacionais, além de impossibilitar agendamentos ou downloads padronizados em lote pelo servidor.

**Como confirmei**
Em ambiente de alta concorrência com múltiplos recepcionistas e médicos solicitando relatórios simultaneamente, requisições HTTP bloqueadas para compilar PDFs degradam a latência e causam timeouts de rede.

**O que fiz e por quê**

1. **Infraestrutura**: Adicionado serviço Redis 7 Alpine no `docker-compose.yml` (porta 6380 para evitar conflitos locais) e variáveis no `.env`.
2. **Fila Assíncrona (BullMQ)**: Criada a fila `geracao-pdf` (`src/infra/jobs/pdfQueue.ts`) com política de retentativas automáticas (3 tentativas com backoff exponencial) e retenção temporária de arquivos concluídos.
3. **Worker Dedicado (Puppeteer)**: Implementado `pdfWorker.ts` processando de forma isolada os jobs enfileirados, compilando templates HTML responsivos corporativos da clínica e gerando arquivos PDF A4 padronizados em `/uploads/pdfs/`.
4. **Endpoints REST**:
   - `POST /relatorios/pdf`: Retorna HTTP 202 com `jobId` imediatamente.
   - `GET /relatorios/pdf/status/:jobId`: Consulta reativa do progresso e status da compilação.
   - `GET /relatorios/pdf/download/:jobId`: Download autenticado com streaming binário.
5. **Frontend**: Hook reativo `useExportarPdf` integrado ao componente `BotaoExportarPdf`, fornecendo feedback em tempo real de carregamento, percentual de progresso e acionamento automático de download.

**Como testei**

- Testes automatizados em `apps/api/test/features/feat-09-geracao-pdf-worker.test.ts` cobrindo enfileiramento, RBAC, consulta de status e rejeição de tipos inválidos.
- Typecheck em ambos os workspaces (`apps/api` e `apps/web`) com 0 erros.

**O que considerei e descartei**

- PDFKit sem worker: Mais leve, porém com formatação visual rígida e incapaz de refletir os componentes e tokens de design do sistema web.
- Geração síncrona no Express: Descartada pelo alto risco de bloqueio da thread principal de I/O em picos de uso.

**Quanto tempo levou**
40 minutos.

---

A priorização detalhada e a fundamentação estratégica completa estão documentadas em **[docs/novas-features/README.md](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/README.md)** utilizando o framework **RICE** (Reach, Impact, Confidence, Effort).

A ordem estabelecida para as 10 funcionalidades é:

1. **[Lembrete automático da consulta 24h antes com n8n](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-01-lembrete-automatico-consultas-n8n.md)** (RICE: 20.0): Ataca diretamente a maior fonte de perda financeira da clínica (o absenteísmo/no-show). Implementado como bônus oficial de engenharia.
2. **[Confirmação de presença pelo paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-02-confirmacao-presenca-paciente.md)** (RICE: 15.0): Complementa o lembrete permitindo que o paciente confirme sua ida ou avise com antecedência, liberando a vaga para a recepção remanejar.
3. **[Remarcação pelo próprio paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-03-remarcacao-pelo-paciente.md)** (RICE: 9.0): Autoatendimento que reduz o cancelamento definitivo e o custo de atendimento telefônico no balcão.
4. **[Lista de espera para horários que forem liberados](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-04-lista-de-espera-horarios-liberados.md)** (RICE: 5.6): Maximiza a taxa de ocupação da grade médica ao realocar desistências imediatas.
5. **[Bloqueio de agenda por período, como férias](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-05-bloqueio-agenda-por-periodo.md)** (RICE: 7.6): Extensão natural da RN07 para evitar múltiplos bloqueios manuais unitários em férias de 15 a 30 dias.
6. **[Relatório de faltas](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-06-relatorio-de-faltas.md)** (RICE: 6.7): Dá inteligência de dados à recepção para identificar pacientes reincidentes e especialidades com maior evasão (RN08).
7. **[Histórico de consultas do paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-07-historico-consultas-paciente.md)** (RICE: 10.0): Dá visibilidade ao paciente e médico sobre consultas passadas (hoje restrito a datas futuras).
8. **[Busca de profissionais por especialidade](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-08-busca-profissionais-especialidade.md)** (RICE: 10.5): Melhora a experiência de agendamento em clínicas com corpo clínico amplo.
9. **[Exportação da agenda do dia em PDF](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-09-exportacao-agenda-pdf.md)** (RICE: 2.7): Apoio operacional e contingência para impressão física de lista de chamada da recepção.
10. **[Tema escuro na área do paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-10-tema-escuro-area-paciente.md)** (RICE: 1.4): Conforto visual moderno, porém sem impacto clínico ou financeiro na operação médica.

## Cache com Redis e Paginação (api/profissionais e api/relatorios/faltas)

**O que eu vi**

1. A rota `GET /profissionais` é consultada com frequência em quase todos os fluxos de agendamento e filtragem de recepção/paciente. Sem cache, executa queries com `join` no Prisma a cada requisição.
2. A rota `GET /relatorios/faltas` realizava agregações pesadas em memória sobre todo o histórico de consultas de absenteísmo, e a lista de reincidentes era retornada por inteiro sem paginação, impactando a performance à medida que o histórico de faltas cresce.

**O que fiz e por quê**

1. **Infraestrutura de Cache com Redis (`CacheService`)**:
   - Criada classe `CacheService` com métodos `obter<T>()`, `salvar()`, `remover()` e `invalidarPadrao()`.
   - Implementado cabeçalho HTTP `X-Cache: HIT` e `X-Cache: MISS` para transparência e observabilidade das respostas cacheadas.
2. **Cache na rota `GET /profissionais`**:
   - Chave: `cache:profissionais:${data ?? ''}:${profissionalId ?? ''}:${especialidade ?? ''}` com TTL de 120 segundos.
   - Invalidação automática (`invalidarPadrao('cache:profissionais:*')`) ao registrar folga única ou bloqueio por período.
3. **Paginação e Cache na rota `GET /relatorios/faltas`**:
   - Adicionados query parameters validados com Zod: `pagina` (default 1) e `limite` (default 10, max 100).
   - Chave de cache particionada por filtros e paginação (`cache:relatorios:faltas:${dataInicio}:${dataFim}:${profissionalId}:${pagina}:${limite}`) com TTL de 60 segundos.
   - Resposta paginada de pacientes reincidentes com metadados `paginacao: { pagina, limite, totalItens, totalPaginas }`.
4. **Paginação no Frontend (`apps/web`)**:
   - Criação da molécula acessível `Paginacao` (`apps/web/src/components/molecules/Paginacao/paginacao.tsx`) seguindo o Design System (`Button`, variantes, acessibilidade e modo escuro).
   - Integração da paginação na `TabelaReincidentes` e na página `recepcao/relatorios/page.tsx`, sincronizando a troca de páginas via TanStack Query e resetando para a página 1 ao aplicar ou limpar filtros.

**Como testei**

- Testes automatizados com Vitest e Supertest na API (`apps/api/test/profissionais.test.ts` e `apps/api/test/features/feat-06-relatorio-faltas.test.ts`), verificando `X-Cache: MISS`, `X-Cache: HIT`, invalidação após folga e recorte por páginas.
- Testes no Frontend (`apps/web/test/features/feat-06-relatorio-faltas.test.tsx`), simulando a navegação entre páginas de reincidentes.
- Execução completa do `typecheck` e testes automatizados.

### BFF (Backend for Frontend) & SSR com App Router

1. **BFF Gateway no Next.js (`apps/web/src/app/api/[...path]/route.ts`)**:
   - Criação de Route Handler no Next.js interceptando todas as chamadas de API (`/api/*`) para abstrair e proteger as rotas internas do backend Express (`API_URL`).
   - Encaminhamento seguro de métodos HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), headers de autenticação (`Authorization: Bearer`), cookies de sessão, filtragem de headers hop-by-hop e injeção de headers de auditoria (`x-bff-agent: nextjs-bff`, `x-forwarded-for`).
   - Respostas tratadas com streaming do body, preservando `Content-Type`, `Content-Disposition` (geração e download de PDFs) e status codes sem expor portas ou IPs internos da infraestrutura.
   - Tratamento de falhas de comunicação com retorno de status 502 amigável.
   - Testes automatizados dedicados em `apps/web/test/bff.test.ts`.

2. **SSR (Server-Side Rendering) & Separação de Camadas (`apps/web/src/components/pages`)**:
   - As páginas em `src/app/**/page.tsx` tornaram-se **Server Components (SSR)** nativos, responsáveis pelo scaffolding da página no servidor e geração de metadados SEO (`metadata: Metadata` com título e descrição específicos por rota).
   - A base visual e interativa das páginas foi desacoplada para `src/components/pages/` como Client Components (`'use client'`):
     - `LoginPage`: autenticação e fluxo de entrada.
     - `RecepcaoPage`: controle da agenda diária e filtros da recepção.
     - `RelatoriosPage`: filtros dinâmicos, métricas e relatório de faltas.
     - `MinhasConsultasPage`: listagem de consultas do paciente e cancelamentos.
     - `AgendarConsultaPage`: agendamento de novas consultas.
     - `ProfissionalPage`: visualização da agenda do profissional.

### Gerenciamento de Estado & Eliminação de Prop Drilling

1. **Contexto de Sessão (`apps/web/src/providers/provedorSessao.tsx`)**:
   - Centralização do estado de autenticação e perfil do usuário logado via `ProvedorSessao` e hook `useSessaoContext()`.
   - Remoção de repasse manual de dados de usuário entre `AppShell`, cabeçalhos e páginas filhas.
2. **Contexto de Agenda (`apps/web/src/providers/provedorAgenda.tsx`)**:
   - Criação do `ProvedorAgenda` e hook `useAgendaContext()` encapsulando profissional selecionado, data ativa, listagem de consultas, carregamento e a mutation `agendarConsulta`.
   - Componentes profundos como `CardAgendaDia` e `MarcarConsulta` agora consomem diretamente o contexto ou mantêm fallback gracioso se usados isoladamente, eliminando múltiplos níveis de passagem de callbacks e identificadores.
   - Testes dedicados em `apps/web/test/gerenciamento-estado-context.test.tsx`.

### Estratégia de Cache Unificada com React Query e Redis

1. **Frontend TanStack Query (`apps/web/src/lib/`)**:
   - Centralização de Query Keys em `queryKeys.ts` para padronização e invalidação granular (`especialidades`, `profissionais`, `consultas`, `relatorioFaltas`).
   - Configuração de cache com `staleTime: 5 * 60 * 1000` (5 minutos) e `gcTime: 30 * 60 * 1000` (30 minutos) em `queryClient.ts`.
   - Utilitário `prefetch.ts` para pré-carregamento de dados críticos na navegação.
2. **Cache de Especialidades no Redis na API (`apps/api`)**:
   - Cache com TTL de 300 segundos da listagem de especialidades mais buscadas com cabeçalho `X-Cache: HIT / MISS`.
   - Testes automatizados em `apps/web/test/cache-strategy.test.ts`.

### Design System Tokens, FSD & Atomic Design no Storybook

1. **Estrutura Feature-Sliced Design (FSD)**:
   - Organização das camadas em `shared/ui`, `entities`, `features`, `widgets` e `views`.
   - Componentes em `shared/ui`: `Typography`, `Button`, `Input`, `Select`, `Badge`, `Card`, `Skeleton`, `Modal`, `FormField`.
2. **Acessibilidade e Tokens de Design**:
   - Touch targets mínimos de 44px (`min-h-11`) para botões e campos de entrada.
   - Foco visível com anéis destacados (`focus-visible:ring-2 focus-visible:ring-teal-500`).
   - Acessibilidade semântica com `role="alert"`, `role="status"` e `aria-live`.
3. **Documentação Visual com Storybook**:
   - Instalação e configuração do Storybook 10 em Next.js (`.storybook/main.ts` e `preview.ts`).
   - Stories isoladas para todos os átomos e moléculas do Design System.
4. **Testes Unitários de Componentes**:
   - Suite completa com React Testing Library e Vitest em `apps/web/test/shared-ui-components.test.tsx` (17 testes cobrindo todas as variantes visuais, acessibilidade e interatividade).

### Padronização e Internacionalização do Domínio em Inglês

1. **Contratos Canônicos em `@bemviver/shared`**:
   - Disponibilização de aliases e tipos de domínio em inglês (`User`, `Professional`, `Appointment`, `AbsenceReport`, `TIMEZONE`, etc.) mantendo retrocompatibilidade total com a base existente.
2. **Glossário de Domínio Técnico**:
   - Criação de `docs/domain-glossary-en.md` mapeando todos os termos de negócio (perfis, tipos de consulta, status, entidades) entre Português e Inglês.

### Melhorias de UI/UX, Feedback Visual e Microinterações

1. **Componente de Estado Vazio (`EmptyState`)**:
   - Componente polido em `apps/web/src/shared/ui/empty-state/` com suporte a variantes (`dashed`, `card`, `inline`), ilustrações SVG e slots de ação, com acessibilidade `role="status"`.
2. **Sistema de Notificações Toast (`ToastProvider` e `useToast()`)**:
   - Contexto de feedback visual dinâmico com animação, suporte a tipos (`success`, `error`, `warning`, `info`), auto-dismiss e acessibilidade.
3. **Acessibilidade e Microinterações**:
   - Adicionada resposta tátil com escala suave em cliques (`active:scale-[0.98]`).
   - Inclusão de skip link acessível no `AppShell` (`#conteudo-principal`) para usuários de leitores de tela e navegação por teclado.

### Testes de Carga, Performance e Otimizações de Produção

1. **Suite de Performance da API (`apps/api/test/performance.test.ts`)**:
   - Testes automatizados com 30 requisições simultâneas para validar vazão, comportamento do pool de conexões e tempo de resposta sob concorrência.
2. **Script de Benchmark de Carga (`apps/api/scripts/benchmark-load.ts`)**:
   - Script executável via `npm run test:performance -w @bemviver/api` medindo percentis p50 (1.94ms), p95 (2.73ms), p99 (3.52ms) e vazão estimada (~486 req/s).
3. **Otimizações no Frontend Next.js**:
   - Habilitação de compressão gzip/brotli (`compress: true`) e desativação do cabeçalho `poweredByHeader` para reduzir payload e melhorar LCP.
4. **Correção de Truncate no Banco**:
   - Adicionado `CASCADE` ao `TRUNCATE` no `prisma/seed.ts` para suportar chaves estrangeiras da tabela `lista_espera`.

### Pipeline de CI/CD com GitHub Actions

1. **Workflow Automatizado (`.github/workflows/ci.yml`)**:
   - Pipeline completa disparada em `push` e `pull_request` na branch `main`.
   - Jobs isolados:
     - **Lint & Typecheck**: ESLint e TypeScript em todos os workspaces.
     - **Backend API & Performance**: Sobe containers de PostgreSQL 17, Redis 7 e Mailpit com healthcheck, aplica migrações e seed, roda suite de testes da API e benchmark de carga.
     - **Frontend Tests & Build**: Executa testes unitários (Vitest), compilação do Next.js em modo produção e build do Storybook.
     - **Continuous Deployment**: Job de entrega contínua após aprovação de todos os testes.
2. **Compatibilização FSD com Next.js App Router**:
   - Resolução de conflito entre App Router e o legacy Pages Router do Next.js: camada de páginas do FSD desacoplada em `apps/web/src/views/`, garantindo build de produção com 0 erros.

### Refatoração da Área do Paciente (pattern-front.md & FSD Estrito)

1. **Separação Rígida de Responsabilidades**:
   - **Schema Zod** (`schedule-appointment.schema.ts`): validação declarativa de tipos, formato ISO 8601 com fuso horário e regras de negócio de agendamento.
   - **Custom Hooks** (`use-patient-schedule.ts`, `use-patient-appointments.ts`): isolamento total de queries React Query, mutações e estados de formulário, sem acoplamento com JSX.
   - **Componentes Puros de UI**: divisão atômica em moléculas (`SpecialtySelector`, `DoctorSelector`, `AppointmentDatePicker`, `ConsultationTypeSelector`, `TimeSlotGrid`, `AppointmentCard`, `CancelAppointmentModal`) e organismos (`PatientScheduleForm`, `PatientAppointmentsList`).
2. **Teto Estrito de 120 Linhas por Arquivo**:
   - Todos os arquivos `.tsx` e `.ts` mantidos estritamente abaixo de 120 linhas, garantindo alta coesão e facilidade de manutenção.
3. **Acessibilidade e Usabilidade (WCAG)**:
   - Touch targets mínimos de 44px (`min-h-11`) em todos os seletores e botões.
   - Modais com foco retido (focus-trap), fechamento com tecla `Escape`, clique no backdrop e bloqueio de rolagem do body.
4. **Stories do Storybook**:
   - Criação de stories isoladas para as moléculas da área do paciente (`specialty-selector`, `doctor-selector`, `appointment-card`).
5. **Cobertura de Testes Automatizados**:
   - Nova suite de testes unitários em `apps/web/test/patient-features.test.tsx` cobrindo validações de schema, seletores, cards de consulta e modais acessíveis.

### Refatoração da Área do Profissional (pattern-front.md & FSD Estrito)

1. **Separação Rígida de Responsabilidades**:
   - **Schema Zod** (`block-schedule.schema.ts`): validação de bloqueio de dia individual e intervalo de férias/recesso com regra de `startDate <= endDate`.
   - **Custom Hook** (`use-doctor-schedule.ts`): queries de agenda com chave unificada (`queryKeys.professionals.agenda`), mutações de folga individual e em período, navegação de datas (anterior/hoje/próximo) e feedback por toast.
   - **Componentes Puros de UI**:
     - Moléculas: `ScheduleDateNav`, `BlockDayAction`, `BlockPeriodModal` (com acessibilidade WCAG total) e `ScheduleAppointmentsTable`.
     - Organismo: `DoctorScheduleBoard` integrando navegação, exportação de PDF, alertas de folga e tabela de consultas.
     - View: `DoctorScheduleView` desacoplada do roteador Next.js.
2. **Teto Estrito de 120 Linhas por Arquivo**:
   - Todos os novos arquivos mantidos estritamente abaixo do limite de 120 linhas.
3. **Resiliência e Acessibilidade**:
   - `useToast` com fallback gracioso para execuções isoladas de testes.
   - `AgendaProfissional` atuando como adapter compatível mantendo compatibilidade com testes legados (`rn07` e `feat-05`).
4. **Stories do Storybook**:
   - Criação de stories para `schedule-date-nav` e `schedule-appointments-table`.
5. **Cobertura de Testes Automatizados**:
   - Suite dedicada em `apps/web/test/doctor-features.test.tsx` (7 novos testes unitários).

### Refatoração da Área da Recepção e Relatórios (pattern-front.md & FSD Estrito)

1. **Separação Rígida de Responsabilidades**:
   - **Slice `reception-agenda`**:
     - Schema Zod (`reception-agenda.schema.ts`): validação de filtros de profissional e data no formato `AAAA-MM-DD`.
     - Custom Hook (`use-reception-agenda.ts`): queries de profissionais com base na data para disponibilidade e auto-seleção inicial.
     - Molécula `ReceptionFilterBar` com touch targets $\ge 44px$ (`min-h-11`).
     - Organismo `ReceptionAgendaBoard` coordenando skeleton com acessibilidade, empty state e agenda do dia.
     - View `ReceptionDashboardView` desacoplada da rota Next.js.
   - **Slice `absence-report`**:
     - Schema Zod (`absence-report.schema.ts`): validação de filtros de intervalo de datas e profissional médico.
     - Custom Hook (`use-absence-report.ts`): gerencia paginação com TanStack Query, filtros ativos e reset.
     - Moléculas: `ReportFilterBar`, `ReportMetricsGrid` (com badge de taxa de absenteísmo) e `RepeatOffendersTable` (com paginação e empty state acessíveis).
     - Organismo `AbsenceReportBoard` e View `AbsenceReportView`.
2. **Teto Estrito de 120 Linhas por Arquivo**:
   - 100% dos novos arquivos `.tsx` e `.ts` mantidos estritamente abaixo de 120 linhas.
   - Eliminação da violação do arquivo legado `RelatoriosPage` (que possuía 160 linhas), delegando-o para `AbsenceReportView`.
3. **Stories do Storybook**:
   - Stories adicionadas para `reception-filter-bar` e `report-metrics-grid`.
4. **Cobertura de Testes Automatizados**:
   - Suite completa em `apps/web/test/reception-features.test.tsx` (6 testes unitários).
   - Manutenção de 100% de compatibilidade regressiva nos testes de recepção e relatórios (`recepcao.test.tsx` e `feat-06-relatorio-faltas.test.tsx`).

## Como usei IA

- codificação
- Detalhamento de bugs ( analisando o projeto e documentação )
- Detalhamento de features ( analisando o projeto e documentação )
- Brainstorming de arquitetura
- Otimização de código
- Geração de testes ( tdd )
- Geração de documentação
- Refatoração de código
- Implementação da nova arquitetura do backend

## O que ficou de fora

- [x] **Gerenciamento de Estado**: Substituir *prop drilling* entre componentes por Context API ou biblioteca de estado (ex: Zustand).
- [x] **Estratégia de Cache**: Implementar cache para os dados e consultas mais buscados (ex: React Query / SWR / Redis).
- [x] **Testes de Componentes**: Adicionar testes unitários e de integração nos componentes de UI (ex: React Testing Library / Vitest / Jest).
- [x] **Storybook**: Documentação visual e desenvolvimento isolado de componentes.
- [x] **Design System Tokens**: Definição completa e padronizada de tokens de design (espaçamentos, tipografia, paletas).
- [x] **Internacionalização / Código em Inglês**: Padronizar código, entidades e documentação técnica em inglês.
- [x] **Melhorias de UI/UX**: Polimento fino de microinterações, estados de loading/empty states e acessibilidade.
- [x] **Testes de Performance**: Testes de carga e estresse na API e otimização de bundle/LCP no frontend.
- [x] **Pipeline de CI/CD**: Automação de lint, build, testes e deploy contínuo (GitHub Actions).

OBS: documentei muita coisa para me ajudar nas implementações e organização, talvez seja até exagero, mas me ajudou a visualizar e entender melhor o projeto e suas regras e necessidades.
