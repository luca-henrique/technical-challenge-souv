import { describe, expect, it } from 'vitest'
import { GRADE, gradePorTipo } from '@bemviver/shared'
import { formatarData } from '../src/lib/formato'

describe('RN02: Fuso Horário de Referência e Grade de 30 Minutos (Front-end)', () => {
  describe('formatarData sem regressão de D-1', () => {
    it('formata data mantendo exatamente o dia da semana e o dia do mês sem retrocesso (bug D-1)', () => {
      // 2026-10-15 é uma quinta-feira
      const resultado1 = formatarData('2026-10-15')
      expect(resultado1).toContain('quinta-feira')
      expect(resultado1).toContain('15/10')

      // 2026-10-14 é uma quarta-feira
      const resultado2 = formatarData('2026-10-14')
      expect(resultado2).toContain('quarta-feira')
      expect(resultado2).toContain('14/10')

      // 2026-10-16 é uma sexta-feira
      const resultado3 = formatarData('2026-10-16')
      expect(resultado3).toContain('sexta-feira')
      expect(resultado3).toContain('16/10')
    })

    it('suporta strings ISO de timestamp com segurança', () => {
      const resultado = formatarData('2026-10-15T00:00:00.000Z')
      expect(resultado).toContain('quinta-feira')
      expect(resultado).toContain('15/10')
    })
  })

  describe('Grade de 30 Minutos', () => {
    it('exibe todos os horários canônicos em múltiplos de 30 minutos', () => {
      for (const slot of GRADE) {
        expect(slot).toMatch(/^([01]\d|2[0-3]):(00|30)$/)
      }
    })

    it('gradePorTipo respeita a granularidade de 30 minutos', () => {
      const slotsPrimeira = gradePorTipo('primeira')
      const slotsRetorno = gradePorTipo('retorno')

      for (const slot of slotsPrimeira) {
        expect(slot.endsWith(':00') || slot.endsWith(':30')).toBe(true)
      }
      for (const slot of slotsRetorno) {
        expect(slot.endsWith(':00') || slot.endsWith(':30')).toBe(true)
      }
    })
  })
})
