# Security Policy

## Reportando vulnerabilidades

Não publique vulnerabilidades, credenciais expostas ou riscos operacionais em issues públicas.

Envie o reporte de forma privada ao mantenedor responsável pelo repositório com:

1. resumo do problema
2. impacto potencial
3. passos de reprodução
4. evidências mínimas necessárias
5. sugestão de mitigação, se houver

## Escopo de segurança

Trate como sensível qualquer item relacionado a:

1. variáveis de ambiente e credenciais
2. autenticação e OAuth
3. integrações com IA e endpoints externos
4. exportações de documentos e arquivos
5. acesso a banco, storage ou notificações

## Boas práticas para contribuidores

1. nunca commite segredos reais
2. use placeholders e exemplos mascarados em documentação
3. valide mudanças com testes antes de abrir PR
4. minimize logs que possam expor dados operacionais
