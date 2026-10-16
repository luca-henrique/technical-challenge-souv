import { diaUtil, hojeEmRecife, type TipoConsulta } from '@bemviver/shared'
import type {
  ItemListaEsperaEntity,
  TurnoListaEspera,
} from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'

export interface InscreverParams {
  profissionalId: string
  pacienteId: string
  data: string
  tipo: TipoConsulta
  turno: TurnoListaEspera
}

export class InscreverListaEsperaUseCase {
  constructor(private readonly listaEsperaRepository: IListaEsperaRepository) {}

  async executar({
    profissionalId,
    pacienteId,
    data,
    tipo,
    turno,
  }: InscreverParams): Promise<ItemListaEsperaEntity> {
    if (data < hojeEmRecife()) {
      throw new Error('Não é permitido entrar na lista de espera para datas no passado')
    }

    if (!diaUtil(data)) {
      throw new Error('A clínica só atende em dias úteis (segunda a sexta)')
    }

    const existeProfissional = await this.listaEsperaRepository.buscarProfissional(profissionalId)
    if (!existeProfissional) {
      throw new Error('Profissional não encontrado')
    }

    const folga = await this.listaEsperaRepository.buscarFolga(profissionalId, data)
    if (folga) {
      throw new Error('O profissional está de folga nesta data')
    }

    const existente = await this.listaEsperaRepository.buscarRegistro(
      profissionalId,
      pacienteId,
      data
    )

    if (existente && existente.status === 'aguardando') {
      throw new Error('Você já está na lista de espera deste profissional para esta data')
    }

    if (existente) {
      return this.listaEsperaRepository.atualizarParaAguardando(existente.id, tipo, turno)
    }

    return this.listaEsperaRepository.criar({
      profissionalId,
      pacienteId,
      data,
      tipo,
      turno,
    })
  }
}
