# FEAT-09: Exportação da Agenda do Dia em PDF

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 9º Lugar (RICE Score: 2.7)
- **Status**: Utilitário Operacional
- **Objetivo**: Permitir que recepcionistas e profissionais de saúde gerem e imprimam uma versão física em PDF da grade de consultas do dia com a lista de chamada dos pacientes.

Embora o sistema seja 100% digital e reativo, a impressão da folha de agenda é amplamente utilizada em consultórios como redundância operacional (em momentos de queda de energia ou internet) e como apoio de mesa para médicos anotarem observações rápidas entre as consultas.

---

## 2. Requisitos Funcionais

1. **Botão de Exportação**:
   - Disponível na barra de ações da agenda da recepção (`AgendaDoDia`) e da agenda do médico (`AgendaProfissional`).
2. **Layout do Documento PDF**:
   - Cabeçalho institucional: Logotipo e nome "Clínica Bem Viver".
   - Metadados: Nome do médico, especialidade, data formatada por extenso (`sexta-feira, 16/10/2026`).
   - Tabela organizada por horário:
     | Horário | Paciente | Tipo | Duração | Situação | Assinatura / Observações |
   - Resumo no rodapé: Total de consultas agendadas, primeiras consultas e retornos.
3. **Formatação Otimizada para Impressão**:
   - Folha A4 retrato, fontes limpas, alto contraste em preto e branco.

---

## 3. Especificação Técnica

### 3.1. Abordagens Possíveis
1. **Solução Client-side (Navegador via `@react-pdf/renderer` ou `window.print` com CSS `@media print`)**:
   - Vantagens: Custo zero de processamento no servidor, geração instantânea sem dependências pesadas no Node.js.
   - Ideal para impressão direta na impressora da recepção.
2. **Solução Server-side (`pdfkit` ou `puppeteer`)**:
   - Vantagens: Geração uniforme de arquivo `.pdf` para download via endpoint `GET /profissionais/:id/agenda/pdf?data=AAAA-MM-DD`.
