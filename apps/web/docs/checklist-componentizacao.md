# Checklist de Refatoração: Códigos Duplicados e Oportunidades de Componentização

Este documento apresenta o levantamento técnico dos trechos de código duplicados, semelhantes ou com padrões repetitivos no projeto (`apps/web`), com foco na arquitetura Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).

---

## 📊 Matriz de Priorização e Status

| Oportunidade | Tipo | Impacto | Esforço | Prioridade | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **1. Unificação do Formulário de Marcar Consulta** | Organism | Alto | Baixo | 🔴 **Alta** | Concluído ✅ |
| **2. Card Unificado da Agenda Diária** | Organism | Alto | Médio | 🔴 **Alta** | Concluído ✅ |
| **3. Adoção do `EmptyState` Existente** | Molecule | Alto | Baixo | 🔴 **Alta** | Concluído ✅ |
| **4. Seção e Seletor de Horário com Loading** | Molecule | Médio | Baixo | 🟡 **Média** | Concluído ✅ |
| **5. Componente de Cabeçalho de Página (`PageHeader`)** | Molecule | Médio | Baixo | 🟡 **Média** | Concluído ✅ |
| **6. Componentes de Tabela Componíveis (`Table`)** | Atom | Médio | Médio | 🟡 **Média** | Concluído ✅ |
| **7. Seletor de Intervalo de Datas (`SeletorIntervaloDatas`)** | Molecule | Médio | Baixo | 🟡 **Média** | Concluído ✅ |
| **8. Seletor Segmentado / Radio Group (`SegmentedControl`)** | Molecule | Médio | Médio | 🟡 **Média** | Concluído ✅ |
| **9. Card de Métrica / Estatística (`CardMetrica`)** | Molecule | Baixo | Baixo | 🟢 **Baixa** | Concluído ✅ |
| **10. Botão de Confirmação Inline (`InlineConfirmButton`)** | Molecule | Baixo | Baixo | 🟢 **Baixa** | Concluído ✅ |
| **11. Integração de `BadgeTaxa` com `Badge`** | Atom | Baixo | Baixo | 🟢 **Baixa** | Concluído ✅ |

---

## 🔍 Detalhamento das Oportunidades & Checklist

### 🔴 1. Formulário de "Marcar Consulta" Redundante em `AgendaDoDia`
- **Arquivos envolvidos:**
  - [agendaDoDia.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx)
  - [marcarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MarcarConsulta/marcarConsulta.tsx)
- **Diagnóstico:** O componente `AgendaDoDia` reescreveu por completo um formulário de agendamento contendo `pacienteId`, `tipo`, `hora`, hook de pacientes e hook de agendamento. Esse componente já existe pronto e isolado em `MarcarConsulta`.
- **Benefício:** Elimina ~60 linhas de código duplicado, centraliza validação via Zod e tratamento de erros de mutação.
- **Checklist:**
  - [x] Substituir o `<form>` inline de `AgendaDoDia` pelo componente `<MarcarConsulta profissionalId={profissionalId} data={data} onMarcada={...} />`.
  - [x] Remover estados e hooks duplicados (`usePacientes`, `useForm<DadosAgendarConsulta>`, `mensagemSucesso`) de `AgendaDoDia`.

---

### 🔴 2. Card de Visualização da Agenda Diária (`CardAgendaDia`)
- **Arquivos envolvidos:**
  - [agendaDoDia.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx)
  - [agendaProfissional.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaProfissional/agendaProfissional.tsx)
- **Diagnóstico:** Ambas as telas renderizavam exatamente a mesma estrutura de card para a agenda do dia (`Card`, cabeçalho com data formatada, botão de exportar PDF, alerta condicional de folga e `TabelaConsultas`).
- **Implementação:** Criado organismo `src/components/organisms/CardAgendaDia/` (`cardAgendaDia.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Criar o componente `CardAgendaDia` recebendo `agenda`, `profissionalId`, `acoes?` e mensagens de erro opcionais.
  - [x] Utilizar `CardAgendaDia` tanto na visão da recepção (`AgendaDoDia`) quanto na visão do médico (`AgendaProfissional`).

---

### 🔴 3. Adoção e Unificação do `EmptyState`
- **Arquivos envolvidos:**
  - [emptyState.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/EmptyState/emptyState.tsx)
  - [semProfissionalSelecionado.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado.tsx)
  - [tabelaConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx)
  - [tabelaReincidentes.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaReincidentes/tabelaReincidentes.tsx)
  - [minhasConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx)
- **Diagnóstico:** Múltiplos componentes criavam mensagens visuais vazias distintas com parágrafos manuais e bordas ad-hoc.
- **Implementação:** Suporte a variantes `dashed`, `card` e `inline` adicionado a `EmptyState`.
- **Checklist:**
  - [x] Refatorar `SemProfissionalSelecionado` para compor internamente `<EmptyState />`.
  - [x] Adicionar suporte a variantes `dashed`, `card` e `inline` em `EmptyState`.
  - [x] Substituir estados vazios manuais em `TabelaConsultas`, `TabelaReincidentes` e `MinhasConsultas`.

---

### 🟡 4. Bloco de Seleção de Horários Disponíveis (`SecaoHorario`)
- **Arquivos envolvidos:**
  - [agendarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx)
  - [modalRemarcarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/ModalRemarcarConsulta/modalRemarcarConsulta.tsx)
- **Diagnóstico:** `<fieldset>` com legenda, loading esqueleto (`Skeleton`), grade de horários com `SeletorHorario`, mensagens de erro e fallback de esgotado/slot de lista de espera duplicados nos fluxos de agendamento e remarcação.
- **Implementação:** Criada molécula `src/components/molecules/SecaoHorario/` (`secaoHorario.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Criar a molécula `SecaoHorario`.
  - [x] Integrar `SecaoHorario` em `AgendarConsulta` e `ModalRemarcarConsulta`.

---

### 🟡 5. Cabeçalho Padrão de Página (`PageHeader`)
- **Arquivos envolvidos:**
  - [recepcao/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/page.tsx)
  - [recepcao/relatorios/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/relatorios/page.tsx)
  - [minhasConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx)
  - [agendarConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx)
- **Diagnóstico:** Cabeçalhos com layout flexível, título h1 responsivo, subtítulo e slots de ações replicados manualmente.
- **Implementação:** Criada molécula `src/components/molecules/PageHeader/` (`pageHeader.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Criar o componente `PageHeader`.
  - [x] Adotar o `PageHeader` em `RecepcaoPage`, `RelatoriosPage`, `MinhasConsultas` e `AgendarConsulta`.

---

### 🟡 6. Abstração Componível para Tabelas (`Table`)
- **Arquivos envolvidos:**
  - [tabelaConsultas.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx)
  - [tabelaReincidentes.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaReincidentes/tabelaReincidentes.tsx)
- **Diagnóstico:** Classes utilitárias repetidas em várias tags `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` e `.sr-only`.
- **Implementação:** Criada família de átomos `src/components/atoms/Table/` (`table.tsx`, `types.ts`, `index.ts`) com `Table.Header`, `Table.Body`, `Table.Row`, `Table.Head`, `Table.Cell`.
- **Checklist:**
  - [x] Criar os átomos de tabela com suporte nativo ao tema escuro e estados de hover/borda.
  - [x] Refatorar `TabelaConsultas` e `TabelaReincidentes` para utilizar a estrutura componível.

---

### 🟡 7. Seletor de Intervalo de Datas (`SeletorIntervaloDatas`)
- **Arquivos envolvidos:**
  - [formBloquearPeriodo.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/FormBloquearPeriodo/formBloquearPeriodo.tsx)
  - [recepcao/relatorios/page.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/relatorios/page.tsx)
- **Diagnóstico:** Campos de "Data de início" e "Data de término" com inputs, labels, min/max e wrappers idênticos.
- **Implementação:** Criada molécula `src/components/molecules/SeletorIntervaloDatas/` (`seletorIntervaloDatas.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Implementar `SeletorIntervaloDatas` com suporte a datas controladas, desativação e formatação.
  - [x] Utilizar o componente em `FormBloquearPeriodo` e nos filtros de `RelatoriosPage`.

---

### 🟡 8. Controle de Seleção Segmentada (`SegmentedControl`)
- **Arquivos envolvidos:**
  - [seletorTipoConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorTipoConsulta/seletorTipoConsulta.tsx)
- **Diagnóstico:** Seleções de opções exclusivas com múltiplos botões estilizados.
- **Implementação:** Criada molécula `src/components/molecules/SegmentedControl/` (`segmentedControl.tsx`, `types.ts`, `index.ts`) com acessibilidade total (`role="radiogroup"` / `role="radio"`).
- **Checklist:**
  - [x] Criar `src/components/molecules/SegmentedControl/`.
  - [x] Refatorar `SeletorTipoConsulta` para compor `SegmentedControl`.

---

### 🟢 9. Card de Métrica / Estatística (`CardMetrica`)
- **Arquivos envolvidos:**
  - [metricasRelatorio.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MetricasRelatorio/metricasRelatorio.tsx)
- **Diagnóstico:** Quatro estruturas idênticas de `<Card>` com `<dt>` e `<dd>`.
- **Implementação:** Criada molécula `src/components/molecules/CardMetrica/` (`cardMetrica.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Criar o componente `CardMetrica`.
  - [x] Refatorar `MetricasRelatorio` para usar `<CardMetrica />`.

---

### 🟢 10. Padrão de Confirmação Inline em 2 Etapas (`InlineConfirmButton`)
- **Arquivos envolvidos:**
  - [cartaoConsulta.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx)
  - [agendaProfissional.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaProfissional/agendaProfissional.tsx)
- **Diagnóstico:** Fluxo de confirmação de segurança alternando entre ação inicial e botões "Confirmar" / "Voltar".
- **Implementação:** Criada molécula `src/components/molecules/InlineConfirmButton/` (`inlineConfirmButton.tsx`, `types.ts`, `index.ts`).
- **Checklist:**
  - [x] Criar a molécula `InlineConfirmButton`.
  - [x] Aplicar no cancelamento em `CartaoConsulta` e no bloqueio de folga em `AgendaProfissional`.

---

### 🟢 11. Composição de `BadgeTaxa` sobre `Badge`
- **Arquivos envolvidos:**
  - [badgeTaxa.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/atoms/BadgeTaxa/badgeTaxa.tsx)
  - [badge.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/atoms/Badge/badge.tsx)
- **Diagnóstico:** `BadgeTaxa` recriava classes CSS de cores em vez de utilizar o átomo semântico `Badge`.
- **Checklist:**
  - [x] Refatorar `BadgeTaxa` para compor `<Badge variante={...}>{taxa.toFixed(1)}%</Badge>`.
  - [x] Garantir que formato e contraste permaneçam validados nos testes de relatórios.
