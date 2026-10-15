# RN01: Horário de Expediente e Intervalo de Almoço

## 1. Descrição da Regra

> **Regra Oficial**: *"Atendimento de segunda a sexta, das 8h às 18h, com almoço das 12h às 13h sem atendimento."*

- **Dias de Atendimento**: Exclusivamente dias úteis (segunda a sexta-feira). Sábados e domingos não possuem atendimentos clínicos.
- **Turno Matutino**: 08:00 às 12:00.
- **Intervalo de Almoço**: 12:00 às 13:00 (clínica fechada, sem consultas em andamento ou iniciadas neste período).
- **Turno Vespertino**: 13:00 às 18:00 (último atendimento deve encerrar no máximo às 18:00).

---

## 2. Impacto e Casos de Borda

1. **Tentativa de agendamento em final de semana**: Rejeição obrigatória (HTTP 400).
2. **Início durante o almoço**: Nenhuma consulta pode iniciar entre 12:00 e 12:59.
3. **Invasão do intervalo de almoço**: Uma consulta de 60 minutos (primeira consulta) iniciada às 11:30 terminaria às 12:30, invadindo o almoço. Isso deve ser estritamente proibido. O último horário matutino para primeira consulta é **11:00**.
4. **Invasão após o expediente**: Uma consulta de 60 minutos iniciada às 17:30 terminaria às 18:30, invadindo o horário pós-expediente. O último horário vespertino para primeira consulta é **17:00**.

---

## 3. Implementação Técnica

### Back-end (`apps/api` e `packages/shared`)
- **Arquivo de Validação**: [`apps/api/src/agenda.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts) e [`packages/shared/src/index.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/packages/shared/src/index.ts).
- **Constante `EXPEDIENTE`**:
  ```ts
  export const EXPEDIENTE = [
    { inicio: 8 * 60, fim: 12 * 60 },  // 08:00 às 12:00 (480min a 720min)
    { inicio: 13 * 60, fim: 18 * 60 }, // 13:00 às 18:00 (780min a 1080min)
  ]
  ```
- **Função `validarHorario(data, hora, tipo)`**:
  - Verifica se o dia é sábado ou domingo (`diasDaSemana === 0 || diasDaSemana === 6`).
  - Converte início e fim para minutos e checa se ambos estão estritamente contidos dentro de um mesmo intervalo de expediente:
    ```ts
    const cabe = EXPEDIENTE.some((p) => minInicio >= p.inicio && minFim <= p.fim)
    ```

### Front-end (`apps/web`)
- **Seletor de Data ([`SeletorData`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/molecules/SeletorData/seletorData.tsx))**:
  - Validação para orientar a seleção de dias úteis.
- **Grade de Horários ([`GRADE`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/packages/shared/src/index.ts))**:
  - Lista apenas slots válidos: `08:00` até `11:30` e `13:00` até `17:30`.
- **Filtro de Compatibilidade por Tipo**:
  - Ao selecionar tipo "primeira" (60min), horários das `11:30` e `17:30` são bloqueados ou desabilitados na interface.

---

## 4. Checklist de Verificação

### Back-end
- [x] Rejeição de agendamentos em sábados e domingos com mensagem descritiva (`A clínica só atende de segunda a sexta`).
- [x] Bloqueio de qualquer consulta com início no intervalo de almoço (12h às 13h).
- [x] Bloqueio de consultas que comecem antes das 8h ou terminem após as 18h.
- [x] Bloqueio de primeira consulta (60min) às 11h30 (terminaria às 12h30).
- [x] Bloqueio de primeira consulta (60min) às 17h30 (terminaria às 18h30).
- [x] Testes automatizados cobrindo tentativas de horários fora do expediente e no almoço.

### Front-end
- [x] Select de horário contendo apenas horários dentro dos turnos comerciais permitidos.
- [x] Exibição de alertas de erro retornados da API caso ocorra tentativa inválida.
- [x] Feedback em formulário bloqueando submissão de dados incoerentes.
- [x] Validação com schema Zod no cliente antes do disparo da requisição.
