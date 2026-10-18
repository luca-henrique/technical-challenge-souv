# RN11: Lista de Espera para Vagas Liberadas

## 1. Descrição da Regra

> **Regra Oficial**: *"Quando a grade de um profissional estiver lotada para uma data desejada, o paciente ou a recepção podem se inscrever na lista de espera. Caso um horário seja desocupado (por cancelamento ou remarcação), o sistema notifica o primeiro paciente elegível na fila por ordem de inscrição."*

- **Parâmetros de Inscrição**:
  - `profissionalId`: Médico desejado.
  - `data`: Dia específico (`AAAA-MM-DD`).
  - `tipo`: Tipo da consulta (`primeira` ou `retorno`).
  - `turno`: Preferência de atendimento (`manha`, `tarde` ou `qualquer`).
- **Unicidade de Inscrição**: O mesmo paciente não pode se inscrever mais de uma vez para o mesmo profissional e data (`@@unique([profissionalId, pacienteId, data])`).
- **Critério de Prioridade**: Fila FIFO (First-In, First-Out) ordenada pela data de criação (`criadaEm ASC`).
- **Compatibilidade de Horário**:
  - Horários matutinos (08:00 às 11:30) atendem turnos `manha` ou `qualquer`.
  - Horários vespertinos (13:00 às 17:30) atendem turnos `tarde` ou `qualquer`.
  - Consultas do tipo `primeira` (60 min) exigem que o slot vago comporte a duração integral sem colisão.
- **Processamento Reativo e Assíncrono**:
  - Ao cancelar (RN05) ou remarcar (RN10) uma consulta, a rotina de preenchimento avalia a lista de espera.
  - O candidato elegível tem seu status atualizado para `notificado` com o registro de `notificadoEm`.
  - Um job é despachado na fila assíncrona BullMQ para envio de e-mail ao paciente informando a liberação do horário.

---

## 2. Impacto e Casos de Borda

1. **Minimização da Ociosidade**: Garante que horários desocupados de última hora não permaneçam vagos, otimizando a receita da clínica.
2. **Dupla Inscrição**: Tentar se inscrever duas vezes para o mesmo dia e médico retorna HTTP 409 Conflict.
3. **Inscrição em Dia de Folga**: Não é permitida inscrição em dias em que o médico esteja em folga ou férias (RN07 / RN12).
4. **Desistência da Espera**: O paciente ou a recepção podem remover sua inscrição voluntariamente (`DELETE /lista-espera/:id`).

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Tabela no Banco ([`schema.prisma`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/prisma/schema.prisma))**:
  ```prisma
  model ListaEspera {
    id             String       @id @default(uuid())
    profissionalId String       @map("profissional_id")
    pacienteId     String       @map("paciente_id")
    data           String
    tipo           TipoConsulta
    turno          String       @default("qualquer") // manha, tarde, qualquer
    status         String       @default("aguardando") // aguardando, notificado, atendido, cancelado
    criadaEm       DateTime     @default(now()) @map("criada_em") @db.Timestamptz(3)
    notificadoEm   DateTime?    @map("notificado_em") @db.Timestamptz(3)

    @@unique([profissionalId, pacienteId, data])
  }
  ```
- **Rotas HTTP ([`apps/api/src/modules/listaEspera/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/listaEspera/routes.ts))**:
  - `POST /lista-espera`: Inscrição com RBAC `paciente` e `recepcao`.
  - `GET /lista-espera`: Listagem operacional para `recepcao`.
  - `GET /lista-espera/minhas`: Consulta de inscrições ativas do `paciente`.
  - `DELETE /lista-espera/:id`: Cancelamento de inscrição pelo titular ou recepção.
- **Serviço de Notificação (`verificarListaEspera`)**:
  - Disparado automaticamente ao final dos casos de uso `cancelarConsulta` e `remarcarConsulta`.
  - Enfileira tarefa no `emailQueue` (BullMQ) para processamento assíncrono via Nodemailer e Mailpit.

### Front-end (`apps/web`)
- **Integração na Grade de Horários**:
  - Ao selecionar uma data sem slots disponíveis, a interface exibe opção contextual para inscrição na lista de espera.
- **Painel da Recepção**:
  - Aba ou seção para acompanhamento de pacientes aguardando vagas por data e médico.

---

## 4. Checklist de Verificação

### Back-end
- [x] Relação e índices no Prisma com restrição de unicidade por paciente, profissional e data.
- [x] Endpoints REST para inscrição, listagem de minhas inscrições e cancelamento com RBAC.
- [x] Ordenação rigorosa por prioridade de chegada (`criadaEm ASC`).
- [x] Filtro estrito de compatibilidade de turno (`manha`, `tarde`, `qualquer`) e duração do slot.
- [x] Atualização de status para `notificado` com registro de `notificadoEm`.
- [x] Envio de e-mail assíncrono com template informativo sem travar requisição HTTP.
- [x] Testes automatizados em [`apps/api/test/features/feat-04-lista-espera.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-04-lista-espera.test.ts).

### Front-end
- [x] Feedback visual e formulário de preferência de turno quando todos os horários estiverem lotados.
- [x] Exibição de inscrições ativas com status no painel do paciente.
- [x] Ação para desistir da fila de espera com invalidação de cache.
