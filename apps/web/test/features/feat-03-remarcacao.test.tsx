import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import type { Consulta } from '@bemviver/shared'
import CartaoConsulta from '../../src/components/molecules/CartaoConsulta/cartaoConsulta'
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

describe('FEAT-03: Remarcação pelo próprio paciente (Front-end)', () => {
  const consultaMock: Consulta = {
    id: 'consulta-1',
    profissionalId: 'prof-roberto',
    pacienteId: 'pac-1',
    data: '2026-10-19',
    hora: '09:00',
    inicio: '2026-10-19T12:00:00.000Z',
    fim: '2026-10-19T13:00:00.000Z',
    tipo: 'primeira',
    status: 'agendada',
    criadaEm: '2026-10-10T10:00:00.000Z',
    canceladaEm: null,
    profissionalNome: 'Dr. Roberto',
    especialidade: 'Clínica geral',
  }

  it('permite abrir o modal de remarcação e confirmar novo horário com sucesso', async () => {
    entrarComo('paciente')

    let corpoRemarcacao: Record<string, unknown> | null = null

    simularApi((url, init) => {
      if (url.includes('/horarios')) {
        return { horarios: ['14:00', '15:00', '16:00'] }
      }
      if (url.includes('/consultas/consulta-1/remarcar') && init?.method === 'PATCH') {
        corpoRemarcacao = JSON.parse(init.body as string)
        return {
          ...consultaMock,
          data: '2026-10-21',
          hora: '15:00',
        }
      }
      return []
    })

    renderComQuery(<CartaoConsulta consulta={consultaMock} onCancelar={() => {}} />)

    // Clica no botão Remarcar
    const botaoRemarcar = screen.getByRole('button', { name: /remarcar/i })
    fireEvent.click(botaoRemarcar)

    // Modal aberto
    expect(screen.getByRole('heading', { name: /remarcar consulta/i })).toBeDefined()

    // Preenche nova data (uma quarta-feira)
    const inputNovaData = screen.getByLabelText(/nova data/i)
    fireEvent.change(inputNovaData, { target: { value: '2026-10-21' } })

    // Aguarda carregar horários disponíveis
    const botaoHorario = await screen.findByRole('button', { name: '15:00' })
    fireEvent.click(botaoHorario)

    // Submete formulário
    const botaoConfirmar = screen.getByRole('button', { name: /confirmar nova data/i })
    fireEvent.click(botaoConfirmar)

    await waitFor(() => {
      expect(corpoRemarcacao).toEqual({
        novaData: '2026-10-21',
        novaHora: '15:00',
      })
    })

    // Modal deve fechar após sucesso
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /remarcar consulta/i })).toBeNull()
    })
  })
})
