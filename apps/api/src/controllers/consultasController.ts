import type { Request, Response } from 'express'
import { z } from 'zod'
import { cabeNoExpediente, diaUtil, DURACAO_MINUTOS, hojeEmRecife } from '@bemviver/shared'
import { instante, temConflito } from '../agenda'
import { prisma, type Prisma } from '../prisma'
import { criarConsultaSchema } from '../schemas/consultaSchema'
import { notificarProximoListaEspera } from './listaEsperaController'

export async function listarMinhasConsultas(req: Request, res: Response) {
  const historico = req.query.historico === 'true'

  const whereClause: Prisma.ConsultaWhereInput = historico
    ? {
        pacienteId: req.usuario.id,
        OR: [
          { data: { lt: hojeEmRecife() } },
          { status: { in: ['realizada', 'faltou', 'cancelada'] } },
        ],
      }
    : {
        pacienteId: req.usuario.id,
        data: { gte: hojeEmRecife() },
        status: 'agendada',
      }

  const consultas = await prisma.consulta.findMany({
    where: whereClause,
    include: { profissional: { include: { usuario: { select: { nome: true } } } } },
    orderBy: { inicio: historico ? 'desc' : 'asc' },
  })

  res.json(
    consultas.map(({ profissional, ...consulta }) => ({
      ...consulta,
      profissionalNome: profissional.usuario.nome,
      especialidade: profissional.especialidade,
    })),
  )
}

export async function criarConsulta(req: Request, res: Response) {
  const pacienteId =
    req.usuario.perfil === 'paciente'
      ? req.usuario.id
      : req.body?.pacienteId

  const validacao = criarConsultaSchema.safeParse({
    profissionalId: req.body?.profissionalId,
    pacienteId,
    data: req.body?.data,
    hora: req.body?.hora,
    tipo: req.body?.tipo,
  })

  if (!validacao.success) {
    res.status(400).json({ erro: validacao.error.issues[0].message })
    return
  }

  const { profissionalId, data, hora, tipo } = validacao.data
  const idPacienteFinal = validacao.data.pacienteId

  const [paciente, profissional] = await Promise.all([
    prisma.usuario.findFirst({ where: { id: idPacienteFinal, perfil: 'paciente' } }),
    prisma.profissional.findUnique({ where: { id: profissionalId } }),
  ])

  if (!paciente || !profissional) {
    res.status(400).json({ erro: 'Paciente ou profissional não encontrado' })
    return
  }

  try {
    const consulta = await prisma.$transaction(async (tx) => {
      // Bloqueio atômico por profissional + data contra race condition (RN04)
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
        data: { profissionalId, pacienteId: idPacienteFinal, data, hora, tipo, inicio, fim },
      })
    })

    res.status(201).json(consulta)
  } catch (erro: unknown) {
    if (erro instanceof Error) {
      if (
        erro.message === 'Esse horário já está ocupado' ||
        erro.message === 'O profissional está de folga nesse dia'
      ) {
        res.status(409).json({ erro: erro.message })
        return
      }
    }
    throw erro
  }
}

export async function cancelarConsulta(req: Request, res: Response) {
  const id = String(req.params.id)
  const consulta = await prisma.consulta.findUnique({ where: { id } })

  if (!consulta) {
    res.status(404).json({ erro: 'Consulta não encontrada' })
    return
  }
  if (consulta.status !== 'agendada') {
    res.status(409).json({ erro: 'Só é possível cancelar uma consulta agendada' })
    return
  }

  if (req.usuario.perfil === 'paciente' && consulta.pacienteId !== req.usuario.id) {
    res.status(403).json({ erro: 'Você só pode cancelar suas próprias consultas' })
    return
  }

  const cancelada = await prisma.consulta.update({
    where: { id: consulta.id },
    data: { status: 'cancelada', canceladaEm: new Date() },
  })

  let proximoEspera = null
  try {
    proximoEspera = await notificarProximoListaEspera(
      consulta.profissionalId,
      consulta.data,
      consulta.hora
    )
  } catch (e) {
    console.error('Erro ao notificar lista de espera:', e)
  }

  res.json({
    ...cancelada,
    pacienteNotificadoListaEspera: proximoEspera,
  })
}

export async function registrarFaltaConsulta(req: Request, res: Response) {
  const id = String(req.params.id)
  const consulta = await prisma.consulta.findUnique({ where: { id } })

  if (!consulta) {
    res.status(404).json({ erro: 'Consulta não encontrada' })
    return
  }
  if (consulta.status !== 'agendada') {
    res.status(409).json({ erro: 'Só é possível registrar falta em uma consulta agendada' })
    return
  }
  if (consulta.inicio > new Date()) {
    res.status(409).json({ erro: 'A falta só pode ser registrada depois do horário da consulta' })
    return
  }

  const atualizada = await prisma.consulta.update({ where: { id: consulta.id }, data: { status: 'faltou' } })
  res.json(atualizada)
}

const remarcarSchema = z.object({
  novaData: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  novaHora: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM'),
})

export async function remarcarConsulta(req: Request, res: Response) {
  const id = String(req.params.id)
  const consulta = await prisma.consulta.findUnique({
    where: { id },
    include: { profissional: { include: { usuario: true } } },
  })

  if (!consulta) {
    res.status(404).json({ erro: 'Consulta não encontrada' })
    return
  }

  if (consulta.status !== 'agendada') {
    res.status(409).json({ erro: 'Só é possível remarcar uma consulta com status agendada' })
    return
  }

  if (req.usuario.perfil === 'paciente' && consulta.pacienteId !== req.usuario.id) {
    res.status(403).json({ erro: 'Você só pode remarcar suas próprias consultas' })
    return
  }

  const validacao = remarcarSchema.safeParse(req.body)
  if (!validacao.success) {
    res.status(400).json({ erro: validacao.error.issues[0]?.message ?? 'Dados inválidos' })
    return
  }

  const { novaData, novaHora } = validacao.data

  if (novaData < hojeEmRecife()) {
    res.status(400).json({ erro: 'Não é permitido remarcar para uma data no passado' })
    return
  }

  if (!diaUtil(novaData)) {
    res.status(400).json({ erro: 'A clínica só atende em dias úteis (segunda a sexta)' })
    return
  }

  if (!cabeNoExpediente({ hora: novaHora, tipo: consulta.tipo })) {
    res.status(400).json({ erro: 'Horário fora do expediente ou ultrapassa o limite de atendimento' })
    return
  }

  const novoInicio = instante(novaData, novaHora)
  if (novoInicio <= new Date()) {
    res.status(400).json({ erro: 'Não é permitido remarcar para um horário que já passou' })
    return
  }

  const novoFim = new Date(novoInicio.getTime() + DURACAO_MINUTOS[consulta.tipo] * 60_000)
  const profissionalId = consulta.profissionalId

  try {
    const atualizada = await prisma.$transaction(async (tx) => {
      // Bloqueio atômico para o profissional na nova data
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${novaData}))`
      if (consulta.data !== novaData) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${profissionalId} || '_' || ${consulta.data}))`
      }

      // Verifica folga do profissional
      const folga = await tx.folga.findUnique({
        where: { profissionalId_data: { profissionalId, data: novaData } },
      })
      if (folga) {
        throw new Error('O profissional está de folga nesse dia')
      }

      // Verifica conflitos com outras consultas do profissional (excluindo a própria)
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

      // Verifica se o paciente já tem outra consulta agendada no mesmo horário (excluindo a própria)
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

    // Se o horário antigo foi liberado, notifica o próximo da fila de espera
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

    res.json({
      ...atualizada,
      pacienteNotificadoListaEspera: proximoEspera,
    })
  } catch (erro: unknown) {
    if (erro instanceof Error) {
      if (
        erro.message === 'Esse horário já está ocupado' ||
        erro.message === 'O profissional está de folga nesse dia' ||
        erro.message === 'Você já possui outra consulta agendada nesse horário'
      ) {
        res.status(409).json({ erro: erro.message })
        return
      }
    }
    throw erro
  }
}

export const consultasController = {
  listarMinhas: listarMinhasConsultas,
  criar: criarConsulta,
  cancelar: cancelarConsulta,
  remarcar: remarcarConsulta,
  registrarFalta: registrarFaltaConsulta,
}
