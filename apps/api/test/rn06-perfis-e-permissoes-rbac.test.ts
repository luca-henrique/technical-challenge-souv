import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { criarUsuario, proximaSegunda } from './ajuda'

describe('RN06: Perfis de Usuário e Controle de Acesso (RBAC)', () => {
  describe('Autenticação e Proteção Básica de Rotas', () => {
    it('retorna 401 Unauthorized para rotas protegidas sem token', async () => {
      const res = await request(app).get('/consultas/minhas')
      expect(res.status).toBe(401)
      expect(res.body.erro).toBe('Faça login para continuar')
    })

    it('retorna 401 Unauthorized para token inválido ou expirado', async () => {
      const res = await request(app)
        .get('/consultas/minhas')
        .set('Authorization', 'Bearer token-invalido-123')
      expect(res.status).toBe(401)
      expect(res.body.erro).toBe('Sua sessão expirou. Faça login de novo')
    })
  })

  describe('Perfil: Paciente', () => {
    it('só pode agendar para si próprio, ignorando pacienteId de terceiros no payload', async () => {
      const paciente1 = await criarUsuario('paciente')
      const paciente2 = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .post('/consultas')
        .set('Authorization', paciente1.auth)
        .send({
          profissionalId: profissional.id,
          pacienteId: paciente2.id, // Tentativa de injeção de outro paciente
          data,
          hora: '09:00',
          tipo: 'retorno',
        })

      expect(res.status).toBe(201)
      // O pacienteId salvo deve ser obrigatoriamente do paciente autenticado
      expect(res.body.pacienteId).toBe(paciente1.id)
    })

    it('é impedido de listar pacientes cadastrados (403 Forbidden)', async () => {
      const paciente = await criarUsuario('paciente')

      const res = await request(app)
        .get('/pacientes')
        .set('Authorization', paciente.auth)

      expect(res.status).toBe(403)
      expect(res.body.erro).toBe('Você não tem permissão para isso')
    })

    it('é impedido de acessar agenda completa de profissional (403 Forbidden)', async () => {
      const paciente = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .get(`/profissionais/${profissional.id}/agenda?data=${data}`)
        .set('Authorization', paciente.auth)

      expect(res.status).toBe(403)
      expect(res.body.erro).toBe('Você não tem permissão para isso')
    })

    it('é impedido de registrar faltas (403 Forbidden)', async () => {
      const paciente = await criarUsuario('paciente')

      const res = await request(app)
        .post('/consultas/qualquer-id/falta')
        .set('Authorization', paciente.auth)

      expect(res.status).toBe(403)
    })

    it('é impedido de cadastrar folgas (403 Forbidden)', async () => {
      const paciente = await criarUsuario('paciente')

      const res = await request(app)
        .post('/profissionais/qualquer-id/folgas')
        .set('Authorization', paciente.auth)
        .send({ data: '2026-10-26' })

      expect(res.status).toBe(403)
    })
  })

  describe('Perfil: Recepção', () => {
    it('pode listar pacientes cadastrados', async () => {
      const recepcao = await criarUsuario('recepcao')
      await criarUsuario('paciente', 'Paciente A')

      const res = await request(app)
        .get('/pacientes')
        .set('Authorization', recepcao.auth)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.some((p: { nome: string }) => p.nome === 'Paciente A')).toBe(true)
    })

    it('pode consultar a agenda de qualquer profissional', async () => {
      const recepcao = await criarUsuario('recepcao')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .get(`/profissionais/${profissional.id}/agenda?data=${data}`)
        .set('Authorization', recepcao.auth)

      expect(res.status).toBe(200)
      expect(res.body.data).toBe(data)
    })

    it('pode agendar consulta para qualquer paciente', async () => {
      const recepcao = await criarUsuario('recepcao')
      const paciente = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .post('/consultas')
        .set('Authorization', recepcao.auth)
        .send({
          profissionalId: profissional.id,
          pacienteId: paciente.id,
          data,
          hora: '10:00',
          tipo: 'retorno',
        })

      expect(res.status).toBe(201)
      expect(res.body.pacienteId).toBe(paciente.id)
    })

    it('é impedida de bloquear dias de folga de profissionais (403 Forbidden)', async () => {
      const recepcao = await criarUsuario('recepcao')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .post(`/profissionais/${profissional.id}/folgas`)
        .set('Authorization', recepcao.auth)
        .send({ data })

      expect(res.status).toBe(403)
      expect(res.body.erro).toBe('Você não tem permissão para isso')
    })
  })

  describe('Perfil: Profissional', () => {
    it('pode ver a sua própria agenda, mas é impedido de ver a agenda de colegas (403 Forbidden)', async () => {
      const profissional1 = await criarUsuario('profissional')
      const profissional2 = await criarUsuario('profissional')
      const data = proximaSegunda()

      // Própria agenda: 200 OK
      const resPropria = await request(app)
        .get(`/profissionais/${profissional1.id}/agenda?data=${data}`)
        .set('Authorization', profissional1.auth)
      expect(resPropria.status).toBe(200)

      // Agenda de colega médico: 403 Forbidden
      const resColega = await request(app)
        .get(`/profissionais/${profissional2.id}/agenda?data=${data}`)
        .set('Authorization', profissional1.auth)
      expect(resColega.status).toBe(403)
      expect(resColega.body.erro).toBe('Você só pode ver a sua própria agenda')
    })

    it('pode bloquear folga na sua própria agenda, mas é impedido de bloquear na de colegas (403 Forbidden)', async () => {
      const profissional1 = await criarUsuario('profissional')
      const profissional2 = await criarUsuario('profissional')
      const data = proximaSegunda()

      // Folga na de colega: 403 Forbidden
      const resColega = await request(app)
        .post(`/profissionais/${profissional2.id}/folgas`)
        .set('Authorization', profissional1.auth)
        .send({ data })
      expect(resColega.status).toBe(403)
      expect(resColega.body.erro).toBe('Você só pode bloquear a sua própria agenda')

      // Própria folga: 201 Created
      const resPropria = await request(app)
        .post(`/profissionais/${profissional1.id}/folgas`)
        .set('Authorization', profissional1.auth)
        .send({ data })
      expect(resPropria.status).toBe(201)
      expect(resPropria.body.profissionalId).toBe(profissional1.id)
    })

    it('é impedido de agendar consultas diretamente (403 Forbidden)', async () => {
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const res = await request(app)
        .post('/consultas')
        .set('Authorization', profissional.auth)
        .send({
          profissionalId: profissional.id,
          data,
          hora: '14:00',
          tipo: 'retorno',
        })

      expect(res.status).toBe(403)
    })

    it('é impedido de listar pacientes cadastrados (403 Forbidden)', async () => {
      const profissional = await criarUsuario('profissional')

      const res = await request(app)
        .get('/pacientes')
        .set('Authorization', profissional.auth)

      expect(res.status).toBe(403)
    })
  })
})
