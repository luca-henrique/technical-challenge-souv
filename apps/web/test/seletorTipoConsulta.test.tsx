import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SeletorTipoConsulta from '../src/components/molecules/SeletorTipoConsulta/seletorTipoConsulta'

describe('SeletorTipoConsulta', () => {
  it('renderiza opções padrão (primeira consulta e retorno) quando nenhuma opção é informada', () => {
    render(<SeletorTipoConsulta valor="primeira" onChange={() => {}} />)

    expect(screen.getByRole('button', { name: 'Primeira consulta' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Retorno' })).toBeDefined()
  })

  it('indica a opção atualmente selecionada via aria-pressed', () => {
    render(<SeletorTipoConsulta valor="retorno" onChange={() => {}} />)

    const btnPrimeira = screen.getByRole('button', { name: 'Primeira consulta' })
    const btnRetorno = screen.getByRole('button', { name: 'Retorno' })

    expect(btnPrimeira.getAttribute('aria-pressed')).toBe('false')
    expect(btnRetorno.getAttribute('aria-pressed')).toBe('true')
  })

  it('chama onChange com o valor selecionado ao clicar em um botão', () => {
    const onChange = vi.fn()
    render(<SeletorTipoConsulta valor="primeira" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Retorno' }))
    expect(onChange).toHaveBeenCalledWith('retorno')
  })

  it('aceita opções customizadas via props tanto como string quanto como objeto com rótulo personalizado', () => {
    const onChange = vi.fn()
    render(
      <SeletorTipoConsulta
        valor="retorno"
        onChange={onChange}
        opcoes={[
          { valor: 'retorno', rotulo: 'Consulta de Retorno' },
          { valor: 'primeira', rotulo: 'Avaliação Inicial' },
        ]}
      />
    )

    expect(screen.getByRole('button', { name: 'Consulta de Retorno' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Avaliação Inicial' })).toBeDefined()
  })

  it('exibe mensagem de erro quando fornecida', () => {
    render(
      <SeletorTipoConsulta
        valor="primeira"
        onChange={() => {}}
        erro="Selecione um tipo de consulta válido"
      />
    )

    expect(screen.getByText('Selecione um tipo de consulta válido')).toBeDefined()
  })

  it('permite customizar o label/legend', () => {
    render(
      <SeletorTipoConsulta
        valor="primeira"
        onChange={() => {}}
        label="Modalidade do atendimento"
      />
    )

    expect(screen.getByText('Modalidade do atendimento')).toBeDefined()
  })

  it('funciona com as props alternativas selecionado e onSelecionar', () => {
    const onSelecionar = vi.fn()
    render(
      <SeletorTipoConsulta
        selecionado="primeira"
        onSelecionar={onSelecionar}
      />
    )

    const btnRetorno = screen.getByRole('button', { name: 'Retorno' })
    fireEvent.click(btnRetorno)
    expect(onSelecionar).toHaveBeenCalledWith('retorno')
  })
})
