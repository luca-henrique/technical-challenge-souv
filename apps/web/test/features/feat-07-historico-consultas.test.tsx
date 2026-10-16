import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import MinhasConsultas from '../../src/components/organisms/MinhasConsultas/minhasConsultas'
import { entrarComo, simularApi } from '../simular-api'

function renderComQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('FEAT-07: Histórico de consultas do paciente (Front-end)', () => {
  it('alterna entre abas Próximas consultas e Histórico, exibindo consultas correspondentes', async () => {
    entrarComo('paciente')

    simularApi((url) => {
      if (url.includes('/consultas/minhas?historico=true')) {
        return [
          {
            id: 'consulta-passada-1',
            profissionalId: 'prof-roberto',
            pacienteId: 'pac-1',
            data: '2026-09-10',
            hora: '14:00',
            tipo: 'primeira',
            status: 'realizada',
            profissionalNome: 'Dr. Roberto',
            especialidade: 'Clínica geral',
          },
          {
            id: 'consulta-passada-2',
            profissionalId: 'prof-beatriz',
            pacienteId: 'pac-1',
            data: '2026-08-15',
            hora: '10:00',
            tipo: 'retorno',
            status: 'cancelada',
            profissionalNome: 'Dra. Beatriz',
            especialidade: 'Cardiologia',
          },
        ]
      }

      if (url.includes('/consultas/minhas')) {
        return [
          {
            id: 'consulta-futura-1',
            profissionalId: 'prof-roberto',
            pacienteId: 'pac-1',
            data: '2026-10-25',
            hora: '09:00',
            tipo: 'retorno',
            status: 'agendada',
            profissionalNome: 'Dr. Roberto',
            especialidade: 'Clínica geral',
          },
        ]
      }

      if (url.includes('/lista-espera/minhas')) {
        return []
      }

      return []
    })

    renderComQuery(<MinhasConsultas />)

    // 1. Aba padrão: Próximas consultas
    await waitFor(() => {
      expect(screen.getByText(/próximas consultas/i)).toBeDefined()
      expect(screen.getByText(/25\/10 às 09:00/i)).toBeDefined()
    })

    // 2. Clica na aba Histórico
    const abaHistorico = screen.getByRole('tab', { name: /histórico/i })
    fireEvent.click(abaHistorico)

    // 3. Exibe consultas do histórico
    await waitFor(() => {
      expect(screen.getByText(/10\/09 às 14:00/i)).toBeDefined()
      expect(screen.getByText(/15\/08 às 10:00/i)).toBeDefined()
      expect(screen.getByText(/dra\. beatriz/i)).toBeDefined()
      expect(screen.getByText(/realizada/i)).toBeDefined()
      expect(screen.getByText(/cancelada/i)).toBeDefined()
    })

    // 4. Clica de volta para Próximas consultas
    const abaProximas = screen.getByRole('tab', { name: /próximas consultas/i })
    fireEvent.click(abaProximas)

    await waitFor(() => {
      expect(screen.getByText(/25\/10 às 09:00/i)).toBeDefined()
    })
  })
})
