import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import AgendaDoDia from '../src/components/organisms/AgendaDoDia/agendaDoDia'
import { entrarComo, simularApi } from './simular-api'

function renderComQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('AgendaDoDia', () => {
  it('exibe a agenda e permite agendar consulta via react-hook-form', async () => {
    entrarComo('recepcao')

    let consultaCancelada = false

    simularApi((url, init) => {
      if (url.includes('/api/profissionais/prof-1/agenda')) {
        return {
          data: '2026-10-15',
          folga: false,
          consultas: consultaCancelada
            ? []
            : [
                {
                  id: 'c-1',
                  profissionalId: 'prof-1',
                  pacienteId: 'pac-1',
                  pacienteNome: 'João Silva',
                  data: '2026-10-15',
                  hora: '09:00',
                  inicio: '2026-10-15T09:00:00Z',
                  fim: '2026-10-15T10:00:00Z',
                  tipo: 'primeira',
                  status: 'agendada',
                  criadaEm: '2026-10-15T08:00:00Z',
                  canceladaEm: null,
                },
              ],
        }
      }
      if (url.includes('/api/pacientes')) {
        return [
          { id: 'pac-1', nome: 'João Silva', email: 'joao@example.com' },
          { id: 'pac-2', nome: 'Maria Santos', email: 'maria@example.com' },
        ]
      }
      if (url.includes('/api/consultas/c-1/cancelar') && init?.method === 'POST') {
        consultaCancelada = true
        return { id: 'c-1', status: 'cancelada' }
      }
      return null
    })

    renderComQuery(<AgendaDoDia profissionalId="prof-1" data="2026-10-15" />)

    expect(screen.getByText('Carregando agenda...')).toBeDefined()

    await waitFor(() => {
      expect(screen.getAllByText('João Silva').length).toBeGreaterThan(0)
      expect(screen.getByText('Marcar consulta')).toBeDefined()
    })

    // Cancelar a consulta
    const botaoCancelar = screen.getByRole('button', { name: 'Cancelar' })
    fireEvent.click(botaoCancelar)

    await waitFor(() => {
      expect(screen.queryByText('Cancelar')).toBeNull()
    })
  })
})
