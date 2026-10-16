# Checklist de Refatoração: Códigos Duplicados e Oportunidades de Componentização

Este documento apresenta o levantamento técnico dos trechos de código duplicados, semelhantes ou com padrões repetitivos no projeto (`apps/web`), com foco na arquitetura Atomic Design (`atoms`, `molecules`, `organisms`, `templates`).

---

## 📊 Matriz de Priorização e Impacto

| Oportunidade | Tipo | Impacto | Esforço | Prioridade |
| :--- | :--- | :--- | :--- | :--- |
| **1. Unificação do Formulário de Marcar Consulta** | Organism | Alto | Baixo | 🔴 **Alta** |
| **2. Card Unificado da Agenda Diária** | Organism/Molecule | Alto | Médio | 🔴 **Alta** |
| **3. Adoção do `EmptyState` Existente** | Molecule | Alto | Baixo | 🔴 **Alta** |
| **4. Seção e Seletor de Horário com Loading** | Molecule | Médio | Baixo | 🟡 **Média** |
| **5. Componente de Cabeçalho de Página (`PageHeader`)** | Molecule | Médio | Baixo | 🟡 **Média** |
| **6. Componentes de Tabela Componíveis (`Table`)** | Atom/Molecule | Médio | Médio | 🟡 **Média** |
| **7. Seletor de Intervalo de Datas (`SeletorIntervaloDatas`)** | Molecule | Médio | Baixo | 🟡 **Média** |
| **8. Seletor Segmentado / Radio Group (`SegmentedControl`)** | Molecule | Médio | Médio | 🟡 **Média** |
| **9. Card de Métrica / Estatística (`StatCard`)** | Molecule | Baixo | Baixo | 🟢 **Baixa** |
| **10. Botão de Confirmação Inline (`InlineConfirmButton`)** | Molecule | Baixo | Baixo | 🟢 **Baixa** |
| **11. Integração de `BadgeTaxa` com `Badge`** | Atom | Baixo | Baixo | 🟢 **Baixa** |

---

## 🔍 Detalhamento das Oportunidades & Checklist

### 🔴 1. Formulário de "Marcar Consulta" Redundante em `AgendaDoDia`
- **Arquivos envolvidos:**
  - [agendaDoDia.tsx:L159-204](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx#L159-L204)
  - [marcarConsulta.tsx:L65-112](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MarcarConsulta/marcarConsulta.tsx#L65-L112)
- **Diagnóstico:** O componente `AgendaDoDia` reescreveu por completo um formulário de agendamento contendo `pacienteId`, `tipo`, `hora`, hook de pacientes e hook de agendamento. Esse componente já existe pronto e isolado em `MarcarConsulta`.
- **Benefício:** Elimina ~50 linhas de código duplicado, centraliza validação via Zod e tratamento de erros de mutação.
- **Checklist:**
  - [ ] Substituir o `<form>` inline de `AgendaDoDia` pelo componente `<MarcarConsulta profissionalId={profissionalId} data={data} onMarcada={...} />`.
  - [ ] Remover estados e hooks duplicados (`usePacientes`, `useForm<DadosAgendarConsulta>`, `mensagemSucesso`) de `AgendaDoDia`.

---

### 🔴 2. Card de Visualização da Agenda Diária (`CardAgendaDia`)
- **Arquivos envolvidos:**
  - [agendaDoDia.tsx:L108-157](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx#L108-L157)
  - [agendaProfissional.tsx:L107-121](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaProfissional/agendaProfissional.tsx#L107-L121)
- **Diagnóstico:** Ambas as telas renderizam exatamente a mesma estrutura de card para a agenda do dia:
  ```tsx
  <Card className="space-y-3">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-lg font-semibold first-letter:uppercase">{formatarData(agenda.data)}</h2>
      <BotaoExportarPdf tipo="agenda" filtros={{ data, profissionalId }} />
    </div>
    {agenda.folga && <Alert variante="aviso">Dia bloqueado como folga...</Alert>}
    <TabelaConsultas consultas={agenda.consultas} acoes={...} />
  </Card>
  ```
- **Proposta:** Criar `src/components/organisms/CardAgendaDia/cardAgendaDia.tsx`.
- **Checklist:**
  - [ ] Criar o componente `CardAgendaDia` recebendo `agenda`, `profissionalId`, `acoes?` e mensagens de erro opcionais.
  - [ ] Utilizar `CardAgendaDia` tanto na visão da recepção (`AgendaDoDia`) quanto na visão do médico (`AgendaProfissional`).

---

### 🔴 3. Adoção e Unificação do `EmptyState`
- **Arquivos envolvidos:**
  - Componente já existente: [emptyState.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/EmptyState/emptyState.tsx) (atualmente **com 0 utilizações**)
  - Implementações ad-hoc duplicadas:
    - [semProfissionalSelecionado.tsx](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SemProfissionalSelecionado/semProfissionalSelecionado.tsx)
    - [tabelaConsultas.tsx:L6-12](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx#L6-L12)
    - [tabelaReincidentes.tsx:L5-13](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaReincidentes/tabelaReincidentes.tsx#L5-L13)
    - [minhasConsultas.tsx:L58-64](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx#L58-L64)
- **Diagnóstico:** Múltiplos componentes criam mensagens visuais vazias distintas (parágrafos simples, cards com texto ou componentes específicos como `SemProfissionalSelecionado`), ignorando o átomo/molécula padrão `EmptyState`.
- **Checklist:**
  - [ ] Refatorar `SemProfissionalSelecionado` para compor internamente `<EmptyState />` ou substituí-lo diretamente.
  - [ ] Adicionar suporte a variante `compacto` ou `inline` em `EmptyState` para tabelas.
  - [ ] Substituir estados vazios manuais em `TabelaConsultas`, `TabelaReincidentes` e `MinhasConsultas`.

---

### 🟡 4. Bloco de Seleção de Horários Disponíveis (`SecaoHorario`)
- **Arquivos envolvidos:**
  - [agendarConsulta.tsx:L172-204](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx#L172-L204)
  - [modalRemarcarConsulta.tsx:L100-120](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/ModalRemarcarConsulta/modalRemarcarConsulta.tsx#L100-L120)
- **Diagnóstico:** O trecho que renderiza o `<fieldset>` com legenda ("Horário" / "Novo horário"), esqueleto de carregamento (`Skeleton`), grade de horários (`SeletorHorario`), mensagem de erro e fallback está replicado em ambos os fluxos (agendamento e remarcação).
- **Proposta:** Criar `src/components/molecules/SecaoHorario/secaoHorario.tsx` englobando:
  - Legenda e acessibilidade (`fieldset`, `legend`).
  - Estado `carregando` com `Skeleton`.
  - Grid de `SeletorHorario`.
  - Mensagem de erro de validação.
  - Slot opcional `listaEspera` (quando horários estão esgotados).
- **Checklist:**
  - [ ] Criar a molécula `SecaoHorario`.
  - [ ] Integrar `SecaoHorario` em `AgendarConsulta` e `ModalRemarcarConsulta`.

---

### 🟡 5. Cabeçalho Padrão de Página (`PageHeader`)
- **Arquivos envolvidos:**
  - [recepcao/page.tsx:L31-38](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/page.tsx#L31-L38)
  - [recepcao/relatorios/page.tsx:L52-75](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/relatorios/page.tsx#L52-L75)
  - [minhasConsultas.tsx:L40-45](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx#L40-L45)
  - [agendarConsulta.tsx:L100-107](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendarConsulta/agendarConsulta.tsx#L100-L107)
- **Diagnóstico:** Todas as páginas montam o cabeçalho com a mesma estrutura: container flex com `Heading as="h1" variante="pagina"`, descrição opcional em `Text` e área de ações/links à direita com `flex items-center gap-2`.
- **Proposta:** Criar `src/components/molecules/PageHeader/pageHeader.tsx`:
  ```tsx
  interface PageHeaderProps {
    titulo: string
    subtitulo?: string
    acoes?: ReactNode
    className?: string
  }
  ```
- **Checklist:**
  - [ ] Criar o componente `PageHeader`.
  - [ ] Adotar o `PageHeader` em `RecepcaoPage`, `RelatoriosPage`, `MinhasConsultas` e `AgendarConsulta`.

---

### 🟡 6. Abstração Componível para Tabelas (`Table`)
- **Arquivos envolvidos:**
  - [tabelaConsultas.tsx:L15-58](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx#L15-L58)
  - [tabelaReincidentes.tsx:L20-43](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaReincidentes/tabelaReincidentes.tsx#L20-L43)
- **Diagnóstico:** Classes Tailwind repetidas para tabelas (`overflow-x-auto`, `w-full text-left text-sm`, bordas nos cabeçalhos, caption acessível com `.sr-only`).
- **Proposta:** Criar família de componentes em `src/components/atoms/Table/`:
  - `Table`
  - `Table.Header` / `Table.Head`
  - `Table.Body`
  - `Table.Row`
  - `Table.Cell`
- **Checklist:**
  - [ ] Criar os átomos de tabela com suporte nativo ao tema escuro e estados de hover/zebra.
  - [ ] Refatorar `TabelaConsultas` e `TabelaReincidentes` para utilizar a estrutura componível.

---

### 🟡 7. Seletor de Intervalo de Datas (`SeletorIntervaloDatas`)
- **Arquivos envolvidos:**
  - [formBloquearPeriodo.tsx:L40-68](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/FormBloquearPeriodo/formBloquearPeriodo.tsx#L40-L68)
  - [recepcao/relatorios/page.tsx:L82-106](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/app/recepcao/relatorios/page.tsx#L82-L106)
- **Diagnóstico:** A combinação de dois campos de data ("Data de início" e "Data de término") dispostos lado a lado com responsividade (`flex flex-wrap gap-4`) é repetida com os mesmos labels e formatos.
- **Proposta:** Criar `src/components/molecules/SeletorIntervaloDatas/seletorIntervaloDatas.tsx`.
- **Checklist:**
  - [ ] Implementar `SeletorIntervaloDatas` recebendo `inicio`, `fim`, callbacks de alteração e mensagens de erro individuais.
  - [ ] Utilizar o componente em `FormBloquearPeriodo` e no formulário de filtros de `RelatoriosPage`.

---

### 🟡 8. Controle de Seleção Segmentada (`SegmentedControl` / `RadioGroup`)
- **Arquivos envolvidos:**
  - [seletorTipoConsulta.tsx:L63-80](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorTipoConsulta/seletorTipoConsulta.tsx#L63-L80)
  - [cardEntrarListaEspera.tsx:L72-96](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CardEntrarListaEspera/cardEntrarListaEspera.tsx#L72-L96)
- **Diagnóstico:** Ambos constroem uma lista de opções exclusivas dispostas horizontalmente ou em grid (tipo de consulta e seleção de turno da lista de espera), porém com implementações distintas (uma usando botões e outra usando labels com input radio oculto).
- **Proposta:** Criar um átomo/molécula genérico `SegmentedControl` com suporte completo a acessibilidade ARIA (`role="radiogroup"` / `role="radio"`).
- **Checklist:**
  - [ ] Criar `src/components/molecules/SegmentedControl/segmentedControl.tsx`.
  - [ ] Refatorar `SeletorTipoConsulta` e a seleção de turnos em `CardEntrarListaEspera` para usá-lo.

---

### 🟢 9. Card de Métrica / Estatística (`CardMetrica`)
- **Arquivos envolvidos:**
  - [metricasRelatorio.tsx:L10-32](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MetricasRelatorio/metricasRelatorio.tsx#L10-L32)
- **Diagnóstico:** Quatro estruturas idênticas contendo `<Card className="space-y-1"><dt ...>{titulo}</dt><dd ...>{valor}</dd></Card>`.
- **Proposta:** Criar `src/components/molecules/CardMetrica/cardMetrica.tsx` com suporte a título, valor, cor temática e slot opcional de tag/badge.
- **Checklist:**
  - [ ] Criar o componente `CardMetrica`.
  - [ ] Refatorar `MetricasRelatorio` para mapear os dados sobre `<CardMetrica />`.

---

### 🟢 10. Padrão de Confirmação Inline em 2 Etapas (`InlineConfirmButton`)
- **Arquivos envolvidos:**
  - [cartaoConsulta.tsx:L63-80](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/CartaoConsulta/cartaoConsulta.tsx#L63-L80)
  - [agendaProfissional.tsx:L85-93](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaProfissional/agendaProfissional.tsx#L85-L93)
- **Diagnóstico:** Em ambos os locais há um estado booleano manual `confirmando` para alternar entre o botão inicial de ação e uma dupla de botões "Confirmar [Ação]" / "Voltar".
- **Proposta:** Criar uma molécula `InlineConfirmButton` que gerencia o estado `confirmando` internamente ou via controle externo.
- **Checklist:**
  - [ ] Criar a molécula `InlineConfirmButton`.
  - [ ] Aplicar no cancelamento em `CartaoConsulta` e na confirmação de bloqueio em `AgendaProfissional`.

---

### 🟢 11. Composição de `BadgeTaxa` sobre `Badge`
- **Arquivos envolvidos:**
  - [badgeTaxa.tsx:L1-20](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/atoms/BadgeTaxa/badgeTaxa.tsx#L1-L20)
  - [badge.tsx:L1-30](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/atoms/Badge/badge.tsx#L1-L30)
- **Diagnóstico:** `BadgeTaxa` recria classes CSS de borda e cores em vez de reutilizar as variantes semânticas já existentes em `Badge` (`sucesso`, `aviso`, `erro`).
- **Checklist:**
  - [ ] Refatorar `BadgeTaxa` para retornar `<Badge variante={...}>{taxa.toFixed(1)}%</Badge>`.
  - [ ] Garantir que o formato e contrastes se mantenham intactos nos testes.
