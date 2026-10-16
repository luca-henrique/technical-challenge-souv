import { describe, expect, it } from 'vitest'
import type { ConsultaPacienteEntity, PacienteEntity } from '../entities/pacientes.entity'
import type { IPacientesRepository } from '../repositories/pacientes.repository'
import { ListarConsultasPacienteUseCase } from './listarConsultasPaciente.usecase'
import { ListarPacientesUseCase } from './listarPacientes.usecase'

class InMemoryPacientesRepository implements IPacientesRepository {
  public pacientes: PacienteEntity[] = [
    { id: 'pac-1', nome: 'Ana Paciente', email: 'ana@teste.com' },
    { id: 'pac-2', nome: 'Beto Paciente', email: 'beto@teste.com' },
  ]
  public consultas: ConsultaPacienteEntity[] = []
  public cancelouExpiradas = false

  async listarPacientes(): Promise<PacienteEntity[]> {
    return this.pacientes
  }

  async cancelarConsultasExpiradasNaoConfirmadas(_pacienteId?: string): Promise<void> {
    this.cancelouExpiradas = true
  }

  async listarConsultasPaciente(pacienteId: string): Promise<ConsultaPacienteEntity[]> {
    return this.consultas.filter((c) => c.pacienteId === pacienteId)
  }
}

describe('Pacientes UseCases', () => {
  it('deve listar pacientes ordenadamente', async () => {
    const repo = new InMemoryPacientesRepository()
    const useCase = new ListarPacientesUseCase(repo)
    const res = await useCase.executar()
    expect(res.length).toBe(2)
    expect(res[0].nome).toBe('Ana Paciente')
  })

  it('deve cancelar consultas expiradas ao listar histórico do paciente', async () => {
    const repo = new InMemoryPacientesRepository()
    repo.consultas = [
      {
        id: 'c-1',
        pacienteId: 'pac-1',
        profissionalId: 'prof-1',
        data: '2026-10-20',
        hora: '10:00',
        tipo: 'primeira',
        status: 'agendada',
        inicio: new Date(),
        fim: new Date(),
        confirmadaEm: null,
        canceladaEm: null,
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new ListarConsultasPacienteUseCase(repo)
    const res = await useCase.executar('pac-1')

    expect(repo.cancelouExpiradas).toBe(true)
    expect(res.length).toBe(1)
    expect(res[0].profissionalNome).toBe('Dr. Roberto')
  })
})
