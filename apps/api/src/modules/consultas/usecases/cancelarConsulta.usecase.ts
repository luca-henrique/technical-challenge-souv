import { notificarProximoListaEspera } from '../../listaEspera/controllers/listaEspera.controller'
import type { ConsultaEntity } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export interface CancelarConsultaResultado {
  consulta: ConsultaEntity
  pacienteNotificadoListaEspera: unknown
}

export class CancelarConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(
    id: string,
    usuarioPerfil: string,
    usuarioId: string
  ): Promise<CancelarConsultaResultado> {
    const consulta = await this.consultasRepository.buscarPorId(id)

    if (!consulta) {
      throw new Error('Consulta não encontrada')
    }
    if (consulta.status !== 'agendada') {
      throw new Error('Só é possível cancelar uma consulta agendada')
    }
    if (usuarioPerfil === 'paciente' && consulta.pacienteId !== usuarioId) {
      throw new Error('Você só pode cancelar suas próprias consultas')
    }

    const cancelada = await this.consultasRepository.cancelarConsulta(id)

    let proximoEspera = null
    try {
      proximoEspera = await notificarProximoListaEspera(
        consulta.profissionalId,
        consulta.data,
        consulta.hora
      )
    } catch (e) {
      console.error('Erro ao notificar lista de espera:', e)
    }

    return {
      consulta: cancelada,
      pacienteNotificadoListaEspera: proximoEspera,
    }
  }
}
