# RN12: Bloqueio de Agenda por Período (Férias e Recessos)

## 1. Descrição da Regra

> **Regra Oficial**: *"O profissional de saúde ou a recepção podem bloquear um intervalo de datas contínuas na agenda (como férias, congressos ou licenças médicas). O bloqueio cria registros de folga para os dias úteis do período e preserva integralmente as consultas já marcadas."*

- **Extensão da [RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md)**: Aplica o conceito de folga a múltiplos dias de forma atômica e em lote, sem a necessidade de múltiplos cadastros diários avulsos.
- **Validação de Intervalo**:
  - `dataInicio` e `dataFim` no formato `AAAA-MM-DD`.
  - A data de início deve ser anterior ou igual à data de término (`dataInicio <= dataFim`).
- **Escopo de Dias**: Apenas dias de atendimento clínico (segunda a sexta-feira) são cadastrados como folga; sábados e domingos são desconsiderados.
- **Preservação de Consultas Preexistentes**: Em harmonia estrita com a RN07, **nenhuma consulta previamente marcada no período é cancelada ou apagada**. Elas permanecem visíveis na agenda para ação e contato manual da recepção.
- **Impedimento de Novos Agendamentos**: Qualquer tentativa de marcar nova consulta em dias abrangidos pelo período bloqueado é rejeitada com **HTTP 409 Conflict**.
- **Invalidação de Cache**: O cache de listagem e disponibilidade do profissional no Redis é invalidado imediatamente.

---

## 2. Impacto e Casos de Borda

1. **Economia de Tempo Operacional**: Permite registrar férias de 15 a 30 dias em uma única interação.
2. **Intervalo Invertido**: Se `dataInicio > dataFim`, a operação é imediatamente rejeitada com HTTP 400 Bad Request.
3. **Dias Já Bloqueados Parcialmente**: Se alguns dias do intervalo já possuíam registro de folga avulsa, o sistema utiliza transação idempotente (`createMany` com `skipDuplicates` ou upsert), evitando erros de chave duplicada.
4. **Controle de Acesso RBAC**:
   - O médico só pode bloquear períodos para o seu próprio `profissionalId`.
   - A recepção pode bloquear períodos para qualquer médico.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rota HTTP ([`apps/api/src/modules/profissionais/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/profissionais/routes.ts))**:
  - `POST /profissionais/:id/folgas/periodo` protegido por `permitir('profissional', 'recepcao')`.
- **Validação Zod**:
  ```ts
  export const schemaBloquearPeriodo = z.object({
    dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).refine((data) => data.dataInicio <= data.dataFim, {
    message: 'A data inicial deve ser anterior ou igual à data final',
    path: ['dataFim'],
  })
  ```
- **Caso de Uso (`bloquearPeriodo`)**:
  - Itera dia a dia entre `dataInicio` e `dataFim`.
  - Filtra apenas dias da semana de segunda a sexta (1 a 5).
  - Executa inserção em lote no banco com `skipDuplicates: true`.
  - Executa `cacheService.invalidarPadrao('cache:profissionais:*')`.
  - Retorna resumo com o total de dias úteis bloqueados com sucesso.

### Front-end (`apps/web`)
- **Modal de Bloqueio por Período ([`block-period-modal.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/doctor-schedule/ui/block-period-modal.tsx))**:
  - Formulário com campos de data inicial e data final com touch targets de 44px (`min-h-11`).
  - Focus trap acessível, tecla ESC e clique fora para fechamento.
- **Hook Reativo ([`use-doctor-schedule.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/doctor-schedule/model/use-doctor-schedule.ts))**:
  - Mutação conectada ao endpoint da API.
  - Alerta Toast com contagem de dias bloqueados.
  - Revalidação automática dos seletores de data e agenda do médico.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoint `POST /profissionais/:id/folgas/periodo` com permissão para médico e recepção.
- [x] Validação de intervalo com rejeição de data inicial superior à data final.
- [x] Cadastro exclusivo para dias úteis (segunda a sexta-feira).
- [x] Preservação integral de consultas previamente marcadas no intervalo.
- [x] Rejeição com HTTP 409 para tentativas de agendamento em qualquer dia do período bloqueado.
- [x] Invalidação do cache Redis para refletir a indisponibilidade imediatamente.
- [x] Testes automatizados em [`apps/api/test/features/feat-05-bloqueio-periodo.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-05-bloqueio-periodo.test.ts).

### Front-end
- [x] Botão e modal de bloqueio de período na interface do profissional e da recepção.
- [x] Validação client-side impedindo envio com datas invertidas.
- [x] Tratamento de carregamento e feedback acessível via Toast.
- [x] Atualização imediata do calendário da agenda após confirmação.
