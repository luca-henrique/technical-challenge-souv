import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendaDoDia from '../src/components/organisms/AgendaDoDia/agendaDoDia'
import MinhasConsultas from '../src/components/organisms/MinhasConsultas/minhasConsultas'
import { entrarComo, simularApi } from './simular-api'

const roteador = { push: vi.fn(), replace: vi.fn() }
vi.mock('next/navigation', () => ({ useRouter: () => roteador }))

function renderComQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('RN08: Registro de Faltas e Restrições Operacionais (Front-end)', () => {
  describe('Área da Recepção (AgendaDoDia)', () => {
    it('exibe botão "Registrar falta" apenas para consultas cujo horário de início já passou', async () => {
      entrarComo('recepcao', 'rec-1')

      const inicioPassado = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const inicioFuturo = new Date(Date.now() + 60 * 60 * 1000).toISOString()

      simularApi((url) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-16',
            folga: false,
            consultas: [
              {
                id: 'c-passada',
                hora: '09:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'Paciente Passado',
                inicio: inicioPassado,
              },
              {
                id: 'c-futura',
                hora: '16:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'Paciente Futuro',
                inicio: inicioFuturo,
              },
            ],
          }
        }
        if (url.includes('/api/pacientes')) {
          return []
        }
        return null
      })

      renderComQuery(<AgendaDoDia profissionalId="prof-1" data="2026-10-16" />)

      await waitFor(() => {
        expect(screen.getByText('Paciente Passado')).toBeDefined()
        expect(screen.getByText('Paciente Futuro')).toBeDefined()
      })

      // Deve haver exatamente 1 botão de "Registrar falta", correspondente à consulta passada
      const botoesFalta = screen.getAllByRole('button', { name: 'Registrar falta' })
      expect(botoesFalta).toHaveLength(1)

      // Ambas possuem botão Cancelar
      const botoesCancelar = screen.getAllByRole('button', { name: 'Cancelar' })
      expect(botoesCancelar).toHaveLength(2)
    })

    it('permite que a recepção registre falta com sucesso, acionando a API e invalidando a agenda', async () => {
      entrarComo('recepcao', 'rec-1')

      const inicioPassado = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      let faltaRegistrada = false

      simularApi((url, init) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-16',
            folga: false,
            consultas: [
              {
                id: 'c-1',
                hora: '10:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'Carlos Alberto',
                inicio: inicioPassado,
              },
            ],
          }
        }
        if (url.includes('/api/pacientes')) {
          return []
        }
        if (url.includes('/api/consultas/c-1/falta') && init?.method === 'POST') {
          faltaRegistrada = true
          return { id: 'c-1', status: 'faltou' }
        }
        return null
      })

      const { queryClient } = renderComQuery(
        <AgendaDoDia profissionalId="prof-1" data="2026-10-16" />,
      )
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Registrar falta' })).toBeDefined()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Registrar falta' }))

      await waitFor(() => {
        expect(faltaRegistrada).toBe(true)
      })

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['agenda', 'prof-1', '2026-10-16'],
        }),
      )
    })

    it('exibe alerta de erro se a API recusar o registro de falta', async () => {
      entrarComo('recepcao', 'rec-1')

      const inicioPassado = new Date(Date.now() - 30 * 60 * 1000).toISOString()

      simularApi((url, init) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-16',
            folga: false,
            consultas: [
              {
                id: 'c-1',
                hora: '10:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'Carlos Alberto',
                inicio: inicioPassado,
              },
            ],
          }
        }
        if (url.includes('/api/pacientes')) {
          return []
        }
        if (url.includes('/api/consultas/c-1/falta') && init?.method === 'POST') {
          return {
            status: 409,
            body: { erro: 'A falta só pode ser registrada depois do horário da consulta' },
          }
        }
        return null
      })

      renderComQuery(<AgendaDoDia profissionalId="prof-1" data="2026-10-16" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Registrar falta' })).toBeDefined()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Registrar falta' }))

      await waitFor(() => {
        expect(
          screen.getByText('A falta só pode ser registrada depois do horário da consulta'),
        ).toBeDefined()
      })
    })
  })

  describe('Área do Paciente (MinhasConsultas)', () => {
    it('nunca exibe opção de registrar falta para o perfil paciente', async () => {
      entrarComo('paciente', 'pac-1')

      const inicioPassado = new Date(Date.now() - 60 * 60 * 1000).toISOString()

      simularApi((url) => {
        if (url.includes('/api/consultas/minhas')) {
          return [
            {
              id: 'c-passada',
              data: '2026-10-15',
              hora: '09:00',
              tipo: 'retorno',
              status: 'agendada',
              profissionalNome: 'Dr. Roberto',
              especialidade: 'Cardiologia',
              inicio: inicioPassado,
            },
          ]
        }
        return null
      })

      renderComQuery(<MinhasConsultas />)

      await waitFor(() => {
        expect(screen.getByText(/Dr\. Roberto/)).toBeDefined()
      })

      // O paciente tem o botão Cancelar consulta, mas NUNCA Registrar falta
      expect(screen.getByRole('button', { name: 'Cancelar consulta' })).toBeDefined()
      expect(screen.queryByRole('button', { name: /Registrar falta/i })).toBeNull()
    })
  })
})
