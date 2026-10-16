# FEAT-10: Tema Escuro na Área do Paciente

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 10º Lugar (RICE Score: 1.4)
- **Status**: Baixa Prioridade Clínica / Polimento Visual
- **Objetivo**: Disponibilizar uma opção de tema escuro (*dark mode*) na interface do paciente, reduzindo o cansaço visual em ambientes de baixa luminosidade e respeitando a preferência do sistema operacional.

Apesar de ser um diferencial estético apreciado por usuários modernos, o tema escuro tem impacto nulo na receita da clínica, na pontualidade dos médicos e na redução do no-show. Por essa razão, ocupa a última posição na matriz de prioridades, devendo ser executado após as ferramentas essenciais de negócio.

---

## 2. Requisitos Funcionais

1. **Seletor de Tema**:
   - Opções: `"Claro"`, `"Escuro"`, `"Automático"` (segue o sistema operacional via `@media (prefers-color-scheme: dark)`).
   - Localizado no cabeçalho ou nas preferências do perfil do paciente.
2. **Persistência**:
   - Salvo em `localStorage` para manter a escolha entre visitas subsequentes.
3. **Harmonia Visual**:
   - Paleta escura elegante (tons de cinza escuro/chumbo `#121827`, texto `#F3F4F6`, acentos em verde-azulado teal `#14B8A6` para manter a identidade da marca Bem Viver).

---

## 3. Especificação Técnica

### 3.1. Implementação no Tailwind CSS / CSS Modules
- Configuração de `darkMode: 'class'` no Tailwind (`apps/web/tailwind.config.ts`).
- Manipulação da classe `.dark` no elemento raiz `<html>`.
- Hook React `useTema` com controle reativo e suporte a hydration segura no Next.js.
