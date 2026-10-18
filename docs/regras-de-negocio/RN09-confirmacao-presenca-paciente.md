# RN09: Confirmação de Presença pelo Paciente

## 1. Descrição da Regra

> **Regra Oficial**: *"O paciente pode confirmar a sua presença na consulta previamente agendada. A confirmação não altera a data ou hora, registrando o carimbo de confirmação e dando visibilidade operacional à recepção e ao médico."*

- **Elegibilidade**: Apenas consultas com status `agendada` podem ser confirmadas.
- **Quem pode executar**: O próprio paciente titular da consulta ou a equipe de recepção.
- **Idempotência**: Se a consulta já estiver confirmada, requisições repetidas de confirmação mantêm a resposta com sucesso e preservam o timestamp original `confirmadaEm`.
- **Restrições de Status**: Consultas com status `cancelada`, `faltou` ou `realizada` não podem receber confirmação de presença (retorno HTTP 400).
- **Invalidação**: Caso a consulta seja posteriormente remarcada (RN10), o estado de confirmação é revogado (`confirmadaEm = null`), exigindo nova confirmação para o novo horário.

---

## 2. Impacto e Casos de Borda

1. **Previsão de No-Show**: Permite à recepção prever pacientes que provavelmente comparecerão, priorizando contato telefônico apenas com quem ainda não confirmou.
2. **Tentativa de confirmação por outro paciente**: Rejeição estrita com HTTP 403 Forbidden via validação de posse no middleware RBAC.
3. **Consulta Cancelada**: Se o paciente cancelou a consulta, tentar confirmar deve retornar erro explicativo (`Não é possível confirmar uma consulta cancelada`).
4. **Consulta no Passado**: Consultas cujo horário de atendimento já expirou não devem aceitar confirmação tardia.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Modelagem Prisma ([`schema.prisma`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/prisma/schema.prisma))**:
  ```prisma
  model Consulta {
    // ...
    status         StatusConsulta @default(agendada)
    confirmadaEm   DateTime?      @map("confirmada_em") @db.Timestamptz(3)
  }
  ```
- **Rota HTTP ([`apps/api/src/modules/consultas/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/consultas/routes.ts))**:
  - `POST /consultas/:id/confirmar` protegido por `permitir('paciente', 'recepcao')`.
- **Caso de Uso**:
  - Valida se a consulta existe e se o usuário autenticado é o dono do agendamento ou recepcionista.
  - Verifica se `status === 'agendada'`.
  - Atualiza atomicamente `confirmadaEm = new Date()`.
  - Retorna o objeto da consulta atualizado com HTTP 200.

### Front-end (`apps/web`)
- **Card de Consulta ([`appointment-card.tsx`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/patient-appointments/ui/appointment-card.tsx))**:
  - Exibe badge de status: `Confirmada` (verde) quando `confirmadaEm` existe, ou `Agendada` quando pendente.
  - Exibe botão interativo acessível `Confirmar Presença` apenas quando ainda não confirmada.
- **Hook de Mutação ([`use-patient-appointments.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/features/patient-appointments/model/use-patient-appointments.ts))**:
  - Executa mutação via TanStack Query.
  - Notifica o paciente via Toast acessível (`Presença confirmada com sucesso!`).
  - Invalida queries da lista de consultas para atualizar o estado em tempo real.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoint `POST /consultas/:id/confirmar` implementado com middleware `permitir('paciente', 'recepcao')`.
- [x] Validação de posse: paciente só pode confirmar consulta vinculada ao seu `pacienteId`.
- [x] Bloqueio de confirmação para consultas canceladas, faltadas ou finalizadas (HTTP 400).
- [x] Persistência do timestamp exato em `confirmadaEm` com timezone UTC.
- [x] Idempotência garantida para chamadas repetidas sem corromper o banco.
- [x] Testes automatizados em [`apps/api/test/features/feat-02-confirmacao-presenca.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-02-confirmacao-presenca.test.ts).

### Front-end
- [x] Badge visual destacando consultas confirmadas versus agendadas.
- [x] Botão de confirmação de presença com feedback visual de carregamento (`isPending`).
- [x] Disparo de notificação Toast de sucesso ou erro amigável.
- [x] Invalidação automática do cache TanStack Query nas chaves de consultas.
- [x] Testes unitários com React Testing Library cobrindo a ação de confirmação.
