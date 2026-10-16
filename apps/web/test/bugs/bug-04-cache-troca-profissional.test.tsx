import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import RecepcaoPage from '../../src/app/recepcao/page'
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

describe('BUG-04: Cache Desatualizado ao Alternar Profissionais na Agenda', () => {
  it('relato da clínica: ao trocar de profissional, a agenda do anterior não deve continuar aparecendo', async () => {
    entrarComo('recepcao')

    simularApi((url) => {
      if (url.includes('/api/profissionais/prof-1/agenda')) {
        return {
          data: '2026-10-16',
          folga: false,
          consultas: [
            {
              id: 'c-1',
              profissionalId: 'prof-1',
              pacienteId: 'pac-1',
              pacienteNome: 'Paciente Roberto Exclusivo',
              data: '2026-10-16',
              hora: '09:00',
              tipo: 'retorno',
              status: 'agendada',
              inicio: '2026-10-16T12:00:00.000Z',
              fim: '2026-10-16T12:30:00.000Z',
            },
          ],
        }
      }

      if (url.includes('/api/profissionais/prof-2/agenda')) {
        return {
          data: '2026-10-16',
          folga: false,
          consultas: [
            {
              id: 'c-2',
              profissionalId: 'prof-2',
              pacienteId: 'pac-2',
              pacienteNome: 'Paciente Julia Exclusivo',
              data: '2026-10-16',
              hora: '14:00',
              tipo: 'primeira',
              status: 'agendada',
              inicio: '2026-10-16T17:00:00.000Z',
              fim: '2026-10-16T18:00:00.000Z',
            },
          ],
        }
      }

      if (url.includes('/api/profissionais')) {
        return [
          { id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia' },
          { id: 'prof-2', nome: 'Dra. Julia', especialidade: 'Pediatria' },
        ]
      }

      if (url.includes('/api/pacientes')) {
        return [
          { id: 'pac-1', nome: 'Paciente Pac1' },
          { id: 'pac-2', nome: 'Paciente Pac2' },
        ]
      }

      return null
    })

    renderComQuery(<RecepcaoPage />)

    // 1. Aguarda carregar a lista de profissionais
    await waitFor(() => {
      expect(screen.getByLabelText('Profissional')).toBeDefined()
    })

    // 2. Seleciona o primeiro médico (Dr. Roberto)
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-1' } })

    // 3. Aguarda renderizar a tabela com a consulta exclusiva de Dr. Roberto
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Paciente Roberto Exclusivo' })).toBeDefined()
    })
    expect(screen.queryByRole('cell', { name: 'Paciente Julia Exclusivo' })).toBeNull()

    // 4. Recepcionista altera o profissional no dropdown para Dra. Julia ('prof-2')
    fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-2' } })

    // 5. Verifica que a agenda do Dr. Roberto NÃO continua aparecendo
    await waitFor(() => {
      expect(screen.getByRole('cell', { name: 'Paciente Julia Exclusivo' })).toBeDefined()
    })
    expect(screen.queryByRole('cell', { name: 'Paciente Roberto Exclusivo' })).toBeNull()
  })
})
