# RN17: Exportação de Relatórios e Contingência em PDF

## 1. Descrição da Regra

> **Regra Oficial**: *"A recepção e o corpo médico podem exportar a grade de atendimentos diários ou relatórios operacionais em arquivo PDF diagramado no padrão A4 corporativo, funcionando como lista de chamada física e plano de contingência para eventuais falhas de conexão ou energia."*

- **Execução Assíncrona Não-Bloqueante**: A compilação e renderização visual de PDFs (via Puppeteer/Chromium headless) é pesada para o processador. O sistema nunca compila PDFs na thread HTTP principal do Express; as solicitações são enfileiradas no **BullMQ** e processadas por um worker dedicado.
- **Ciclo de Vida do Job**:
  1. Solicitação (`POST /relatorios/pdf`): Validação de parâmetros e enfileiramento imediato, retornando **HTTP 202 Accepted** com `jobId`.
  2. Acompanhamento (`GET /relatorios/pdf/status/:jobId`): Consulta reativa do estado (`processando`, `concluido`, `falhou`).
  3. Download Seguro (`GET /relatorios/pdf/download/:jobId`): Entrega do binário com cabeçalho `Content-Type: application/pdf` e `Content-Disposition: attachment; filename=...`.
- **Controle de Acesso RBAC**: Apenas os perfis `recepcao` e `profissional` possuem permissão para requisitar e baixar relatórios em PDF.

---

## 2. Impacto e Casos de Borda

1. **Garantia de Contingência Operacional**: Se a recepção ficar temporariamente sem internet durante o expediente, a folha impressa garante que os pacientes agendados sejam acolhidos e atendidos normalmente.
2. **Alta Concorrência**: Múltiplos médicos solicitando exportação simultânea não degradam o tempo de resposta das rotas de agendamento de consultas.
3. **Download de Job Inexistente ou Incompleto**: Retorna HTTP 404 Not Found ou HTTP 400 com mensagem amigável instruindo a aguardar a conclusão.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Fila BullMQ ([`src/infra/jobs/pdfQueue.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/infra/jobs/pdfQueue.ts))**:
  - Conecta-se ao Redis e define retentativas automáticas com backoff exponencial.
- **Worker Isolado ([`src/infra/jobs/pdfWorker.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/infra/jobs/pdfWorker.ts))**:
  - Compila template HTML responsivo com a marca da Clínica Bem Viver.
  - Gera PDF A4 com margens e numeração de páginas em `/uploads/pdfs/`.
- **Rotas HTTP ([`apps/api/src/modules/relatorios/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/relatorios/routes.ts))**:
  - `POST /relatorios/pdf`
  - `GET /relatorios/pdf/status/:jobId`
  - `GET /relatorios/pdf/download/:jobId`

### Front-end (`apps/web`)
- **Hook Reativo ([`useExportarPdf`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/hooks/useExportarPdf.ts))**:
  - Dispara a requisição de enfileiramento, faz polling curto de status e aciona o download nativo do arquivo no navegador.
- **Botão com Feedback Visual**:
  - Exibe spinner acessível durante a compilação e dispara Toast de sucesso quando o download inicia.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoints para solicitação (HTTP 202), consulta de status e download.
- [x] Processamento em background desacoplado da thread HTTP com BullMQ.
- [x] Template visual A4 com tipografia institucional e dados dos pacientes.
- [x] Restrição RBAC para perfis `recepcao` e `profissional`.
- [x] Testes automatizados em [`apps/api/test/features/feat-09-geracao-pdf-worker.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-09-geracao-pdf-worker.test.ts).

### Front-end
- [x] Ação de exportação acessível no topo da agenda do médico e da recepção.
- [x] Estado de carregamento e feedback visual durante o processamento.
- [x] Disparo automático de download no cliente sem travar a interface.
