import type { ConsultaEntity } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export class RegistrarFaltaConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(id: string): Promise<ConsultaEntity> {
    const consulta = await this.consultasRepository.buscarPorId(id)

    if (!consulta) {
      throw new Error('Consulta não encontrada')
    }
    if (consulta.status !== 'agendada') {
      throw new Error('Só é possível registrar falta em uma consulta agendada')
    }
    if (consulta.inicio > new Date()) {
      throw new Error('A falta só pode ser registrada depois do horário da consulta')
    }

    return this.consultasRepository.registrarFalta(id)
  }
}
