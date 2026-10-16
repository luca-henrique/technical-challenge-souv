import { describe, expect, it } from 'vitest'
import type {
  ConsultaRelatorioEntity,
  FiltroRelatorioFaltas,
} from '../entities/relatorios.entity'
import type { IRelatoriosRepository } from '../repositories/relatorios.repository'
import { GerarRelatorioFaltasUseCase } from './gerarRelatorioFaltas.usecase'

class InMemoryRelatoriosRepository implements IRelatoriosRepository {
  public consultas: ConsultaRelatorioEntity[] = []

  async buscarConsultasRelatorio(
    _filtro: FiltroRelatorioFaltas
  ): Promise<ConsultaRelatorioEntity[]> {
    return this.consultas
  }
}

describe('GerarRelatorioFaltasUseCase', () => {
  it('agrega corretamente estatísticas de consultas, faltas e reincidentes', async () => {
    const repo = new InMemoryRelatoriosRepository()
    repo.consultas = [
      {
        id: '1',
        pacienteId: 'pac-1',
        profissionalId: 'prof-1',
        data: '2026-10-10',
        status: 'realizada',
        paciente: { id: 'pac-1', nome: 'Paciente A', email: 'a@teste.com' },
        profissional: {
          id: 'prof-1',
          especialidade: 'Cardiologia',
          usuario: { nome: 'Dr. Roberto' },
        },
      },
      {
        id: '2',
        pacienteId: 'pac-1',
        profissionalId: 'prof-1',
        data: '2026-10-11',
        status: 'faltou',
        paciente: { id: 'pac-1', nome: 'Paciente A', email: 'a@teste.com' },
        profissional: {
          id: 'prof-1',
          especialidade: 'Cardiologia',
          usuario: { nome: 'Dr. Roberto' },
        },
      },
      {
        id: '3',
        pacienteId: 'pac-2',
        profissionalId: 'prof-1',
        data: '2026-10-12',
        status: 'cancelada',
        paciente: { id: 'pac-2', nome: 'Paciente B', email: 'b@teste.com' },
        profissional: {
          id: 'prof-1',
          especialidade: 'Cardiologia',
          usuario: { nome: 'Dr. Roberto' },
        },
      },
    ]

    const useCase = new GerarRelatorioFaltasUseCase(repo)
    const relatorio = await useCase.executar({ dataInicio: '2026-10-10', dataFim: '2026-10-12' })

    expect(relatorio.totais.agendadas).toBe(3)
    expect(relatorio.totais.realizadas).toBe(1)
    expect(relatorio.totais.canceladas).toBe(1)
    expect(relatorio.totais.faltas).toBe(1)
    expect(relatorio.taxaFaltas).toBe(33.3)
    expect(relatorio.reincidentes.length).toBe(1)
    expect(relatorio.reincidentes[0].nome).toBe('Paciente A')
    expect(relatorio.faltasPorProfissional[0].faltas).toBe(1)
  })
})
