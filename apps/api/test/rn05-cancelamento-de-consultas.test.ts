import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'
import { criarConsulta, criarUsuario, proximaSegunda } from './ajuda'

describe('RN05: Cancelamento de Consultas e Liberação de Horário', () => {
  it('permite que o paciente cancele sua própria consulta com soft delete (preservação histórica)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '09:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('cancelada')
    expect(res.body.canceladaEm).toBeTruthy()

    // Soft delete: o registro NUNCA é removido fisicamente do banco
    const consultaNoBanco = await prisma.consulta.findUnique({
      where: { id: consulta.id },
    })
    expect(consultaNoBanco).not.toBeNull()
    expect(consultaNoBanco?.status).toBe('cancelada')
    expect(consultaNoBanco?.canceladaEm).not.toBeNull()
  })

  it('permite que a recepção cancele a consulta de qualquer paciente', async () => {
    const paciente = await criarUsuario('paciente')
    const recepcao = await criarUsuario('recepcao')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '10:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('cancelada')
  })

  it('impede que um paciente cancele a consulta de outro paciente (403 Forbidden)', async () => {
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente1.id,
      data,
      hora: '11:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', paciente2.auth)

    expect(res.status).toBe(403)
    expect(res.body.erro).toBe('Você só pode cancelar suas próprias consultas')

    // Consulta do paciente 1 permanece inalterada como agendada
    const consultaNoBanco = await prisma.consulta.findUnique({
      where: { id: consulta.id },
    })
    expect(consultaNoBanco?.status).toBe('agendada')
  })

  it('impede que o profissional cancele consultas diretamente via rota de cancelamento (403 Forbidden)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '14:00',
      tipo: 'retorno',
    })

    const res = await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', profissional.auth)

    expect(res.status).toBe(403)
  })

  it('retorna 404 Not Found para tentativa de cancelar consulta inexistente', async () => {
    const paciente = await criarUsuario('paciente')

    const res = await request(app)
      .post('/consultas/id-inexistente-12345/cancelar')
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(404)
    expect(res.body.erro).toBe('Consulta não encontrada')
  })

  it('retorna 409 Conflict ao tentar cancelar consulta já cancelada', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente.id,
      data,
      hora: '15:00',
      tipo: 'retorno',
    })

    // Primeiro cancelamento: 200
    await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', paciente.auth)
      .expect(200)

    // Segundo cancelamento: 409
    const res = await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(409)
    expect(res.body.erro).toBe('Só é possível cancelar uma consulta agendada')
  })

  it('libera imediatamente o horário cancelado para nova consulta na rota de horários e no agendamento', async () => {
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')
    const data = proximaSegunda()
    const hora = '16:00'

    const consulta = await criarConsulta({
      profissionalId: profissional.id,
      pacienteId: paciente1.id,
      data,
      hora,
      tipo: 'retorno',
    })

    // Antes de cancelar: slot 16:00 NÃO está disponível
    const resAntes = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente2.auth)
    expect(resAntes.body.horarios).not.toContain(hora)

    // Paciente 1 cancela
    await request(app)
      .post(`/consultas/${consulta.id}/cancelar`)
      .set('Authorization', paciente1.auth)
      .expect(200)

    // Após cancelar: slot 16:00 IMEDIATAMENTE disponível
    const resDepois = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente2.auth)
    expect(resDepois.body.horarios).toContain(hora)

    // Paciente 2 agora consegue agendar com sucesso
    const resAgendamento = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora,
        tipo: 'retorno',
      })

    expect(resAgendamento.status).toBe(201)
    expect(resAgendamento.body.hora).toBe(hora)
    expect(resAgendamento.body.pacienteId).toBe(paciente2.id)
  })
})
