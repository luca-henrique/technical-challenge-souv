import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../src/app'
import { criarUsuario, proximaSegunda } from '../ajuda'

describe('BUG-02: Sobreposição de Consultas com Durações Diferentes (60 min x 30 min)', () => {
  it('relato da clínica: doutor não pode ficar com dois pacientes no mesmo horário quando um deles tem consulta de 60 min', async () => {
    const data = proximaSegunda()
    const profissional = await criarUsuario('profissional')
    const paciente1 = await criarUsuario('paciente')
    const paciente2 = await criarUsuario('paciente')

    // 1. Paciente 1 agenda primeira consulta (60 minutos) às 10:00 (ocupa 10:00 até 11:00)
    const resConsulta1 = await request(app)
      .post('/consultas')
      .set('Authorization', paciente1.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:00',
        tipo: 'primeira',
      })
    expect(resConsulta1.status).toBe(201)

    // 2. Paciente 2 tenta marcar consulta às 10:30 (segundo bloco da consulta de 60 min)
    // No código original com bug (que comparava apenas hora === '10:00'), esse agendamento passava!
    const resConflito1030 = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '10:30',
        tipo: 'retorno',
      })
    expect(resConflito1030.status).toBe(409)
    expect(resConflito1030.body.erro).toBe('Esse horário já está ocupado')

    // 3. Paciente 2 tenta marcar primeira consulta (60 min) às 09:30 (terminaria às 10:30, colidindo com as 10:00)
    const resConflito0930Primeira = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:30',
        tipo: 'primeira',
      })
    expect(resConflito0930Primeira.status).toBe(409)
    expect(resConflito0930Primeira.body.erro).toBe('Esse horário já está ocupado')

    // 4. Mas um retorno de 30 min às 09:30 (termina às 10:00 em ponto) deve ser permitido com sucesso!
    const resRetorno0930 = await request(app)
      .post('/consultas')
      .set('Authorization', paciente2.auth)
      .send({
        profissionalId: profissional.id,
        data,
        hora: '09:30',
        tipo: 'retorno',
      })
    expect(resRetorno0930.status).toBe(201)

    // 5. Verifica que a grade de horários disponíveis em GET /profissionais/:id/horarios reflete a ocupação
    const resHorarios = await request(app)
      .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
      .set('Authorization', paciente1.auth)

    expect(resHorarios.status).toBe(200)
    expect(resHorarios.body.horarios).not.toContain('10:00')
    expect(resHorarios.body.horarios).not.toContain('10:30')
    expect(resHorarios.body.horarios).not.toContain('09:30') // Já ocupado pelo paciente 2
    expect(resHorarios.body.horarios).toContain('11:00') // Livre após o término da primeira consulta
  })
})
