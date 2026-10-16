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

trocar props drilling entre components por context ( talvez um gerenciador de estado ), gerar cache pelos mais buscados, teste unitarios dentro dos components, storybook, design system tokens completos, padronizar tudo para inglês ( costume, achei estranho tudo em português, mas faz parte do desafio ), melhorias adicionais de ui/ux, teste de performance, ci/cd

OBS: documentei muita coisa para me ajudar nas implementações e organização, talvez seja até exagero, mas me ajudou a visualizar e entender melhor o projeto e suas regras e necessidades.
