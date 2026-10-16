import type { Request, Response } from 'express'
import { DURACAO_MINUTOS, hojeEmRecife } from '@bemviver/shared'
import { instante, temConflito } from '../agenda'
import { prisma } from '../prisma'
import { criarConsultaSchema } from '../schemas/consultaSchema'
import { notificarProximoListaEspera } from './listaEsperaController'

export async function listarMinhasConsultas(req: Request, res: Response) {
  const consultas = await prisma.consulta.findMany({
    where: { pacienteId: req.usuario.id, data: { gte: hojeEmRecife() } },
    include: { profissional: { include: { usuario: { select: { nome: true } } } } },
    orderBy: { inicio: 'asc' },
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

export const consultasController = {
  listarMinhas: listarMinhasConsultas,
  criar: criarConsulta,
  cancelar: cancelarConsulta,
  registrarFalta: registrarFaltaConsulta,
}
