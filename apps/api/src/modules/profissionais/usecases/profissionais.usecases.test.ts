import { describe, expect, it } from 'vitest'
import type { TipoConsulta } from '@bemviver/shared'
import type {
  ConsultaAgendaEntity,
  FiltroProfissionais,
  FolgaEntity,
  ProfissionalEntity,
} from '../entities/profissionais.entity'
import type { IProfissionaisRepository } from '../repositories/profissionais.repository'
import { BloquearFolgaUseCase } from './bloquearFolga.usecase'
import { BloquearPeriodoFolgaUseCase } from './bloquearPeriodoFolga.usecase'
import { ListarEspecialidadesUseCase } from './listarEspecialidades.usecase'
import { ListarProfissionaisUseCase } from './listarProfissionais.usecase'
import { ObterAgendaProfissionalUseCase } from './obterAgendaProfissional.usecase'

class InMemoryProfissionaisRepository implements IProfissionaisRepository {
  public especialidades: string[] = ['Cardiologia', 'Dermatologia']
  public folgas: FolgaEntity[] = []
  public profissionais: ProfissionalEntity[] = [
    { id: 'prof-1', nome: 'Dra. Ana', especialidade: 'Cardiologia' },
    { id: 'prof-2', nome: 'Dr. Bruno', especialidade: 'Dermatologia' },
  ]
  public consultas: ConsultaAgendaEntity[] = []

  async listarEspecialidades(): Promise<string[]> {
    return this.especialidades
  }

  async listarProfissionais(_filtro: FiltroProfissionais): Promise<ProfissionalEntity[]> {
    return this.profissionais
  }

  async buscarPorId(id: string): Promise<{ id: string; especialidade: string } | null> {
    const prof = this.profissionais.find((p) => p.id === id)
    return prof ? { id: prof.id, especialidade: prof.especialidade } : null
  }

  async buscarFolga(profissionalId: string, data: string): Promise<FolgaEntity | null> {
    return this.folgas.find((f) => f.profissionalId === profissionalId && f.data === data) ?? null
  }

  async buscarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<FolgaEntity[]> {
    return this.folgas.filter((f) => f.profissionalId === profissionalId && datas.includes(f.data))
  }

  async buscarConsultasDoDia(profissionalId: string, data: string): Promise<ConsultaAgendaEntity[]> {
    return this.consultas.filter((c) => c.profissionalId === profissionalId && c.data === data)
  }

  async buscarConsultasAgendadasDoDia(
    profissionalId: string,
    data: string
  ): Promise<{ hora: string; tipo: TipoConsulta; status: string }[]> {
    return this.consultas
      .filter((c) => c.profissionalId === profissionalId && c.data === data && c.status === 'agendada')
      .map((c) => ({ hora: c.hora, tipo: c.tipo, status: c.status }))
  }

  async criarFolga(profissionalId: string, data: string): Promise<FolgaEntity> {
    const nova: FolgaEntity = { id: `folga-${Date.now()}`, profissionalId, data }
    this.folgas.push(nova)
    return nova
  }

  async criarFolgasPeriodo(profissionalId: string, datas: string[]): Promise<void> {
    for (const d of datas) {
      this.folgas.push({ id: `folga-${d}`, profissionalId, data: d })
    }
  }
}

describe('Profissionais UseCases', () => {
  it('deve listar especialidades', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new ListarEspecialidadesUseCase(repo)
    const res = await useCase.executar()
    expect(res).toEqual(['Cardiologia', 'Dermatologia'])
  })

  it('deve listar profissionais', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new ListarProfissionaisUseCase(repo)
    const res = await useCase.executar({})
    expect(res.length).toBe(2)
  })

  it('impede outro profissional de visualizar agenda alheia', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new ObterAgendaProfissionalUseCase(repo)
    await expect(
      useCase.executar({
        profissionalId: 'prof-1',
        data: '2026-10-20',
        usuarioPerfil: 'profissional',
        usuarioId: 'prof-2',
      })
    ).rejects.toThrow('Você só pode ver a sua própria agenda')
  })

  it('permite recepção visualizar agenda de qualquer profissional', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new ObterAgendaProfissionalUseCase(repo)
    const res = await useCase.executar({
      profissionalId: 'prof-1',
      data: '2026-10-20',
      usuarioPerfil: 'recepcao',
      usuarioId: 'rec-1',
    })
    expect(res.data).toBe('2026-10-20')
    expect(res.folga).toBe(false)
  })

  it('deve bloquear folga de um dia futuro', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new BloquearFolgaUseCase(repo)
    const res = await useCase.executar({
      profissionalId: 'prof-1',
      data: '2030-01-15',
      usuarioId: 'prof-1',
    })
    expect(res.profissionalId).toBe('prof-1')
    expect(res.data).toBe('2030-01-15')
  })

  it('impede bloqueio de folga em dia passado', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new BloquearFolgaUseCase(repo)
    await expect(
      useCase.executar({
        profissionalId: 'prof-1',
        data: '2020-01-01',
        usuarioId: 'prof-1',
      })
    ).rejects.toThrow('Não é possível bloquear um dia que já passou')
  })

  it('deve bloquear período de folga com sucesso', async () => {
    const repo = new InMemoryProfissionaisRepository()
    const useCase = new BloquearPeriodoFolgaUseCase(repo)
    const res = await useCase.executar({
      profissionalId: 'prof-1',
      dataInicio: '2030-05-01',
      dataFim: '2030-05-05',
      usuarioPerfil: 'profissional',
      usuarioId: 'prof-1',
    })
    expect(res.totalDiasBloqueados).toBe(5)
    expect(res.dias.length).toBe(5)
  })
})
