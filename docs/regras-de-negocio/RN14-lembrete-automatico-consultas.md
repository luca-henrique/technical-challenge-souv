# RN14: Lembrete Automático de Consultas 24 Horas Antes

## 1. Descrição da Regra

> **Regra Oficial**: *"O sistema disponibiliza rotina automatizada para envio de lembretes aos pacientes 24 horas antes da data de sua consulta, informando profissional, data, horário e orientações para comparecimento com antecedência."*

- **Janela Temporal**: Consultas marcadas para o dia seguinte ($D+1$), considerando o fuso horário oficial de Recife (`America/Recife`).
- **Filtro Estrito de Status**: Apenas consultas com `status = 'agendada'` são elegíveis para receber lembrete.
  - Consultas canceladas (`cancelada`), faltadas (`faltou`) ou já atendidas (`realizada`) são terminantemente ignoradas.
- **Autenticação da Integração**: O endpoint de alimentação da rotina é protegido por chave secreta dedicada (`x-chave-integracao`), isolado dos tokens JWT de usuários comuns.
- **Desacoplamento Arquitetural**: O disparo de e-mails nunca ocorre na thread síncrona do Express, sendo orquestrado externamente pelo **n8n** ou por fila assíncrona **BullMQ** com servidor SMTP (Mailpit).

---

## 2. Impacto e Casos de Borda

1. **Combate ao No-Show**: O lembrete na véspera é a intervenção de maior impacto no absenteísmo da clínica.
2. **Consultas Canceladas de Última Hora**: Pacientes que já haviam cancelado a consulta não recebem lembrete de agendamento inexistente, evitando reclamações e ruído de comunicação.
3. **Chave de Integração Ausente ou Inválida**: Tentativas de acesso sem o cabeçalho correto retornam HTTP 401 Unauthorized.
4. **Idempotência**: Reexecuções no mesmo dia não devem duplicar mensagens caso o registro de envio já tenha ocorrido.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Rota HTTP ([`apps/api/src/modules/integracoes/routes.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/modules/integracoes/routes.ts))**:
  - `GET /integracoes/lembretes`
  - Middleware de autenticação `autenticarIntegracao` validando `req.headers['x-chave-integracao'] === process.env.CHAVE_INTEGRACAO`.
- **Caso de Uso (`listarLembretes`)**:
  - Calcula a data de amanhã no fuso de Recife caso o parâmetro `?data=` não seja informado.
  - Executa query no Prisma trazendo nome do paciente, e-mail, médico, especialidade, tipo, data e hora.
  - Retorna lista estruturada em JSON pronta para consumo do nó de automação.

### Orquestrador n8n e Mailpit
- **Workflow n8n ([`n8n/lembrete.json`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/n8n/lembrete.json))**:
  1. *Schedule Trigger*: Disparo diário às 08:00 (Recife).
  2. *HTTP Request*: `GET http://host.docker.internal:3333/integracoes/lembretes` com header `x-chave-integracao`.
  3. *Code (JS)*: Formatação de datas (`DD/MM/AAAA`) e compilação do layout HTML corporativo da Clínica Bem Viver.
  4. *Send Email*: Envio SMTP direcionado ao container do Mailpit na porta 1025.
- **Worker BullMQ Alternativo ([`apps/api/src/infra/jobs/emailWorker.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/infra/jobs/emailWorker.ts))**:
  - Processa jobs assíncronos com Nodemailer, retentativas automáticas e backoff exponencial.

---

## 4. Checklist de Verificação

### Back-end & Integrações
- [x] Rota `GET /integracoes/lembretes` protegida pelo header `x-chave-integracao`.
- [x] Rejeição com HTTP 401 para requisições sem chave ou com chave incorreta.
- [x] Cálculo padrão da data de amanhã ($D+1$) no fuso canônico `America/Recife`.
- [x] Suporte ao parâmetro `?data=AAAA-MM-DD` para testes manuais e simulações.
- [x] Exclusão obrigatória de consultas canceladas (`status != 'agendada'`).
- [x] Workflow exportado e testado no n8n (`n8n/lembrete.json`).
- [x] Emulação de envio e recebimento de e-mails via Mailpit na porta 1025/8025.
- [x] Testes automatizados em [`apps/api/test/features/feat-01-lembrete-n8n.test.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/test/features/feat-01-lembrete-n8n.test.ts).
