# Requisitos do Módulo de Lista de Espera

## Visão Geral
Permite que pacientes que não encontraram horários vagos com determinado profissional de saúde se inscrevam em uma fila de espera para um dia específico (podendo especificar turno: manhã, tarde ou qualquer). Quando uma consulta for cancelada ou remarcada liberando um slot, o próximo paciente da fila é automaticamente notificado.

## Requisitos Funcionais (RF)
- **RF-WAIT-01**: Paciente ou recepção pode inscrever o paciente na lista de espera para uma data futura em dia útil (`POST /lista-espera`).
- **RF-WAIT-02**: Impede inscrição para datas no passado, dias não úteis, em dias que o profissional esteja de folga ou se o paciente já estiver aguardando na lista para aquele profissional e data.
- **RF-WAIT-03**: Recepção pode listar todas as inscrições (`GET /lista-espera`) com filtros opcionais por profissional, data e status.
- **RF-WAIT-04**: Pacientes podem listar suas próprias inscrições (`GET /lista-espera/minhas`).
- **RF-WAIT-05**: Paciente ou recepção pode cancelar uma inscrição (`DELETE /lista-espera/:id`).
- **RF-WAIT-06**: Ao liberar um horário vago por cancelamento ou remarcação, notificar automaticamente o próximo da fila conforme turno compatível.
