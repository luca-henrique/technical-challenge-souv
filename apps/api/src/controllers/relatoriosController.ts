import type { Request, Response } from 'express'
import { dataValida, type RelatorioFaltas } from '@bemviver/shared'
import { prisma } from '../prisma'

export async function gerarRelatorioFaltas(req: Request, res: Response) {
  const dataInicio = req.query.dataInicio ? String(req.query.dataInicio) : undefined
  const dataFim = req.query.dataFim ? String(req.query.dataFim) : undefined
  const profissionalId = req.query.profissionalId ? String(req.query.profissionalId) : undefined

  if (dataInicio && !dataValida(dataInicio)) {
    res.status(400).json({ erro: 'Data de início inválida. Use o formato AAAA-MM-DD' })
    return
  }
  if (dataFim && !dataValida(dataFim)) {
    res.status(400).json({ erro: 'Data de término inválida. Use o formato AAAA-MM-DD' })
    return
  }
  if (dataInicio && dataFim && dataInicio > dataFim) {
    res.status(400).json({ erro: 'A data de início não pode ser posterior à data de término' })
    return
  }

  const where: {
    data?: { gte?: string; lte?: string }
    profissionalId?: string
  } = {}

  if (dataInicio || dataFim) {
    where.data = {
      ...(dataInicio ? { gte: dataInicio } : {}),
      ...(dataFim ? { lte: dataFim } : {}),
    }
  }

  if (profissionalId) {
    where.profissionalId = profissionalId
  }

  const consultas = await prisma.consulta.findMany({
    where,
    include: {
      paciente: { select: { id: true, nome: true, email: true } },
      profissional: {
        include: {
          usuario: { select: { nome: true } },
        },
      },
    },
    orderBy: { inicio: 'asc' },
  })

  const totalAgendadas = consultas.length
  let totalRealizadas = 0
  let totalCanceladas = 0
  let totalFaltas = 0

  const mapaPacientesFaltas = new Map<
    string,
    { pacienteId: string; nome: string; email: string; totalFaltas: number }
  >()

  const mapaProfissionais = new Map<
    string,
    {
      profissionalId: string
      nome: string
      especialidade: string
      totalConsultas: number
      faltas: number
    }
  >()

  for (const c of consultas) {
    if (c.status === 'realizada') totalRealizadas++
    else if (c.status === 'cancelada') totalCanceladas++
    else if (c.status === 'faltou') {
      totalFaltas++

      // Agrega faltas por paciente
      const existente = mapaPacientesFaltas.get(c.pacienteId)
      if (existente) {
        existente.totalFaltas++
      } else {
        mapaPacientesFaltas.set(c.pacienteId, {
          pacienteId: c.paciente.id,
          nome: c.paciente.nome,
          email: c.paciente.email,
          totalFaltas: 1,
        })
      }
    }

    // Agrega por profissional
    const profExistente = mapaProfissionais.get(c.profissionalId)
    if (profExistente) {
      profExistente.totalConsultas++
      if (c.status === 'faltou') profExistente.faltas++
    } else {
      mapaProfissionais.set(c.profissionalId, {
        profissionalId: c.profissional.id,
        nome: c.profissional.usuario.nome,
        especialidade: c.profissional.especialidade,
        totalConsultas: 1,
        faltas: c.status === 'faltou' ? 1 : 0,
      })
    }
  }

  const taxaFaltas = totalAgendadas > 0 ? Number(((totalFaltas / totalAgendadas) * 100).toFixed(1)) : 0

  // Pacientes com mais de 1 falta ou ordenados por número de faltas decrescente
  const reincidentes = Array.from(mapaPacientesFaltas.values())
    .sort((a, b) => b.totalFaltas - a.totalFaltas)

  const faltasPorProfissional = Array.from(mapaProfissionais.values()).map((p) => ({
    ...p,
    taxaFaltas: p.totalConsultas > 0 ? Number(((p.faltas / p.totalConsultas) * 100).toFixed(1)) : 0,
  }))

  const relatorio: RelatorioFaltas = {
    periodo: {
      dataInicio,
      dataFim,
    },
    totais: {
      agendadas: totalAgendadas,
      realizadas: totalRealizadas,
      canceladas: totalCanceladas,
      faltas: totalFaltas,
    },
    taxaFaltas,
    reincidentes,
    faltasPorProfissional,
  }

  res.json(relatorio)
}

export const relatoriosController = {
  gerarRelatorioFaltas,
}
