# Requisitos do Módulo de Pacientes

## Visão Geral
Gerencia a consulta de pacientes e seus históricos de consultas médicas na clínica Bem Viver.

## Requisitos Funcionais (RF)
- **RF-PAC-01**: Listagem de pacientes (`GET /pacientes`) restrita a usuários com perfil `recepcao`, ordenada alfabeticamente.
- **RF-PAC-02**: Consulta de consultas de um paciente (`GET /pacientes/:id/consultas`) restrita a `recepcao` e `profissional`.
- **RF-PAC-03**: Ao consultar o histórico de um paciente, o sistema cancela automaticamente consultas expiradas que não foram confirmadas antes do seu horário de início.

## Requisitos Não Funcionais (RNF)
- **RNF-PAC-01**: Restrição de acesso garantida via middleware RBAC centralizado.
