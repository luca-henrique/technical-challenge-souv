import { describe, expect, it } from 'vitest'
import type { TipoConsulta } from '@bemviver/shared'
import type {
  FiltroListaEspera,
  ItemListaEsperaDetalhadoEntity,
  ItemListaEsperaEntity,
  PacienteNotificadoListaEspera,
  TurnoListaEspera,
} from '../entities/listaEspera.entity'
import type { IListaEsperaRepository } from '../repositories/listaEspera.repository'
import { InscreverListaEsperaUseCase } from './inscreverListaEspera.usecase'
import { NotificarProximoListaEsperaUseCase } from './notificarProximoListaEspera.usecase'

class InMemoryListaEsperaRepository implements IListaEsperaRepository {
  public itens: ItemListaEsperaEntity[] = []
  public profissionaisExistentes = new Set(['prof-1'])
  public folgasExistentes = new Set<string>()

  async buscarProfissional(id: string): Promise<boolean> {
    return this.profissionaisExistentes.has(id)
  }

  async buscarFolga(profissionalId: string, data: string): Promise<boolean> {
    return this.folgasExistentes.has(`${profissionalId}_${data}`)
  }

  async buscarRegistro(
    profissionalId: string,
    pacienteId: string,
    data: string
  ): Promise<ItemListaEsperaEntity | null> {
    return (
      this.itens.find(
        (i) =>
          i.profissionalId === profissionalId &&
          i.pacienteId === pacienteId &&
          i.data === data
      ) ?? null
    )
  }

  async criar(dados: {
    profissionalId: string
    pacienteId: string
    data: string
    tipo: TipoConsulta
    turno: TurnoListaEspera
  }): Promise<ItemListaEsperaEntity> {
    const item: ItemListaEsperaEntity = {
      id: `item-${Date.now()}`,
      profissionalId: dados.profissionalId,
      pacienteId: dados.pacienteId,
      data: dados.data,
      tipo: dados.tipo,
      turno: dados.turno,
      status: 'aguardando',
      criadaEm: new Date(),
    }
    this.itens.push(item)
    return item
  }

  async atualizarParaAguardando(
    id: string,
    tipo: TipoConsulta,
    turno: TurnoListaEspera
  ): Promise<ItemListaEsperaEntity> {
    const item = this.itens.find((i) => i.id === id)!
    item.tipo = tipo
    item.turno = turno
    item.status = 'aguardando'
    item.criadaEm = new Date()
    return item
  }

  async listar(_filtro: FiltroListaEspera): Promise<ItemListaEsperaDetalhadoEntity[]> {
    return []
  }

  async listarPorPaciente(_pacienteId: string): Promise<ItemListaEsperaDetalhadoEntity[]> {
    return []
  }

  async buscarPorId(id: string): Promise<ItemListaEsperaEntity | null> {
    return this.itens.find((i) => i.id === id) ?? null
  }

  async cancelar(id: string): Promise<ItemListaEsperaEntity> {
    const item = this.itens.find((i) => i.id === id)!
    item.status = 'cancelado'
    return item
  }

  async notificarProximo(
    profissionalId: string,
    data: string,
    turno: 'manha' | 'tarde'
  ): Promise<PacienteNotificadoListaEspera | null> {
    const proximo = this.itens.find(
      (i) =>
        i.profissionalId === profissionalId &&
        i.data === data &&
        i.status === 'aguardando' &&
        (i.turno === turno || i.turno === 'qualquer')
    )
    if (!proximo) return null
    proximo.status = 'notificado'
    proximo.notificadoEm = new Date()
    return {
      id: proximo.id,
      pacienteId: proximo.pacienteId,
      pacienteNome: 'Paciente Fila',
      pacienteEmail: 'fila@teste.com',
      profissionalNome: 'Doutor',
      data: proximo.data,
      turno: proximo.turno,
      notificadoEm: proximo.notificadoEm.toISOString(),
    }
  }
}

describe('ListaEspera UseCases', () => {
  it('inscreve paciente na lista de espera para data futura', async () => {
    const repo = new InMemoryListaEsperaRepository()
    const useCase = new InscreverListaEsperaUseCase(repo)

    const item = await useCase.executar({
      profissionalId: 'prof-1',
      pacienteId: 'pac-1',
      data: '2030-08-12', // Segunda-feira útil futura
      tipo: 'primeira',
      turno: 'manha',
    })

    expect(item.id).toBeDefined()
    expect(item.status).toBe('aguardando')
  })

  it('notifica próximo da fila com turno compatível', async () => {
    const repo = new InMemoryListaEsperaRepository()
    repo.itens = [
      {
        id: '1',
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2030-08-12',
        tipo: 'primeira',
        turno: 'manha',
        status: 'aguardando',
        criadaEm: new Date(),
      },
    ]

    const useCase = new NotificarProximoListaEsperaUseCase(repo)
    const notificado = await useCase.executar('prof-1', '2030-08-12', '09:00')

    expect(notificado).not.toBeNull()
    expect(notificado?.pacienteId).toBe('pac-1')
  })
})
