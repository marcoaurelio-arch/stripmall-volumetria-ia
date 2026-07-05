# Contributing

Obrigado pelo interesse em contribuir com o `stripmall-volumetria-ia`.

## Escopo

Este repositório cobre uma aplicação de estudos preliminares de implantação, volumetria e apoio técnico para projetos de `strip mall`.

Contribuições são bem-vindas principalmente para:

1. correções de bugs
2. robustez de testes
3. melhorias de documentação
4. desacoplamento de integrações por configuração
5. experiência de desenvolvimento local

## Como começar

Pré-requisitos:

1. Node.js 20+
2. pnpm
3. variáveis de ambiente válidas para os serviços usados no seu ambiente

Setup:

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

## Diretrizes

1. prefira mudanças pequenas, objetivas e testáveis
2. não publique credenciais, arquivos `.env` ou dados sensíveis
3. preserve compatibilidade configurável para integrações externas
4. inclua ou ajuste testes quando houver mudança de comportamento
5. atualize a documentação quando a interface ou o fluxo mudar

## Pull requests

Ao abrir um PR, descreva:

1. problema atacado
2. abordagem adotada
3. impacto esperado
4. evidência de validação local

## Segurança

Se a contribuição envolver vulnerabilidade, segredo exposto ou risco operacional, não abra issue pública. Use o fluxo descrito em `SECURITY.md`.
