# FEAT-09: Exportação da Agenda do Dia em PDF

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 9º Lugar (RICE Score: 2.7)
- **Status**: Utilitário Operacional
- **Objetivo**: Permitir que recepcionistas e profissionais de saúde gerem e imprimam uma versão física em PDF da grade de consultas do dia com a lista de chamada dos pacientes.

Embora o sistema seja 100% digital e reativo, a impressão da folha de agenda é amplamente utilizada em consultórios como redundância operacional (em momentos de queda de energia ou internet) e como apoio de mesa para médicos anotarem observações rápidas entre as consultas.

---

## 2. Requisitos Funcionais

1. **Botão de Exportação**:
   - Disponível na barra de ações da agenda da recepção (`AgendaDoDia`) e da agenda do médico (`AgendaProfissional`).
2. **Layout do Documento PDF**:
   - Cabeçalho institucional: Logotipo e nome "Clínica Bem Viver".
   - Metadados: Nome do médico, especialidade, data formatada por extenso (`sexta-feira, 16/10/2026`).
   - Tabela organizada por horário:
     | Horário | Paciente | Tipo | Duração | Situação | Assinatura / Observações |
   - Resumo no rodapé: Total de consultas agendadas, primeiras consultas e retornos.
3. **Formatação Otimizada para Impressão**:
   - Folha A4 retrato, fontes limpas, alto contraste em preto e branco.

---

## 3. Especificação Técnica e Arquitetura Assíncrona

### 3.1. Arquitetura com BullMQ, Redis e Puppeteer

A exportação de documentos PDF foi projetada com uma **arquitetura orientada a filas assíncronas**, desacoplando o servidor HTTP da carga de renderização do Chromium e evitando travamento do Event Loop do Node.js:

```
[ Frontend: BotaoExportarPdf ]
         │
         ▼  (POST /relatorios/pdf)
[ Express API ] ───( Adiciona Job )───► [ Redis: Fila 'geracao-pdf' ]
                                                      │
                                                      ▼
                                       [ BullMQ Worker: pdfWorker ]
                                                      │
                                    ┌─────────────────┴─────────────────┐
                                    ▼                                   ▼
                            Busca Dados no BD                  Compila Template HTML
                                    │                                   │
                                    └─────────────────┬─────────────────┘
                                                      │
                                                      ▼
                                         [ Puppeteer (Headless Chrome) ]
                                                      │
                                                      ▼
                                        Gera Buffer PDF A4 Otimizado
                                                      │
                                                      ▼
                                    Salva em /uploads/pdfs/{jobId}.pdf
                                                      │
                                                      ▼
                                          Status: 'concluido' (100%)
                                                      │
[ Frontend: Polling /status/:jobId ] ◄────────────────┘
         │
         ▼  (GET /relatorios/pdf/download/:jobId)
Download Automático do PDF no Navegador
```

### 3.2. Endpoints e Contratos

1. **Solicitar Geração de PDF**:
   - `POST /relatorios/pdf`
   - Headers: `Authorization: Bearer <token>` (Permitido para `recepcao` e `profissional`)
   - Body:
     ```json
     {
       "tipo": "agenda" | "absenteismo",
       "filtros": {
         "data": "2026-10-16",
         "profissionalId": "uuid-opcional",
         "dataInicio": "2026-10-01",
         "dataFim": "2026-10-31"
       }
     }
     ```
   - Retorno (HTTP 202 Accepted):
     ```json
     {
       "jobId": "1",
       "status": "pendente",
       "mensagem": "Geração de PDF enfileirada no worker com sucesso"
     }
     ```

2. **Consultar Progresso da Fila**:
   - `GET /relatorios/pdf/status/:jobId`
   - Retorno: `{ "id": "1", "status": "processando", "progresso": 60 }`
   - Quando finalizado: `{ "id": "1", "status": "concluido", "progresso": 100, "resultado": { "arquivoNome": "agenda-1.pdf" } }`

3. **Download do Arquivo Gerado**:
   - `GET /relatorios/pdf/download/:jobId`
   - Resposta: Stream binário com `Content-Disposition: attachment; filename="agenda-1.pdf"` e `Content-Type: application/pdf`.

### 3.3. Documentos Suportados na Fila

1. **Agenda do Dia (`tipo: "agenda"`)**:
   - Utilizado em `AgendaDoDia` (recepção) e `AgendaProfissional` (médico).
   - Cabeçalho institucional, lista completa de horários, pacientes, situações e quadro de assinaturas para atendimento ambulatorial.
2. **Relatório de Absenteísmo (`tipo: "absenteismo"`)**:
   - Utilizado em `/recepcao/relatorios`.
   - Cards de indicadores consolidados (total de agendamentos, total de faltas, taxa geral de no-show), tabela analítica por especialidade e lista de pacientes reincidentes.
