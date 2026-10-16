import nodemailer from 'nodemailer'

const host = process.env.SMTP_HOST || 'localhost'
const port = Number(process.env.SMTP_PORT || 1025)

export const mailTransporter = nodemailer.createTransport({
  host,
  port,
  secure: false, // Mailpit local não utiliza TLS
  ignoreTLS: true,
})

export const REMETENTE_PADRAO =
  process.env.SMTP_FROM || 'Clínica Bem Viver <atendimento@clinicabemviver.com.br>'
