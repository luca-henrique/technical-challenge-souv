import { describe, expect, it } from 'vitest'
import type { LembreteConsultaEntity } from '../entities/integracoes.entity'
import type { IIntegracoesRepository } from '../repositories/integracoes.repository'
import { ListarLembretesUseCase } from './listarLembretes.usecase'

class InMemoryIntegracoesRepository implements IIntegracoesRepository {
  public consultas: LembreteConsultaEntity[] = []

  async buscarConsultasParaLembrete(data: string): Promise<LembreteConsultaEntity[]> {
    return this.consultas.filter((c) => c.data === data)
  }
}

describe('ListarLembretesUseCase', () => {
  it('retorna consultas agendadas para a data informada', async () => {
    const repo = new InMemoryIntegracoesRepository()
    repo.consultas = [
      {
        id: 'c-1',
        consultaId: 'c-1',
        data: '2026-10-25',
        hora: '09:00',
        tipo: 'primeira',
        pacienteNome: 'Paciente 1',
        pacienteEmail: 'paciente1@teste.com',
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new ListarLembretesUseCase(repo)
    const res = await useCase.executar('2026-10-25')

    expect(res.length).toBe(1)
    expect(res[0].pacienteNome).toBe('Paciente 1')
  })
})
