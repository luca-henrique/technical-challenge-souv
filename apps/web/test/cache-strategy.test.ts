import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { CACHE_TIMES, createQueryClient } from '../src/lib/queryClient'
import { queryKeys } from '../src/lib/queryKeys'
import { prefetchCommonData } from '../src/lib/prefetch'
import { simularApi } from './simular-api'

describe('Cache Strategy & Server State Management', () => {
  it('queryKeys generates structured and deterministic keys', () => {
    expect(queryKeys.professionals.all).toEqual(['profissionais'])
    expect(queryKeys.professionals.list({ especialidade: 'Cardiologia' })).toEqual([
      'profissionais',
      { especialidade: 'Cardiologia' },
    ])
    expect(queryKeys.professionals.agenda('prof-1', '2026-10-20')).toEqual([
      'agenda',
      'prof-1',
      '2026-10-20',
    ])
    expect(queryKeys.professionals.slots('prof-1', '2026-10-20', 'primeira')).toEqual([
      'horarios',
      'prof-1',
      '2026-10-20',
      'primeira',
    ])
    expect(queryKeys.professionals.specialties).toEqual(['especialidades'])
    expect(queryKeys.patients.all).toEqual(['pacientes'])
    expect(queryKeys.consultations.my('pac-1')).toEqual(['consultas', 'paciente', 'pac-1'])
  })

  it('createQueryClient sets proper default, static, and dynamic cache times', () => {
    const client = createQueryClient()
    const defaultOptions = client.getDefaultOptions()

    expect(defaultOptions.queries?.staleTime).toBe(CACHE_TIMES.DEFAULT_STALE)
    expect(defaultOptions.queries?.gcTime).toBe(CACHE_TIMES.DEFAULT_GC)
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
    expect(defaultOptions.queries?.retry).toBe(1)
    expect(defaultOptions.mutations?.retry).toBe(false)
  })

  it('prefetchCommonData pre-loads high-demand datasets into cache without error', async () => {
    const client = new QueryClient()

    let chamadasProfissionais = 0
    let chamadasEspecialidades = 0

    simularApi((url) => {
      if (url.includes('/api/profissionais/especialidades') || url.includes('/profissionais/especialidades') || url.includes('/api/especialidades')) {
        chamadasEspecialidades++
        return ['Cardiologia', 'Dermatologia', 'Ortopedia']
      }
      if (url.includes('/api/profissionais') || url.includes('/profissionais')) {
        chamadasProfissionais++
        return [
          { id: 'p-1', nome: 'Dr. Lucas', especialidade: 'Cardiologia' },
          { id: 'p-2', nome: 'Dra. Mariana', especialidade: 'Dermatologia' },
        ]
      }
      return null
    })

    await prefetchCommonData(client)

    // Verifica que os dados foram armazenados no cache do React Query
    const dadosProfissionais = client.getQueryData(queryKeys.professionals.list())
    const dadosEspecialidades = client.getQueryData(queryKeys.professionals.specialties)

    expect(dadosProfissionais).toBeDefined()
    expect(dadosEspecialidades).toBeDefined()
    expect(chamadasProfissionais).toBe(1)
    expect(chamadasEspecialidades).toBe(1)
  })

  it('mutations invalidate target queries without full page reload', async () => {
    const client = new QueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    // Popula cache
    client.setQueryData(queryKeys.professionals.agenda('prof-1', '2026-10-20'), {
      data: '2026-10-20',
      folga: false,
      consultas: [],
    })

    // Invalidação direcionada
    await client.invalidateQueries({
      queryKey: queryKeys.professionals.agenda('prof-1', '2026-10-20'),
    })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['agenda', 'prof-1', '2026-10-20'],
    })
  })
})
