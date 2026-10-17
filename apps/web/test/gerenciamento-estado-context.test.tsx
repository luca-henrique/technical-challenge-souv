import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  ProvedorAgenda,
  ProvedorSessao,
  useAgendaContext,
  useSessaoContext,
} from '../src/providers'
import { entrarComo, simularApi } from './simular-api'

function Wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <ProvedorSessao>{children}</ProvedorSessao>
    </QueryClientProvider>
  )
}

function ConsumidorSessao() {
  const context = useSessaoContext()
  if (!context) return <div>Sem contexto de sessão</div>

  return (
    <div>
      <span data-testid="nome-usuario">{context.usuario?.nome ?? 'Deslogado'}</span>
      <span data-testid="perfil-usuario">{context.perfil ?? 'Sem perfil'}</span>
      <button
        onClick={() =>
          context.definirSessao({
            token: 'fake-token-context',
            usuario: {
              id: 'u-teste',
              nome: 'Dra. Roberta Santos',
              perfil: 'profissional',
            },
          })
        }
      >
        Entrar como Roberta
      </button>
      <button onClick={() => context.encerrar()}>Sair do Contexto</button>
    </div>
  )
}

function ConsumidorAgenda() {
  const context = useAgendaContext()
  if (!context) return <div>Sem contexto de agenda</div>

  return (
    <div>
      <span data-testid="agenda-prof">{context.profissionalId}</span>
      <span data-testid="agenda-data">{context.data}</span>
      <span data-testid="consultas-qtd">
        {context.agenda?.consultas?.length ?? 0}
      </span>
      <button
        onClick={() =>
          context.agendarConsulta({
            profissionalId: context.profissionalId,
            data: context.data,
            pacienteId: 'pac-teste',
            tipo: 'primeira',
            hora: '10:00',
          })
        }
      >
        Agendar via Contexto
      </button>
    </div>
  )
}

describe('Gerenciamento de Estado via Context API', () => {
  it('ProvedorSessao compartilha estado de autenticação e responde a login/logout reativamente', async () => {
    localStorage.clear()

    render(
      <Wrapper>
        <ConsumidorSessao />
      </Wrapper>,
    )

    expect(screen.getByTestId('nome-usuario').textContent).toBe('Deslogado')
    expect(screen.getByTestId('perfil-usuario').textContent).toBe('Sem perfil')

    // Executa login através do contexto
    fireEvent.click(screen.getByText('Entrar como Roberta'))

    await waitFor(() => {
      expect(screen.getByTestId('nome-usuario').textContent).toBe(
        'Dra. Roberta Santos',
      )
      expect(screen.getByTestId('perfil-usuario').textContent).toBe('profissional')
    })

    // Executa logout através do contexto
    fireEvent.click(screen.getByText('Sair do Contexto'))

    await waitFor(() => {
      expect(screen.getByTestId('nome-usuario').textContent).toBe('Deslogado')
    })
  })

  it('ProvedorAgenda compartilha dados e mutations entre múltiplos componentes sem prop drilling', async () => {
    entrarComo('recepcao')

    let agendada = false

    simularApi((url, init) => {
      if (url.includes('/api/profissionais/prof-context/agenda')) {
        return {
          data: '2026-10-20',
          folga: false,
          consultas: agendada
            ? [
                {
                  id: 'c-context-1',
                  profissionalId: 'prof-context',
                  pacienteId: 'pac-teste',
                  pacienteNome: 'Novo Paciente',
                  data: '2026-10-20',
                  hora: '10:00',
                  inicio: '2026-10-20T10:00:00Z',
                  fim: '2026-10-20T11:00:00Z',
                  tipo: 'primeira',
                  status: 'agendada',
                  criadaEm: '2026-10-20T08:00:00Z',
                  canceladaEm: null,
                },
              ]
            : [],
        }
      }
      if (url.includes('/api/consultas') && init?.method === 'POST') {
        agendada = true
        return { id: 'c-context-1', status: 'agendada' }
      }
      return null
    })

    render(
      <Wrapper>
        <ProvedorAgenda profissionalId="prof-context" data="2026-10-20">
          <ConsumidorAgenda />
        </ProvedorAgenda>
      </Wrapper>,
    )

    expect(screen.getByTestId('agenda-prof').textContent).toBe('prof-context')
    expect(screen.getByTestId('agenda-data').textContent).toBe('2026-10-20')

    await waitFor(() => {
      expect(screen.getByTestId('consultas-qtd').textContent).toBe('0')
    })

    fireEvent.click(screen.getByText('Agendar via Contexto'))

    await waitFor(() => {
      expect(screen.getByTestId('consultas-qtd').textContent).toBe('1')
    })
  })
})
