# Requisitos do Módulo de Integrações

## Visão Geral
Disponibiliza endpoints para integração com ferramentas externas de automação (como n8n, serviços de mensageria e webhooks), permitindo disparo automatizado de lembretes de consultas aos pacientes 24h antes do atendimento.

## Requisitos Funcionais (RF)
- **RF-INT-01**: Autenticação por chave secreta fornecida no cabeçalho `x-chave-integracao`. Requisições com chaves inválidas ou ausentes devem receber status HTTP 401.
- **RF-INT-02**: Consulta de lembretes (`GET /integracoes/lembretes`) retornando todas as consultas agendadas do dia alvo com dados de contato do paciente e especialidade médica.
- **RF-INT-03**: Se o parâmetro `data` não for informado na query, a data padrão deve ser o dia seguinte à data corrente (D+1) no fuso horário de Recife.

## Requisitos Não Funcionais (RNF)
- **RNF-INT-01**: Validação de chave de integração utilizando comparação em tempo constante (`timingSafeEqual`) para mitigar timing attacks.
