# Requisitos do Módulo de Relatórios

## Visão Geral
Fornece métricas e relatórios analíticos para a equipe de recepção e gestão da clínica Bem Viver, com foco no monitoramento de absenteísmo (faltas), volume de atendimentos e taxa de comparecimento.

## Requisitos Funcionais (RF)
- **RF-REL-01**: Geração de relatório de faltas (`GET /relatorios/faltas`), exclusivo para a `recepcao`.
- **RF-REL-02**: Filtros opcionais por intervalo de datas (`dataInicio`, `dataFim`) e por `profissionalId`.
- **RF-REL-03**: Validação rigorosa dos parâmetros de data em formato AAAA-MM-DD e garantia de que `dataInicio <= dataFim`.
- **RF-REL-04**: Agregação dos totais de consultas (agendadas, realizadas, canceladas e faltas) e cálculo percentual da taxa de faltas com precisão de uma casa decimal.
- **RF-REL-05**: Ranking de pacientes reincidentes em faltas ordenado por volume de faltas decrescente.
- **RF-REL-06**: Distribuição de faltas e taxa por profissional de saúde.
