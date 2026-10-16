import type { ConsultaComProfissionalEntity } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export class ConfirmarConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(
    id: string,
    usuarioPerfil: string,
    usuarioId: string
  ): Promise<ConsultaComProfissionalEntity> {
    const consulta = await this.consultasRepository.buscarPorId(id)

    if (!consulta) {
      throw new Error('Consulta não encontrada')
    }
    if (consulta.status !== 'agendada') {
      throw new Error('Só é possível confirmar uma consulta agendada')
    }
    if (usuarioPerfil === 'paciente' && consulta.pacienteId !== usuarioId) {
      throw new Error('Você só pode confirmar suas próprias consultas')
    }

    if (consulta.confirmadaEm) {
      return consulta
    }

    return this.consultasRepository.confirmarConsulta(id)
  }
}
