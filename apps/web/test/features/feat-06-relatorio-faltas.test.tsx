import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import RelatoriosPage from '../../src/app/recepcao/relatorios/page'
import { entrarComo, simularApi } from '../simular-api'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
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

describe('FEAT-06: Relatório de Faltas e Absenteísmo (Front-end)', () => {
  it('exibe métricas consolidadas e tabela de pacientes reincidentes', async () => {
    entrarComo('recepcao')

    simularApi((url) => {
      if (url.includes('/api/relatorios/faltas')) {
        return {
          periodo: {},
          totais: {
            agendadas: 20,
            realizadas: 14,
            canceladas: 2,
            faltas: 4,
          },
          taxaFaltas: 20.0,
          reincidentes: [
            {
              pacienteId: 'pac-1',
              nome: 'Carlos Reincidente',
              email: 'carlos@teste.com',
              totalFaltas: 3,
            },
            {
              pacienteId: 'pac-2',
              nome: 'Ana SegundaFalta',
              email: 'ana@teste.com',
              totalFaltas: 1,
            },
          ],
          faltasPorProfissional: [],
        }
      }

      if (url.includes('/api/profissionais')) {
        return [{ id: 'prof-1', nome: 'Dr. Roberto', especialidade: 'Clínica geral' }]
      }

      return null
    })

    renderComQuery(<RelatoriosPage />)

    // 1. Aguarda carregar dados
    await waitFor(() => {
      expect(screen.getByText('Relatório de Absenteísmo (No-Show)')).toBeDefined()
      expect(screen.getByText('Total agendadas')).toBeDefined()
      expect(screen.getByText('20')).toBeDefined()
      expect(screen.getByText('14')).toBeDefined()
      expect(screen.getByText('20.0%')).toBeDefined()
    })

    // 2. Verifica a tabela de pacientes reincidentes
    expect(screen.getByText('Carlos Reincidente')).toBeDefined()
    expect(screen.getByText('carlos@teste.com')).toBeDefined()
    expect(screen.getByText('3 faltas')).toBeDefined()

    // 3. Testa submissão de filtro
    const botaoFiltrar = screen.getByRole('button', { name: 'Filtrar' })
    fireEvent.click(botaoFiltrar)
  })

  it('permite limpar filtros e voltar para a agenda da recepção', async () => {
    entrarComo('recepcao')

    simularApi((url) => {
      if (url.includes('/api/relatorios/faltas')) {
        return {
          periodo: {},
          totais: { agendadas: 0, realizadas: 0, canceladas: 0, faltas: 0 },
          taxaFaltas: 0,
          reincidentes: [],
          faltasPorProfissional: [],
        }
      }
      if (url.includes('/api/profissionais')) return []
      return null
    })

    renderComQuery(<RelatoriosPage />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum paciente reincidente em faltas registrado no período.')).toBeDefined()
    })

    const linkVoltar = screen.getByRole('link', { name: 'Voltar para Agenda' })
    expect(linkVoltar.getAttribute('href')).toBe('/recepcao')

    const botaoLimpar = screen.getByRole('button', { name: 'Limpar' })
    fireEvent.click(botaoLimpar)
  })

  it('permite navegar entre páginas de pacientes reincidentes', async () => {
    entrarComo('recepcao')

    simularApi((url) => {
      if (url.includes('/api/relatorios/faltas')) {
        const paginaMatch = url.match(/[?&]pagina=(\d+)/)
        const paginaSolicitada = paginaMatch ? Number(paginaMatch[1]) : 1

        return {
          periodo: {},
          totais: { agendadas: 15, realizadas: 10, canceladas: 0, faltas: 5 },
          taxaFaltas: 33.3,
          reincidentes:
            paginaSolicitada === 1
              ? [
                  {
                    pacienteId: 'pac-1',
                    nome: 'Paciente Pagina 1',
                    email: 'p1@teste.com',
                    totalFaltas: 4,
                  },
                ]
              : [
                  {
                    pacienteId: 'pac-2',
                    nome: 'Paciente Pagina 2',
                    email: 'p2@teste.com',
                    totalFaltas: 2,
                  },
                ],
          faltasPorProfissional: [],
          paginacao: {
            pagina: paginaSolicitada,
            limite: 1,
            totalItens: 2,
            totalPaginas: 2,
          },
        }
      }
      if (url.includes('/api/profissionais')) return []
      return null
    })

    renderComQuery(<RelatoriosPage />)

    await waitFor(() => {
      expect(screen.getByText('Paciente Pagina 1')).toBeDefined()
      expect(screen.getByText(/Página/)).toBeDefined()
    })

    const botaoProxima = screen.getByRole('button', { name: 'Ir para a próxima página' })
    expect(botaoProxima).toBeDefined()
    expect(botaoProxima.hasAttribute('disabled')).toBe(false)

    fireEvent.click(botaoProxima)

    await waitFor(() => {
      expect(screen.getByText('Paciente Pagina 2')).toBeDefined()
    })
  })
})

