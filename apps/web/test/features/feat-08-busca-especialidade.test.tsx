import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendarConsulta from '../../src/components/organisms/AgendarConsulta/agendarConsulta'
import { entrarComo, simularApi } from '../simular-api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

function renderComQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('FEAT-08: Busca de profissionais por especialidade (Front-end)', () => {
  it('permite filtrar a lista de profissionais ao selecionar uma especialidade', async () => {
    entrarComo('paciente')

    simularApi((url) => {
      if (url.includes('/profissionais/especialidades')) {
        return ['Cardiologia', 'Clínica geral', 'Dermatologia']
      }

      if (url.includes('especialidade=Cardiologia')) {
        return [
          {
            id: 'prof-beatriz',
            nome: 'Dra. Beatriz',
            especialidade: 'Cardiologia',
          },
        ]
      }

      if (url.includes('/profissionais')) {
        return [
          {
            id: 'prof-roberto',
            nome: 'Dr. Roberto',
            especialidade: 'Clínica geral',
          },
          {
            id: 'prof-beatriz',
            nome: 'Dra. Beatriz',
            especialidade: 'Cardiologia',
          },
        ]
      }

      return []
    })

    renderComQuery(<AgendarConsulta />)

    // 1. Aguarda carregar as opções de especialidade
    await screen.findByRole('option', { name: 'Cardiologia' })

    const selectEspecialidade = screen.getByLabelText(/especialidade/i)

    // Inicialmente aparecem ambos os profissionais
    expect(screen.getByRole('option', { name: /dr\. roberto/i })).toBeDefined()
    expect(screen.getByRole('option', { name: /dra\. beatriz/i })).toBeDefined()

    // 2. Filtra por Cardiologia
    fireEvent.change(selectEspecialidade, { target: { value: 'Cardiologia' } })

    // 3. O select de profissionais agora exibe apenas Dra. Beatriz
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: /dr\. roberto/i })).toBeNull()
      expect(screen.getByRole('option', { name: /dra\. beatriz/i })).toBeDefined()
    })
  })
})
