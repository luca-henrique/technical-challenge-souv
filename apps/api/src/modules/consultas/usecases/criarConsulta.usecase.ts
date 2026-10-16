import { DURACAO_MINUTOS } from '@bemviver/shared'
import { instante, temConflito } from '../../../agenda'
import { prisma } from '../../../infra/database'
import type { ConsultaEntity, CriarConsultaDados } from '../entities/consultas.entity'
import type { IConsultasRepository } from '../repositories/consultas.repository'

export class CriarConsultaUseCase {
  constructor(private readonly consultasRepository: IConsultasRepository) {}

  async executar(dados: CriarConsultaDados): Promise<ConsultaEntity> {
    const [pacienteExiste, profissionalExiste] = await Promise.all([
      this.consultasRepository.buscarPaciente(dados.pacienteId),
      this.consultasRepository.buscarProfissional(dados.profissionalId),
    ])

    if (!pacienteExiste || !profissionalExiste) {
      throw new Error('Paciente ou profissional não encontrado')
    }

    const { profissionalId, pacienteId, data, hora, tipo } = dados

    const consultaCriada = await prisma.$transaction(async (tx) => {
      // Bloqueio atômico por profissional + data contra race condition (RN04 / BUG-06)
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${data}))`

      const folga = await tx.folga.findUnique({
        where: { profissionalId_data: { profissionalId, data } },
      })
      if (folga) {
        throw new Error('O profissional está de folga nesse dia')
      }

      const marcadas = await tx.consulta.findMany({
        where: { profissionalId, data, status: 'agendada' },
      })
      if (temConflito(marcadas, { hora, tipo })) {
        throw new Error('Esse horário já está ocupado')
      }

      const inicio = instante(data, hora)
      const fim = new Date(inicio.getTime() + DURACAO_MINUTOS[tipo] * 60_000)

      return tx.consulta.create({
        data: { profissionalId, pacienteId, data, hora, tipo, inicio, fim },
      })
    })

    // Enfileira o e-mail de confirmação em background via BullMQ
    try {
      const [paciente, profissional] = await Promise.all([
        prisma.usuario.findUnique({ where: { id: dados.pacienteId } }),
        prisma.profissional.findUnique({
          where: { id: dados.profissionalId },
          include: { usuario: { select: { nome: true } } },
        }),
      ])

      if (paciente?.email && profissional?.usuario?.nome) {
        const { enfileirarEmail, gerarEmailConfirmacaoAgendamento } = await import(
          '../../../infra/jobs'
        )
        const emailDados = gerarEmailConfirmacaoAgendamento({
          pacienteNome: paciente.nome,
          profissionalNome: profissional.usuario.nome,
          especialidade: profissional.especialidade,
          data: consultaCriada.data,
          hora: consultaCriada.hora,
          tipo: consultaCriada.tipo,
        })

        await enfileirarEmail({
          para: paciente.email,
          assunto: emailDados.assunto,
          html: emailDados.html,
          texto: emailDados.texto,
          tipo: 'confirmacao_agendamento',
          metadados: { consultaId: consultaCriada.id },
        })
      }
    } catch (err) {
      console.error('[CriarConsulta] Falha ao enfileirar e-mail de confirmação:', err)
    }

    return consultaCriada
  }
}
