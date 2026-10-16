import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { criarConsulta, criarUsuario, proximaSegunda, somarDias } from '../ajuda'

describe('FEAT-06: Relatório de Faltas (Back-end)', () => {
  it('exige autenticação com perfil de recepção (RBAC)', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional')

    // Paciente bloqueado (403)
    const resPaciente = await request(app)
      .get('/relatorios/faltas')
      .set('Authorization', paciente.auth)
    expect(resPaciente.status).toBe(403)

    // Profissional bloqueado (403)
    const resProfissional = await request(app)
      .get('/relatorios/faltas')
      .set('Authorization', profissional.auth)
    expect(resProfissional.status).toBe(403)

    // Recepção permitida (200)
    const recepcao = await criarUsuario('recepcao')
    const resRecepcao = await request(app)
      .get('/relatorios/faltas')
      .set('Authorization', recepcao.auth)
    expect(resRecepcao.status).toBe(200)
  })

  it('calcula métricas consolidadas, identifica pacientes reincidentes e agrega por profissional', async () => {
    const recepcao = await criarUsuario('recepcao')
    const profissionalA = await criarUsuario('profissional')
    const profissionalB = await criarUsuario('profissional')
    const pacienteFaltoso = await criarUsuario('paciente')
    const pacientePontual = await criarUsuario('paciente')

    const data1 = proximaSegunda()
    const data2 = somarDias(data1, 1)

    // 1. Paciente faltoso falta 2 vezes com o Profissional A
    await criarConsulta({
      profissionalId: profissionalA.id,
      pacienteId: pacienteFaltoso.id,
      data: data1,
      hora: '09:00',
      status: 'faltou',
    })
    await criarConsulta({
      profissionalId: profissionalA.id,
      pacienteId: pacienteFaltoso.id,
      data: data2,
      hora: '10:00',
      status: 'faltou',
    })

    // 2. Paciente pontual realiza 1 consulta com Profissional A e tem 1 agendada
    await criarConsulta({
      profissionalId: profissionalA.id,
      pacienteId: pacientePontual.id,
      data: data1,
      hora: '14:00',
      status: 'realizada',
    })
    await criarConsulta({
      profissionalId: profissionalA.id,
      pacienteId: pacientePontual.id,
      data: data2,
      hora: '15:00',
      status: 'agendada',
    })

    // 3. Consulta cancelada com Profissional B
    await criarConsulta({
      profissionalId: profissionalB.id,
      pacienteId: pacientePontual.id,
      data: data1,
      hora: '11:00',
      status: 'cancelada',
    })

    // Executa a busca do relatório
    const res = await request(app)
      .get(`/relatorios/faltas?dataInicio=${data1}&dataFim=${data2}`)
      .set('Authorization', recepcao.auth)

    expect(res.status).toBe(200)
    expect(res.body.totais.agendadas).toBe(5)
    expect(res.body.totais.realizadas).toBe(1)
    expect(res.body.totais.canceladas).toBe(1)
    expect(res.body.totais.faltas).toBe(2)
    expect(res.body.taxaFaltas).toBe(40.0) // 2 / 5 = 40%

    // Identifica paciente reincidente com 2 faltas
    expect(res.body.reincidentes.length).toBeGreaterThanOrEqual(1)
    expect(res.body.reincidentes[0].pacienteId).toBe(pacienteFaltoso.id)
    expect(res.body.reincidentes[0].totalFaltas).toBe(2)

    // Detalha por profissional
    const profARelatorio = res.body.faltasPorProfissional.find(
      (p: { profissionalId: string }) => p.profissionalId === profissionalA.id,
    )
    expect(profARelatorio).toBeDefined()
    expect(profARelatorio.faltas).toBe(2)
    expect(profARelatorio.totalConsultas).toBe(4)
  })

  it('valida datas de início e fim retornando 400 em caso de formato inválido', async () => {
    const recepcao = await criarUsuario('recepcao')

    const resInvalida = await request(app)
      .get('/relatorios/faltas?dataInicio=data-errada')
      .set('Authorization', recepcao.auth)
    expect(resInvalida.status).toBe(400)

    const resInvertida = await request(app)
      .get('/relatorios/faltas?dataInicio=2026-10-20&dataFim=2026-10-10')
      .set('Authorization', recepcao.auth)
    expect(resInvertida.status).toBe(400)
    expect(resInvertida.body.erro).toContain('não pode ser posterior')
  })
})
