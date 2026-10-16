# FEAT-05: Bloqueio de Agenda por Período (Férias e Recessos)

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 5º Lugar (RICE Score: 7.6)
- **Status**: Média / Alta Prioridade
- **Objetivo**: Permitir que médicos e administradores bloqueiem intervalos contínuos de datas (como férias de 15 a 30 dias, licenças médicas ou participação em congressos) em uma única operação.

Hoje, a [RN07](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN07-bloqueio-de-folgas.md) permite apenas o bloqueio dia a dia (`POST /profissionais/:id/folgas` com uma única string `data`). Para um recesso de 20 dias úteis, o médico precisaria clicar e confirmar 20 vezes consecutivas, gerando atrito e alto risco de esquecer dias intercalados.

---

## 2. Requisitos de Negócio e Validações

1. **Seleção de Intervalo**:
   - Campos de `dataInicio` e `dataFim` (ambos no formato `AAAA-MM-DD`).
   - `dataInicio` deve ser menor ou igual a `dataFim`.
   - `dataInicio` não pode ser uma data passada em relação a `hojeEmRecife()`.
2. **Validação Prévia de Consultas Agendadas**:
   - Se já existirem consultas marcadas em qualquer dia do intervalo, o sistema retorna um relatório detalhado com as consultas afetadas antes de aplicar o bloqueio.
   - O médico ou a recepção devem ser notificados para que essas consultas sejam remarcadas ou tratadas com os pacientes previamente.
3. **Persistência Atômica**:
   - Criação em lote (`prisma.folga.createMany`) para todos os dias do período.

---

## 3. Especificação Técnica

### 3.1. Endpoint da API
- `POST /profissionais/:id/folgas/periodo`:
  - **Permissão**: `permitir('profissional', 'recepcao')`
  - **Body**: `{ "dataInicio": "2026-11-01", "dataFim": "2026-11-15", "motivo": "Férias anuais" }`
  - **Resposta de Sucesso**: `{ "totalDiasBloqueados": 15, "folgas": [...] }` com status `201 Created`.

### 3.2. Interface do Profissional
- Na tela `/profissional`, inclusão de um seletor de "Período / Férias" ao lado do botão de bloqueio de dia único.
