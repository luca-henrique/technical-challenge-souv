# Mapeamento de Páginas e Funcionalidades do Front-end (`apps/web/src/app`)

Este documento descreve detalhadamente a arquitetura de páginas, componentes atômicos associados e as regras de negócio/features implementadas em cada rota da aplicação web (`apps/web`).

---

## Estrutura de Diretórios de Rotas

```
apps/web/src/app/
├── layout.tsx                     # Root Layout (provedores, tema anti-flicker e fontes)
├── page.tsx                       # Rota pública: / (Login)
├── paciente/                      # Rota protegida: /paciente (Perfil: paciente)
│   ├── layout.tsx                 # Header com perfil, logout e BotaoTema
│   ├── page.tsx                   # Minhas Consultas (Próximas vs Histórico)
│   └── agendar/
│       └── page.tsx               # Rota: /paciente/agendar (Novo agendamento)
├── profissional/                  # Rota protegida: /profissional (Perfil: profissional)
│   ├── layout.tsx                 # Header do profissional com logout e BotaoTema
│   └── page.tsx                   # Agenda do médico, bloqueio de férias e exportação
└── recepcao/                      # Rota protegida: /recepcao (Perfil: recepcao)
    ├── layout.tsx                 # Header da recepção com logout e BotaoTema
    ├── page.tsx                   # Grade operacional, faltas, folgas e exportação
    └── relatorios/
        ├── page.tsx               # Rota: /recepcao/relatorios (Absenteísmo/No-show)
        └── schema.ts              # Validação Zod dos filtros de relatório
```

---

## 1. Pasta Raiz: `apps/web/src/app/`

### 1.1. `layout.tsx` (Root Layout)
- **Caminho**: [apps/web/src/app/layout.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/layout.tsx)
- **Responsabilidade**: Casca global compartilhada por todas as páginas da aplicação.
- **Features e Tecnologias**:
  - **Provedor React Query (`ProvedorQuery`)**: Configuração global do TanStack Query com cache inteligente e sem retry duplicado desnecessário.
  - **Script Anti-Flicker de Tema**: Execução síncrona no `<head>` para detectar `localStorage` e preferência do sistema operacional (`prefers-color-scheme: dark`) antes da hidratação, evitando piscada branca (FOUC).
  - **Classes Base Responsivas**: Estilização com suporte a modo escuro (`dark:bg-gray-950 dark:text-gray-100`).

### 1.2. `page.tsx` (Página de Login)
- **Caminho**: [apps/web/src/app/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/page.tsx)
- **Rota**: `/`
- **Acesso**: Público (redireciona automaticamente se já houver sessão ativa).
- **Componentes Principais**:
  - `AuthTemplate` ([authTemplate.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/templates/AuthTemplate/authTemplate.tsx))
  - `FormularioLogin` ([formularioLogin.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/FormularioLogin/formularioLogin.tsx))
- **Features Implementadas**:
  - **Autenticação com JWT**: Envio de credenciais para `POST /auth/login`.
  - **Validação com React Hook Form + Zod**: Validação de formato de e-mail e senha em tempo real com mensagens acessíveis.
  - **Redirecionamento Baseado em RBAC (RN06)**:
    - Paciente ➔ `/paciente`
    - Profissional ➔ `/profissional`
    - Recepção ➔ `/recepcao`
  - **Tratamento de Credenciais Inválidas**: Mensagem visual de erro com `Alert` acessível em caso de 401.

---

## 2. Pasta: `apps/web/src/app/paciente/`

### 2.1. `layout.tsx` (Layout da Área do Paciente)
- **Caminho**: [apps/web/src/app/paciente/layout.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/paciente/layout.tsx)
- **Componente**: `AreaTemplate` ([areaTemplate.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/templates/AreaTemplate/areaTemplate.tsx))
- **Features**:
  - **Guarda de Rotas (RBAC)**: Redireciona usuários sem perfil `paciente` para `/`.
  - **Botão de Alternância de Tema (FEAT-10)**: Alterna entre Claro, Escuro e Automático com feedback visual imediato.
  - **Identificação do Paciente e Logout**: Exibição do nome do usuário autenticado e botão de encerramento de sessão.

---

### 2.2. `page.tsx` (Painel Principal do Paciente — Minhas Consultas)
- **Caminho**: [apps/web/src/app/paciente/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/paciente/page.tsx)
- **Rota**: `/paciente`
- **Componentes Principais**:
  - `MinhasConsultas` ([minhasConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx))
  - `CartaoConsulta` ([cartaoConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx))
  - `ModalRemarcarConsulta` ([modalRemarcarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/ModalRemarcarConsulta/modalRemarcarConsulta.tsx))
  - `MinhasInscricoesEspera` ([minhasInscricoesEspera.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasInscricoesEspera/minhasInscricoesEspera.tsx))
- **Features Implementadas**:
  1. **Navegação por Abas (FEAT-07)**:
     - **Aba "Próximas consultas"**: Lista apenas agendamentos futuros confirmados ou pendentes (`inicio > agora`).
     - **Aba "Histórico"**: Lista consultas passadas (`inicio <= agora`) e concluídas/canceladas (`realizada`, `faltou`, `cancelada`).
  2. **Transição Temporal e Cancelamento Automático (Edge Case FEAT-07)**:
     - Consultas do mesmo dia cujo horário passou sem confirmação são canceladas automaticamente e migradas para o histórico.
  3. **Confirmação de Presença (FEAT-02)**:
     - Botão "Confirmar presença" no card da consulta futura (`POST /consultas/:id/confirmar`).
     - Badge visual verde `✓ Presença confirmada`.
  4. **Remarcação de Consulta pelo Paciente (FEAT-03)**:
     - Botão "Remarcar" que abre o modal com seleção de nova data e horário disponível.
     - Bloqueio com lock concorrente PostgreSQL e notificação da vaga liberada para a lista de espera.
  5. **Cancelamento Seguro de Consulta (RN05)**:
     - Ação de cancelamento em duas etapas com pedido explícito de confirmação ("Confirmar cancelamento" / "Voltar").
     - Liberação imediata da vaga na grade e disparo de alerta para a lista de espera.
  6. **Gestão de Inscrições na Lista de Espera (FEAT-04)**:
     - Card de inscrições ativas exibindo médico, data solicitada e turno.
     - Indicador destacado `🎉 Vaga liberada!` quando uma vaga é notificada ao paciente.
     - Ação "Sair da fila" para desistência da lista de espera.
  7. **Botão de Ação Rápida**: Link "Marcar consulta" para a tela `/paciente/agendar`.

---

### 2.3. `agendar/page.tsx` (Agendamento de Consulta pelo Paciente)
- **Caminho**: [apps/web/src/app/paciente/agendar/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/paciente/agendar/page.tsx)
- **Rota**: `/paciente/agendar`
- **Componentes Principais**:
  - `AgendarConsulta` ([agendarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx))
  - `SeletorEspecialidade` ([seletorEspecialidade.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorEspecialidade/seletorEspecialidade.tsx))
  - `SeletorProfissional` ([seletorProfissional.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorProfissional/seletorProfissional.tsx))
  - `SeletorData` ([seletorData.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorData/seletorData.tsx))
  - `SeletorTipoConsulta` ([seletorTipoConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorTipoConsulta/seletorTipoConsulta.tsx))
  - `SeletorHorario` ([seletorHorario.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorHorario/seletorHorario.tsx))
  - `CardEntrarListaEspera` ([cardEntrarListaEspera.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CardEntrarListaEspera/cardEntrarListaEspera.tsx))
- **Features Implementadas**:
  1. **Filtro de Médicos por Especialidade (FEAT-08)**:
     - Dropdown com especialidades cadastradas; filtrar por especialidade restringe imediatamente a lista de profissionais.
  2. **Bloqueio de Finais de Semana e Expediente (RN01 / BUG-01)**:
     - Bloqueio de seleção de sábados, domingos e horários fora do expediente (08h às 18h).
  3. **Seleção de Duração Dinâmica por Tipo (RN03 / BUG-02)**:
     - Primeira consulta (60 minutos) vs Retorno (30 minutos) com validação de janelas contíguas livres.
  4. **Entrada na Lista de Espera por Horários Liberados (FEAT-04)**:
     - Quando a grade de um médico estiver esgotada para a data, exibe automaticamente o card para entrar na fila com preferência de turno (Manhã, Tarde ou Qualquer).
  5. **Proteção Contra Conflitos de Horário (RN04 / BUG-06)**:
     - Verificação em tempo real de slots disponíveis e feedback acessível de concorrência com reset de seleção.

---

## 3. Pasta: `apps/web/src/app/profissional/`

### 3.1. `layout.tsx` (Layout da Área do Profissional)
- **Caminho**: [apps/web/src/app/profissional/layout.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/profissional/layout.tsx)
- **Componente**: `AreaTemplate` com permissão restrita a `perfil="profissional"`.

---

### 3.2. `page.tsx` (Agenda do Médico e Gestão de Folgas)
- **Caminho**: [apps/web/src/app/profissional/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/profissional/page.tsx)
- **Rota**: `/profissional`
- **Componentes Principais**:
  - `AgendaProfissional` ([agendaProfissional.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaProfissional/agendaProfissional.tsx))
  - `FormBloquearFolga` ([formBloquearFolga.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/FormBloquearFolga/formBloquearFolga.tsx))
  - `FormBloquearPeriodo` ([formBloquearPeriodo.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/FormBloquearPeriodo/formBloquearPeriodo.tsx))
  - `BotaoExportarPdf` ([botaoExportarPdf.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/BotaoExportarPdf/botaoExportarPdf.tsx))
  - `TabelaConsultas` ([tabelaConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx))
- **Features Implementadas**:
  1. **Visualização da Grade do Dia por Data**:
     - Seletor de data para inspeção da escala de consultas do médico.
  2. **Indicador de Confirmação de Presença (FEAT-02)**:
     - Badge visual na listagem indicando se o paciente confirmou a ida ("Confirmada" em verde vs "Pendente").
  3. **Bloqueio de Folga Única (RN07)**:
     - Formulário para registrar folga em data específica, impedindo novos agendamentos na grade.
  4. **Bloqueio de Agenda por Período de Férias (FEAT-05)**:
     - Modal/Formulário para bloqueio contínuo de data início a data término em lote (ignorando sábados e domingos automaticamente).
  5. **Exportação da Agenda em PDF (FEAT-09)**:
     - Botão dedicado para impressão/exportação formatada em PDF (`@media print`), ocultando botões de ação e headers.

---

## 4. Pasta: `apps/web/src/app/recepcao/`

### 4.1. `layout.tsx` (Layout da Área da Recepção)
- **Caminho**: [apps/web/src/app/recepcao/layout.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/layout.tsx)
- **Componente**: `AreaTemplate` com permissão restrita a `perfil="recepcao"`.

---

### 4.2. `page.tsx` (Central da Recepção — Gestão de Grade)
- **Caminho**: [apps/web/src/app/recepcao/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/page.tsx)
- **Rota**: `/recepcao`
- **Componentes Principais**:
  - `AgendaDoDia` ([agendaDoDia.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx))
  - `TabelaConsultas` ([tabelaConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx))
  - `BotaoExportarPdf` ([botaoExportarPdf.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/BotaoExportarPdf/botaoExportarPdf.tsx))
  - `FormBloquearFolga` ([formBloquearFolga.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/FormBloquearFolga/formBloquearFolga.tsx))
- **Features Implementadas**:
  1. **Filtro Combinado de Médico e Data (BUG-04)**:
     - Seleção de profissional e data com reset imediato de cache para garantir que a agenda de um médico anterior não continue visível.
  2. **Registro de Falta / No-Show pelo Balcão (RN08)**:
     - Botão "Registrar falta" liberado exclusivamente para horários cujo início já passou.
     - Bloqueio operacional automático caso o paciente já possua 3 faltas acumuladas nos últimos 90 dias.
  3. **Visualização de Presença Confirmada (FEAT-02)**:
     - Permite à recepção priorizar chamadas e remanejar horários de pacientes com presença confirmada.
  4. **Exportação da Agenda do Dia em PDF (FEAT-09)**:
     - Impressão física da lista de chamada do dia com cabeçalho limpo e checklist de presença.
  5. **Navegação para o Painel Analítico**:
     - Botão em destaque "Relatório de faltas" direcionando para `/recepcao/relatorios`.

---

### 4.3. `relatorios/page.tsx` (Relatório de Absenteísmo e No-Show)
- **Caminho**: [apps/web/src/app/recepcao/relatorios/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/relatorios/page.tsx)
- **Rota**: `/recepcao/relatorios`
- **Componentes Principais**:
  - `MetricasRelatorio` ([metricasRelatorio.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MetricasRelatorio/metricasRelatorio.tsx))
  - `TabelaReincidentes` ([tabelaReincidentes.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaReincidentes/tabelaReincidentes.tsx))
  - `BotaoExportarPdf` ([botaoExportarPdf.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/BotaoExportarPdf/botaoExportarPdf.tsx))
- **Features Implementadas (FEAT-06)**:
  1. **Painel de Métricas Consolidadas**:
     - **Total de Consultas**: Volume global de agendamentos no período.
     - **Faltas Registradas**: Contagem absoluta de ausências sem cancelamento prévio.
     - **Taxa de Absenteísmo**: Porcentagem precisa de no-show para tomada de decisão clínica.
  2. **Filtros Parametrizados (React Hook Form + Zod)**:
     - Filtro por Data de Início, Data de Término e Seleção de Médico com botões de "Filtrar" e "Limpar".
  3. **Tabela de Pacientes Reincidentes**:
     - Relação de pacientes com 2 ou mais faltas no período com badges de severidade (Alerta para ≥ 2 faltas e Crítico para ≥ 3 faltas com restrição operacional).
  4. **Exportação do Relatório em PDF**:
     - Geração de relatório limpo e executivo para apresentação gerencial à diretoria da clínica.

---

## Matriz Resumo de Rotas e Recursos

| Rota | Perfil Autorizado | Finalidade Principal | Funcionalidades / Casos de Uso |
|---|:---:|---|---|
| `/` | Público | Autenticação | Login JWT, validação Zod, redirecionamento RBAC |
| `/paciente` | Paciente | Autoatendimento | Próximas consultas, histórico cronológico, confirmação de presença, remarcação, cancelamento e lista de espera |
| `/paciente/agendar` | Paciente | Novo Agendamento | Filtro por especialidade, grade de 30/60min, bloqueio fim de semana, lista de espera automática |
| `/profissional` | Profissional | Grade Médica | Visualização da agenda do dia, indicador de confirmação, bloqueio de dia avulso e férias em período, PDF |
| `/recepcao` | Recepção | Balcão Operacional | Busca por médico/data, registro de faltas (RN08), visualização de presença, cancelamentos, PDF |
| `/recepcao/relatorios` | Recepção | Inteligência de Dados | Métricas de no-show, taxa de evasão, tabela de pacientes reincidentes e exportação em PDF |
