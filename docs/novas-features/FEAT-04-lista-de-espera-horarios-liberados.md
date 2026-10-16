# FEAT-04: Lista de Espera para Horários Liberados

## 1. Visão Geral e Justificativa

- **Prioridade no Ranking**: 4º Lugar (RICE Score: 5.6)
- **Status**: Alta Prioridade
- **Objetivo**: Permitir que pacientes se cadastrem em uma lista de espera para datas ou médicos sem horários vagos, sendo notificados automaticamente assim que um cancelamento ocorrer.

Quando um paciente cancela uma consulta de última hora ([RN05](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/docs/regras-de-negocio/RN05-cancelamento-de-consultas.md)), o slot liberado frequentemente fica ocioso porque outros pacientes não sabem que a vaga abriu. A lista de espera converte desistências em receita e melhora o acesso à saúde.

---

## 2. Requisitos Funcionais

1. **Inscrição na Lista de Espera**:
   - Quando o paciente busca horários para um médico e a rota retorna `{ horarios: [] }`, a interface apresenta o botão `"Entrar na lista de espera deste dia"`.
   - O paciente seleciona a preferência de turno (`'manha'`, `'tarde'` ou `'qualquer'`).
2. **Disparo Reativo no Cancelamento**:
   - No momento em que uma consulta é cancelada (`POST /consultas/:id/cancelar`), o sistema verifica se há pacientes na fila de espera para aquele médico, data e turno.
   - O primeiro paciente da fila é notificado via e-mail ou WhatsApp com uma janela de tempo de exclusividade (ex: 30 minutos) para confirmar a vaga.
3. **Painel da Recepção**:
   - A recepção visualiza a lista de espera por médico e pode alocar um paciente manualmente se necessário.

---

## 3. Especificação Técnica

### 3.1. Modelo de Dados (Prisma)
```prisma
model ListaEspera {
  id             String       @id @default(uuid())
  profissionalId String
  pacienteId     String
  data           String
  tipo           TipoConsulta
  turno          String       @default("qualquer") // manha, tarde, qualquer
  status         String       @default("aguardando") // aguardando, notificado, atendido, expirado
  criadaEm       DateTime     @default(now())
  notificadoEm   DateTime?

  profissional   Profissional @relation(fields: [profissionalId], references: [id])
  paciente       Usuario      @relation(fields: [pacienteId], references: [id])

  @@unique([profissionalId, pacienteId, data])
}
```

### 3.2. Endpoints da API
- `POST /lista-espera`: Inscreve o paciente logado.
- `GET /lista-espera`: Lista pacientes em espera (acesso restrito à recepção).
- `DELETE /lista-espera/:id`: Cancela a inscrição na fila.
