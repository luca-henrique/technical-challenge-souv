# FEAT-08: Busca de Profissionais por Especialidade

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 8º Lugar (RICE Score: 10.5)
- **Status**: Média Prioridade / Melhoria Contínua
- **Objetivo**: Permitir que pacientes e recepcionistas filtrem a lista de médicos pela especialidade desejada (ex.: Cardiologia, Dermatologia, Ortopedia, Pediatria) antes de escolher o profissional.

Conforme a clínica expande seu corpo clínico com múltiplos médicos por área, selecionar diretamente em uma lista única e extensa ordenada por nome dificulta a localização do profissional adequado para cada necessidade médica.

---

## 2. Requisitos Funcionais

1. **Filtro no Agendamento do Paciente**:
   - Um primeiro seletor ou chips de `"Especialidade"`.
   - Ao selecionar `"Cardiologia"`, o dropdown de profissionais filtra automaticamente para exibir apenas cardiologistas.
2. **Filtro na Recepção**:
   - Na página `/recepcao`, a busca permite filtrar médicos por especialidade em conjunto com o seletor de data.
3. **Listagem Dinâmica de Especialidades**:
   - As especialidades disponíveis devem ser extraídas dinamicamente do banco de dados (ex: `prisma.profissional.findMany({ distinct: ['especialidade'] })`).

---

## 3. Especificação Técnica

### 3.1. Endpoint da API
- `GET /especialidades`:
  - Retorna a lista única de especialidades ativas: `['Cardiologia', 'Clínica geral', 'Dermatologia', 'Pediatria']`.
- Parâmetro em `GET /profissionais`:
  - `GET /profissionais?especialidade=Cardiologia` filtra profissionais pelo campo `especialidade`.

### 3.2. Front-end
- Componente `SeletorEspecialidade` reutilizável em `apps/web/src/components/molecules/SeletorEspecialidade`.
