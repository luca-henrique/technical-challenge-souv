import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'
import { criarUsuario } from './ajuda'

describe('profissionais', () => {
  it('lista os profissionais com nome e especialidade', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional', 'Dra. Teste')

    const resposta = await request(app).get('/profissionais').set('Authorization', paciente.auth)

    expect(resposta.status).toBe(200)
    expect(resposta.body).toEqual([{ id: profissional.id, nome: 'Dra. Teste', especialidade: 'Clínica geral' }])
  })

  it('filtra pelo query param profissionalId', async () => {
    const paciente = await criarUsuario('paciente')
    const p1 = await criarUsuario('profissional', 'Dr. Um')
    await criarUsuario('profissional', 'Dr. Dois')

    const resposta = await request(app)
      .get(`/profissionais?profissionalId=${p1.id}`)
      .set('Authorization', paciente.auth)

    expect(resposta.status).toBe(200)
    expect(resposta.body).toHaveLength(1)
    expect(resposta.body[0].id).toBe(p1.id)
  })

  it('indica folga no query param data e valida formato', async () => {
    const paciente = await criarUsuario('paciente')
    const profissional = await criarUsuario('profissional', 'Dra. Folga')

    await prisma.folga.create({
      data: {
        profissionalId: profissional.id,
        data: '2026-10-20',
      },
    })

    const respostaInvalida = await request(app)
      .get('/profissionais?data=data-invalida')
      .set('Authorization', paciente.auth)
    expect(respostaInvalida.status).toBe(400)

    const resposta = await request(app)
      .get('/profissionais?data=2026-10-20')
      .set('Authorization', paciente.auth)

    expect(resposta.status).toBe(200)
    const encontrado = resposta.body.find((p: { id: string }) => p.id === profissional.id)
    expect(encontrado?.folga).toBe(true)
  })
})
