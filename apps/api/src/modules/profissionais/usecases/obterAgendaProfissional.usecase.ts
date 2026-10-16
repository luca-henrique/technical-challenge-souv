import type { AgendaProfissionalEntity } from '../entities/profissionais.entity'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export interface ObterAgendaParams {
  profissionalId: string
  data: string
  usuarioPerfil: string
  usuarioId: string
}

export class ObterAgendaProfissionalUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar({
    profissionalId,
    data,
    usuarioPerfil,
    usuarioId,
  }: ObterAgendaParams): Promise<AgendaProfissionalEntity> {
    if (usuarioPerfil === 'profissional' && usuarioId !== profissionalId) {
      throw new Error('Você só pode ver a sua própria agenda')
    }

    const [folga, consultas] = await Promise.all([
      this.profissionaisRepository.buscarFolga(profissionalId, data),
      this.profissionaisRepository.buscarConsultasDoDia(profissionalId, data),
    ])

    return {
      data,
      folga: Boolean(folga),
      consultas,
    }
  }
}
