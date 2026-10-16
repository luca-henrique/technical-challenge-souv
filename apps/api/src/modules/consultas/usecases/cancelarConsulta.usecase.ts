import { notificarProximoListaEspera } from '../../listaEspera/controllers/listaEspera.controller'
import type { PacienteNotificadoListaEspera } from '../../listaEspera/entities/listaEspera.entity'
import type { ConsultaEntity } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export interface CancelarConsultaResultado {
  consulta: ConsultaEntity
  pacienteNotificadoListaEspera: PacienteNotificadoListaEspera | null
}

export class CancelarConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(
    id: string,
    usuarioPerfil: string,
    usuarioId: string
  ): Promise<CancelarConsultaResultado> {
    const consulta = await this.consultasRepository.buscarPorId(id)

    if (!consulta) {
      throw new Error('Consulta não encontrada')
    }
    if (consulta.status !== 'agendada') {
      throw new Error('Só é possível cancelar uma consulta agendada')
    }
    if (usuarioPerfil === 'paciente' && consulta.pacienteId !== usuarioId) {
      throw new Error('Você só pode cancelar suas próprias consultas')
    }

    const cancelada = await this.consultasRepository.cancelarConsulta(id)

    // Enfileira o e-mail de cancelamento para o paciente
    try {
      const { prisma } = await import('../../../infra/database')
      const paciente = await prisma.usuario.findUnique({ where: { id: consulta.pacienteId } })
      if (paciente?.email) {
        const { enfileirarEmail, gerarEmailCancelamento } = await import('../../../infra/jobs')
        const emailDados = gerarEmailCancelamento({
          pacienteNome: paciente.nome,
          profissionalNome: consulta.profissionalNome,
          especialidade: consulta.especialidade,
          data: consulta.data,
          hora: consulta.hora,
        })
        await enfileirarEmail({
          para: paciente.email,
          assunto: emailDados.assunto,
          html: emailDados.html,
          texto: emailDados.texto,
          tipo: 'cancelamento',
          metadados: { consultaId: id },
        })
      }
    } catch (e) {
      console.error('[CancelarConsulta] Erro ao enfileirar e-mail de cancelamento:', e)
    }

    let proximoEspera: PacienteNotificadoListaEspera | null = null
    try {
      proximoEspera = await notificarProximoListaEspera(
        consulta.profissionalId,
        consulta.data,
        consulta.hora
      )

      if (proximoEspera && proximoEspera.pacienteEmail) {
        const { enfileirarEmail, gerarEmailVagaLiberada } = await import('../../../infra/jobs')
        const emailEspera = gerarEmailVagaLiberada({
          pacienteNome: proximoEspera.pacienteNome,
          profissionalNome: proximoEspera.profissionalNome,
          data: proximoEspera.data,
          turno: proximoEspera.turno,
        })
        await enfileirarEmail({
          para: proximoEspera.pacienteEmail,
          assunto: emailEspera.assunto,
          html: emailEspera.html,
          texto: emailEspera.texto,
          tipo: 'lista_espera_liberada',
          metadados: { listaEsperaId: proximoEspera.id },
        })
      }
    } catch (e) {
      console.error('Erro ao notificar lista de espera:', e)
    }

    return {
      consulta: cancelada,
      pacienteNotificadoListaEspera: proximoEspera,
    }
  }
}
