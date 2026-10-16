import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BotaoTema from '../../src/components/atoms/BotaoTema/botaoTema'
import AreaTemplate from '../../src/components/templates/AreaTemplate/areaTemplate'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
}))

// Mock useSessao
vi.mock('@/hooks/useSessao', () => ({
  useSessao: () => ({
    usuario: { id: 'pac-1', nome: 'Paciente Teste', perfil: 'paciente' },
  }),
}))

describe('FEAT-10: Tema Escuro na Área do Paciente', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('permite alternar entre os temas Claro, Escuro e Automático e persiste no localStorage', () => {
    render(<BotaoTema />)

    const botao = screen.getByRole('button', { name: /Alternar tema|Tema/i })
    expect(botao).toBeDefined()

    // Clica para alternar tema
    fireEvent.click(botao)

    // Se estava em sistema (ou claro), alterna para o próximo
    const proximoTema = localStorage.getItem('tema-clinica-bem-viver')
    expect(['claro', 'escuro', 'sistema']).toContain(proximoTema)
  })

  it('adiciona a classe .dark no elemento raiz html quando o tema escuro é ativado', () => {
    localStorage.setItem('tema-clinica-bem-viver', 'escuro')
    render(<BotaoTema />)

    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('remove a classe .dark quando o tema claro é ativado', () => {
    localStorage.setItem('tema-clinica-bem-viver', 'claro')
    render(<BotaoTema />)

    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('exibe o seletor de tema no cabeçalho do AreaTemplate', () => {
    render(
      <AreaTemplate perfil="paciente" titulo="Minhas consultas">
        <p>Conteúdo da área</p>
      </AreaTemplate>,
    )

    expect(screen.getByRole('button', { name: /Alternar tema|Tema/i })).toBeDefined()
    expect(screen.getByText('Conteúdo da área')).toBeDefined()
  })
})
