import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarUsuario, proximaSegunda, somarDias } from '../ajuda'

describe('FEAT-05: Bloqueio de Agenda por Período (Férias e Recessos)', () => {
  it('permite que o profissional bloqueie um período contínuo de férias de uma só vez', async () => {
    const profissional = await criarUsuario('profissional')
    const dataInicio = proximaSegunda()
    const dataFim = somarDias(dataInicio, 4) // 5 dias corridos (segunda a sexta)

    const res = await request(app)
      .post(`/profissionais/${profissional.id}/folgas/periodo`)
      .set('Authorization', profissional.auth)
      .send({ dataInicio, dataFim })

    expect(res.status).toBe(201)
    expect(res.body.totalDiasBloqueados).toBe(5)
    expect(res.body.periodo).toEqual({ dataInicio, dataFim })

    // Valida no banco de dados que as 5 folgas foram criadas
    const folgasGravadas = await prisma.folga.findMany({
      where: { profissionalId: profissional.id },
    })
    expect(folgasGravadas).toHaveLength(5)

    // Valida que para cada dia do período a grade de horários está totalmente vazia
    for (let i = 0; i < 5; i++) {
      const dia = somarDias(dataInicio, i)
      const resHorarios = await request(app)
        .get(`/profissionais/${profissional.id}/horarios?data=${dia}&tipo=retorno`)
        .set('Authorization', profissional.auth)
      expect(resHorarios.body.horarios).toEqual([])
    }
  })

  it('lida com dias já bloqueados sem duplicar nem falhar a transação', async () => {
    const profissional = await criarUsuario('profissional')
    const dataInicio = proximaSegunda()
    const dataFim = somarDias(dataInicio, 2) // 3 dias

    // Bloqueia previamente o primeiro dia
    await request(app)
      .post(`/profissionais/${profissional.id}/folgas`)
      .set('Authorization', profissional.auth)
      .send({ data: dataInicio })

    // Bloqueia o período completo de 3 dias
    const res = await request(app)
      .post(`/profissionais/${profissional.id}/folgas/periodo`)
      .set('Authorization', profissional.auth)
      .send({ dataInicio, dataFim })

    expect(res.status).toBe(201)
    // Apenas os 2 novos dias devem ter sido criados
    expect(res.body.totalDiasBloqueados).toBe(2)

    // Total no banco continua sendo rigorosamente 3
    const totalFolgas = await prisma.folga.count({ where: { profissionalId: profissional.id } })
    expect(totalFolgas).toBe(3)
  })

  it('impede que outro profissional bloqueie a agenda alheia', async () => {
    const prof1 = await criarUsuario('profissional')
    const prof2 = await criarUsuario('profissional')
    const dataInicio = proximaSegunda()

    const res = await request(app)
      .post(`/profissionais/${prof1.id}/folgas/periodo`)
      .set('Authorization', prof2.auth)
      .send({ dataInicio, dataFim: somarDias(dataInicio, 2) })

    expect(res.status).toBe(403)
    expect(res.body.erro).toContain('só pode bloquear a sua própria agenda')
  })

  it('valida datas inválidas, invertidas ou períodos no passado', async () => {
    const profissional = await criarUsuario('profissional')

    // Data no passado
    const resPassado = await request(app)
      .post(`/profissionais/${profissional.id}/folgas/periodo`)
      .set('Authorization', profissional.auth)
      .send({ dataInicio: '2020-01-01', dataFim: '2020-01-10' })
    expect(resPassado.status).toBe(400)

    // Invertidas
    const resInvertida = await request(app)
      .post(`/profissionais/${profissional.id}/folgas/periodo`)
      .set('Authorization', profissional.auth)
      .send({ dataInicio: '2026-11-10', dataFim: '2026-11-01' })
    expect(resInvertida.status).toBe(400)
    expect(resInvertida.body.erro).toContain('não pode ser posterior')
  })
})
