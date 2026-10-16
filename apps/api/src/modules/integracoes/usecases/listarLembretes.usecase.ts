import { hojeEmRecife } from '@bemviver/shared'
import { somarDias } from '../../../agenda'
import type { LembreteConsultaEntity } from '../entities/integracoes.entity'
import type { IIntegracoesRepository } from '../repositories/integracoes.repository'

export class ListarLembretesUseCase {
  constructor(private readonly integracoesRepository: IIntegracoesRepository) {}

  async executar(data?: string): Promise<LembreteConsultaEntity[]> {
    const dataAlvo = data ?? somarDias(hojeEmRecife(), 1)
    return this.integracoesRepository.buscarConsultasParaLembrete(dataAlvo)
  }
}
