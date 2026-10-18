# RN10: Remarcação de Consultas

## 1. Descrição da Regra

> **Regra Oficial**: *"O paciente ou a recepção podem solicitar a remarcação de uma consulta previamente agendada para uma nova data e horário disponíveis, preservando o histórico e liberando o slot original imediatamente."*

- **Elegibilidade**: Apenas consultas com status `agendada` podem ser remarcadas.
- **Validação do Novo Horário**: O novo horário deve cumprir rigorosamente:
  - [RN01](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN01-horario-expediente-e-almoco.md): Dias úteis (seg-sex, 8h-18h, almoço 12h-13h).
  - [RN02](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN02-fuso-horario-e-grade-30min.md): Slots de 30 minutos em horário de Recife (`America/Recife`).
  - [RN03](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN03-duracao-consultas-e-tipos.md): Duração compatível (60min primeira consulta, 30min retorno).
  - [RN04](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN04-exclusividade-atendimento-e-conflitos.md): Sem sobreposição com outros agendamentos do profissional.
  - [RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md) e [RN12](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN12-bloqueio-agenda-por-periodo.md): O médico não pode estar em dia de folga ou período de recesso.
- **Atomicidade**: A liberação do horário anterior e a reserva do novo horário ocorrem em uma transação atômica única para evitar perda de vaga ou duplo agendamento.
- **Reset de Confirmação**: Caso a consulta estivesse com presença confirmada (`confirmadaEm != null`), o timestamp é resetado para `null` (RN09), requerendo confirmação para a nova data.
- **Desencadeamento da Fila de Espera**: O horário liberado pela remarcação é automaticamente ofertado para pacientes elegíveis inscritos na lista de espera (RN11).

---

## 2. Impacto e Casos de Borda

1. **Evitar Cancelamento Definitivo**: A remarcação por autoatendimento reduz a taxa de desistência definitiva de pacientes que teriam imprevistos de agenda.
2. **Remarcar para o Mesmo Horário**: Se a nova data e hora forem idênticas às atuais, a operação retorna a própria consulta sem reprocessamento de conflitos.
3. **Consulta Cancelada ou Passada**: Não é permitido remarcar consultas já canceladas, com falta registrada ou em datas que já passaram.
4. **Tentativa de Remarcação de Outro Usuário**: O paciente só pode remarcar as suas próprias consultas (HTTP 403 Forbidden). A recepção pode remarcar para qualquer paciente.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rotas HTTP ([`apps/api/src/modules/consultas/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/consultas/routes.ts))**:
  - `PATCH /consultas/:id/remarcar` e `POST /consultas/:id/remarcar` protegidos por `permitir('paciente', 'recepcao')`.
- **Validação de Entrada com Zod**:
  ```ts
  export const schemaRemarcarConsulta = z.object({
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    hora: z.string().regex(/^\d{2}:\d{2}$/),
    tipo: z.enum(['primeira', 'retorno']).optional(),
  })
  ```
- **Caso de Uso (`remarcarConsulta`)**:
  - Verifica propriedade/perfil RBAC.
  - Valida regras de negócio de horário e checa se o profissional possui folga na nova data.
  - Busca consultas ativas do médico na nova data (excluindo a própria consulta atual caso seja no mesmo dia) e executa `temConflito`.
  - Atualiza em transação Prisma: `data`, `hora`, `inicio`, `fim`, `tipo` (se alterado) e redefine `confirmadaEm = null`.
  - Dispara verificação assíncrona na tabela `lista_espera` para notificar candidatos ao horário vago.

### Front-end (`apps/web`)
- **Modal de Remarcação ([`ModalRemarcarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/ModalRemarcarConsulta/modalRemarcarConsulta.tsx))**:
  - Diálogo acessível WCAG com focus-trap, fechamento com ESC e bloqueio de rolagem do body.
  - Seletores reativos de data e horário disponível consumindo a API.
- **Hook Reativo ([`useRemarcarConsulta`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useRemarcarConsulta.ts))**:
  - Realiza mutação `PATCH /consultas/:id/remarcar`.
  - Feedback via Toast: `"Consulta remarcada com sucesso!"`.
  - Invalida queries de agenda da recepção e consultas do paciente.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoints `PATCH` e `POST /consultas/:id/remarcar` com RBAC `paciente` e `recepcao`.
- [x] Validação de propriedade: paciente só pode remarcar sua própria consulta.
- [x] Rejeição de remarcação para horários fora do expediente ou em almoço (RN01).
- [x] Rejeição de remarcação para horários que conflitem com outra consulta do médico (RN04).
- [x] Rejeição de remarcação para datas em que o profissional registrou folga ou férias (RN07 / RN12).
- [x] Redefinição automática de `confirmadaEm = null` após a alteração de horário.
- [x] Disparo automático de checagem da lista de espera para preenchimento do slot liberado.
- [x] Testes automatizados em [`apps/api/test/features/feat-03-remarcacao.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-03-remarcacao.test.ts).

### Front-end
- [x] Botão de ação "Remarcar" visível nos cards de consulta com status `agendada`.
- [x] Modal acessível de remarcação respeitando teto de linhas e foco pelo teclado.
- [x] Carregamento dinâmico apenas dos slots de horários vagos na data escolhida.
- [x] Invalidação reativa e atualização visual imediata sem necessidade de F5.
