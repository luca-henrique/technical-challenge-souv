export interface AgendaPdfData {
  data: string
  profissionalNome?: string
  especialidade?: string
  consultas: Array<{
    hora: string
    pacienteNome: string
    profissionalNome: string
    especialidade: string
    tipo: string
    status: string
    confirmadaEm: string | null
  }>
}

export interface AbsenteismoPdfData {
  periodo: {
    inicio: string
    fim: string
  }
  metricas: {
    totalConsultas: number
    totalFaltas: number
    taxaAbsenteismo: number
  }
  porEspecialidade: Array<{
    especialidade: string
    totalConsultas: number
    totalFaltas: number
    taxaAbsenteismo: number
  }>
  reincidentes: Array<{
    pacienteId: string
    pacienteNome: string
    totalFaltas: number
    totalConsultas: number
    taxaFalta: number
  }>
}

export function gerarHtmlAgenda(dados: AgendaPdfData): string {
  const totalAgendadas = dados.consultas.length
  const totalPrimeiras = dados.consultas.filter((c) => c.tipo === 'primeira').length
  const totalRetornos = dados.consultas.filter((c) => c.tipo === 'retorno').length
  const totalConfirmadas = dados.consultas.filter((c) => !!c.confirmadaEm).length

  const linhas = dados.consultas
    .map(
      (c) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f766e;">${c.hora}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${c.pacienteNome}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #475569;">${c.profissionalNome} (${c.especialidade})</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-transform: capitalize;">${c.tipo === 'primeira' ? '1ª Consulta' : 'Retorno'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500; ${
            c.confirmadaEm
              ? 'background-color: #d1fae5; color: #065f46;'
              : c.status === 'agendada'
                ? 'background-color: #f1f5f9; color: #334155;'
                : 'background-color: #fee2e2; color: #991b1b;'
          }">
            ${c.confirmadaEm ? 'Confirmada' : c.status}
          </span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; border-left: 1px dashed #cbd5e1; width: 140px;"></td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Agenda do Dia - Clínica Bem Viver</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 0; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
        .brand { font-size: 20px; font-weight: 700; color: #0f766e; }
        .subbrand { font-size: 12px; color: #64748b; }
        .meta { text-align: right; font-size: 12px; color: #475569; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px; }
        .resumo { display: flex; gap: 20px; margin-top: 20px; padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .resumo-item { flex: 1; }
        .resumo-num { font-size: 18px; font-weight: 700; color: #0f766e; }
        .resumo-label { font-size: 11px; color: #64748b; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Clínica Bem Viver</div>
          <div class="subbrand">Sistema de Gestão Ambulatorial</div>
        </div>
        <div class="meta">
          <div><strong>Agenda de Atendimentos</strong></div>
          <div>Data: <strong>${dados.data}</strong></div>
          ${dados.profissionalNome ? `<div>Profissional: <strong>${dados.profissionalNome}</strong> (${dados.especialidade || 'Geral'})</div>` : '<div>Todos os Profissionais</div>'}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 60px;">Horário</th>
            <th>Paciente</th>
            <th>Profissional</th>
            <th>Tipo</th>
            <th>Situação</th>
            <th>Assinatura / Obs</th>
          </tr>
        </thead>
        <tbody>
          ${linhas || '<tr><td colspan="6" style="padding: 24px; text-align: center; color: #64748b;">Nenhuma consulta agendada para esta data.</td></tr>'}
        </tbody>
      </table>

      <div class="resumo">
        <div class="resumo-item">
          <div class="resumo-num">${totalAgendadas}</div>
          <div class="resumo-label">Total Agendadas</div>
        </div>
        <div class="resumo-item">
          <div class="resumo-num">${totalConfirmadas}</div>
          <div class="resumo-label">Confirmadas</div>
        </div>
        <div class="resumo-item">
          <div class="resumo-num">${totalPrimeiras}</div>
          <div class="resumo-label">Primeiras Consultas</div>
        </div>
        <div class="resumo-item">
          <div class="resumo-num">${totalRetornos}</div>
          <div class="resumo-label">Retornos</div>
        </div>
      </div>

      <div class="footer">
        Documento gerado de forma assíncrona pelo sistema em ${new Date().toLocaleString('pt-BR')} | Uso exclusivo da recepção e consultório
      </div>
    </body>
    </html>
  `
}

export function gerarHtmlAbsenteismo(dados: AbsenteismoPdfData): string {
  const linhasEspecialidade = dados.porEspecialidade
    .map(
      (e) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${e.especialidade}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${e.totalConsultas}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #dc2626; font-weight: 600;">${e.totalFaltas}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${e.taxaAbsenteismo.toFixed(1)}%</td>
      </tr>
    `
    )
    .join('')

  const linhasReincidentes = dados.reincidentes
    .map(
      (r) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${r.pacienteNome}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #dc2626; font-weight: 700;">${r.totalFaltas}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${r.totalConsultas}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${r.taxaFalta.toFixed(1)}%</td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Absenteísmo - Clínica Bem Viver</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.4; margin: 0; padding: 0; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 16px; }
        .brand { font-size: 20px; font-weight: 700; color: #0f766e; }
        .subbrand { font-size: 12px; color: #64748b; }
        .meta { text-align: right; font-size: 12px; color: #475569; }
        .cards { display: flex; gap: 16px; margin-bottom: 20px; }
        .card { flex: 1; padding: 12px 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
        .card-num { font-size: 22px; font-weight: 700; color: #0f766e; }
        .card-num.danger { color: #dc2626; }
        .card-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        h3 { font-size: 15px; margin: 20px 0 8px 0; color: #0f766e; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th { background-color: #f8fafc; color: #475569; font-weight: 600; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-size: 12px; }
        .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Clínica Bem Viver</div>
          <div class="subbrand">Relatório Gerencial de Absenteísmo (No-Show)</div>
        </div>
        <div class="meta">
          <div>Período: <strong>${dados.periodo.inicio} até ${dados.periodo.fim}</strong></div>
          <div>Emissão: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></div>
        </div>
      </div>

      <div class="cards">
        <div class="card">
          <div class="card-num">${dados.metricas.totalConsultas}</div>
          <div class="card-label">Total de Agendamentos</div>
        </div>
        <div class="card">
          <div class="card-num danger">${dados.metricas.totalFaltas}</div>
          <div class="card-label">Total de Faltas</div>
        </div>
        <div class="card">
          <div class="card-num ${dados.metricas.taxaAbsenteismo > 20 ? 'danger' : ''}">
            ${dados.metricas.taxaAbsenteismo.toFixed(1)}%
          </div>
          <div class="card-label">Taxa Global de Faltas</div>
        </div>
      </div>

      <h3>Absenteísmo por Especialidade</h3>
      <table>
        <thead>
          <tr>
            <th>Especialidade</th>
            <th style="text-align: center;">Consultas</th>
            <th style="text-align: center;">Faltas</th>
            <th style="text-align: right;">Taxa de Absenteísmo</th>
          </tr>
        </thead>
        <tbody>
          ${linhasEspecialidade || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #64748b;">Nenhum dado registrado para o período.</td></tr>'}
        </tbody>
      </table>

      <h3>Pacientes Reincidentes (Mais de 1 Falta)</h3>
      <table>
        <thead>
          <tr>
            <th>Paciente</th>
            <th style="text-align: center;">Faltas Acumuladas</th>
            <th style="text-align: center;">Total Consultas</th>
            <th style="text-align: right;">Taxa Individual</th>
          </tr>
        </thead>
        <tbody>
          ${linhasReincidentes || '<tr><td colspan="4" style="padding: 16px; text-align: center; color: #64748b;">Nenhum paciente reincidente no período selecionado.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        Relatório corporativo processado via fila assíncrona (BullMQ + Puppeteer) em ${new Date().toLocaleString('pt-BR')}
      </div>
    </body>
    </html>
  `
}
