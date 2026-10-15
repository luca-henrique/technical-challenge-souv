import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from '../src/app/page'
import { lerSessao } from '../src/lib/sessao'
import { simularApi } from './simular-api'

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

describe('login', () => {
  beforeEach(() => {
    roteador.push.mockClear()
    roteador.replace.mockClear()
  })

  it('guarda a sessão e leva o usuário para a área do perfil dele', async () => {
    simularApi(() => ({ token: 'abc', usuario: { id: '1', nome: 'Maria', perfil: 'paciente' } }))
    renderComQuery(<LoginPage />)

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@exemplo.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'bemviver123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(roteador.push).toHaveBeenCalledWith('/paciente'))
    expect(lerSessao()?.token).toBe('abc')
  })

  it('exibe erros de validação com dados inválidos sem chamar a API', async () => {
    const chamadaApi = vi.fn()
    simularApi(chamadaApi)

    renderComQuery(<LoginPage />)

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'email-invalido' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Informe um e-mail válido')).toBeDefined()
      expect(screen.getByText('Informe sua senha')).toBeDefined()
    })

    expect(chamadaApi).not.toHaveBeenCalled()
  })
})
