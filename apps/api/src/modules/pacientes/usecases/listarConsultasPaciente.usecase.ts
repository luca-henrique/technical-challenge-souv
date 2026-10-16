import type { ConsultaPacienteEntity } from '../entities/pacientes.entity'
import type { IPacientesRepository } from '../repositories/pacientes.repository'

export class ListarConsultasPacienteUseCase {
  constructor(private readonly pacientesRepository: IPacientesRepository) {}

  async executar(pacienteId: string): Promise<ConsultaPacienteEntity[]> {
    await this.pacientesRepository.cancelarConsultasExpiradasNaoConfirmadas(pacienteId)
    return this.pacientesRepository.listarConsultasPaciente(pacienteId)
  }
}
