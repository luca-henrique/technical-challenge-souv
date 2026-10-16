import { hojeEmRecife } from '@bemviver/shared'
import { somarDias } from '../../../agenda'
import type { BloqueioPeriodoResultado } from '../entities/profissionais.entity'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'

export interface BloquearPeriodoParams {
  profissionalId: string
  dataInicio: string
  dataFim: string
  usuarioPerfil: string
  usuarioId: string
}

export class BloquearPeriodoFolgaUseCase {
  constructor(private readonly profissionaisRepository: IProfissionaisRepository) {}

  async executar({
    profissionalId,
    dataInicio,
    dataFim,
    usuarioPerfil,
    usuarioId,
  }: BloquearPeriodoParams): Promise<BloqueioPeriodoResultado> {
    if (usuarioPerfil === 'profissional' && usuarioId !== profissionalId) {
      throw new Error('Você só pode bloquear a sua própria agenda')
    }

    if (dataInicio < hojeEmRecife()) {
      throw new Error('Não é possível bloquear um período que já passou')
    }

    if (dataInicio > dataFim) {
      throw new Error('A data de início não pode ser posterior à data de término')
    }

    const profissional = await this.profissionaisRepository.buscarPorId(profissionalId)
    if (!profissional) {
      throw new Error('Profissional não encontrado')
    }

    const dias: string[] = []
    let d = dataInicio
    while (d <= dataFim) {
      dias.push(d)
      d = somarDias(d, 1)
    }

    if (dias.length > 90) {
      throw new Error('O período máximo de bloqueio é de 90 dias')
    }

    const folgasExistentes = await this.profissionaisRepository.buscarFolgasPeriodo(
      profissionalId,
      dias
    )
    const setExistentes = new Set(folgasExistentes.map((f) => f.data))
    const diasParaCriar = dias.filter((dia) => !setExistentes.has(dia))

    if (diasParaCriar.length > 0) {
      await this.profissionaisRepository.criarFolgasPeriodo(profissionalId, diasParaCriar)
    }

    return {
      totalDiasBloqueados: diasParaCriar.length,
      periodo: { dataInicio, dataFim },
      dias: diasParaCriar,
    }
  }
}
