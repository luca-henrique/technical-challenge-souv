# RN16: Busca e Filtragem de Profissionais por Especialidade

## 1. Descrição da Regra

> **Regra Oficial**: *"O sistema permite a busca e filtragem dinâmica de médicos pela especialidade clínica desejada, normalizando acentuações e maiúsculas, e omitindo profissionais que estejam em folga quando uma data de atendimento for especificada."*

- **Listagem de Especialidades**: Rota pública/autenticada para obtenção das especialidades médicas ativas na clínica.
- **Normalização de Termos**: A busca por especialidade opera de maneira *case-insensitive* e tolerante a acentuação (ex.: `"cardiologia"`, `"Cardiologia"`, `"CARDIOLOGIA"` retornam os mesmos resultados).
- **Filtro de Disponibilidade por Data**: Quando o parâmetro `?data=AAAA-MM-DD` for informado:
  - O sistema exclui da listagem os médicos que possuem registro de folga avulsa (RN07) ou bloqueio por período (RN12) naquela data específica.
- **Estratégia de Cache**: As listagens de especialidades e profissionais são cacheadas no Redis com TTL de 120 a 300 segundos, com invalidação automática caso um médico cadastre folga.

---

## 2. Impacto e Casos de Borda

1. **Jornada de Agendamento Ágil**: Evita que o paciente precise navegar por uma lista desordenada de todos os médicos para encontrar a especialidade que precisa.
2. **Especialidade Inexistente**: Retorna lista vazia com HTTP 200, sem erros 500 no servidor.
3. **Médico com Múltiplas Folgas**: O filtro avalia a tabela `folgas` de forma indexada (`@@unique([profissionalId, data])`), mantendo a performance da query.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rotas HTTP ([`apps/api/src/modules/profissionais/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/profissionais/routes.ts))**:
  - `GET /profissionais/especialidades`
  - `GET /profissionais?especialidade=...&data=...`
- **Caso de Uso (`listarProfissionais`)**:
  - Aplica chave de cache no Redis: `cache:profissionais:${data}:${especialidade}`.
  - Filtra com `mode: 'insensitive'` no Prisma.
  - Se `data` for fornecida, adiciona cláusula `where: { folgas: { none: { data } } }`.

### Front-end (`apps/web`)
- **Molécula [`SpecialtySelector`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/patient-schedule/ui/specialty-selector.tsx)**:
  - Select acessível WCAG com touch targets $\ge 44px$ (`min-h-11`).
  - Sincronização em cascata com o `DoctorSelector`: selecionar a especialidade filtra automaticamente os médicos disponíveis no formulário de agendamento.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoint `GET /profissionais/especialidades` retornando lista única ordenada.
- [x] Filtro case-insensitive de especialidade na listagem de profissionais.
- [x] Exclusão automática de médicos com folga cadastrada na data consultada.
- [x] Cache no Redis com TTL configurado e cabeçalho `X-Cache`.
- [x] Testes automatizados em [`apps/api/test/features/feat-08-busca-especialidade.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-08-busca-especialidade.test.ts).

### Front-end
- [x] Seletor de especialidade integrado no fluxo de agendamento do paciente.
- [x] Filtragem reativa do seletor de médicos conforme a especialidade selecionada.
- [x] Integração com TanStack Query utilizando chaves padronizadas (`queryKeys.professionals.list`).
