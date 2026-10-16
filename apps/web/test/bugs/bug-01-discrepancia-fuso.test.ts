import { describe, expect, it } from 'vitest'
import { formatarData } from '../../src/lib/formato'

describe('BUG-01: Discrepância de Data Entre Paciente e Recepção (Bug D-1)', () => {
  it('relato da clínica: consulta na quarta nunca deve retroceder para terça na recepção ou no paciente', () => {
    // Caso real relatado: quarta-feira, 14/10/2026
    const dataQuarta = '2026-10-14'
    const textoFormatado = formatarData(dataQuarta)

    expect(textoFormatado).toContain('quarta-feira')
    expect(textoFormatado).toContain('14/10')
    expect(textoFormatado).not.toContain('terça-feira')
    expect(textoFormatado).not.toContain('13/10')
  })

  it('mantém consistência para viradas de mês e início de ano em qualquer fuso horário UTC negativo', () => {
    // 01 de Novembro de 2026 é domingo
    expect(formatarData('2026-11-01')).toContain('domingo')
    expect(formatarData('2026-11-01')).toContain('01/11')

    // 01 de Janeiro de 2026 é quinta-feira
    expect(formatarData('2026-01-01')).toContain('quinta-feira')
    expect(formatarData('2026-01-01')).toContain('01/01')
  })

  it('lida com timestamps ISO completos sem aplicar deslocamento de fuso local que cause D-1', () => {
    const timestampIso = '2026-10-14T00:00:00.000Z'
    const formatado = formatarData(timestampIso)

    expect(formatado).toContain('quarta-feira')
    expect(formatado).toContain('14/10')
  })

  it('trata graciosamente strings vazias ou malformadas sem quebrar a aplicação', () => {
    expect(formatarData('')).toBe('')
    expect(formatarData('invalida')).toBe('invalida')
  })
})
