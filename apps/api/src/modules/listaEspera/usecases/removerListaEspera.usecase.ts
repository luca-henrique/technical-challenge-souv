import type { ItemListaEsperaEntity } from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'

export interface RemoverListaEsperaParams {
  id: string
  usuarioPerfil: string
  usuarioId: string
}

export class RemoverListaEsperaUseCase {
  constructor(private readonly listaEsperaRepository: IListaEsperaRepository) {}

  async executar({
    id,
    usuarioPerfil,
    usuarioId,
  }: RemoverListaEsperaParams): Promise<ItemListaEsperaEntity> {
    const item = await this.listaEsperaRepository.buscarPorId(id)

    if (!item) {
      throw new Error('Registro de lista de espera não encontrado')
    }

    if (usuarioPerfil === 'paciente' && item.pacienteId !== usuarioId) {
      throw new Error('Você só pode cancelar suas próprias inscrições na lista de espera')
    }

    return this.listaEsperaRepository.cancelar(id)
  }
}
