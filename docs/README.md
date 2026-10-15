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

---

### 2. [Melhorias e Arquitetura (`docs/melhorias/`)](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/README.md)
Histórico e detalhamento das modernizações técnicas introduzidas no monorepo:
- **[Histórico Consolidado de Melhorias](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/historico-de-melhorias.md)**: Visão geral de todas as entregas técnicas (TanStack Query, Zod, RHF, Edge Middleware, Skeletons e serviços).
- **[Padrões de Desenvolvimento e Nomenclatura](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/padroes-de-desenvolvimento.md)**: Convenções de pastas, arquivos, TypeScript, Atomic Design e boas práticas.
- **[Melhorias no Formulário de Login](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/melhorias-formulario-login.md)**: Detalhamento do login moderno com TanStack Query e Zod.
- **[Melhorias na Agenda do Dia](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/melhorias/melhorias-agenda-do-dia.md)**: Refatoração da agenda da recepção e resolução do bug de fuso horário.
