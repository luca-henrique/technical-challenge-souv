import { describe, expect, it } from 'vitest'
import type {
  ConsultaComProfissionalEntity,
  ConsultaEntity,
  CriarConsultaDados,
} from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'
import { ConfirmarConsultaUseCase } from './confirmarConsulta.usecase'
import { RegistrarFaltaConsultaUseCase } from './registrarFaltaConsulta.usecase'

class InMemoryConsultasRepository implements IConsultasRepository {
  public consultas: ConsultaComProfissionalEntity[] = []

  async buscarPorId(id: string): Promise<ConsultaComProfissionalEntity | null> {
    return this.consultas.find((c) => c.id === id) ?? null
  }

  async buscarPaciente(_id: string): Promise<boolean> {
    return true
  }

  async buscarProfissional(_id: string): Promise<boolean> {
    return true
  }

  async cancelarConsultasExpiradasNaoConfirmadas(_pacienteId?: string): Promise<void> {}

  async listarMinhasConsultas(
    _pacienteId: string,
    _historico: boolean
  ): Promise<ConsultaComProfissionalEntity[]> {
    return this.consultas
  }

  async criarConsulta(
    dados: CriarConsultaDados & { inicio: Date; fim: Date }
  ): Promise<ConsultaEntity> {
    const c: ConsultaComProfissionalEntity = {
      id: `c-${Date.now()}`,
      profissionalId: dados.profissionalId,
      pacienteId: dados.pacienteId,
      data: dados.data,
      hora: dados.hora,
      tipo: dados.tipo,
      status: 'agendada',
      inicio: dados.inicio,
      fim: dados.fim,
      confirmadaEm: null,
      canceladaEm: null,
      profissionalNome: 'Doutor Teste',
      especialidade: 'Cardiologia',
    }
    this.consultas.push(c)
    return c
  }

  async cancelarConsulta(id: string): Promise<ConsultaEntity> {
    const c = this.consultas.find((item) => item.id === id)!
    c.status = 'cancelada'
    c.canceladaEm = new Date()
    return c
  }

  async confirmarConsulta(id: string): Promise<ConsultaComProfissionalEntity> {
    const c = this.consultas.find((item) => item.id === id)!
    c.confirmadaEm = new Date()
    return c
  }

  async remarcarConsulta(
    id: string,
    dados: { novaData: string; novaHora: string; novoInicio: Date; novoFim: Date }
  ): Promise<ConsultaEntity> {
    const c = this.consultas.find((item) => item.id === id)!
    c.data = dados.novaData
    c.hora = dados.novaHora
    c.inicio = dados.novoInicio
    c.fim = dados.novoFim
    return c
  }

  async registrarFalta(id: string): Promise<ConsultaEntity> {
    const c = this.consultas.find((item) => item.id === id)!
    c.status = 'faltou'
    return c
  }
}

describe('Consultas UseCases', () => {
  it('confirma presença com sucesso para consulta agendada', async () => {
    const repo = new InMemoryConsultasRepository()
    repo.consultas = [
      {
        id: 'c-1',
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-20',
        hora: '10:00',
        tipo: 'primeira',
        status: 'agendada',
        inicio: new Date(Date.now() + 100000),
        fim: new Date(Date.now() + 160000),
        confirmadaEm: null,
        canceladaEm: null,
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new ConfirmarConsultaUseCase(repo)
    const res = await useCase.executar('c-1', 'paciente', 'pac-1')

    expect(res.confirmadaEm).not.toBeNull()
  })

  it('impede outro paciente de confirmar consulta alheia', async () => {
    const repo = new InMemoryConsultasRepository()
    repo.consultas = [
      {
        id: 'c-1',
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-20',
        hora: '10:00',
        tipo: 'primeira',
        status: 'agendada',
        inicio: new Date(Date.now() + 100000),
        fim: new Date(Date.now() + 160000),
        confirmadaEm: null,
        canceladaEm: null,
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new ConfirmarConsultaUseCase(repo)
    await expect(useCase.executar('c-1', 'paciente', 'pac-2')).rejects.toThrow(
      'Você só pode confirmar suas próprias consultas'
    )
  })

  it('registra falta apenas após o horário de início da consulta', async () => {
    const repo = new InMemoryConsultasRepository()
    repo.consultas = [
      {
        id: 'c-1',
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-20',
        hora: '10:00',
        tipo: 'primeira',
        status: 'agendada',
        inicio: new Date(Date.now() - 60000), // Já iniciou
        fim: new Date(Date.now() + 60000),
        confirmadaEm: null,
        canceladaEm: null,
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new RegistrarFaltaConsultaUseCase(repo)
    const res = await useCase.executar('c-1')

    expect(res.status).toBe('faltou')
  })

  it('impede registro de falta antes do horário da consulta', async () => {
    const repo = new InMemoryConsultasRepository()
    repo.consultas = [
      {
        id: 'c-1',
        profissionalId: 'prof-1',
        pacienteId: 'pac-1',
        data: '2026-10-20',
        hora: '10:00',
        tipo: 'primeira',
        status: 'agendada',
        inicio: new Date(Date.now() + 3600000), // Futura
        fim: new Date(Date.now() + 7200000),
        confirmadaEm: null,
        canceladaEm: null,
        profissionalNome: 'Dr. Roberto',
        especialidade: 'Cardiologia',
      },
    ]

    const useCase = new RegistrarFaltaConsultaUseCase(repo)
    await expect(useCase.executar('c-1')).rejects.toThrow(
      'A falta só pode ser registrada depois do horário da consulta'
    )
  })
})
