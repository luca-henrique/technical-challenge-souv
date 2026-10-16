import type { ItemListaEsperaDetalhadoEntity } from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'

export class ListarMinhasEsperaUseCase {
  constructor(private readonly listaEsperaRepository: IListaEsperaRepository) {}

  async executar(pacienteId: string): Promise<ItemListaEsperaDetalhadoEntity[]> {
    return this.listaEsperaRepository.listarPorPaciente(pacienteId)
  }
}
