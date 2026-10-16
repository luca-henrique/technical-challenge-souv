import fs from 'node:fs'
import path from 'node:path'
import { Worker, type Job } from 'bullmq'
import puppeteer from 'puppeteer'
import { redisConnection } from '../../redis'
import { prisma, type Prisma } from '../database'
import { FILA_PDF_NOME, type JobPdfPayload } from './pdfQueue'
import {
  gerarHtmlAbsenteismo,
  gerarHtmlAgenda,
  type AbsenteismoPdfData,
  type AgendaPdfData,
} from './templates/pdfTemplates'

const DIRETORIO_UPLOADS = path.resolve(process.cwd(), 'uploads/pdfs')

// Garante que o diretório de destino existe
if (!fs.existsSync(DIRETORIO_UPLOADS)) {
  fs.mkdirSync(DIRETORIO_UPLOADS, { recursive: true })
}

export function iniciarPdfWorker() {
  const worker = new Worker<JobPdfPayload, { arquivoNome: string; caminho: string }>(
    FILA_PDF_NOME,
    async (job: Job<JobPdfPayload>) => {
      console.log(`[BullMQ Worker] Iniciando processamento do Job #${job.id} (Tipo: ${job.data.tipo})`)
      await job.updateProgress(10)

      let html = ''

      if (job.data.tipo === 'agenda') {
        const dataAlvo = job.data.filtros.data || new Date().toISOString().slice(0, 10)
        const where: Prisma.ConsultaWhereInput = { data: dataAlvo }

        if (job.data.filtros.profissionalId) {
          where.profissionalId = job.data.filtros.profissionalId
        }

        const consultas = await prisma.consulta.findMany({
          where,
          include: {
            paciente: { select: { nome: true } },
            profissional: {
              include: {
                usuario: { select: { nome: true } },
              },
            },
          },
          orderBy: { hora: 'asc' },
        })

        await job.updateProgress(35)

        let profissionalNome: string | undefined
        let especialidade: string | undefined

        if (job.data.filtros.profissionalId && consultas.length > 0) {
          profissionalNome = consultas[0].profissional.usuario.nome
          especialidade = consultas[0].profissional.especialidade
        } else if (job.data.filtros.profissionalId) {
          const prof = await prisma.profissional.findUnique({
            where: { id: job.data.filtros.profissionalId },
            include: { usuario: { select: { nome: true } } },
          })
          if (prof) {
            profissionalNome = prof.usuario.nome
            especialidade = prof.especialidade
          }
        }

        const dadosAgenda: AgendaPdfData = {
          data: dataAlvo,
          profissionalNome,
          especialidade,
          consultas: consultas.map((c) => ({
            hora: c.hora,
            pacienteNome: c.paciente.nome,
            profissionalNome: c.profissional.usuario.nome,
            especialidade: c.profissional.especialidade,
            tipo: c.tipo,
            status: c.status,
            confirmadaEm: c.confirmadaEm ? c.confirmadaEm.toISOString() : null,
          })),
        }

        html = gerarHtmlAgenda(dadosAgenda)
      } else if (job.data.tipo === 'absenteismo') {
        const where: Prisma.ConsultaWhereInput = {}
        const dataInicio = job.data.filtros.dataInicio
        const dataFim = job.data.filtros.dataFim

        if (dataInicio || dataFim) {
          where.data = {
            ...(dataInicio ? { gte: dataInicio } : {}),
            ...(dataFim ? { lte: dataFim } : {}),
          }
        }

        if (job.data.filtros.profissionalId) {
          where.profissionalId = job.data.filtros.profissionalId
        }

        const consultas = await prisma.consulta.findMany({
          where,
          include: {
            paciente: { select: { id: true, nome: true } },
            profissional: {
              include: {
                usuario: { select: { nome: true } },
              },
            },
          },
          orderBy: { inicio: 'asc' },
        })

        await job.updateProgress(35)

        const totalConsultas = consultas.length
        let totalFaltas = 0
        const especialidadeMap = new Map<string, { total: number; faltas: number }>()
        const pacienteMap = new Map<string, { nome: string; total: number; faltas: number }>()

        for (const c of consultas) {
          const ehFalta = c.status === 'faltou'
          if (ehFalta) totalFaltas++

          // Agrupamento por especialidade
          const esp = c.profissional.especialidade
          const itemEsp = especialidadeMap.get(esp) || { total: 0, faltas: 0 }
          itemEsp.total++
          if (ehFalta) itemEsp.faltas++
          especialidadeMap.set(esp, itemEsp)

          // Agrupamento por paciente
          const p = pacienteMap.get(c.pacienteId) || { nome: c.paciente.nome, total: 0, faltas: 0 }
          p.total++
          if (ehFalta) p.faltas++
          pacienteMap.set(c.pacienteId, p)
        }

        const porEspecialidade = Array.from(especialidadeMap.entries()).map(([especialidade, v]) => ({
          especialidade,
          totalConsultas: v.total,
          totalFaltas: v.faltas,
          taxaAbsenteismo: v.total > 0 ? (v.faltas / v.total) * 100 : 0,
        }))

        const reincidentes = Array.from(pacienteMap.entries())
          .filter(([, v]) => v.faltas > 1)
          .map(([pacienteId, v]) => ({
            pacienteId,
            pacienteNome: v.nome,
            totalFaltas: v.faltas,
            totalConsultas: v.total,
            taxaFalta: v.total > 0 ? (v.faltas / v.total) * 100 : 0,
          }))
          .sort((a, b) => b.totalFaltas - a.totalFaltas)

        const dadosAbsenteismo: AbsenteismoPdfData = {
          periodo: {
            inicio: dataInicio || 'Início dos registros',
            fim: dataFim || 'Hoje',
          },
          metricas: {
            totalConsultas,
            totalFaltas,
            taxaAbsenteismo: totalConsultas > 0 ? (totalFaltas / totalConsultas) * 100 : 0,
          },
          porEspecialidade,
          reincidentes,
        }

        html = gerarHtmlAbsenteismo(dadosAbsenteismo)
      } else {
        throw new Error('Tipo de relatório desconhecido')
      }

      await job.updateProgress(60)

      console.log(`[BullMQ Worker] Abrindo Puppeteer para compilar PDF do Job #${job.id}...`)
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      })

      try {
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'domcontentloaded' })
        await job.updateProgress(80)

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '15mm',
            right: '15mm',
            bottom: '15mm',
            left: '15mm',
          },
        })

        const arquivoNome = `${job.data.tipo}-${job.id}.pdf`
        const caminhoCompleto = path.join(DIRETORIO_UPLOADS, arquivoNome)
        await fs.promises.writeFile(caminhoCompleto, pdfBuffer)

        await job.updateProgress(100)
        console.log(`[BullMQ Worker] Job #${job.id} finalizado com sucesso! Arquivo gerado: ${caminhoCompleto}`)

        return {
          arquivoNome,
          caminho: caminhoCompleto,
        }
      } finally {
        await browser.close()
      }
    },
    {
      connection: redisConnection,
      concurrency: 2, // Processa até 2 PDFs simultaneamente
    }
  )

  worker.on('completed', (job) => {
    console.log(`[BullMQ Worker] Job #${job.id} completado.`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job #${job?.id} falhou com erro:`, err.message)
  })

  return worker
}
