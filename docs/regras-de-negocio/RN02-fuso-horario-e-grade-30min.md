# RN02: Fuso Horário de Referência e Grade de 30 Minutos

## 1. Descrição da Regra

> **Regra Oficial**: *"Agenda em horários de 30 minutos, com America/Recife como fuso de referência."*

- **Fuso Horário Padrão**: `America/Recife` (UTC-3, sem horário de verão).
- **Consistência Territorial**: Independentemente do fuso horário configurado no computador do paciente ou na máquina da recepção, todas as operações (marcação, cálculo de disponibilidade, exportações) devem adotar o horário de Recife.
- **Granularidade da Grade**: Intervalos de 30 minutos iniciando sempre nos minutos `:00` ou `:30`.

---

## 2. Impacto e Problemas Relatados da Clínica

> *“Uma paciente disse que na tela dela a consulta aparece na quarta. Na agenda da recepção, a mesma consulta aparece na terça.”*

### Causa Raiz Descoberta
1. **Interpretação de strings de data (`YYYY-MM-DD`)**:
   - `new Date("2026-10-15")` em JavaScript é parseado como UTC meia-noite (`2026-10-15T00:00:00.000Z`).
   - Ao executar `.toLocaleDateString("pt-BR")` sem especificar fuso horário, o navegador do cliente aplica o fuso da máquina.
   - Em fusos com deslocamento negativo (como UTC-3 no Brasil), meia-noite UTC vira 21h do dia anterior, retrocedendo um dia inteiro (**D-1**).
2. **Armazenamento de Timestamp**:
   - Campos `inicio` e `fim` são timestamps UTC no PostgreSQL (`DateTime` do Prisma).
   - O campo `data` deve ser mantido como string canônica `YYYY-MM-DD` e manipulado com precisão.

---

## 3. Implementação Técnica

### Packages Compartilhados (`packages/shared`)
- **Constante `FUSO`**: `export const FUSO = 'America/Recife'`
- **Função `hojeEmRecife()`**:
  ```ts
  export function hojeEmRecife(agora = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(agora)
  }
  ```
- **Grade Canônica (`GRADE`)**:
  ```ts
  // 08:00, 08:30, 09:00, ..., 11:30, 13:00, ..., 17:30
  export const GRADE = EXPEDIENTE.flatMap((periodo) => { ... })
  ```

### Back-end (`apps/api`)
- **Instante Seguro (`instante`)**:
  - Função em [`agenda.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/agenda.ts) que converte `data` ("2026-10-15") e `hora` ("09:00") para o momento absoluto exato no fuso `America/Recife` (`-03:00`), gerando instantes UTC sem desvio.

### Front-end (`apps/web`)
- **Formatação de Data Segura**:
  - Em [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx):
    ```tsx
    {new Date(agenda.data).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    })}
    ```
  - Em [`lib/formato.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/formato.ts): função `formatarData()` fixada com `timeZone: "UTC"` para evitar o bug de D-1.

---

## 4. Checklist de Verificação

### Back-end
- [x] Geração e validação de datas baseadas no fuso `America/Recife`.
- [x] Cálculo de horários disponíveis estritamente na grade de 30 minutos.
- [x] Armazenamento de `inicio` e `fim` em instantes UTC precisos no PostgreSQL.
- [x] Comparação de "consultas passadas" para registro de falta considerando o momento atual no fuso correto.

### Front-end
- [x] Fix do formatador `toLocaleDateString` com `timeZone: "UTC"`, impedindo regressão de data na interface.
- [x] Grade de horários exibida sempre em blocos múltiplos de 30 minutos.
- [x] Filtro de data inicializado com `hojeEmRecife()` em vez de `new Date().toISOString()`.
- [x] Testes unitários validando a exibição exata da data sem retrocessos.
