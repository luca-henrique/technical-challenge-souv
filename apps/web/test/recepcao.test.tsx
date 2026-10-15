import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import RecepcaoPage from '../src/app/recepcao/page'
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

describe('RecepcaoPage', () => {
  it('carrega a lista de profissionais e exibe a agenda do primeiro profissional', async () => {
    entrarComo('recepcao')

    simularApi((url) => {
      if (url.includes('/api/profissionais/prof-1/agenda')) {
        return {
          data: '2026-10-15',
          folga: false,
          consultas: [],
        }
      }
      if (url.includes('/api/profissionais')) {
        return [
          { id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' },
          { id: 'prof-2', nome: 'Dra. Julia', especialidade: 'Pediatria' },
        ]
      }
      if (url.includes('/api/pacientes')) {
        return []
      }
      return null
    })

    renderComQuery(<RecepcaoPage />)

    expect(screen.getByRole('status', { name: 'Carregando dados da recepção' })).toBeDefined()

    await waitFor(() => {
      expect(screen.getByLabelText('Profissional')).toBeDefined()
      expect(screen.getByDisplayValue('Dr. Roberto (Cardiologia)')).toBeDefined()
    })

    // Trocar de profissional
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-2' } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('Dra. Julia (Pediatria)')).toBeDefined()
    })
  })
})
