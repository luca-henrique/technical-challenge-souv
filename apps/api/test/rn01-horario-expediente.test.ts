import { describe, expect, it } from 'vitest'
import {
  cabeNoExpediente,
  dataValida,
  diaUtil,
  gradePorTipo,
  validarHorario,
} from '@bemviver/shared'
import { horariosDisponiveis, temConflito } from '../src/agenda'
import { criarConsultaSchema } from '../src/schemas/consultaSchema'

describe('RN01: Horário de Expediente e Intervalo de Almoço', () => {
  describe('Validação de Dias Úteis (Segunda a Sexta)', () => {
    it('aceita dias de segunda a sexta', () => {
      expect(diaUtil('2026-10-19')).toBe(true) // Segunda-feira
      expect(diaUtil('2026-10-20')).toBe(true) // Terça-feira
      expect(diaUtil('2026-10-21')).toBe(true) // Quarta-feira
      expect(diaUtil('2026-10-22')).toBe(true) // Quinta-feira
      expect(diaUtil('2026-10-23')).toBe(true) // Sexta-feira
    })

    it('valida formato de datas corretamente', () => {
      expect(dataValida('2026-10-20')).toBe(true)
      expect(dataValida('data-invalida')).toBe(false)
      expect(dataValida('2026-02-30')).toBe(false)
    })

    it('detecta conflitos de horário com temConflito', () => {
      const marcadas = [{ hora: '09:00', tipo: 'primeira' as const }]
      expect(temConflito(marcadas, { hora: '09:00', tipo: 'retorno' })).toBe(true)
      expect(temConflito(marcadas, { hora: '09:30', tipo: 'retorno' })).toBe(true) // colide com os 60min da primeira
      expect(temConflito(marcadas, { hora: '10:00', tipo: 'retorno' })).toBe(false)
    })

    it('rejeita sábado e domingo', () => {
      expect(diaUtil('2026-10-24')).toBe(false) // Sábado
      expect(diaUtil('2026-10-25')).toBe(false) // Domingo
    })

    it('validarHorario retorna mensagem descritiva para final de semana', () => {
      const erroSabado = validarHorario('2026-10-24', '09:00', 'primeira', new Date('2026-10-01'))
      const erroDomingo = validarHorario('2026-10-25', '09:00', 'retorno', new Date('2026-10-01'))

      expect(erroSabado).toBe('A clínica só atende de segunda a sexta')
      expect(erroDomingo).toBe('A clínica só atende de segunda a sexta')
    })
  })

  describe('Validação de Expediente e Almoço (cabeNoExpediente)', () => {
    it('permite consultas no turno matutino que terminam até 12:00', () => {
      expect(cabeNoExpediente({ hora: '08:00', tipo: 'primeira' })).toBe(true)
      expect(cabeNoExpediente({ hora: '11:00', tipo: 'primeira' })).toBe(true) // 11:00 às 12:00
      expect(cabeNoExpediente({ hora: '11:30', tipo: 'retorno' })).toBe(true)  // 11:30 às 12:00
    })

    it('bloqueia primeira consulta (60min) às 11:30 pois invade o almoço (termina às 12:30)', () => {
      expect(cabeNoExpediente({ hora: '11:30', tipo: 'primeira' })).toBe(false)
      const motivo = validarHorario('2026-10-26', '11:30', 'primeira', new Date('2026-10-01'))
      expect(motivo).toBe('A consulta precisa terminar antes do almoço ou do fim do expediente')
    })

    it('permite consultas no turno vespertino que terminam até 18:00', () => {
      expect(cabeNoExpediente({ hora: '13:00', tipo: 'primeira' })).toBe(true)
      expect(cabeNoExpediente({ hora: '17:00', tipo: 'primeira' })).toBe(true) // 17:00 às 18:00
      expect(cabeNoExpediente({ hora: '17:30', tipo: 'retorno' })).toBe(true)  // 17:30 às 18:00
    })

    it('bloqueia primeira consulta (60min) às 17:30 pois invade o fim do expediente (termina às 18:30)', () => {
      expect(cabeNoExpediente({ hora: '17:30', tipo: 'primeira' })).toBe(false)
      const motivo = validarHorario('2026-10-26', '17:30', 'primeira', new Date('2026-10-01'))
      expect(motivo).toBe('A consulta precisa terminar antes do almoço ou do fim do expediente')
    })

    it('gradePorTipo remove 11:30 e 17:30 para tipo primeira consulta', () => {
      const gradePrimeira = gradePorTipo('primeira')
      expect(gradePrimeira).not.toContain('11:30')
      expect(gradePrimeira).not.toContain('17:30')
      expect(gradePrimeira).toContain('11:00')
      expect(gradePrimeira).toContain('17:00')

      const gradeRetorno = gradePorTipo('retorno')
      expect(gradeRetorno).toContain('11:30')
      expect(gradeRetorno).toContain('17:30')
    })
  })

  describe('Filtro de Horários Disponíveis (horariosDisponiveis)', () => {
    it('retorna lista vazia em sábados e domingos', () => {
      const horariosSabado = horariosDisponiveis([], 'primeira', '2026-10-24', new Date('2026-10-01'))
      const horariosDomingo = horariosDisponiveis([], 'retorno', '2026-10-25', new Date('2026-10-01'))

      expect(horariosSabado).toEqual([])
      expect(horariosDomingo).toEqual([])
    })

    it('não inclui 11:30 e 17:30 para tipo primeira consulta', () => {
      const horarios = horariosDisponiveis([], 'primeira', '2026-10-26', new Date('2026-10-01'))
      expect(horarios).not.toContain('11:30')
      expect(horarios).not.toContain('17:30')
      expect(horarios).toContain('11:00')
      expect(horarios).toContain('17:00')
    })
  })

  describe('Schema Zod do Backend (criarConsultaSchema)', () => {
    it('valida com sucesso agendamento em conformidade com RN01', () => {
      const resultado = criarConsultaSchema.safeParse({
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-26',
        hora: '11:00',
        tipo: 'primeira',
      })

      expect(resultado.success).toBe(true)
    })

    it('rejeita com erro descritivo tentativa de agendamento em final de semana', () => {
      const resultado = criarConsultaSchema.safeParse({
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-25', // Domingo
        hora: '09:00',
        tipo: 'primeira',
      })

      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe('A clínica só atende de segunda a sexta')
      }
    })

    it('rejeita primeira consulta às 11:30 invadindo o almoço', () => {
      const resultado = criarConsultaSchema.safeParse({
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-26',
        hora: '11:30',
        tipo: 'primeira',
      })

      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe(
          'A consulta precisa terminar antes do almoço ou do fim do expediente',
        )
      }
    })

    it('rejeita primeira consulta às 17:30 invadindo o fim do expediente', () => {
      const resultado = criarConsultaSchema.safeParse({
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-26',
        hora: '17:30',
        tipo: 'primeira',
      })

      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toBe(
          'A consulta precisa terminar antes do almoço ou do fim do expediente',
        )
      }
    })
  })
})
