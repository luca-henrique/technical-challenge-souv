# RN08: Registro de Faltas e Restrições Operacionais

## 1. Descrição da Regra

> **Regra Oficial**: *"A recepção registra faltas. Não existe encaixe, política de cancelamento tardio nem tratamento de faltas recorrentes."*

- **Exclusividade da Recepção**: Somente usuários com perfil `recepcao` têm permissão para registrar falta de pacientes. Pacientes e profissionais não têm acesso a essa operação.
- **Momento Permitido**: A falta só pode ser registrada **após o horário de início da consulta ter passado** (`inicio <= agora`). Não é permitido registrar falta preventiva ou antecipadamente.
- **Status Exclusivo**: Só é possível registrar falta para consultas cujo status atual seja estritamente `'agendada'`. Não é permitido registrar falta em consultas já canceladas ou já marcadas com falta.
- **Simplificação de Regras Operacionais**:
  - Não há penalidades financeiras, bloqueios automáticos ou regras de pontuação para pacientes com faltas recorrentes.
  - Não existem "encaixes" ou listas de espera automáticas.

---

## 2. Impacto e Casos de Borda

1. **Tentativa de registrar falta antes do horário**:
   - Uma consulta marcada para as 15:00 não pode ter falta registrada às 14:30. A API deve rejeitar com `409 Conflict` informando: `"A falta só pode ser registrada depois do horário da consulta"`.
2. **Tentativa de registrar falta em consulta cancelada**:
   - Rejeição com `409 Conflict`: `"Só é possível registrar falta em uma consulta agendada"`.
3. **Visibilidade do Botão na Interface**:
   - O botão "Registrar falta" na tabela da recepção só deve ser exibido ou habilitado para consultas cujo horário de início já tenha passado em relação ao horário atual.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Endpoint `POST /consultas/:id/falta`**:
  ```ts
  rotasConsultas.post('/:id/falta', permitir('recepcao'), async (req, res) => {
    const consulta = await prisma.consulta.findUnique({ where: { id: req.params.id } })

    if (!consulta) {
      res.status(404).json({ erro: 'Consulta não encontrada' })
      return
    }
    if (consulta.status !== 'agendada') {
      res.status(409).json({ erro: 'Só é possível registrar falta em uma consulta agendada' })
      return
    }
    if (consulta.inicio > new Date()) {
      res.status(409).json({ erro: 'A falta só pode ser registrada depois do horário da consulta' })
      return
    }

    const atualizada = await prisma.consulta.update({
      where: { id: consulta.id },
      data: { status: 'faltou' },
    })
    res.json(atualizada)
  })
  ```

### Front-end (`apps/web`)
- **Tabela de Consultas na Recepção ([`TabelaConsultas`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/TabelaConsultas/tabelaConsultas.tsx) e [`AgendaDoDia`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/components/organisms/AgendaDoDia/agendaDoDia.tsx))**:
  - Validação de renderização condicional do botão "Registrar falta":
    ```tsx
    {new Date(consulta.inicio) <= new Date() && (
      <Button
        variante="secundario"
        tamanho="compacto"
        disabled={registrandoFalta}
        onClick={() => executar("falta", consulta.id)}
      >
        {registrandoFalta ? "Registrando..." : "Registrar falta"}
      </Button>
    )}
    ```
  - Atualização do status na tabela para "Faltou" via invalidação reativa do cache com TanStack Query.

---

## 4. Checklist de Verificação

### Back-end
- [x] Endpoint `POST /consultas/:id/falta` restrito com `permitir('recepcao')`.
- [x] Paciente ou profissional recebem `403 Forbidden` caso tentem registrar falta.
- [x] Bloqueio com `409 Conflict` se a consulta ainda não começou (`inicio > new Date()`).
- [x] Bloqueio com `409 Conflict` se a consulta não estiver com status `agendada`.
- [x] Atualização segura do banco com `status = 'faltou'`.

### Front-end
- [x] Botão "Registrar falta" renderizado exclusivamente na tela de recepção.
- [x] Botão "Registrar falta" exibido apenas para consultas com horário de início já decorrido.
- [x] Desabilitação do botão com indicador visual (`Registrando...`) enquanto a requisição é processada.
- [x] Mudança reativa imediata na tabela refletindo o novo status sem necessidade de recarregar a página.
- [x] Testes automatizados cobrindo a execução da ação de registrar falta.
