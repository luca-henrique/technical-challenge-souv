# Documentação do Projeto — Clínica Bem Viver

Bem-vindo à documentação técnica oficial da **Clínica Bem Viver**.

> **Regra Obrigatória do Projeto**: A cada alteração ou nova funcionalidade implementada no código (`apps/api`, `apps/web` ou `packages/shared`), documente imediatamente as melhorias e decisões de arquitetura nos diretórios correspondentes em `docs/`.

---

## Estrutura da Documentação

### 1. [Regras de Negócio (`docs/regras-de-negocio/`)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/README.md)
Documentação técnica aprofundada de cada regra de negócio do sistema, com matriz de rastreabilidade, resolução dos relatos da clínica e checklists completos de conformidade para Back-end e Front-end:
- **[RN01: Horário de Expediente e Almoço](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN01-horario-expediente-e-almoco.md)**
- **[RN02: Fuso Horário de Referência e Grade de 30min](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md)**
- **[RN03: Duração de Consultas e Tipos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md)**
- **[RN04: Exclusividade de Atendimento e Conflitos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md)**
- **[RN05: Cancelamento de Consultas e Liberação de Slot](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md)**
- **[RN06: Perfis de Acesso e Permissões RBAC](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md)**
- **[RN07: Bloqueio de Folgas do Profissional](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md)**
- **[RN08: Registro de Faltas e Restrições Operacionais](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md)**
- **[RN09: Confirmação de Presença pelo Paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN09-confirmacao-presenca-paciente.md)**
- **[RN10: Remarcação de Consultas](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN10-remarcacao-de-consultas.md)**
- **[RN11: Lista de Espera para Vagas Liberadas](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN11-lista-de-espera-vagas-liberadas.md)**
- **[RN12: Bloqueio de Agenda por Período](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN12-bloqueio-agenda-por-periodo.md)**
- **[RN13: Relatório de Faltas e Métricas de Absenteísmo](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN13-relatorio-faltas-e-absenteismo.md)**
- **[RN14: Lembrete Automático de Consultas 24 Horas Antes](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN14-lembrete-automatico-consultas.md)**
- **[RN15: Histórico de Consultas e Linha do Tempo](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN15-historico-consultas-paciente.md)**
- **[RN16: Busca e Filtragem por Especialidade](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN16-busca-profissionais-por-especialidade.md)**
- **[RN17: Exportação de Relatórios e Contingência em PDF](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN17-exportacao-agenda-pdf.md)**
- **[RN18: Concorrência Atômica e Prevenção de Race Conditions](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN18-concorrencia-atomica-agendamentos.md)**

---

### 2. [Melhorias e Arquitetura (`docs/melhorias/`)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/README.md)
Histórico e detalhamento das modernizações técnicas introduzidas no monorepo:
- **[Histórico Consolidado de Melhorias](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/historico-de-melhorias.md)**: Visão geral de todas as entregas técnicas (TanStack Query, Zod, RHF, Edge Middleware, Skeletons e serviços).
- **[Mapeamento de Páginas e Features do Front-end](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/mapeamento-paginas-e-features.md)**: Inventário completo das rotas em `apps/web/src/app` separadas por pastas com todas as features e componentes atômicos.
- **[Checklist de Acessibilidade (a11y)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/checklist-acessibilidade-a11y.md)**: Diagnóstico e checklist de WCAG 2.1/2.2 AA para todas as telas e componentes.
- **[Checklist de Auditoria e Padronização do Design System](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/checklist-design-system.md)**: Diagnóstico de inconsistências visuais, tipografia, botões, badges, modais e plano de ação do Design System (`apps/web`).
- **[Padrões de Desenvolvimento e Nomenclatura](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/padroes-de-desenvolvimento.md)**: Convenções de pastas, arquivos, TypeScript, Atomic Design e boas práticas.
- **[Melhorias no Formulário de Login](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/melhorias-formulario-login.md)**: Detalhamento do login moderno com TanStack Query e Zod.
- **[Melhorias na Agenda do Dia](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/melhorias-agenda-do-dia.md)**: Refatoração da agenda da recepção e resolução do bug de fuso horário.

---

### 3. [Bugs e Resoluções (`docs/bugs/`)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/README.md)
Mapeamento aprofundado, diagnóstico de causas raízes e testes de regressão dos 6 problemas relatados pela clínica:
- **[BUG-01: Discrepância de Data e Fuso Horário (Bug D-1)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-01-discrepancia-data-fuso-horario.md)**
- **[BUG-02: Sobreposição de Consultas com Durações Diferentes](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-02-sobreposicao-consultas-duracoes-diferentes.md)**
- **[BUG-03: Slot Bloqueado Após Cancelamento de Consulta](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-03-slot-bloqueado-apos-cancelamento.md)**
- **[BUG-04: Cache Desatualizado ao Alternar Profissionais na Agenda](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-04-cache-troca-profissional-agenda.md)**
- **[BUG-05: Carregamento Infinito para Pacientes Novos sem Consultas](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-05-carregamento-infinito-paciente-sem-consultas.md)**
- **[BUG-06: Condição de Corrida em Agendamentos Simultâneos](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/BUG-06-condicao-de-corrida-agendamento-simultaneo.md)**
- **[Situações em Aberto e Pedidos Operacionais](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/bugs/SITUACOES-EM-ABERTO.md)**

---

### 4. [Novas Funcionalidades (`docs/novas-features/`)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/README.md)
Planejamento estratégico, priorização por matriz RICE e especificações técnicas das 10 funcionalidades solicitadas:
- **[Matriz de Priorização RICE e Ranking](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/README.md)**
- **[FEAT-01: Lembrete Automático com n8n (1º Lugar - Bônus)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-01-lembrete-automatico-consultas-n8n.md)**
- **[FEAT-02: Confirmação de Presença pelo Paciente (2º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-02-confirmacao-presenca-paciente.md)**
- **[FEAT-03: Remarcação pelo Próprio Paciente (3º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-03-remarcacao-pelo-paciente.md)**
- **[FEAT-04: Lista de Espera para Horários Liberados (4º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-04-lista-de-espera-horarios-liberados.md)**
- **[FEAT-05: Bloqueio de Agenda por Período (5º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-05-bloqueio-agenda-por-periodo.md)**
- **[FEAT-06: Relatório de Faltas (6º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-06-relatorio-de-faltas.md)**
- **[FEAT-07: Histórico de Consultas do Paciente (7º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-07-historico-consultas-paciente.md)**
- **[FEAT-08: Busca de Profissionais por Especialidade (8º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-08-busca-profissionais-especialidade.md)**
- **[FEAT-09: Exportação da Agenda do Dia em PDF (9º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-09-exportacao-agenda-pdf.md)**
- **[FEAT-10: Tema Escuro na Área do Paciente (10º Lugar)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-10-tema-escuro-area-paciente.md)**

