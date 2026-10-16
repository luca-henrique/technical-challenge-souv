import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendarConsulta from '../src/components/organisms/AgendarConsulta/agendarConsulta'
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
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('AgendarConsulta', () => {
  it('permite selecionar profissional, data, horário e agendar consulta', async () => {
    entrarComo('paciente')
    const onSucesso = vi.fn()

    let consultaCriada = false

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
        consultaCriada = true
        return {
          id: 'c-100',
          profissionalId: 'prof-1',
          data: '2026-10-26',
          hora: '09:00',
          tipo: 'primeira',
          status: 'agendada',
        }
      }
      return null
    })

    renderComQuery(<AgendarConsulta onSucesso={onSucesso} />)

    // Aguardar carregamento dos profissionais
    await waitFor(() => {
      expect(screen.getByText(/Dr\. Roberto/)).toBeDefined()
    })

    // Selecionar profissional
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-1' } })

    // Selecionar data (segunda-feira)
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-10-26' } })

    // Aguardar horários
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '09:00' })).toBeDefined()
    })

    // Selecionar horário 09:00
    fireEvent.click(screen.getByRole('button', { name: '09:00' }))

    // Submeter formulário
    const botaoConfirmar = screen.getByRole('button', { name: 'Confirmar consulta' })
    fireEvent.click(botaoConfirmar)

    await waitFor(() => {
      expect(consultaCriada).toBe(true)
      expect(onSucesso).toHaveBeenCalledTimes(1)
    })
  })

  it('permite passar opcoesTipoConsulta customizadas via props', async () => {
    entrarComo('paciente')
    simularApi((url) => {
      if (url.includes('/api/profissionais')) {
        return [{ id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' }]
      }
      return null
    })

    renderComQuery(
      <AgendarConsulta
        opcoesTipoConsulta={[
          { valor: 'retorno', rotulo: 'Retorno Personalizado' },
          { valor: 'primeira', rotulo: 'Primeira Vez' },
        ]}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Retorno Personalizado' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Primeira Vez' })).toBeDefined()
    })
  })

  it('bloqueia e exibe erro ao selecionar sábado ou domingo (RN01)', async () => {
    entrarComo('paciente')
    simularApi((url) => {
      if (url.includes('/api/profissionais')) {
        return [{ id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' }]
      }
      return null
    })

    renderComQuery(<AgendarConsulta />)

    await waitFor(() => {
      expect(screen.getByText(/Dr\. Roberto/)).toBeDefined()
    })

    // Selecionar profissional
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-1' } })

    // Selecionar domingo (2026-10-25)
    fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-10-25' } })

    // Aguardar mensagem de erro da RN01
    await waitFor(() => {
      expect(screen.getByText('A clínica só atende de segunda a sexta')).toBeDefined()
    })

    // Botão de submissão desabilitado
    const botaoConfirmar = screen.getByRole('button', { name: 'Confirmar consulta' })
    expect(botaoConfirmar.getAttribute('disabled')).not.toBeNull()

    // Não deve renderizar grade de horários
    expect(screen.queryByRole('button', { name: '09:00' })).toBeNull()
  })
})


