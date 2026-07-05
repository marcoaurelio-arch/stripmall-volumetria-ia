# Strip Mall Volumetria IA

Aplicação web para estudos de massa, volumetria e apoio à viabilidade de empreendimentos `strip mall`.

## Visão Geral

O projeto foi estruturado para apoiar análises preliminares de implantação, comparação de layouts e geração de materiais técnicos a partir de parâmetros urbanísticos e dados do terreno.

Principais capacidades:

1. cadastro e gestão de projetos
2. análise volumétrica assistida por IA
3. comparação de layouts e cenários
4. apoio a relatórios e exportações técnicas
5. visualização geográfica com mapas

## Stack

- React 19
- TypeScript
- Vite
- Express
- tRPC
- Drizzle ORM
- Vitest

## Execução Local

Pré-requisitos:

1. Node.js 20+
2. pnpm
3. variáveis de ambiente configuradas para banco, autenticação e serviços de IA

Comandos principais:

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

## Variáveis de Ambiente

O projeto depende de credenciais e endpoints configurados por ambiente. Não publique arquivos `.env` ou credenciais reais no repositório.

Exemplos de categorias de configuração:

1. banco de dados
2. autenticação OAuth
3. endpoint de IA
4. conversão de PDF
5. mapas

## Estado Atual

O repositório passou por uma rodada extensa de curadoria técnica e institucional para reduzir acoplamentos legados, limpar artefatos sensíveis e estabilizar a baseline local de testes.

## Testes

Baseline validada no clone auditado:

1. backend com testes unitários passando e integrações opcionais marcadas como `skipped` quando o ambiente não está disponível
2. frontend com suíte local estável

## Uso

Este projeto é mantido como ativo técnico da Nexa Malls e deve ser publicado apenas com revisão final de narrativa, secrets e dependências de ambiente.

## Governanca

Antes de abrir o repositório publicamente, valide:

1. metadados do repositório no GitHub
2. política de licença
3. postura de recebimento de contribuições
4. canal para reporte responsável de vulnerabilidades

Arquivos de apoio:

1. `CONTRIBUTING.md`
2. `SECURITY.md`
3. `PUBLICATION_CHECKLIST.md`
