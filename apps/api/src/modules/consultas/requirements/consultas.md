# Requisitos do Módulo de Consultas (Agendamento)

## Visão Geral
Módulo central do sistema de agendamento médico da clínica Bem Viver, responsável pelo ciclo completo de vida de uma consulta: agendamento inicial, confirmação de comparecimento pelo paciente, remarcação, cancelamento, registro de falta e histórico.

## Requisitos Funcionais (RF)
- **RF-CON-01**: Agendamento de Consulta (`POST /consultas`) por paciente (para si) ou recepção (para qualquer paciente).
- **RF-CON-02**: Confirmação de Presença (`POST /consultas/:id/confirmar`) pelo paciente ou recepção.
- **RF-CON-03**: Cancelamento de Consulta (`POST /consultas/:id/cancelar`). Libera o horário imediatamente e notifica o próximo da lista de espera.
- **RF-CON-04**: Remarcação de Consulta (`PATCH` ou `POST /consultas/:id/remarcar`) para uma nova data e horário válidos.
- **RF-CON-05**: Registro de Falta (`POST /consultas/:id/falta`) exclusivo para a recepção após o início da consulta.
- **RF-CON-06**: Listagem de Consultas do Paciente (`GET /consultas/minhas`), com suporte a flag `historico=true`.
- **RF-CON-07**: Cancelamento automático em lote de consultas expiradas não confirmadas antes do início do atendimento.

## Regras de Negócio Associadas
- **RN01**: Horário de expediente (08:00 às 18:00 com almoço 12:00 às 13:00).
- **RN02**: Grade de 30 minutos em fuso horário de Recife (America/Recife).
- **RN03**: Duração da consulta (`primeira` consulta = 60 minutos, `retorno` = 30 minutos).
- **RN04**: Exclusividade e prevenção de conflitos de horário via `pg_advisory_xact_lock` por profissional e data.
- **RN05**: Cancelamento apenas de consultas no status `agendada`.
- **RN06**: Perfis e permissões RBAC.
- **RN07**: Respeito às folgas cadastradas para o profissional de saúde.
- **RN08**: Registro de faltas apenas para consultas que já deveriam ter iniciado.
