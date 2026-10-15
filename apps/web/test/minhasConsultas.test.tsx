import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import MinhasConsultas from '../src/components/organisms/MinhasConsultas/minhasConsultas'
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

describe('MinhasConsultas', () => {
  it('exibe mensagem quando não há consultas agendadas', async () => {
    entrarComo('paciente')

    simularApi((url) => {
      if (url.includes('/api/consultas/minhas')) {
        return []
      }
      return null
    })

    renderComQuery(<MinhasConsultas />)

    expect(screen.getByRole('status', { name: 'Carregando consultas' })).toBeDefined()
    expect(screen.getByText('Carregando suas consultas...')).toBeDefined()

    await waitFor(() => {
      expect(screen.getByText('Você não possui consultas agendadas no momento.')).toBeDefined()
    })
  })

  it('lista consultas e permite cancelamento com atualização reativa', async () => {
    entrarComo('paciente')

    let consultaCancelada = false

    simularApi((url, init) => {
      if (url.includes('/api/consultas/minhas')) {
        return consultaCancelada
          ? []
          : [
              {
                id: 'consulta-1',
                profissionalId: 'prof-1',
                pacienteId: 'paciente-1',
                profissionalNome: 'Dra. Ana',
                especialidade: 'Dermatologia',
                data: '2026-10-20',
                hora: '14:00',
                inicio: '2026-10-20T14:00:00Z',
                fim: '2026-10-20T14:30:00Z',
                tipo: 'retorno',
                status: 'agendada',
                criadaEm: '2026-10-15T10:00:00Z',
                canceladaEm: null,
              },
            ]
      }
      if (url.includes('/api/consultas/consulta-1/cancelar') && init?.method === 'POST') {
        consultaCancelada = true
        return { id: 'consulta-1', status: 'cancelada' }
      }
      return null
    })

    renderComQuery(<MinhasConsultas />)

    await waitFor(() => {
      expect(screen.getByText(/Dra\. Ana/)).toBeDefined()
    })

    // Clicar em Cancelar consulta
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))

    // Confirmar cancelamento
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmar cancelamento' })).toBeDefined()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

    await waitFor(() => {
      expect(screen.getByText('Você não possui consultas agendadas no momento.')).toBeDefined()
    })
  })
})
