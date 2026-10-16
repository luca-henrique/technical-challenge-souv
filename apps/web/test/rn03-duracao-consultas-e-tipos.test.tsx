import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DURACAO_MINUTOS, gradePorTipo } from '@bemviver/shared'
import { NOME_TIPO, NOME_TIPO_COM_DURACAO } from '../src/lib/formato'
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

describe('RN03: Duração de Consultas e Tipos (Front-end)', () => {
  describe('Definições e Formatação de Tipos e Durações', () => {
    it('associa primeira consulta a 60 minutos e retorno a 30 minutos', () => {
      expect(DURACAO_MINUTOS.primeira).toBe(60)
      expect(DURACAO_MINUTOS.retorno).toBe(30)
    })

    it('apresenta rótulos claros com indicação de duração', () => {
      expect(NOME_TIPO.primeira).toBe('Primeira consulta')
      expect(NOME_TIPO.retorno).toBe('Retorno')

      expect(NOME_TIPO_COM_DURACAO.primeira).toBe('Primeira consulta (60 min)')
      expect(NOME_TIPO_COM_DURACAO.retorno).toBe('Retorno (30 min)')
    })

    it('filtra slots na grade de acordo com a duração de cada tipo', () => {
      const slotsPrimeira = gradePorTipo('primeira')
      const slotsRetorno = gradePorTipo('retorno')

      // Primeira consulta (60 min) não pode começar em 11:30 nem em 17:30
      expect(slotsPrimeira).not.toContain('11:30')
      expect(slotsPrimeira).not.toContain('17:30')
      expect(slotsPrimeira).toContain('11:00')
      expect(slotsPrimeira).toContain('17:00')

      // Retorno (30 min) pode ser marcado às 11:30 e às 17:30
      expect(slotsRetorno).toContain('11:30')
      expect(slotsRetorno).toContain('17:30')
    })
  })

  describe('Integração com Formulário de Agendamento', () => {
    it('solicita horários na API passando o tipo de consulta selecionado', async () => {
      entrarComo('paciente')
      const chamadasApi: string[] = []

      simularApi((url) => {
        if (url.includes('/api/profissionais/prof-1/horarios')) {
          chamadasApi.push(url)
          if (url.includes('tipo=primeira')) {
            return { horarios: ['09:00', '10:00'] }
          }
          if (url.includes('tipo=retorno')) {
            return { horarios: ['09:00', '09:30', '10:00'] }
          }
          return { horarios: ['09:00', '09:30', '10:00'] }
        }
        if (url.includes('/api/profissionais')) {
          return [
            { id: 'prof-1', nome: 'Dra. Beatriz', especialidade: 'Pediatria' },
          ]
        }
        return null
      })

      renderComQuery(<AgendarConsulta />)

      // Aguardar profissional carregar
      await waitFor(() => {
        expect(screen.getByText(/Dra\. Beatriz/)).toBeDefined()
      })

      // Selecionar profissional
      fireEvent.change(screen.getByLabelText('Profissional'), { target: { value: 'prof-1' } })

      // Selecionar data
      fireEvent.change(screen.getByLabelText('Data'), { target: { value: '2026-10-27' } })

      // Por padrão o tipo é primeira consulta (ou pode ser selecionado)
      await waitFor(() => {
        expect(chamadasApi.some((u) => u.includes('tipo=primeira'))).toBe(true)
      })

      // Troca o tipo para Retorno
      const seletorRetorno = screen.getByRole('button', { name: /Retorno/i })
      fireEvent.click(seletorRetorno)

      await waitFor(() => {
        expect(chamadasApi.some((u) => u.includes('tipo=retorno'))).toBe(true)
      })
    })
  })
})
