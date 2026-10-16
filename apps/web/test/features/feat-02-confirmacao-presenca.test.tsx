import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import type { Consulta } from '@bemviver/shared'
import CartaoConsulta from '../../src/components/molecules/CartaoConsulta/cartaoConsulta'
import TabelaConsultas from '../../src/components/organisms/TabelaConsultas/tabelaConsultas'
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

describe('FEAT-02: Confirmação de presença pelo paciente (Front-end)', () => {
  const consultaPendente: Consulta = {
    id: 'consulta-1',
    profissionalId: 'prof-roberto',
    pacienteId: 'pac-1',
    data: '2026-10-25',
    hora: '10:00',
    inicio: '2026-10-25T13:00:00.000Z',
    fim: '2026-10-25T13:30:00.000Z',
    tipo: 'retorno',
    status: 'agendada',
    criadaEm: '2026-10-10T10:00:00.000Z',
    canceladaEm: null,
    confirmadaEm: null,
    profissionalNome: 'Dr. Roberto',
    especialidade: 'Clínica geral',
    pacienteNome: 'João Silva',
  }

  const consultaConfirmada: Consulta = {
    ...consultaPendente,
    id: 'consulta-2',
    hora: '11:00',
    confirmadaEm: '2026-10-24T10:00:00.000Z',
    pacienteNome: 'Maria Santos',
  }

  it('permite que o paciente confirme sua presença no CartaoConsulta', async () => {
    entrarComo('paciente')

    let idConfirmado = ''

    simularApi((url, init) => {
      if (url.includes('/consultas/consulta-1/confirmar') && init?.method === 'POST') {
        idConfirmado = 'consulta-1'
        return {
          ...consultaPendente,
          confirmadaEm: '2026-10-24T12:00:00.000Z',
        }
      }
      return []
    })

    renderComQuery(<CartaoConsulta consulta={consultaPendente} onCancelar={() => {}} />)

    // Botão de confirmar presença deve estar visível
    const botaoConfirmar = screen.getByRole('button', { name: /confirmar presença/i })
    fireEvent.click(botaoConfirmar)

    await waitFor(() => {
      expect(idConfirmado).toBe('consulta-1')
    })
  })

  it('exibe o badge de presença confirmada quando confirmadaEm está presente', () => {
    renderComQuery(<CartaoConsulta consulta={consultaConfirmada} onCancelar={() => {}} />)

    expect(screen.getByText(/✓ presença confirmada/i)).toBeDefined()
    expect(screen.queryByRole('button', { name: /confirmar presença/i })).toBeNull()
  })

  it('exibe tags Confirmada e Pendente na TabelaConsultas', () => {
    render(
      <TabelaConsultas consultas={[consultaPendente, consultaConfirmada]} />
    )

    expect(screen.getByText('Pendente')).toBeDefined()
    expect(screen.getByText('Confirmada')).toBeDefined()
  })
})
