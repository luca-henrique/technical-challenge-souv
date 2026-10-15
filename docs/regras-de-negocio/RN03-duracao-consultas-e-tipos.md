# RN03: Duração de Consultas e Tipos

## 1. Descrição da Regra

> **Regra Oficial**: *"Primeira consulta dura 60 minutos e retorno dura 30."*

- **Tipos de Consulta Suportados**:
  - `'primeira'`: Primeira consulta de um paciente com determinado profissional. Duração estrita de **60 minutos** (consome 2 blocos consecutivos da grade de 30 minutos).
  - `'retorno'`: Consulta de acompanhamento/retorno. Duração estrita de **30 minutos** (consome 1 bloco da grade).

---

## 2. Impacto e Casos de Borda

1. **Primeira Consulta no final do turno matutino (11h30)**:
   - Duração: 60 minutos.
   - Término: 12h30.
   - **Resultado**: Invade o almoço (12h às 13h). Deve ser terminantemente bloqueada.
2. **Primeira Consulta no final do expediente (17h30)**:
   - Duração: 60 minutos.
   - Término: 18h30.
   - **Resultado**: Invade horário fechado. Deve ser bloqueada.
3. **Sobreposição com consultas subsequentes**:
   - Uma primeira consulta às 09:00 bloqueia tanto o horário das 09:00 quanto o horário das 09:30. Nenhuma outra consulta pode iniciar às 09:30.
4. **Consulta existente bloqueando Primeira Consulta**:
   - Se já existe uma consulta às 10:00, uma primeira consulta não pode ser agendada às 09:30, pois terminaria às 10:30, colidindo com o atendimento das 10:00.

---

## 3. Implementação Técnica

### Packages Compartilhados (`packages/shared`)
- **Tabela de Duração**:
  ```ts
  export const DURACAO_MINUTOS: Record<TipoConsulta, number> = {
    primeira: 60,
    retorno: 30,
  }
  ```

### Back-end (`apps/api`)
- **Cálculo de Início e Fim**:
  ```ts
  const inicio = instante(data, hora)
  const fim = new Date(inicio.getTime() + DURACAO_MINUTOS[tipo] * 60_000)
  ```
- **Detecção de Conflitos (`temConflito`)**:
  - Verifica sobreposição de intervalos:
    `inicioA < fimB && fimA > inicioB`
  - Se a nova consulta for de 60 minutos, valida se ambos os blocos estão livres.
- **Validação de Tipos**:
  - `ehTipoConsulta(tipo)` valida se o valor recebido é exclusivamente `'primeira'` ou `'retorno'`.

### Front-end (`apps/web`)
- **Validação com Schema Zod**:
  ```ts
  tipo: z.enum(['primeira', 'retorno'])
  ```
- **Seletor de Tipo**:
  - Permite escolher entre "Primeira consulta (60 min)" e "Retorno (30 min)".
- **Busca Dinâmica de Horários Livres**:
  - A rota `GET /profissionais/:id/horarios?data=...&tipo=...` recalcula os horários disponíveis considerando a duração de cada tipo.

---

## 4. Checklist de Verificação

### Back-end
- [x] Validação rigorosa do tipo recebido no payload (`primeira` ou `retorno`).
- [x] Persistência dos campos `inicio` e `fim` com a duração precisa (60min ou 30min).
- [x] Algoritmo de verificação de horários bloqueando slots de 60 minutos que ultrapassem turnos.
- [x] Bloqueio de agendamento caso o segundo bloco de 30 minutos de uma primeira consulta já esteja ocupado.
- [x] Rota `/horarios` retornando apenas horários compatíveis com o tipo solicitado.

### Front-end
- [x] Formulário de agendamento na recepção e no paciente permitindo escolher o tipo de consulta.
- [x] Identificação clara do tipo de consulta na tabela de consultas (`Primeira consulta` / `Retorno`).
- [x] Reatividade: alteração do tipo de consulta recalcula/filtra os horários disponíveis.
- [x] Schemas Zod tipados em [AgendaDoDia/schema.ts](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/schema.ts).
