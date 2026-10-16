import type { PacienteEntity } from '../entities/pacientes.entity'
import type { IPacientesRepository } from '../repositories/pacientes.repository'

export class ListarPacientesUseCase {
  constructor(private readonly pacientesRepository: IPacientesRepository) {}

  async executar(): Promise<PacienteEntity[]> {
    return this.pacientesRepository.listarPacientes()
  }
}
