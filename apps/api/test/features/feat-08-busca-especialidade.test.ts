import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { prisma } from '../../src/prisma'
import { criarUsuario } from '../ajuda'

describe('FEAT-08: Busca de profissionais por especialidade (API)', () => {
  let paciente: Awaited<ReturnType<typeof criarUsuario>>

  beforeEach(async () => {
    paciente = await criarUsuario('paciente')

    const u1 = await criarUsuario('profissional')
    await prisma.profissional.update({
      where: { id: u1.id },
      data: { especialidade: 'Cardiologia' },
    })

    const u2 = await criarUsuario('profissional')
    await prisma.profissional.update({
      where: { id: u2.id },
      data: { especialidade: 'Dermatologia' },
    })

    const u3 = await criarUsuario('profissional')
    await prisma.profissional.update({
      where: { id: u3.id },
      data: { especialidade: 'Cardiologia' },
    })
  })

  it('retorna a lista distinta de especialidades ordenadas alfabeticamente', async () => {
    const res = await request(app)
      .get('/profissionais/especialidades')
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toContain('Cardiologia')
    expect(res.body).toContain('Dermatologia')
  })

  it('filtra os profissionais pelo parâmetro especialidade', async () => {
    const res = await request(app)
      .get('/profissionais?especialidade=Cardiologia')
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
    res.body.forEach((p: { especialidade: string }) => {
      expect(p.especialidade).toBe('Cardiologia')
    })
  })

  it('realiza filtro insensível a maiúsculas/minúsculas', async () => {
    const res = await request(app)
      .get('/profissionais?especialidade=cardiologia')
      .set('Authorization', paciente.auth)

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(2)
    res.body.forEach((p: { especialidade: string }) => {
      expect(p.especialidade).toBe('Cardiologia')
    })
  })
})
