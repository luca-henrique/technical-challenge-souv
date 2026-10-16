import type { TipoConsulta } from '@bemviver/shared'
import { diaUtil, horariosDisponiveis } from '../../../agenda'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export interface ListarHorariosParams {
  profissionalId: string
  data: string
  tipo: TipoConsulta
  agora?: Date
}

export class ListarHorariosDisponiveisUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar({
    profissionalId,
    data,
    tipo,
    agora = new Date(),
  }: ListarHorariosParams): Promise<string[]> {
    const folga = await this.profissionaisRepository.buscarFolga(profissionalId, data)
    if (folga || !diaUtil(data)) {
      return []
    }

    const marcadas = await this.profissionaisRepository.buscarConsultasAgendadasDoDia(
      profissionalId,
      data
    )
    return horariosDisponiveis(marcadas, tipo, data, agora)
  }
}
