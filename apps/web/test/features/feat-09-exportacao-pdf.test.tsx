import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BotaoExportarPdf from '../../src/components/molecules/BotaoExportarPdf/botaoExportarPdf'

describe('FEAT-09: Exportação da Agenda do Dia em PDF', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    window.print = vi.fn()
  })

  it('renderiza o botão com texto e aria-label acessível para exportação/impressão', () => {
    render(<BotaoExportarPdf />)

    const botao = screen.getByRole('button', { name: 'Exportar PDF' })
    expect(botao).toBeDefined()
    expect(botao.className).toContain('print:hidden')
  })

  it('aciona window.print() quando clicado na ausência de callback customizado', () => {
    render(<BotaoExportarPdf />)

    const botao = screen.getByRole('button', { name: 'Exportar PDF' })
    fireEvent.click(botao)

    expect(window.print).toHaveBeenCalledTimes(1)
  })

  it('executa a função onExportar customizada quando fornecida', () => {
    const mockOnExportar = vi.fn()
    render(<BotaoExportarPdf onExportar={mockOnExportar} rotulo="Baixar PDF" />)

    const botao = screen.getByRole('button', { name: 'Baixar PDF' })
    fireEvent.click(botao)

    expect(mockOnExportar).toHaveBeenCalledTimes(1)
    expect(window.print).not.toHaveBeenCalled()
  })
})
