export interface DadosEmailAgendamento {
  pacienteNome: string
  profissionalNome: string
  especialidade: string
  data: string
  hora: string
  tipo: string
}

export interface DadosEmailCancelamento {
  pacienteNome: string
  profissionalNome: string
  especialidade: string
  data: string
  hora: string
}

export interface DadosEmailListaEspera {
  pacienteNome: string
  profissionalNome: string
  data: string
  turno: string
}

function baseLayout(titulo: string, conteudo: string): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #0f766e; color: #ffffff; padding: 20px 24px; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .content { padding: 24px; line-height: 1.6; font-size: 14px; }
        .box { background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 16px; margin: 16px 0; }
        .box-item { margin-bottom: 6px; }
        .box-item:last-child { margin-bottom: 0; }
        .footer { padding: 16px 24px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Clínica Bem Viver</h1>
        </div>
        <div class="content">
          ${conteudo}
        </div>
        <div class="footer">
          Mensagem automática da Clínica Bem Viver. Por favor, não responda diretamente a este e-mail.
        </div>
      </div>
    </body>
    </html>
  `
}

export function gerarEmailConfirmacaoAgendamento(dados: DadosEmailAgendamento) {
  const tipoFormatado = dados.tipo === 'primeira' ? 'Primeira consulta (60 min)' : 'Retorno (30 min)'
  const html = baseLayout(
    'Consulta Confirmada - Clínica Bem Viver',
    `
      <p>Olá, <strong>${dados.pacienteNome}</strong>!</p>
      <p>Sua consulta médica foi agendada com sucesso. Confira os detalhes abaixo:</p>
      <div class="box">
        <div class="box-item"><strong>Profissional:</strong> ${dados.profissionalNome} (${dados.especialidade})</div>
        <div class="box-item"><strong>Data:</strong> ${dados.data}</div>
        <div class="box-item"><strong>Horário:</strong> ${dados.hora}</div>
        <div class="box-item"><strong>Tipo:</strong> ${tipoFormatado}</div>
      </div>
      <p>Por favor, chegue com 15 minutos de antecedência na recepção da clínica portando documento oficial com foto.</p>
      <p>Caso precise remarcar ou cancelar, você pode fazer isso diretamente pelo portal do paciente até o horário agendado.</p>
    `
  )

  const texto = `Olá, ${dados.pacienteNome}!\nSua consulta com ${dados.profissionalNome} (${dados.especialidade}) foi agendada para ${dados.data} às ${dados.hora} (${tipoFormatado}).\nChegue com 15 minutos de antecedência.\nClínica Bem Viver`

  return { assunto: `Confirmação de Consulta - ${dados.data} às ${dados.hora}`, html, texto }
}

export function gerarEmailCancelamento(dados: DadosEmailCancelamento) {
  const html = baseLayout(
    'Consulta Cancelada - Clínica Bem Viver',
    `
      <p>Olá, <strong>${dados.pacienteNome}</strong>,</p>
      <p>Informamos que sua consulta foi <strong>cancelada</strong> com sucesso:</p>
      <div class="box" style="background: #fef2f2; border-color: #fee2e2;">
        <div class="box-item"><strong>Profissional:</strong> ${dados.profissionalNome} (${dados.especialidade})</div>
        <div class="box-item"><strong>Data cancelada:</strong> ${dados.data} às ${dados.hora}</div>
      </div>
      <p>O horário foi liberado em nossa grade médica. Se desejar agendar um novo horário, acesse o portal do paciente a qualquer momento.</p>
    `
  )

  const texto = `Olá, ${dados.pacienteNome}.\nSua consulta com ${dados.profissionalNome} para ${dados.data} às ${dados.hora} foi cancelada.\nPara novo agendamento, acesse o portal da Clínica Bem Viver.`

  return { assunto: `Cancelamento de Consulta - ${dados.data} às ${dados.hora}`, html, texto }
}

export function gerarEmailVagaLiberada(dados: DadosEmailListaEspera) {
  const turnoFormatado = dados.turno === 'manha' ? 'Manhã (08h às 12h)' : 'Tarde (13h às 18h)'
  const html = baseLayout(
    'Vaga Liberada na Lista de Espera - Clínica Bem Viver',
    `
      <p>Olá, <strong>${dados.pacienteNome}</strong>!</p>
      <p>Temos ótimas notícias! Um horário foi liberado com o(a) <strong>${dados.profissionalNome}</strong> na data que você aguardava:</p>
      <div class="box">
        <div class="box-item"><strong>Data liberada:</strong> ${dados.data}</div>
        <div class="box-item"><strong>Turno de preferência:</strong> ${turnoFormatado}</div>
      </div>
      <p>Entre em contato com nossa recepção ou acesse o portal imediatamente para confirmar o seu encaixe nesta vaga.</p>
    `
  )

  const texto = `Olá, ${dados.pacienteNome}!\nUma vaga foi liberada com ${dados.profissionalNome} no dia ${dados.data} (${turnoFormatado}).\nAcesse o portal da Clínica Bem Viver para confirmar seu horário.`

  return { assunto: `Vaga Liberada na Lista de Espera - ${dados.data}`, html, texto }
}
