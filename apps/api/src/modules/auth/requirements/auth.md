# Requisitos do Módulo de Autenticação (Auth)

## Visão Geral
Gerencia a autenticação de usuários na clínica Bem Viver, emitindo JWT com controle de expiração de 8 horas e suporte a múltiplos perfis (paciente, profissional, recepção).

## Requisitos Funcionais (RF)
- **RF-AUTH-01**: O usuário deve conseguir autenticar fornecendo seu e-mail e senha.
- **RF-AUTH-02**: Ao autenticar com sucesso, o sistema deve retornar um token JWT assinado e os dados resumidos do usuário (`id`, `nome`, `perfil`).
- **RF-AUTH-03**: Em caso de credenciais inválidas ou e-mail inexistente, retornar status HTTP 401 com mensagem padronizada `E-mail ou senha incorretos`.

## Requisitos Não Funcionais (RNF)
- **RNF-AUTH-01**: Criptografia de senhas utilizando hash com salt aleatório e derivação segura de chave (`scrypt`).
- **RNF-AUTH-02**: Comparação de hashes em tempo constante (`timingSafeEqual`) para mitigar ataques de timing.
- **RNF-AUTH-03**: Token JWT assinado com chave secreta segura (`JWT_SEGREDO`).
