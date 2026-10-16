import type { Request, Response } from 'express'
import { z } from 'zod'
import { diaUtil, hojeEmRecife, paraMinutos } from '@bemviver/shared'
import { prisma } from '../prisma'

const inscreverSchema = z.object({
  profissionalId: z.string().min(1, 'ID do profissional é obrigatório'),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  tipo: z.enum(['primeira', 'retorno']),
  turno: z.enum(['manha', 'tarde', 'qualquer']).default('qualquer'),
  pacienteId: z.string().optional(),
})

export async function inscreverListaEspera(req: Request, res: Response) {
  const parse = inscreverSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ erro: parse.error.issues[0]?.message ?? 'Dados inválidos' })
    return
  }

  const { profissionalId, data, tipo, turno } = parse.data
  const pacienteId =
    req.usuario.perfil === 'recepcao' && parse.data.pacienteId
      ? parse.data.pacienteId
      : req.usuario.id

  if (data < hojeEmRecife()) {
    res.status(400).json({ erro: 'Não é permitido entrar na lista de espera para datas no passado' })
    return
  }

  if (!diaUtil(data)) {
    res.status(400).json({ erro: 'A clínica só atende em dias úteis (segunda a sexta)' })
    return
  }

  const profissional = await prisma.profissional.findUnique({
    where: { id: profissionalId },
    include: { usuario: true },
  })

  if (!profissional) {
    res.status(404).json({ erro: 'Profissional não encontrado' })
    return
  }

  const folga = await prisma.folga.findUnique({
    where: {
      profissionalId_data: { profissionalId, data },
    },
  })

  if (folga) {
    res.status(409).json({ erro: 'O profissional está de folga nesta data' })
    return
  }

  const existente = await prisma.listaEspera.findUnique({
    where: {
      profissionalId_pacienteId_data: { profissionalId, pacienteId, data },
    },
  })

  if (existente && existente.status === 'aguardando') {
    res.status(409).json({ erro: 'Você já está na lista de espera deste profissional para esta data' })
    return
  }

  let item
  if (existente) {
    item = await prisma.listaEspera.update({
      where: { id: existente.id },
      data: {
        tipo,
        turno,
        status: 'aguardando',
        criadaEm: new Date(),
        notificadoEm: null,
      },
    })
  } else {
    item = await prisma.listaEspera.create({
      data: {
        profissionalId,
        pacienteId,
        data,
        tipo,
        turno,
        status: 'aguardando',
      },
    })
  }

  res.status(201).json({
    id: item.id,
    profissionalId: item.profissionalId,
    pacienteId: item.pacienteId,
    data: item.data,
    tipo: item.tipo,
    turno: item.turno,
    status: item.status,
    criadaEm: item.criadaEm.toISOString(),
  })
}

export async function listarListaEspera(req: Request, res: Response) {
  const { profissionalId, data, status } = req.query

  const where: Record<string, unknown> = {}
  if (typeof profissionalId === 'string' && profissionalId) {
    where.profissionalId = profissionalId
  }
  if (typeof data === 'string' && data) {
    where.data = data
  }
  if (typeof status === 'string' && status) {
    where.status = status
  }

  const itens = await prisma.listaEspera.findMany({
    where,
    include: {
      profissional: {
        include: { usuario: true },
      },
      paciente: true,
    },
    orderBy: { criadaEm: 'asc' },
  })

  res.json(
    itens.map((item) => ({
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo,
      turno: item.turno,
      status: item.status,
      criadaEm: item.criadaEm.toISOString(),
      notificadoEm: item.notificadoEm?.toISOString() ?? null,
      profissionalNome: item.profissional.usuario.nome,
      especialidade: item.profissional.especialidade,
      pacienteNome: item.paciente.nome,
      pacienteEmail: item.paciente.email,
    }))
  )
}

export async function listarMinhasEspera(req: Request, res: Response) {
  const pacienteId = req.usuario.id
  const itens = await prisma.listaEspera.findMany({
    where: { pacienteId },
    include: {
      profissional: {
        include: { usuario: true },
      },
    },
    orderBy: { criadaEm: 'desc' },
  })

  res.json(
    itens.map((item) => ({
      id: item.id,
      profissionalId: item.profissionalId,
      pacienteId: item.pacienteId,
      data: item.data,
      tipo: item.tipo,
      turno: item.turno,
      status: item.status,
      criadaEm: item.criadaEm.toISOString(),
      notificadoEm: item.notificadoEm?.toISOString() ?? null,
      profissionalNome: item.profissional.usuario.nome,
      especialidade: item.profissional.especialidade,
    }))
  )
}

export async function removerListaEspera(req: Request, res: Response) {
  const id = String(req.params.id)
  const item = await prisma.listaEspera.findUnique({ where: { id } })

  if (!item) {
    res.status(404).json({ erro: 'Registro de lista de espera não encontrado' })
    return
  }

  if (req.usuario.perfil === 'paciente' && item.pacienteId !== req.usuario.id) {
    res.status(403).json({ erro: 'Você só pode cancelar suas próprias inscrições na lista de espera' })
    return
  }

  const atualizado = await prisma.listaEspera.update({
    where: { id },
    data: { status: 'cancelado' },
  })

  res.json({ sucesso: true, id: atualizado.id, status: atualizado.status })
}

export async function notificarProximoListaEspera(
  profissionalId: string,
  data: string,
  horaConsulta: string
) {
  const minutos = paraMinutos(horaConsulta)
  const turno = minutos < 12 * 60 ? 'manha' : 'tarde'

  const proximo = await prisma.listaEspera.findFirst({
    where: {
      profissionalId,
      data,
      status: 'aguardando',
      turno: { in: [turno, 'qualquer'] },
    },
    include: {
      paciente: true,
      profissional: { include: { usuario: true } },
    },
    orderBy: { criadaEm: 'asc' },
  })

  if (!proximo) {
    return null
  }

  const atualizado = await prisma.listaEspera.update({
    where: { id: proximo.id },
    data: {
      status: 'notificado',
      notificadoEm: new Date(),
    },
  })

  return {
    id: atualizado.id,
    pacienteId: proximo.pacienteId,
    pacienteNome: proximo.paciente.nome,
    pacienteEmail: proximo.paciente.email,
    profissionalNome: proximo.profissional.usuario.nome,
    data: atualizado.data,
    turno: atualizado.turno,
    notificadoEm: atualizado.notificadoEm?.toISOString() ?? null,
  }
}
