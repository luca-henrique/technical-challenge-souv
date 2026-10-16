# Decisões

Use uma seção para cada problema investigado ou decisão tomada, copiando o bloco abaixo quantas vezes precisar. Escreva do seu jeito, sem se preocupar com formalidade.

## Título curto do problema ou da decisão

**O que eu vi**

**O que achei que era**

**Como confirmei**

**O que fiz e por quê**

**Como testei**

**O que considerei e descartei**

**Quanto tempo levou**

---

## Lembrete com n8n (bônus, se você fizer)

**Como montei o fluxo**

- Exportado no arquivo `n8n/lembrete.json` e executado no container oficial do n8n (`n8nio/n8n:2.40.3`) via `docker compose --profile n8n up -d` (`npm run n8n`).
- **Nó Schedule Trigger**: Configurado para disparar diariamente às 08:00 (fuso `America/Recife`), com antecedência de 24 horas para as consultas agendadas do dia seguinte.
- **Nó HTTP Request**: Realiza requisição `GET http://host.docker.internal:3333/integracoes/lembretes` autenticado pelo cabeçalho `x-chave-integracao` com a chave do ambiente (`CHAVE_INTEGRACAO`), obtendo a lista de consultas ativas (`status = 'agendada'`).
- **Nó Code (JavaScript)**: Itera pelas consultas e formata a data para o padrão nacional (`DD/MM/AAAA`), o assunto (`Lembrete: Sua consulta na Clínica Bem Viver amanhã às HH:mm`) e gera um template HTML responsivo e com a identidade visual da clínica, informando paciente, médico, especialidade, tipo de consulta e orientações para comparecimento com 15 minutos de antecedência.
- **Nó Send Email (SMTP)**: Conecta-se diretamente ao container do Mailpit (`host: mailpit`, porta `1025`) para despachar os e-mails para `atendimento@clinicabemviver.com.br` -> `pacienteEmail` sem necessidade de SSL/TLS local.

**Como testei**

- **Testes automatizados na API**:
  - `apps/api/test/features/feat-01-lembrete-n8n.test.ts`: 5 testes cobrindo autenticação por `x-chave-integracao` (401 para chave ausente ou inválida), cálculo padrão do dia seguinte (`D+1`), formatação e integridade dos nós e conexões do arquivo exportado `n8n/lembrete.json`.
  - `apps/api/test/integracoes.test.ts`: 3 testes cobrindo filtros de data e exclusão de consultas canceladas.
- **Testes de integração com Mailpit**:
  - Validação via API HTTP do Mailpit (`curl http://localhost:8025/api/v1/messages`) para certificar que o servidor SMTP emula com perfeição o recebimento dos e-mails disparados pelo workflow n8n.

**O que mudaria para usar em produção**

- **Idempotência**: Criação de campo `lembreteEnviadoEm DateTime?` na tabela `consultas` e gravação de timestamp após cada disparo bem-sucedido, garantindo que reexecuções manuais ou retries do n8n não dupliquem e-mails aos pacientes.
- **Canais adicionais (Omnichannel)**: Integração com WhatsApp Business API (Evolution API, Twilio ou Z-API) e SMS para pacientes que não acessam e-mail com frequência.
- **Ações diretas (Magic Links)**: Inclusão de links com tokens JWT de uso único no corpo do e-mail ("Confirmar presença com 1 clique" e "Remarcar consulta"), permitindo ao paciente atualizar o status sem login manual prévio.
- **Observabilidade**: Adição de nó *Error Trigger* no n8n reportando falhas de conexão ou erros de entrega SMTP para canal de alerta (Slack/Discord/Sentry).
- **Provedor SMTP Transacional**: Substituição do Mailpit local por serviço em nuvem de alta entregabilidade (AWS SES, Resend ou SendGrid) com DKIM, SPF e DMARC devidamente configurados.

## Ordem das funcionalidades, com justificativa

A priorização detalhada e a fundamentação estratégica completa estão documentadas em **[docs/novas-features/README.md](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/README.md)** utilizando o framework **RICE** (Reach, Impact, Confidence, Effort).

A ordem estabelecida para as 10 funcionalidades é:

1. **[Lembrete automático da consulta 24h antes com n8n](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-01-lembrete-automatico-consultas-n8n.md)** (RICE: 20.0): Ataca diretamente a maior fonte de perda financeira da clínica (o absenteísmo/no-show). Implementado como bônus oficial de engenharia.
2. **[Confirmação de presença pelo paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-02-confirmacao-presenca-paciente.md)** (RICE: 15.0): Complementa o lembrete permitindo que o paciente confirme sua ida ou avise com antecedência, liberando a vaga para a recepção remanejar.
3. **[Remarcação pelo próprio paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-03-remarcacao-pelo-paciente.md)** (RICE: 9.0): Autoatendimento que reduz o cancelamento definitivo e o custo de atendimento telefônico no balcão.
4. **[Lista de espera para horários que forem liberados](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-04-lista-de-espera-horarios-liberados.md)** (RICE: 5.6): Maximiza a taxa de ocupação da grade médica ao realocar desistências imediatas.
5. **[Bloqueio de agenda por período, como férias](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-05-bloqueio-agenda-por-periodo.md)** (RICE: 7.6): Extensão natural da RN07 para evitar múltiplos bloqueios manuais unitários em férias de 15 a 30 dias.
6. **[Relatório de faltas](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-06-relatorio-de-faltas.md)** (RICE: 6.7): Dá inteligência de dados à recepção para identificar pacientes reincidentes e especialidades com maior evasão (RN08).
7. **[Histórico de consultas do paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-07-historico-consultas-paciente.md)** (RICE: 10.0): Dá visibilidade ao paciente e médico sobre consultas passadas (hoje restrito a datas futuras).
8. **[Busca de profissionais por especialidade](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-08-busca-profissionais-especialidade.md)** (RICE: 10.5): Melhora a experiência de agendamento em clínicas com corpo clínico amplo.
9. **[Exportação da agenda do dia em PDF](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-09-exportacao-agenda-pdf.md)** (RICE: 2.7): Apoio operacional e contingência para impressão física de lista de chamada da recepção.
10. **[Tema escuro na área do paciente](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/novas-features/FEAT-10-tema-escuro-area-paciente.md)** (RICE: 1.4): Conforto visual moderno, porém sem impacto clínico ou financeiro na operação médica.

## Como usei IA

## O que ficou de fora

