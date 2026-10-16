import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import AgendaDoDia from '../src/components/organisms/AgendaDoDia/agendaDoDia'
import AgendaProfissional from '../src/components/organisms/AgendaProfissional/agendaProfissional'
import SeletorProfissional from '../src/components/molecules/SeletorProfissional/seletorProfissional'
import { entrarComo, simularApi } from './simular-api'

function renderComQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('RN07: Bloqueio de Folgas do Profissional (Front-end)', () => {
  describe('Área do Profissional (AgendaProfissional)', () => {
    it('permite solicitar e confirmar bloqueio de dia de folga', async () => {
      entrarComo('profissional', 'prof-1')

      let folgaSolicitada = false

      simularApi((url, init) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-26',
            folga: false,
            consultas: [],
          }
        }
        if (url.includes('/api/profissionais/prof-1/folgas') && init?.method === 'POST') {
          folgaSolicitada = true
          return { id: 'folga-1', profissionalId: 'prof-1', data: '2026-10-26' }
        }
        return null
      })

      renderComQuery(<AgendaProfissional />)

      // Aguarda carregar botão de bloquear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Bloquear este dia como folga' })).toBeDefined()
      })

      // Clica para bloquear
      fireEvent.click(screen.getByRole('button', { name: 'Bloquear este dia como folga' }))

      // Botões de confirmação devem aparecer
      expect(screen.getByRole('button', { name: 'Confirmar folga' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Voltar' })).toBeDefined()

      // Confirma bloqueio
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar folga' }))

      await waitFor(() => {
        expect(folgaSolicitada).toBe(true)
      })
    })

    it('exibe alerta de folga ativa e mantém consultas pré-existentes visíveis na agenda médica', async () => {
      entrarComo('profissional', 'prof-1')

      simularApi((url) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-26',
            folga: true,
            consultas: [
              {
                id: 'c-1',
                hora: '09:00',
                tipo: 'retorno',
                status: 'agendada',
                pacienteNome: 'Lucas Henrique',
                inicio: '2026-10-26T12:00:00.000Z',
              },
            ],
          }
        }
        return null
      })

      renderComQuery(<AgendaProfissional />)

      // Aguarda alerta de folga
      await waitFor(() => {
        expect(screen.getByText('Este dia está bloqueado como folga.')).toBeDefined()
      })

      // As consultas pré-existentes continuam sendo renderizadas
      expect(screen.getByText('Lucas Henrique')).toBeDefined()
      expect(screen.getByText('09:00')).toBeDefined()
    })
  })

  describe('Área da Recepção (AgendaDoDia)', () => {
    it('exibe alerta de aviso sobre dia bloqueado de folga e mantém consultas visíveis', async () => {
      entrarComo('recepcao', 'rec-1')

      simularApi((url) => {
        if (url.includes('/api/profissionais/prof-1/agenda')) {
          return {
            data: '2026-10-26',
            folga: true,
            consultas: [
              {
                id: 'c-2',
                hora: '11:00',
                tipo: 'primeira',
                status: 'agendada',
                pacienteNome: 'Beatriz Santos',
                inicio: '2026-10-26T14:00:00.000Z',
              },
            ],
          }
        }
        if (url.includes('/api/pacientes')) {
          return []
        }
        return null
      })

      renderComQuery(<AgendaDoDia profissionalId="prof-1" data="2026-10-26" />)

      await waitFor(() => {
        expect(screen.getByText('Dia bloqueado como folga do profissional.')).toBeDefined()
      })

      expect(screen.getByText('Beatriz Santos')).toBeDefined()
      expect(screen.getAllByText('11:00').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Seletor de Profissionais (SeletorProfissional)', () => {
    it('adiciona indicador (De folga) no nome de profissionais com folga ativa', () => {
      const profissionais = [
        { id: 'p-1', nome: 'Dr. Roberto', especialidade: 'Cardiologia', folga: true },
        { id: 'p-2', nome: 'Dra. Ana', especialidade: 'Pediatria', folga: false },
      ]

      renderComQuery(
        <SeletorProfissional
          profissionais={profissionais}
          valor="p-1"
          onChange={() => {}}
        />,
      )

      expect(screen.getByText(/Dr\. Roberto \(Cardiologia\) \(De folga\)/)).toBeDefined()
      expect(screen.getByText(/Dra\. Ana \(Pediatria\)$/)).toBeDefined()
    })
  })
})
