import request from 'supertest'
import { describe, expect, it } from 'vitest'
import {
  FUSO,
  GRADE,
  hojeEmRecife,
  instante,
} from '@bemviver/shared'
import { app } from '../src/app'
import { horariosDisponiveis } from '../src/agenda'
import { criarConsulta, criarUsuario, proximaSegunda } from './ajuda'

describe('RN02: Fuso Horário de Referência e Grade de 30 Minutos', () => {
  describe('Fuso Horário e Constantes Canônicas', () => {
    it('utiliza America/Recife como fuso horário padrão da clínica', () => {
      expect(FUSO).toBe('America/Recife')
    })

    it('hojeEmRecife retorna formato canônico AAAA-MM-DD no fuso de Recife', () => {
      const hoje = hojeEmRecife()
      expect(hoje).toMatch(/^\d{4}-\d{2}-\d{2}$/)

      // Teste com horário limite (23:30 em Recife = 02:30 UTC do dia seguinte)
      const noiteRecife = new Date('2026-10-15T23:30:00-03:00') // 2026-10-16T02:30:00Z
      expect(hojeEmRecife(noiteRecife)).toBe('2026-10-15')
    })

    it('a grade canônica (GRADE) é composta estritamente por intervalos de 30 minutos (:00 e :30)', () => {
      expect(GRADE.length).toBeGreaterThan(0)
      for (const slot of GRADE) {
        expect(slot).toMatch(/^([01]\d|2[0-3]):(00|30)$/)
      }

      // Primeiro e último horários dos turnos comerciais
      expect(GRADE[0]).toBe('08:00')
      expect(GRADE).toContain('11:30')
      expect(GRADE).toContain('13:00')
      expect(GRADE[GRADE.length - 1]).toBe('17:30')
    })

    it('instante(data, hora) gera objeto Date no momento UTC exato correspondente a -03:00', () => {
      const d = instante('2026-10-15', '09:00')
      // 09:00 em Recife (-03:00) equivale a 12:00:00.000Z
      expect(d.toISOString()).toBe('2026-10-15T12:00:00.000Z')

      const dAlmoco = instante('2026-10-15', '13:30')
      expect(dAlmoco.toISOString()).toBe('2026-10-15T16:30:00.000Z')
    })
  })

  describe('Filtro de Horários Disponíveis e Consultas Passadas', () => {
    it('filtra horários anteriores ao momento atual no fuso de Recife', () => {
      const data = '2026-10-15'
      // Simulando que agora são 10:15 em Recife (13:15 UTC)
      const agora = new Date('2026-10-15T10:15:00-03:00')

      const livres = horariosDisponiveis([], 'retorno', data, agora)

      expect(livres).not.toContain('08:00')
      expect(livres).not.toContain('09:00')
      expect(livres).not.toContain('10:00')
      expect(livres).toContain('10:30')
      expect(livres).toContain('11:00')
      expect(livres).toContain('13:00')
    })

    it('libera horário na grade quando a consulta anterior for cancelada', async () => {
      const paciente = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      // Criar consulta agendada às 09:00
      const consulta = await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data,
        hora: '09:00',
        tipo: 'retorno',
      })

      // Horário ocupado
      let resposta = await request(app)
        .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
        .set('Authorization', paciente.auth)

      expect(resposta.status).toBe(200)
      expect(resposta.body.horarios).not.toContain('09:00')

      // Cancelar a consulta
      await request(app)
        .post(`/consultas/${consulta.id}/cancelar`)
        .set('Authorization', paciente.auth)

      // Horário volta a estar disponível
      resposta = await request(app)
        .get(`/profissionais/${profissional.id}/horarios?data=${data}&tipo=retorno`)
        .set('Authorization', paciente.auth)

      expect(resposta.status).toBe(200)
      expect(resposta.body.horarios).toContain('09:00')
    })
  })

  describe('Registro de Falta baseado no Horário da Consulta', () => {
    it('impede registrar falta para consultas futuras', async () => {
      const recepcao = await criarUsuario('recepcao')
      const paciente = await criarUsuario('paciente')
      const profissional = await criarUsuario('profissional')
      const data = proximaSegunda()

      const consulta = await criarConsulta({
        profissionalId: profissional.id,
        pacienteId: paciente.id,
        data,
        hora: '15:00',
      })

      const resposta = await request(app)
        .post(`/consultas/${consulta.id}/falta`)
        .set('Authorization', recepcao.auth)

      expect(resposta.status).toBe(409)
      expect(resposta.body.erro).toBe('A falta só pode ser registrada depois do horário da consulta')
    })
  })
})
