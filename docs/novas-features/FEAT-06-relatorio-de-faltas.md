# FEAT-06: Relatório de Faltas e Absenteísmo

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 6º Lugar (RICE Score: 6.7)
- **Status**: Média Prioridade
- **Objetivo**: Fornecer um relatório gerencial e operacional para a recepção e administração da clínica com métricas consolidadas de faltas, pacientes reincidentes e taxa de absenteísmo por médico e especialidade.

A regra [RN08](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN08-registro-de-faltas-e-restricoes.md) instituiu o registro auditável do status `'faltou'`. No entanto, os dados ficam dispersos na tabela de consultas do dia. O relatório consolida essas informações para que a gerência tome ações preventivas (como contato prévio obrigatório com pacientes reincidentes) sem recorrer a punições automáticas prejudiciais.

---

## 2. Requisitos Funcionais

1. **Filtros do Relatório**:
   - Por período (`dataInicio` e `dataFim`).
   - Por profissional ou especialidade.
   - Por paciente (busca nominal).
2. **Métricas Consolidadas**:
   - Total de consultas agendadas, realizadas, canceladas e faltadas.
   - Taxa percentual de absenteísmo: $\frac{\text{Faltas}}{\text{Agendadas}} \times 100\%$.
   - Ranking de pacientes com 2 ou mais faltas no período selecionado.
3. **Controle de Acesso (RBAC)**:
   - Apenas perfis `recepcao` e administradores têm acesso ao relatório ([RN06](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN06-perfis-e-permissoes-rbac.md)). Pacientes não podem visualizar dados consolidados de outros usuários.

---

## 3. Especificação Técnica

### 3.1. Endpoint da API
- `GET /relatorios/faltas`:
  - **Permissão**: `permitir('recepcao')`
  - **Query Params**: `?dataInicio=2026-10-01&dataFim=2026-10-31&profissionalId=prof-1`
  - **Payload de Resposta**:
    ```json
    {
      "periodo": { "dataInicio": "2026-10-01", "dataFim": "2026-10-31" },
      "totais": { "agendadas": 120, "realizadas": 95, "canceladas": 15, "faltas": 10 },
      "taxaFaltas": "8.3%",
      "reincidentes": [
        { "pacienteId": "pac-1", "nome": "Lucas Santos", "totalFaltas": 3 }
      ]
    }
    ```

### 3.2. Interface Front-end
- Nova página `/recepcao/relatorios` com gráficos simples ou tabelas de agregação visual.
