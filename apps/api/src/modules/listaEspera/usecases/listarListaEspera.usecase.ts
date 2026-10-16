import type {
  FiltroListaEspera,
  ItemListaEsperaDetalhadoEntity,
} from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'

export class ListarListaEsperaUseCase {
  constructor(private readonly listaEsperaRepository: IListaEsperaRepository) {}

  async executar(filtro: FiltroListaEspera): Promise<ItemListaEsperaDetalhadoEntity[]> {
    return this.listaEsperaRepository.listar(filtro)
  }
}
