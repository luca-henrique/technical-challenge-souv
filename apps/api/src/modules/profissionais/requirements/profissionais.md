# Requisitos do Módulo de Profissionais

## Visão Geral
Gerencia médicos/profissionais de saúde da clínica Bem Viver, suas especialidades, agenda diária, cálculo dinâmico de horários livres e bloqueio de folgas pontuais ou em períodos prolongados (férias, congressos, afastamentos).

## Requisitos Funcionais (RF)
- **RF-PROF-01**: Listagem de todas as especialidades médicas cadastradas na clínica em ordem alfabética sem duplicidades.
- **RF-PROF-02**: Busca de profissionais com filtros por `data` (sinalizando se o profissional está de folga), `profissionalId` e `especialidade` (busca case-insensitive).
- **RF-PROF-03**: Consulta da agenda diária do profissional (`/:id/agenda`). Profissionais só podem consultar a sua própria agenda; recepção pode consultar a agenda de qualquer profissional.
- **RF-PROF-04**: Listagem de horários disponíveis (`/:id/horarios`) considerando:
  - Dias úteis (segunda a sexta).
  - Folgas cadastradas para o profissional.
  - Grade de 30 minutos e duração conforme tipo da consulta (`primeira` 60min, `retorno` 30min).
  - Intervalo de almoço (12:00 às 13:00) e encerramento do expediente (18:00).
  - Não retornar horários no passado em relação ao horário corrente.
- **RF-PROF-05**: Bloqueio individual de folga (`POST /:id/folgas`). Apenas o próprio profissional pode realizar o bloqueio de datas futuras.
- **RF-PROF-06**: Bloqueio de período de folga (`POST /:id/folgas/periodo`). Permitido ao próprio profissional e à recepção, com limite máximo de 90 dias e validação de datas no futuro.

## Regras de Negócio Associadas
- **RN01**: Horário de expediente (08:00 às 18:00 com almoço 12:00 às 13:00).
- **RN02**: Fuso horário de Recife (UTC-3) e grade de horários.
- **RN06**: Perfis e permissões RBAC.
- **RN07**: Bloqueio de folgas individuais e períodos.
