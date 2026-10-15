# RN05: Cancelamento de Consultas e Liberação de Horário

## 1. Descrição da Regra

> **Regra Oficial**: *"O paciente pode cancelar a qualquer momento. Cancelar muda o status e nunca apaga o registro. Não existe política de cancelamento tardio."*

- **Soft Delete / Preservação Histórica**: Consultas canceladas **nunca** são removidas do banco de dados (`DELETE FROM Consulta` é expressamente proibido).
- **Mudança de Status**: O campo `status` transita para `'cancelada'` e o timestamp `canceladaEm` é preenchido com a data/hora atual.
- **Liberação Imediata de Slot**: O horário da consulta cancelada torna-se imediatamente elegível para novo agendamento por qualquer outro paciente.
- **Sem Penalidade ou Prazo Limite**: O paciente e a recepção podem cancelar a qualquer momento, antes do início da consulta.

---

## 2. Impacto e Problemas Relatados da Clínica

> *“Quando alguém cancela, ninguém mais consegue marcar naquele horário.”*

### Causa Raiz
Na verificação de disponibilidade e conflito de horários:
- Se a query de consultas ocupadas buscar apenas por `where: { profissionalId, data }` sem filtrar `status: 'agendada'`, as consultas com status `'cancelada'` continuavam sendo tratadas como ocupadas.
- **Correção necessária**: Tanto a rota de listagem de horários disponíveis quanto a checagem de conflitos no momento da criação devem ignorar registros onde `status === 'cancelada'` ou considerar exclusivamente `status === 'agendada'`.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Endpoint `POST /consultas/:id/cancelar`**:
  ```ts
  rotasConsultas.post('/:id/cancelar', permitir('paciente', 'recepcao'), async (req, res) => {
    const consulta = await prisma.consulta.findUnique({ where: { id: req.params.id } })
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada' })
    if (consulta.status !== 'agendada') {
      return res.status(409).json({ erro: 'Só é possível cancelar uma consulta agendada' })
    }
    // Paciente só cancela a sua própria consulta
    if (req.usuario.perfil === 'paciente' && consulta.pacienteId !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode cancelar suas próprias consultas' })
    }

    const cancelada = await prisma.consulta.update({
      where: { id: consulta.id },
      data: { status: 'cancelada', canceladaEm: new Date() },
    })
    res.json(cancelada)
  })
  ```
- **Liberação do Horário**:
  - Na rota `GET /profissionais/:id/horarios`, consultas com `status = 'cancelada'` não bloqueiam os slots.

### Front-end (`apps/web`)
- **Área do Paciente ([`MinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/MinhasConsultas/minhasConsultas.tsx))**:
  - Exibe botão "Cancelar consulta" com confirmação inline de segurança.
  - Ao confirmar, dispara a mutation via hook [`useMinhasConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useMinhasConsultas.ts).
- **Área da Recepção ([`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx))**:
  - Exibe botão "Cancelar" para qualquer consulta com status `agendada`.
  - Atualização automática via TanStack Query invalidando `['agenda', profissionalId, data]`.

---

## 4. Checklist de Verificação

### Back-end
- [x] O cancelamento atualiza o registro com `status: 'cancelada'` e preenche `canceladaEm`.
- [x] Nenhuma query executa `DELETE` físico de consultas.
- [x] Tentativa de cancelar consulta inexistente retorna `404 Not Found`.
- [x] Tentativa de cancelar consulta já cancelada ou com falta retorna `409 Conflict`.
- [x] Paciente impedido de cancelar consulta de outro paciente (`403 Forbidden`).
- [x] O horário cancelado fica imediatamente disponível para nova marcação.

### Front-end
- [x] Botão de cancelamento visível para paciente em suas consultas ativas.
- [x] Botão de cancelamento visível para recepcionista em qualquer consulta ativa.
- [x] Feedback visual de carregamento (`cancelando`) durante a requisição.
- [x] Invalidação reativa do cache sem necessidade de refresh manual de página.
- [x] Testes unitários cobrindo o fluxo de cancelamento no paciente e na recepção.
