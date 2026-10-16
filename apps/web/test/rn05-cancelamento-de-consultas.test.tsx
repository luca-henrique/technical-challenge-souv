import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import AgendaDoDia from '../src/components/organisms/AgendaDoDia/agendaDoDia'
import MinhasConsultas from '../src/components/organisms/MinhasConsultas/minhasConsultas'
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

describe('RN05: Cancelamento de Consultas e Liberação de Horário (Front-end)', () => {
  describe('Área do Paciente (MinhasConsultas)', () => {
    it('exibe botão de cancelamento apenas em consultas agendadas e solicita confirmação de segurança', async () => {
      entrarComo('paciente', 'pac-1')

      let chamadaCancelamento = false

      simularApi((url, init) => {
        if (url.includes('/api/consultas/minhas')) {
          return [
            {
              id: 'c-1',
              data: '2026-10-26',
              hora: '09:00',
              tipo: 'retorno',
              status: 'agendada',
              profissionalNome: 'Dr. Roberto',
              especialidade: 'Cardiologia',
            },
            {
              id: 'c-2',
              data: '2026-10-20',
              hora: '14:00',
              tipo: 'primeira',
              status: 'cancelada',
              profissionalNome: 'Dra. Ana',
              especialidade: 'Dermatologia',
            },
          ]
        }
        if (url.includes('/api/consultas/c-1/cancelar') && init?.method === 'POST') {
          chamadaCancelamento = true
          return {
            id: 'c-1',
            status: 'cancelada',
            canceladaEm: new Date().toISOString(),
          }
        }
        return null
      })

      renderComQuery(<MinhasConsultas />)

      // Aguarda carregar consultas
      await waitFor(() => {
        expect(screen.getByText(/Dr\. Roberto/)).toBeDefined()
        expect(screen.getByText(/Dra\. Ana/)).toBeDefined()
      })

      // Botão "Cancelar consulta" só deve existir para a consulta agendada (c-1), não para c-2
      const botoesCancelar = screen.getAllByRole('button', { name: 'Cancelar consulta' })
      expect(botoesCancelar).toHaveLength(1)

      // Clica em cancelar consulta -> Exibe confirmação inline
      fireEvent.click(botoesCancelar[0])
      expect(screen.getByRole('button', { name: 'Confirmar cancelamento' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Voltar' })).toBeDefined()

      // Testa botão "Voltar" (desiste do cancelamento)
      fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
      expect(screen.queryByRole('button', { name: 'Confirmar cancelamento' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Cancelar consulta' })).toBeDefined()

      // Clica novamente e desta vez confirma
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

      await waitFor(() => {
        expect(chamadaCancelamento).toBe(true)
      })
    })

    it('exibe alerta de erro se a API rejeitar o cancelamento (ex: consulta já cancelada)', async () => {
      entrarComo('paciente', 'pac-1')

      simularApi((url, init) => {
        if (url.includes('/api/consultas/minhas')) {
          return [
            {
              id: 'c-1',
              data: '2026-10-26',
              hora: '09:00',
              tipo: 'retorno',
              status: 'agendada',
              profissionalNome: 'Dr. Roberto',
              especialidade: 'Cardiologia',
            },
          ]
        }
        if (url.includes('/api/consultas/c-1/cancelar') && init?.method === 'POST') {
          return {
            status: 409,
            body: { erro: 'Só é possível cancelar uma consulta agendada' },
          }
        }
        return null
      })

      renderComQuery(<MinhasConsultas />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Cancelar consulta' })).toBeDefined()
      })

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }))
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelamento' }))

      await waitFor(() => {
        expect(screen.getByText('Só é possível cancelar uma consulta agendada')).toBeDefined()
      })
    })
  })

  describe('Área da Recepção (AgendaDoDia)', () => {
    it('permite que a recepção cancele a consulta de qualquer paciente e invalide a agenda', async () => {
      entrarComo('recepcao', 'rec-1')

      let cancelamentoFeito = false

      simularApi((url, init) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            profissionalId: 'prof-1',
            data: '2026-10-26',
            folga: false,
            consultas: [
              {
                id: 'c-99',
                hora: '10:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'João Silva',
                inicio: '2026-10-26T13:00:00.000Z',
              },
            ],
          }
        }
        if (url.includes('/api/pacientes')) {
          return []
        }
        if (url.includes('/api/consultas/c-99/cancelar') && init?.method === 'POST') {
          cancelamentoFeito = true
          return { id: 'c-99', status: 'cancelada' }
        }
        return null
      })

      const { queryClient } = renderComQuery(
        <AgendaDoDia profissionalId="prof-1" data="2026-10-26" />,
      )
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeDefined()
      })

      const botaoCancelar = screen.getByRole('button', { name: 'Cancelar' })
      fireEvent.click(botaoCancelar)

      await waitFor(() => {
        expect(cancelamentoFeito).toBe(true)
      })

      // Invalida a query da agenda para recarregar os slots livres
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['agenda', 'prof-1', '2026-10-26'],
        }),
      )
    })
  })
})
