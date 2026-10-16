import type { FiltroProfissionais, ProfissionalEntity } from '../entities/profissionais.entity'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export class ListarProfissionaisUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar(filtro: FiltroProfissionais): Promise<ProfissionalEntity[]> {
    return this.profissionaisRepository.listarProfissionais(filtro)
  }
}
