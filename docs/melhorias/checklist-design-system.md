# Checklist de Auditoria e Padronização do Design System (`apps/web`)

Este documento apresenta o **diagnóstico de inconsistências visuais, estruturais e de Atomic Design** na aplicação `apps/web`, acompanhado de um checklist detalhado de refatoração para estabelecer um **Design System coeso, escalável e reutilizável**.

---

## 🎨 1. Tokens de Design e Sistema de Cores

### 1.1. Diagnóstico Atual
- **Cores Primárias**: Uso misturado de tons `teal-700`, `teal-800` e `teal-600`.
- **Cores de Superfície e Fundo no Dark Mode**:
  - `dark:bg-gray-900` em cards e headers.
  - `dark:bg-gray-950` na raiz e body.
  - `dark:bg-amber-950/10` em cards de lista de espera.
  - `dark:bg-emerald-950/40` e `dark:bg-emerald-950/50` em badges (opacidades divergentes).
- **Cores de Borda no Dark Mode**:
  - Mistura não padronizada de `dark:border-gray-700`, `dark:border-gray-800` e `dark:border-gray-900`.
- **Raio de Borda (Border Radius)**:
  - Botões e inputs usam `rounded-md` (6px).
  - Cards e formulários usam `rounded-lg` (8px).
  - Badges usam ora `rounded` (4px), ora `rounded-md` (6px).

### 1.2. Checklist de Ajustes
- [ ] **Definir Tokens Semânticos em `@theme` no `globals.css`**:
  - `--color-primary`: Teal da marca (`#0f766e` / `teal-700`).
  - `--color-surface`: Branco no modo claro, `#0f172a` (Slate 900) ou `#111827` (Gray 900) no escuro.
  - `--color-background`: `#f8fafc` (Slate 50) no claro, `#030712` (Gray 950) no escuro.
  - `--color-border`: `#e2e8f0` no claro, `#1f2937` no escuro.
- [ ] **Padronizar Elevações e Sombras**: Criar tokens para `shadow-card`, `shadow-modal` e `shadow-dropdown`.
- [ ] **Padronizar Border Radius**: Adotar `rounded-lg` para containers/cards e `rounded-md` para elementos interativos (botões, inputs, selects).

---

## ✍️ 2. Tipografia (Typography)

### 2.1. Diagnóstico Atual
- **Ausência de Componente de Tipografia**: Não existe nenhum componente ou utilitário centralizado (`Heading`, `Text`, `Title`, `Caption`).
- **Inconsistências em Títulos de Páginas**:
  - `/paciente`: `<h1 className="text-xl font-semibold">Minhas consultas</h1>`
  - `/paciente/agendar`: `<h1 className="text-xl font-semibold">Marcar consulta</h1>`
  - `/recepcao`: `<h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Agenda da Recepção</h1>`
  - `/recepcao/relatorios`: `<h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Relatório de Absenteísmo (No-Show)</h1>`
  - *Problema*: Variação entre `font-bold` e `font-semibold`, e algumas páginas incluem classes de cor dark explícitas enquanto outras dependem de herança implícita.
- **Inconsistências em Subtítulos e Seções**:
  - `AgendaDoDia.tsx`: `<h2 className="text-lg font-semibold">Marcar consulta</h2>`
  - `MinhasInscricoesEspera.tsx`: `<h2 className="text-base font-semibold">...</h2>`
  - `ModalRemarcarConsulta.tsx`: `<h2 className="text-lg font-semibold ...">...</h2>`
- **Textos de Apoio e Legendas (Caption / Subtitle)**:
  - Mistura arbitrária de `text-xs text-gray-500`, `text-xs text-gray-600 dark:text-gray-300`, `text-xs text-gray-400` e `text-sm text-gray-500`.

### 2.2. Checklist de Ajustes
- [ ] **Criar Átomo `Heading` (`components/atoms/Heading`)**:
  - Propriedades: `as: 'h1' | 'h2' | 'h3' | 'h4'`, `variante: 'pagina' | 'secao' | 'card' | 'modal'`.
  - Estilização unificada com suporte nativo a dark mode:
    - *Título de Página (`h1`)*: `text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100`
    - *Título de Seção (`h2`)*: `text-lg font-semibold text-gray-900 dark:text-gray-100`
    - *Título de Card / Modal (`h3`)*: `text-base font-semibold text-gray-900 dark:text-gray-100`
- [ ] **Criar Átomo `Text` (`components/atoms/Text`)**:
  - Variantes: `corpo` (14px), `suporte` (12px), `legenda` (11px), `destaque`.
  - Tratamento de cor: `padrao`, `secundario` (`text-gray-500 dark:text-gray-400`), `erro`, `sucesso`.
- [ ] **Substituir tags `<h1-h3>` manuais nas páginas pelo componente `Heading`**.

---

## 🔘 3. Botões e Ações (`Button`, `LinkButton`, `IconButton`)

### 3.1. Diagnóstico Atual
- **Variantes Limitadas no Componente `Button`**:
  - Atualmente só existem `primario`, `secundario` e `perigo`.
  - Faltam variantes essenciais como `fantasma` (ghost), `outline-teal`, `sucesso` e `link`.
- **Sobrescrita Inline Despadronizada (Anti-Pattern)**:
  - Em `CartaoConsulta.tsx`:
    - Botão "Confirmar presença": `className="text-xs text-teal-700 hover:text-teal-800 border-teal-300"`.
    - Botão "Cancelar": `className="flex-1 text-red-600 hover:text-red-700"`.
  - Em `MinhasConsultas.tsx`: As abas utilizam botões HTML puros `<button>` com classes de borda e cor em linha.
  - Em `ModalRemarcarConsulta.tsx`: O botão de fechar modal (`✕`) é um `<button>` puro sem padding mínimo de toque.
- **Divergência entre Links e Botões de Navegação**:
  - Em `AgendarConsulta`: `<Link href="/paciente" className="text-sm text-teal-700 underline">Voltar</Link>`.
  - Em `RelatoriosPage`: `<LinkButton href="/recepcao" variante="secundario">Voltar para Agenda</LinkButton>`.
  - Falta de coerência visual entre links de retorno.

### 3.2. Checklist de Ajustes
- [ ] **Expandir as Variantes do `Button`**:
  - `outline-primario`: Borda teal com fundo transparente (`border border-teal-600 text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30`).
  - `fantasma`: Sem borda nem fundo fixo, apenas hover suave para botões de cabeçalho e abas.
  - `sucesso`: Fundo verde esmeralda para confirmações afirmativas.
- [ ] **Criar Átomo `IconButton` (`components/atoms/IconButton`)**:
  - Para ícones de fechamento (`✕`), alternadores e ações unitárias, com área de toque mínima de 44x44px e foco visível.
- [ ] **Remover Estilos Inline de Botões**: Eliminar strings como `border-teal-300 text-teal-700` e adotar as variantes do design system.
- [ ] **Padronizar Links de Ação com `LinkButton`**: Unificar todos os botões de navegação secundária ("Voltar", "Ir para relatórios").

---

## 🏷️ 4. Badges, Tags e Indicadores de Status

### 4.1. Diagnóstico Atual
- **Falta de um Componente Genérico `Badge`**:
  - Existe apenas `BadgeTaxa` (criado exclusivamente para o relatório de faltas).
  - Todas as outras marcações de status são divs e spans criados do zero com classes manuais:
    - *Presença confirmada*: `rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300`
    - *Presença pendente*: `rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400`
    - *Vaga liberada*: `rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/50 dark:text-green-300`
    - *Aguardando desistência*: `rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300`
    - *Alerta de faltas*: `rounded bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800`
    - *Bloqueio crítico*: `rounded bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800`
  - Inconsistência nos paddings (`px-1.5`, `px-2`, `px-2.5`), opacidades de dark mode (`/40`, `/50`) e pesos de fonte (`font-normal`, `font-medium`, `font-semibold`).

### 4.2. Checklist de Ajustes
- [ ] **Criar Átomo Unificado `Badge` (`components/atoms/Badge`)**:
  - Propriedades: `variante: 'sucesso' | 'aviso' | 'erro' | 'info' | 'neutro'`, `tamanho: 'sm' | 'md'`.
  - Estilização consistente:
    - *sucesso*: `bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900`
    - *aviso*: `bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900`
    - *erro / critico*: `bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900`
    - *neutro / pendente*: `bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700`
    - *info*: `bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-900`
- [ ] **Substituir todas as tags manuais** em `CartaoConsulta`, `TabelaConsultas`, `MinhasInscricoesEspera` e `TabelaReincidentes` pelo átomo `Badge`.

---

## 📑 5. Navegação em Abas (Tabs)

### 5.1. Diagnóstico Atual
- Em `MinhasConsultas.tsx`, as abas "Próximas consultas" e "Histórico" foram construídas de forma artesanal com markup customizado:
  ```tsx
  <div className="flex border-b border-gray-200 dark:border-gray-800">
    <button className={abaAtiva === 'proximas' ? 'border-teal-700 text-teal-700 ...' : '...'}>
  ```
- Não há reutilização caso outra página necessite de abas (ex.: abas de filtro na recepção ou prontuário).
- Ausência de semântica WAI-ARIA (`role="tablist"`, `role="tab"`, `role="tabpanel"`).

### 5.2. Checklist de Ajustes
- [ ] **Criar Molécula `Tabs` (`components/molecules/Tabs`)**:
  - Componentes compostos: `<Tabs>`, `<TabsList>`, `<TabTrigger>` e `<TabContent>`.
  - Estados visuais consistentes (ativo, inativo, hover, foco por teclado).
  - Refatorar `MinhasConsultas` para utilizar a nova molécula.

---

## 🪟 6. Modais e Diálogos (`Modal`)

### 6.1. Diagnóstico Atual
- `ModalRemarcarConsulta` e `FormBloquearPeriodo` reinventam a estrutura de janela modal do zero:
  - Fundo escurecido duplicado: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs`.
  - Cabeçalho, botão de fechar, divisórias e rodapés de ações implementados separadamente.
- Não há garantia uniforme de Focus Trap e tecla Escape.

### 6.2. Checklist de Ajustes
- [ ] **Criar Molécula Unificada `Modal` (`components/molecules/Modal`)**:
  - Estrutura:
    - `<Modal aberto={isOpen} onFechar={onClose} tamanho="md">`
    - `<Modal.Header titulo="..." subtitulo="..." onFechar={...} />`
    - `<Modal.Body>{children}</Modal.Body>`
    - `<Modal.Footer>{botoes}</Modal.Footer>`
  - Recursos embutidos: Backdrop com transição suave, listener para tecla `Escape`, bloqueio de rolagem do body e contenção de foco.
- [ ] **Refatorar `ModalRemarcarConsulta` e `FormBloquearPeriodo`** utilizando o componente `Modal`.

---

## 📋 7. Formulários e Controles de Entrada

### 7.1. Diagnóstico Atual
- **Controles Ausentes como Átomos**:
  - Não existem átomos para `Radio` e `Checkbox`.
  - Em `CardEntrarListaEspera`, os inputs de rádio de turno foram estilizados manualmente.
- **Molecula `Field` Incompleta**:
  - Envolve filhos em `<label>` sem flexibilidade para `<label htmlFor="id">`.
  - Falta suporte nativo para texto auxiliar de instrução (`hint`) abaixo do campo.
- **Variantes de Tamanho em Inputs**:
  - `Input` e `Select` só possuem uma única altura/tamanho padrão (`text-base py-2`). Em formulários densos de filtros (como na Recepção e Relatórios), são forçados a encolher com hacks de CSS.

### 7.2. Checklist de Ajustes
- [ ] **Criar Átomo `Radio` e `RadioGroup`**: Com suporte a teclado, foco visual e estados selecionado/desabilitado.
- [ ] **Evoluir o Componente `Field`**:
  - Adicionar props: `hint?: string`, `required?: boolean`, `id?: string`.
  - Renderizar texto de instrução (`hint`) e associar via `aria-describedby`.
- [ ] **Adicionar Tamanhos em `Input` e `Select`**: Suportar `tamanho: 'normal' | 'compacto'`.

---

## ⏳ 8. Estados de Feedback e Carregamento

### 8.1. Diagnóstico Atual
- **Carregamento Desigual**:
  - Algumas telas possuem Skeletons elaborados (`MinhasConsultasSkeleton`, `RecepcaoSkeleton`).
  - Outras exibem textos crus na tela: `<p className="text-sm text-gray-500">Carregando relatório...</p>` em `relatorios/page.tsx:125`.
- **Estados Vazios (Empty States)**:
  - Textos simples repetitivos espalhados pelo código:
    - `"Nenhum horário disponível nesse dia."`
    - `"Nenhuma consulta neste dia."`
    - `"Nenhum profissional encontrado."`
  - Enquanto a recepção possui a molécula `SemProfissionalSelecionado` com ilustração/card.

### 8.2. Checklist de Ajustes
- [ ] **Criar Molécula `EmptyState` (`components/molecules/EmptyState`)**:
  - Props: `icone`, `titulo`, `descricao`, `acao?: ReactNode`.
  - Padronizar todas as mensagens de listas vazias na aplicação.
- [ ] **Criar Átomo `Spinner` e Padronizar Skeletons**:
  - Eliminar textos puros `"Carregando..."` e utilizar `Spinner` ou `Skeleton` com acessibilidade.

---

## 🧹 9. Limpeza e Governança do Atomic Design

### 9.1. Diagnóstico Atual
- **Duplicação de Componentes**:
  - `SemProfissionalSelecionado` existe tanto em `components/molecules/SemProfissionalSelecionado` quanto em `components/organisms/SemProfissionalSelecionado` (onde apenas reexporta a molécula).
- **Componente Legado**:
  - `MarcarConsulta` (`components/organisms/MarcarConsulta`) tornou-se obsoleto após a criação do fluxo moderno `AgendarConsulta`.

### 9.2. Checklist de Ajustes
- [ ] **Eliminar Reexportação Redundante**: Remover a pasta `components/organisms/SemProfissionalSelecionado` e manter apenas a molécula oficial.
- [ ] **Depreciar/Consolidar `MarcarConsulta`**: Migrar testes que ainda referenciam o organismo antigo para a suíte padrão de `AgendarConsulta`.

---

## 📊 Matriz Resumo de Prioridades do Design System

| Prioridade | Iniciativa | Componentes a Criar / Refatorar | Impacto Visual | Esforço |
|:---:|---|---|:---:|:---:|
| 🔴 **Alta** | **Átomo `Badge` Universal** | Substituir badges inline em 4 organismos | Alto (unifica status de presença, filas e faltas) | Baixo |
| 🔴 **Alta** | **Sistema de Tipografia (`Heading` e `Text`)** | `Heading`, `Text`, padronizar h1-h3 e cores dark | Alto (elimina inconsistências de fontes e pesos) | Médio |
| 🟡 **Média** | **Molécula `Modal` Reutilizável** | `ModalRemarcarConsulta`, `FormBloquearPeriodo` | Médio (padroniza overlays, foco e ações) | Médio |
| 🟡 **Média** | **Molécula `Tabs` Padronizada** | `MinhasConsultas` e futuras abas | Médio (consistência de navegação e a11y) | Médio |
| 🟡 **Média** | **Variantes de `Button` e `IconButton`** | `Button`, `IconButton`, eliminar overrides inline | Médio (elimina botões crus e classes em linha) | Baixo |
| 🟢 **Baixa** | **Molécula `EmptyState` e `Spinner`** | Padronizar mensagens de vazio e carregamento | Baixo (polimento e refinamento visual) | Baixo |
| 🟢 **Baixa** | **Governança Atomic Design** | Remover duplicata de `SemProfissionalSelecionado` | Baixo (organização de código) | Muito Baixo |
