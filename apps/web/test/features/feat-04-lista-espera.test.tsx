import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendarConsulta from '../../src/components/organisms/AgendarConsulta/agendarConsulta'
import MinhasInscricoesEspera from '../../src/components/organisms/MinhasInscricoesEspera/minhasInscricoesEspera'
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

describe('FEAT-04: Lista de espera para horários que forem liberados (Front-end)', () => {
  it('exibe o CardEntrarListaEspera quando não há horários disponíveis para o profissional e data', async () => {
    entrarComo('paciente')

    let dadosInscricao: Record<string, unknown> | null = null

    simularApi((url, init) => {
      if (url.includes('/profissionais')) {
        return [
          {
            id: 'prof-roberto',
            nome: 'Dr. Roberto',
            especialidade: 'Clínica geral',
          },
        ]
      }
      if (url.includes('/horarios')) {
        // Retorna grade vazia (todos horários ocupados)
        return []
      }
      if (url.includes('/lista-espera') && init?.method === 'POST') {
        dadosInscricao = JSON.parse(init.body as string)
        return {
          id: 'espera-1',
          profissionalId: 'prof-roberto',
          data: '2026-10-20',
          tipo: 'primeira',
          turno: 'manha',
          status: 'aguardando',
        }
      }
      return []
    })

    renderComQuery(<AgendarConsulta />)

    // Aguarda carregar profissionais
    await screen.findByRole('option', { name: /dr\. roberto/i })

    // Seleciona profissional
    const selectProfissional = screen.getByRole('combobox')
    fireEvent.change(selectProfissional, { target: { value: 'prof-roberto' } })

    // Seleciona data (uma terça-feira futura)
    const inputData = screen.getByLabelText('Data')
    fireEvent.change(inputData, { target: { value: '2026-10-20' } })

    // Card de lista de espera deve aparecer
    await waitFor(() => {
      expect(screen.getByText(/nenhum horário disponível para esta data\?/i)).toBeDefined()
    })

    // Seleciona turno da manhã
    const radioManha = screen.getByLabelText(/manhã/i)
    fireEvent.click(radioManha)

    // Submete entrada na lista de espera
    const botaoEntrar = screen.getByRole('button', { name: /entrar na lista de espera deste dia/i })
    fireEvent.click(botaoEntrar)

    await waitFor(() => {
      expect(dadosInscricao).toEqual({
        profissionalId: 'prof-roberto',
        data: '2026-10-20',
        tipo: 'primeira',
        turno: 'manha',
      })
      expect(screen.getByText(/inscrição na lista de espera confirmada/i)).toBeDefined()
    })
  })

  it('exibe inscrições ativas e permite sair da fila em MinhasInscricoesEspera', async () => {
    entrarComo('paciente')

    let idCancelado = ''

    simularApi((url, init) => {
      if (url.includes('/lista-espera/minhas')) {
        return [
          {
            id: 'esp-1',
            profissionalId: 'prof-1',
            pacienteId: 'pac-1',
            data: '2026-10-20',
            tipo: 'primeira',
            turno: 'manha',
            status: 'aguardando',
            profissionalNome: 'Dra. Beatriz',
            especialidade: 'Cardiologia',
          },
        ]
      }
      if (url.includes('/lista-espera/esp-1') && init?.method === 'DELETE') {
        idCancelado = 'esp-1'
        return { sucesso: true }
      }
      return []
    })

    renderComQuery(<MinhasInscricoesEspera />)

    await screen.findByText(/suas inscrições na lista de espera/i)
    expect(screen.getByText(/dra\. beatriz/i)).toBeDefined()
    expect(screen.getByText(/aguardando desistência/i)).toBeDefined()

    const botaoSair = screen.getByRole('button', { name: /sair da fila/i })
    fireEvent.click(botaoSair)

    await waitFor(() => {
      expect(idCancelado).toBe('esp-1')
    })
  })
})
