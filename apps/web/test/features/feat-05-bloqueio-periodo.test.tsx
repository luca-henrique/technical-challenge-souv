import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AgendaProfissional from '../../src/components/organisms/AgendaProfissional/agendaProfissional'
import FormBloquearPeriodo from '../../src/components/molecules/FormBloquearPeriodo/formBloquearPeriodo'
import { entrarComo, simularApi } from '../simular-api'

describe('FEAT-05: Bloqueio de agenda por período (Front-end)', () => {
  it('valida que data final não pode ser anterior à data inicial no formulário', async () => {
    const onConfirmar = vi.fn()
    const onCancelar = vi.fn()

    render(
      <FormBloquearPeriodo
        onConfirmar={onConfirmar}
        onCancelar={onCancelar}
      />
    )

    const dataInicioInput = screen.getByLabelText('Data de início')
    const dataFimInput = screen.getByLabelText('Data de término')

    fireEvent.change(dataInicioInput, { target: { value: '2026-06-15' } })
    fireEvent.change(dataFimInput, { target: { value: '2026-06-10' } })

    fireEvent.click(screen.getByRole('button', { name: /confirmar bloqueio/i }))

    await waitFor(() => {
      expect(screen.getByText('A data de início não pode ser posterior à data de término')).toBeDefined()
    })
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('permite abrir o formulário em AgendaProfissional e enviar bloqueio de período com sucesso', async () => {
    entrarComo('profissional')

    let chamadaBloqueioPeriodo: Record<string, unknown> | null = null

    simularApi((url, init) => {
      if (url.includes('/agenda')) {
        return {
          profissionalId: 'prof-roberto',
          data: '2026-06-01',
          folga: false,
          consultas: [],
        }
      }

      if (url.includes('/folgas/periodo') && init?.method === 'POST') {
        chamadaBloqueioPeriodo = JSON.parse(init.body as string)
        return {
          sucesso: true,
          diasBloqueados: 5,
          totalCriadas: 5,
        }
      }

      return {}
    })

    render(<AgendaProfissional />)

    // Aguarda carregar agenda
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /bloquear período \(férias\)/i })).toBeDefined()
    })

    // Clica para abrir formulário
    fireEvent.click(screen.getByRole('button', { name: /bloquear período \(férias\)/i }))

    expect(screen.getByText(/bloquear período de folga/i)).toBeDefined()

    // Preenche dados
    const dataInicioInput = screen.getByLabelText('Data de início')
    const dataFimInput = screen.getByLabelText('Data de término')

    fireEvent.change(dataInicioInput, { target: { value: '2026-06-01' } })
    fireEvent.change(dataFimInput, { target: { value: '2026-06-05' } })

    fireEvent.click(screen.getByRole('button', { name: /confirmar bloqueio/i }))

    await waitFor(() => {
      expect(chamadaBloqueioPeriodo).toEqual({
        dataInicio: '2026-06-01',
        dataFim: '2026-06-05',
      })
    })

    // Formulário fecha após confirmação com sucesso
    await waitFor(() => {
      expect(screen.queryByText(/bloquear período de folga/i)).toBeNull()
    })
  })
})
