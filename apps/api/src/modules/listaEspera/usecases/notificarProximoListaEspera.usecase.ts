import { paraMinutos } from '@bemviver/shared'
import type { PacienteNotificadoListaEspera } from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'

export class NotificarProximoListaEsperaUseCase {
  constructor(private readonly listaEsperaRepository: IListaEsperaRepository) {}

  async executar(
    profissionalId: string,
    data: string,
    horaConsulta: string
  ): Promise<PacienteNotificadoListaEspera | null> {
    const minutos = paraMinutos(horaConsulta)
    const turno = minutos < 12 * 60 ? 'manha' : 'tarde'

    return this.listaEsperaRepository.notificarProximo(profissionalId, data, turno)
  }
}
