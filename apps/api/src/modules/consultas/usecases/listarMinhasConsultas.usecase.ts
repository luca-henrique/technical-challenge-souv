import type { ConsultaComProfissionalEntity } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export class ListarMinhasConsultasUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(
    pacienteId: string,
    historico: boolean
  ): Promise<ConsultaComProfissionalEntity[]> {
    // Cancela automaticamente consultas não confirmadas cujo horário já passou
    await this.consultasRepository.cancelarConsultasExpiradasNaoConfirmadas(pacienteId)
    return this.consultasRepository.listarMinhasConsultas(pacienteId, historico)
  }
}
