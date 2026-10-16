import {
  cabeNoExpediente,
  diaUtil,
  DURACAO_MINUTOS,
  hojeEmRecife,
} from '@bemviver/shared'
import { instante, temConflito } from '../../../agenda'
import { prisma } from '../../../infra/database'
import { notificarProximoListaEspera } from '../../listaEspera/controllers/listaEspera.controller'
import type { ConsultaEntity, RemarcarConsultaDados } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export interface RemarcarConsultaResultado {
  consulta: ConsultaEntity
  pacienteNotificadoListaEspera: unknown
}

export class RemarcarConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(
    id: string,
    dados: RemarcarConsultaDados,
    usuarioPerfil: string,
    usuarioId: string
  ): Promise<RemarcarConsultaResultado> {
    const consulta = await this.consultasRepository.buscarPorId(id)

    if (!consulta) {
      throw new Error('Consulta não encontrada')
    }
    if (consulta.status !== 'agendada') {
      throw new Error('Só é possível remarcar uma consulta com status agendada')
    }
    if (usuarioPerfil === 'paciente' && consulta.pacienteId !== usuarioId) {
      throw new Error('Você só pode remarcar suas próprias consultas')
    }

    const { novaData, novaHora } = dados

    if (novaData < hojeEmRecife()) {
      throw new Error('Não é permitido remarcar para uma data no passado')
    }
    if (!diaUtil(novaData)) {
      throw new Error('A clínica só atende em dias úteis (segunda a sexta)')
    }
    if (!cabeNoExpediente({ hora: novaHora, tipo: consulta.tipo })) {
      throw new Error('Horário fora do expediente ou ultrapassa o limite de atendimento')
    }

    const novoInicio = instante(novaData, novaHora)
    if (novoInicio <= new Date()) {
      throw new Error('Não é permitido remarcar para um horário que já passou')
    }

    const novoFim = new Date(novoInicio.getTime() + DURACAO_MINUTOS[consulta.tipo] * 60_000)
    const profissionalId = consulta.profissionalId

    const atualizada = await prisma.$transaction(async (tx) => {
      // Bloqueio atômico para o profissional na nova data
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${novaData}))`
      if (consulta.data !== novaData) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${consulta.data}))`
      }

      const folga = await tx.folga.findUnique({
        where: { profissionalId_data: { profissionalId, data: novaData } },
      })
      if (folga) {
        throw new Error('O profissional está de folga nesse dia')
      }

      const marcadasProfissional = await tx.consulta.findMany({
        where: {
          profissionalId,
          data: novaData,
          status: 'agendada',
          id: { not: consulta.id },
        },
      })
      if (temConflito(marcadasProfissional, { hora: novaHora, tipo: consulta.tipo })) {
        throw new Error('Esse horário já está ocupado')
      }

      const marcadasPaciente = await tx.consulta.findMany({
        where: {
          pacienteId: consulta.pacienteId,
          data: novaData,
          status: 'agendada',
          id: { not: consulta.id },
        },
      })
      if (temConflito(marcadasPaciente, { hora: novaHora, tipo: consulta.tipo })) {
        throw new Error('Você já possui outra consulta agendada nesse horário')
      }

      return tx.consulta.update({
        where: { id: consulta.id },
        data: {
          data: novaData,
          hora: novaHora,
          inicio: novoInicio,
          fim: novoFim,
        },
      })
    })

    let proximoEspera = null
    try {
      proximoEspera = await notificarProximoListaEspera(
        consulta.profissionalId,
        consulta.data,
        consulta.hora
      )
    } catch (e) {
      console.error('Erro ao notificar lista de espera na remarcação:', e)
    }

    return {
      consulta: {
        id: atualizada.id,
        profissionalId: atualizada.profissionalId,
        pacienteId: atualizada.pacienteId,
        data: atualizada.data,
        hora: atualizada.hora,
        tipo: atualizada.tipo as any,
        status: atualizada.status,
        inicio: atualizada.inicio,
        fim: atualizada.fim,
        confirmadaEm: atualizada.confirmadaEm,
        canceladaEm: atualizada.canceladaEm,
      },
      pacienteNotificadoListaEspera: proximoEspera,
    }
  }
}
