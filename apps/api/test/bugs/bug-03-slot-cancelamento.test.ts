import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { criarUsuario, proximaSegunda } from '../ajuda'

describe('BUG-03: Slot Bloqueado Após Cancelamento de Consulta', () => {
  it('relato da clínica: quando alguém cancela, o horário deve ser liberado imediatamente para outro paciente marcar', async () => {
    const data = proximaSegunda()
    const profissional = await criarUsuario('profissional')
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')

    // 1. Paciente 1 marca consulta para as 14:00
    const resAgendamento = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '14:00',
        tipo: 'retorno',
      })
    expect(resAgendamento.status).toBe(201)
    const consultaId = resAgendamento.body.id

    // 2. Consulta a grade: o horário 14:00 NÃO deve estar disponível
    const resHorariosOcupado = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente2.auth)
    expect(resHorariosOcupado.body.horarios).not.toContain('14:00')

    // 3. Paciente 2 tenta marcar 14:00 e é rejeitado com 409 Conflict
    const resBloqueio = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '14:00',
        tipo: 'retorno',
      })
    expect(resBloqueio.status).toBe(409)

    // 4. Paciente 1 cancela sua consulta
    const resCancelamento = await request(app)
      .post(`/consultas/${consultaId}/cancelar`)
      .set('Authorization', paciente1.auth)
    expect(resCancelamento.status).toBe(200)
    expect(resCancelamento.body.status).toBe('cancelada')

    // 5. Imediatamente após o cancelamento, a grade deve exibir o horário 14:00 novamente como livre
    const resHorariosLiberado = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente2.auth)
    expect(resHorariosLiberado.body.horarios).toContain('14:00')

    // 6. Paciente 2 consegue agora marcar às 14:00 com 201 Created
    const resNovoAgendamento = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '14:00',
        tipo: 'retorno',
      })
    expect(resNovoAgendamento.status).toBe(201)
    expect(resNovoAgendamento.body.hora).toBe('14:00')
    expect(resNovoAgendamento.body.pacienteId).toBe(paciente2.id)
  })

  it('libera ambos os blocos de 30min quando uma primeira consulta (60 min) é cancelada', async () => {
    const data = proximaSegunda()
    const profissional = await criarUsuario('profissional')
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')

    // 1. Marca 60 min às 10:00 (ocupa 10:00 e 10:30)
    const resPrimeira = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:00',
        tipo: 'primeira',
      })
    expect(resPrimeira.status).toBe(201)
    const consultaId = resPrimeira.body.id

    // 2. Cancela a primeira consulta
    await request(app)
      .post(`/consultas/${consultaId}/cancelar`)
      .set('Authorization', paciente1.auth)

    // 3. Ambos os blocos (10:00 e 10:30) devem estar disponíveis novamente
    const resHorarios = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente2.auth)
    expect(resHorarios.body.horarios).toContain('10:00')
    expect(resHorarios.body.horarios).toContain('10:30')
  })
})
