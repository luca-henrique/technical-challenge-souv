import { hojeEmRecife } from '@bemviver/shared'
import type { FolgaEntity } from '../entities/profissionais.entity'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export interface BloquearFolgaParams {
  profissionalId: string
  data: string
  usuarioId: string
}

export class BloquearFolgaUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar({ profissionalId, data, usuarioId }: BloquearFolgaParams): Promise<FolgaEntity> {
    if (usuarioId !== profissionalId) {
      throw new Error('Você só pode bloquear a sua própria agenda')
    }

    if (data < hojeEmRecife()) {
      throw new Error('Não é possível bloquear um dia que já passou')
    }

    const profissional = await this.profissionaisRepository.buscarPorId(profissionalId)
    if (!profissional) {
      throw new Error('Profissional não encontrado')
    }

    const existente = await this.profissionaisRepository.buscarFolga(profissionalId, data)
    if (existente) {
      throw new Error('Esse dia já está bloqueado')
    }

    return this.profissionaisRepository.criarFolga(profissionalId, data)
  }
}
