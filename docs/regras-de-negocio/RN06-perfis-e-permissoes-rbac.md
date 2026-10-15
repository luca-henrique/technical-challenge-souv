# RN06: Perfis de Usuário e Controle de Acesso (RBAC)

## 1. Descrição da Regra

> **Regra Oficial**: *"Os perfis são paciente, recepção e profissional. O paciente vê, marca e cancela só as próprias consultas. A recepção marca e cancela para qualquer paciente e registra faltas. O profissional vê a própria agenda e bloqueia dias de folga."*

### Matriz de Permissões por Perfil

| Ação / Recurso | Paciente | Recepção | Profissional |
| :--- | :---: | :---: | :---: |
| **Ver consultas** | Apenas as próprias (`/consultas/minhas`) | De todos os profissionais e pacientes | Apenas a própria agenda (`/:id/agenda`) |
| **Marcar consulta** | Apenas para si próprio | Para qualquer paciente cadastrado | Não permitido |
| **Cancelar consulta** | Apenas as próprias | Para qualquer consulta agendada | Não permitido |
| **Registrar falta** | Não permitido | Permitido para consultas passadas | Não permitido |
| **Bloquear folga** | Não permitido | Não permitido | Apenas para si próprio (`/:id/folgas`) |
| **Listar profissionais** | Permitido | Permitido | Permitido |
| **Listar pacientes** | Não permitido | Permitido | Não permitido |

---

## 2. Impacto e Violações de Segurança Prevenidas

1. **Privilégio Indevido (Injeção de Paciente)**:
   - Um paciente não pode enviar `pacienteId: 'outro-id'` no corpo de `/consultas` para agendar para terceiro. O backend deve forçar `pacienteId = req.usuario.id`.
2. **Visualização de Agenda Alheia**:
   - Um profissional não pode acessar a rota `/profissionais/:outroId/agenda`. Deve retornar `403 Forbidden`.
3. **Acesso Direto por URL no Frontend**:
   - Paciente digitando `/recepcao` ou `/profissional` deve ser barrado imediatamente no Next.js Edge Middleware.

---

## 3. Implementação Técnica

### Back-end (`apps/api`)
- **Middleware `autenticar` ([`apps/api/src/auth.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/api/src/auth.ts))**:
  - Extrai o token JWT `Bearer`, valida assinatura e injeta `req.usuario: { id, nome, perfil }`.
- **Middleware `permitir(...perfis: Perfil[])`**:
  - Valida se `perfis.includes(req.usuario.perfil)`. Se negativo, responde `403 Forbidden`.
- **Checagens de Propriedade**:
  - Em `POST /consultas`:
    ```ts
    const pacienteId = req.usuario.perfil === 'paciente' ? req.usuario.id : String(req.body?.pacienteId ?? '')
    ```
  - Em `GET /profissionais/:id/agenda`:
    ```ts
    if (req.usuario.perfil === 'profissional' && req.usuario.id !== profissionalId) {
      res.status(403).json({ erro: 'Você só pode ver a sua própria agenda' })
      return
    }
    ```

### Front-end (`apps/web`)
- **Next.js Edge Middleware ([`apps/web/src/middleware.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/middleware.ts))**:
  - Lê o cookie `bemviver_sessao` antes da renderização de qualquer página.
  - Redireciona usuários deslogados tentando acessar `/recepcao`, `/profissional` ou `/paciente` para `/login`.
  - Redireciona usuários logados que tentam acessar rotas fora de seu perfil para sua área correta.
- **Sessão Híbrida ([`apps/web/src/lib/sessao.ts`](file:///Users/lucas1/Desktop/projects/technical-challenge-souv/apps/web/src/lib/sessao.ts))**:
  - Salva dados em `localStorage` e nos cookies com chave `bemviver_sessao`.

---

## 4. Checklist de Verificação

### Back-end
- [x] Middleware `autenticar` rejeitando requisições sem token válido com `401 Unauthorized`.
- [x] Middleware `permitir` bloqueando acessos indevidos com `403 Forbidden`.
- [x] Paciente impedido de agendar consulta com `pacienteId` de outro usuário.
- [x] Paciente impedido de listar todos os pacientes cadastrados (`/pacientes` restrito à recepção).
- [x] Profissional impedido de visualizar agenda de outros colegas médicos.
- [x] Recepção com permissão de consultar qualquer agenda e marcar para qualquer paciente.

### Front-end
- [x] Middleware do Next.js bloqueando navegação de URLs proibidas para o perfil ativo.
- [x] Redirecionamento automático pós-login para a rota correspondente ao perfil (`/paciente`, `/recepcao`, `/profissional`).
- [x] Limpeza completa da sessão e cookies na ação de logout.
- [x] Testes automatizados do middleware cobrindo todos os cenários de redirecionamento e RBAC.
