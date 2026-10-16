import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendarConsulta from '../src/components/organisms/AgendarConsulta/agendarConsulta'
import MarcarConsulta from '../src/components/organisms/MarcarConsulta/marcarConsulta'
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

describe('RN04: Exclusividade de Atendimento e Prevenção de Conflitos (Front-end)', () => {
  it('exibe alerta de conflito e limpa seleção de horário quando a API retorna 409', async () => {
    entrarComo('paciente')

    simularApi((url, init) => {
      if (url.includes('/api/profissionais/prof-1/horarios')) {
        return { horarios: ['09:00', '09:30', '10:00'] }
      }
      if (url.includes('/api/profissionais')) {
        return [
          { id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' },
        ]
      }
      if (url.includes('/api/consultas') && init?.method === 'POST') {
        // Simula colisão / race condition: outro paciente agendou instantes antes
        return {
          status: 409,
          body: { erro: 'Esse horário já está ocupado' },
        }
      }
      return null
    })

    const { queryClient } = renderComQuery(<AgendarConsulta />)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    // Aguardar carregamento dos profissionais
    await waitFor(() => {
      expect(screen.getByText(/Dr\. Roberto/)).toBeDefined()
    })

    // Selecionar profissional
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-1' } })

    // Selecionar data
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-10-26' } })

    // Aguardar botões de horário
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '09:00' })).toBeDefined()
    })

    // Selecionar horário 09:00
    fireEvent.click(screen.getByRole('button', { name: '09:00' }))

    // Submeter formulário
    const botaoConfirmar = screen.getByRole('button', { name: 'Confirmar consulta' })
    fireEvent.click(botaoConfirmar)

    // Deve exibir o alerta com a mensagem de erro da API
    await waitFor(() => {
      expect(screen.getByText('Esse horário já está ocupado')).toBeDefined()
    })

    // Deve revalidar a lista de horários
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['horarios', 'prof-1', '2026-10-26'],
        }),
      )
    })

    // O botão de confirmar deve estar desabilitado porque a hora foi limpa após o erro
    const botaoAposErro = screen.getByRole('button', { name: 'Confirmar consulta' }) as HTMLButtonElement
    expect(botaoAposErro.disabled).toBe(true)
  })

  it('exibe alerta de erro na recepção ao tentar agendar horário ocupado', async () => {
    entrarComo('recepcao')

    simularApi((url, init) => {
      if (url.includes('/api/pacientes')) {
        return [{ id: 'pac-1', nome: 'Mariana Silva' }]
      }
      if (url.includes('/api/consultas') && init?.method === 'POST') {
        return {
          status: 409,
          body: { erro: 'Esse horário já está ocupado' },
        }
      }
      return null
    })

    renderComQuery(
      <MarcarConsulta
        profissionalId="prof-1"
        data="2026-10-26"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Mariana Silva')).toBeDefined()
    })

    // Selecionar paciente
    fireEvent.change(screen.getByLabelText('Paciente'), { target: { value: 'pac-1' } })

    // Submeter formulário
    fireEvent.click(screen.getByRole('button', { name: 'Marcar' }))

    await waitFor(() => {
      expect(screen.getByText('Esse horário já está ocupado')).toBeDefined()
    })
  })
})
