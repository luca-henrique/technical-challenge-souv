import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export class ListarEspecialidadesUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar(): Promise<string[]> {
    return this.profissionaisRepository.listarEspecialidades()
  }
}
