import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('BUG-05: Carregamento Infinito para Pacientes Novos sem Consultas', () => {
  it('relato da clínica: paciente novo com zero consultas não pode ficar com a tela travada em carregamento infinito', async () => {
    entrarComo('paciente')

    // API responde rapidamente com lista vazia [] para o novo paciente
    simularApi((url) => {
      if (url.includes('/api/consultas/minhas')) {
        return []
      }
      return null
    })

    renderComQuery(<MinhasConsultas />)

    // 1. Inicialmente pode exibir skeleton enquanto a requisição voa
    // 2. Logo em seguida, quando a resposta [] chega, o skeleton DEVE sumir
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Carregando consultas...' })).toBeNull()
      expect(screen.getByText('Você não possui consultas agendadas no momento.')).toBeDefined()
    })

    // 3. Garante que o usuário tem ação para sair do estado vazio (botão de marcar consulta)
    const botaoMarcar = screen.getByRole('link', { name: 'Marcar consulta' })
    expect(botaoMarcar).toBeDefined()
    expect(botaoMarcar.getAttribute('href')).toBe('/paciente/agendar')
  })
})
