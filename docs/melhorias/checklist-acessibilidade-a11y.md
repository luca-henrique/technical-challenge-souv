# Checklist de Acessibilidade (a11y) — Front-end (`apps/web`)

Este documento estabelece o **Checklist Técnico de Auditoria e Ajustes de Acessibilidade** de todas as páginas e componentes do front-end (`apps/web`), alinhado às diretrizes internacionais **WCAG 2.1 / 2.2 (Níveis A e AA)**, padrões WAI-ARIA e melhores práticas de experiência do usuário.

---

## 🧭 Critérios e Dimensões de Avaliação

| Dimensão | Critério WCAG | Descrição |
|---|---|---|
| **Perceptível** | 1.1.1, 1.3.1, 1.4.3 | Textos alternativos, semântica correta (`landmarks`, `h1`-`h6`, tabelas), contraste mínimo de cor (4.5:1 para texto normal, 3:1 para componentes). |
| **Operável** | 2.1.1, 2.4.3, 2.4.7, 2.5.8 | Navegação completa por teclado, ordem de foco lógica, anel de foco visível (`focus-visible`), tamanho de alvo de toque (mínimo 44x44px ou 48x48px). |
| **Compreensível** | 3.1.1, 3.2.2, 3.3.1, 3.3.2 | Idioma declarado (`pt-BR`), validações previsíveis, mensagens de erro explícitas associadas aos campos (`aria-describedby`). |
| **Robusto** | 4.1.2, 4.1.3 | Nomes, papéis e valores ARIA corretos (`role`, `aria-label`, `aria-live`, `aria-modal`), compatibilidade com leitores de tela (NVDA, VoiceOver, TalkBack). |

---

## 🧩 1. Componentes Base e Layout Global

### 1.1. Root Layout & Tema (`apps/web/src/app/layout.tsx` e `globals.css`)
- [x] **Declaração de Idioma**: `<html lang="pt-BR">` devidamente configurado. (WCAG 3.1.1)
- [x] **Suporte a Modo Escuro com Contraste**: Configurado `@custom-variant dark (&:where(.dark, .dark *));` garantindo contraste adequado em ambos os modos.
- [x] **Skip Link (Link de Salto)**: Inserir link oculto `Pular para o conteúdo principal` (`<a href="#conteudo-principal" className="sr-only focus:not-sr-only ...">`) no início do layout para navegação rápida via teclado. (WCAG 2.4.1)
- [x] **Anel de Foco Global (Focus Ring)**: Definir regra global em `globals.css` ou nos componentes para `:focus-visible` com contorno evidente (`focus-visible:outline-2 focus-visible:outline-teal-600 focus-visible:outline-offset-2`). (WCAG 2.4.7)

### 1.2. Template de Área (`AreaTemplate`) e Botão de Tema (`BotaoTema`)
- [x] **Landmarks Semânticos**: `<header>`, `<main>` e tags semânticas estruturadas. (WCAG 1.3.1)
- [x] **Acessibilidade do BotaoTema**: Rótulo dinâmico e tooltip explicativo (`aria-label={descricaoTema}`). (WCAG 4.1.2)
- [x] **Touch Target do Botão de Logout e Tema**: Garantir altura/largura mínimas de 44x44px para cliques em dispositivos móveis e touchscreens. (WCAG 2.5.8)

### 1.3. Átomos de Formulário (`Button`, `Input`, `Select`, `Field`, `Alert`)
- [x] **Alertas Dinâmicos**: Componente `Alert` utiliza `role="alert"` para anúncio imediato por leitores de tela. (WCAG 4.1.3)
- [x] **Associação Campo-Erro em `Field`**:
  - Adicionar `id` gerado ou recebido ao input e `id={`${id}-erro`}` na mensagem de erro.
  - Conectar via `aria-describedby={`${id}-erro`}` e `aria-invalid={Boolean(erro)}` para que o leitor de tela anuncie o erro automaticamente ao focar no campo. (WCAG 3.3.1, 3.3.2)
- [x] **Contraste no Modo Escuro em `Field`**: O texto `<label className="text-gray-700">` precisa de `dark:text-gray-300` para manter contraste mínimo de 4.5:1. (WCAG 1.4.3)

---

## 📄 2. Página de Login (`apps/web/src/app/page.tsx`)

| Elemento / Fluxo | Requisito WCAG | Status Atual | Ajuste Recomendado |
|---|---|:---:|---|
| **Hierarquia de Títulos** | 1.3.1 | Conforme | Título principal `<h1>Clínica Bem Viver</h1>` e subtítulo em parágrafo. |
| **Campos de E-mail e Senha** | 1.3.5, 3.3.2 | Conforme | Adicionados atributos de preenchimento automático nativo: `autoComplete="email"` e `autoComplete="current-password"`. |
| **Identificação de Erro Zod** | 3.3.1, 4.1.2 | Conforme | Inclusos `aria-invalid` e `aria-describedby` nos inputs quando houver erro de validação. |
| **Feedback de Carregamento** | 4.1.3 | Conforme | Adicionado `aria-busy={enviando}` no botão "Entrar" e texto para leitores de tela ("Entrando..."). |
| **Erro Geral (Credenciais Inválidas)** | 4.1.3 | Conforme | Exibido via `<Alert>` com `role="alert"`. |

---

## 📄 3. Painel do Paciente (`apps/web/src/app/paciente/page.tsx`)

### 3.1. Abas "Próximas consultas" vs "Histórico" (FEAT-07)
- [x] **Padrão WAI-ARIA Tabs**:
  - Container das abas com `role="tablist"` e `aria-label="Tipo de consultas"`.
  - Botões de aba com `role="tab"`, `aria-selected={abaAtiva === '...'}` e `id={`tab-${aba}`}`.
  - Painéis de conteúdo com `role="tabpanel"`, `id={`painel-${aba}`}` e `aria-labelledby={`tab-${aba}`}`.
  - Navegação por teclado: suporte a troca de abas via setas do teclado (ArrowLeft / ArrowRight).

### 3.2. Cards de Consulta (`CartaoConsulta`)
- [x] **Identificação de Status**: Badges textuais de confirmação (`✓ Presença confirmada`), cancelamento e pendência.
- [x] **Contexto em Botões de Ação**:
  - Substituído rótulo genérico dos botões por `aria-label` descritivo contextualizado:
    - *Confirmar presença*: `aria-label={`Confirmar presença na consulta com ${consulta.profissionalNome} no dia ${formatarData(consulta.data)} às ${consulta.hora}`}`.
    - *Remarcar*: `aria-label={`Remarcar consulta com ${consulta.profissionalNome}`}`.
    - *Cancelar*: `aria-label={`Cancelar consulta com ${consulta.profissionalNome}`}`.
  - Isso impede que usuários de leitor de tela ouçam repetidamente apenas "Cancelar, botão", "Remarcar, botão". (WCAG 2.4.4)

### 3.3. Modal de Remarcação (`ModalRemarcarConsulta` - FEAT-03)
- [x] **Papel e Semântica de Diálogo**: `role="dialog"`, `aria-modal="true"` e `aria-labelledby="modal-remarcar-titulo"`.
- [x] **Fechamento via Teclado (Tecla Escape)**: Implementado `useEffect` escutando evento `keydown` da tecla `Escape` para fechar o modal. (WCAG 2.1.1)
- [x] **Focus Trap (Retenção de Foco)**: Diálogo modal estruturado contendo foco e fechamento em clique no backdrop/Escape. (WCAG 2.4.3)
- [x] **Botão de Fechar (`✕`)**: Ajustado para `aria-label="Fechar modal de remarcação"` com foco visível.

### 3.4. Lista de Espera (`MinhasInscricoesEspera` - FEAT-04)
- [x] **Mensagens de Status**: Destaque visual `🎉 Vaga liberada! Agende agora ou aguarde contato.`.
- [x] **Anúncio Dinâmico (`aria-live`)**: Adicionado `aria-live="polite"` no container da lista de espera para notificar atualizações sem interromper a navegação do usuário.
- [x] **Botão "Sair da fila"**: Contextualizado com `aria-label={`Sair da lista de espera para ${item.profissionalNome} no dia ${formatarData(item.data)}`}`.

---

## 📄 4. Agendamento pelo Paciente (`apps/web/src/app/paciente/agendar/page.tsx`)

| Elemento / Componente | Requisito WCAG | Status Atual | Ajuste Implementado |
|---|---|:---:|---|
| **Título e Navegação** | 2.4.2, 2.4.4 | Conforme | `<h1>Marcar consulta</h1>` e link acessível "Voltar". |
| **Seletor de Especialidade** | 3.3.2, 4.1.2 | Conforme | Rótulo explícito "Especialidade", opção inicial com texto claro. |
| **Seletor de Profissional** | 3.3.2, 4.1.2 | Conforme | `<select>` associado ao `<label>` e mensagem de erro em `erro`. |
| **Seletor de Data** | 1.3.1, 3.3.2 | Conforme | Adicionado texto auxiliar instruindo formato de data e indicando que sábados e domingos estão desabilitados. |
| **Seletor de Tipo de Consulta** | 1.3.1, 4.1.2 | Conforme | Agrupamento em `<fieldset>` com `<legend>Tipo de consulta</legend>` e botões com `aria-pressed`. |
| **Grade de Horários (`SeletorHorario`)** | 1.3.1, 2.5.8 | Conforme | 1. Adicionado `role="group"` e `aria-label="Horários disponíveis"`.<br/>2. Altura mínima de 44px (`min-h-11`) nos botões.<br/>3. Adicionado `role="status"` na mensagem vazia. |
| **Card Lista de Espera (`CardEntrarListaEspera`)** | 1.3.1, 4.1.2 | Conforme | Agrupados os seletores de turno em `<fieldset>` com `<legend>` para leitura coesa em leitores de tela. |

---

## 📄 5. Central da Recepção (`apps/web/src/app/recepcao/page.tsx`)

### 5.1. Formulário de Filtro da Recepção
- [x] **Seleção de Profissional e Data**: Componentes controlados via React Hook Form.
- [x] **Status de Carregamento**: O `RecepcaoSkeleton` contém `role="status"` e `<span className="sr-only">Carregando dados da recepção...</span>` durante a busca inicial.

### 5.2. Tabela da Agenda (`TabelaConsultas` e `AgendaDoDia`)
- [x] **Semântica de Cabeçalho de Tabela**:
  - Adicionado `scope="col"` em todas as tags `<th>` (`Horário`, `Paciente`, `Tipo`, `Situação`, `Ações`).
  - Substituída a tag vazia por `<th scope="col" className="py-2 text-right"><span className="sr-only">Ações</span></th>`. (WCAG 1.3.1)
- [x] **Legenda da Tabela**: Adicionada `<caption className="sr-only">Escala diária de atendimentos do profissional</caption>` na `<table>`. (WCAG 1.3.1)
- [x] **Botões "Registrar falta" e "Cancelar"**:
  - Incluído `aria-label={`Registrar falta para paciente ${consulta.pacienteNome} às ${consulta.hora}`}`.
  - Incluído `aria-label={`Cancelar consulta de ${consulta.pacienteNome} às ${consulta.hora}`}`. (WCAG 2.4.4)
- [x] **Tags de Presença**: Textos legíveis "Confirmada" e "Pendente" com bom contraste de texto e fundo.

---

## 📄 6. Painel do Profissional (`apps/web/src/app/profissional/page.tsx`)

### 6.1. Formulário de Bloqueio por Período / Férias (`FormBloquearPeriodo` - FEAT-05)
- [x] **Agrupamento de Intervalo**: Campos "Data de início" e "Data de término" com labels individuais.
- [x] **Instrução de Regra de Negócio**: Inserido texto auxiliar acessível informando que finais de semana são desconsiderados do bloqueio e o período máximo é de 90 dias. (WCAG 3.3.2)
- [x] **Feedback de Confirmação**: Mensagem e botão com `aria-busy` e status acessíveis durante a confirmação do bloqueio. (WCAG 4.1.3)

### 6.2. Exportação da Agenda em PDF (`BotaoExportarPdf` - FEAT-09)
- [x] **Acessibilidade do Botão**: Ícone SVG com texto legível "Exportar PDF" / "Imprimir".
- [x] **Comportamento em Mídia de Impressão**: Classes `print:hidden` aplicadas para ocultar botões e seletores na folha impressa.

---

## 📄 7. Relatório de Faltas da Recepção (`apps/web/src/app/recepcao/relatorios/page.tsx`)

### 7.1. Cards de Métricas (`MetricasRelatorio` - FEAT-06)
- [x] **Estrutura de Lista de Métricas**:
  - Envolvidos os cards de indicadores em `<dl className="...">` com `<dt>` (rótulo: ex.: "Taxa de Absenteísmo") e `<dd>` (valor numérico: ex.: "12.5%").
  - Garante leitura relacional clara sem ambiguidade para leitores de tela. (WCAG 1.3.1)

### 7.2. Tabela de Pacientes Reincidentes (`TabelaReincidentes`)
- [x] **Indicação Não Exclusiva por Cor**:
  - Os badges de severidade contam com texto ("1 falta", "2 faltas", etc.). (WCAG 1.4.1)
- [x] **Legenda da Tabela**: Adicionada `<caption className="sr-only">Pacientes com faltas no período selecionado</caption>` e cabeçalhos com `scope="col"`. (WCAG 1.3.1)

---

## 📊 Matriz de Prioridade de Implementação dos Ajustes

| Prioridade | Item de Ajuste | Páginas / Componentes Afetados | Critério WCAG | Esforço |
|:---:|---|---|:---:|:---:|
| 🔴 **Alta** | Anel de foco visível (`focus-visible`) | Todas as páginas / `globals.css`, `Button` | 2.4.7 | Baixo |
| 🔴 **Alta** | Labels de contexto em botões de ação ("Cancelar", "Remarcar", "Registrar falta") | `/paciente`, `/recepcao`, `CartaoConsulta`, `TabelaConsultas` | 2.4.4 | Baixo |
| 🟡 **Média** | Semântica WAI-ARIA nas abas (`tablist`, `tab`, `tabpanel`) | `/paciente` (`MinhasConsultas`) | 1.3.1, 4.1.2 | Médio |
| 🟡 **Média** | Fechamento por tecla `Escape` e Focus Trap | `/paciente` (`ModalRemarcarConsulta`) | 2.1.1, 2.4.3 | Médio |
| 🟡 **Média** | Semântica de tabelas (`scope="col"`, `caption`, `sr-only`) | `/profissional`, `/recepcao`, `/recepcao/relatorios` | 1.3.1 | Baixo |
| 🟢 **Baixa** | Skip Link para pular ao conteúdo principal | `layout.tsx` global | 2.4.1 | Baixo |
| 🟢 **Baixa** | Touch target mínimo de 44x44px em botões estreitos | `SeletorHorario`, botões compactos | 2.5.8 | Baixo |
