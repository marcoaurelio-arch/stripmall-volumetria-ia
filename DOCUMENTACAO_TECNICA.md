# Documentação Técnica - Strip Mall Volumetria IA

## Visão Geral

Aplicação web desenvolvida para realizar estudos de massa e volumetria de terrenos focada em projetos de **strip malls**. A solução utiliza inteligência artificial para gerar análises detalhadas, cálculos automáticos e recomendações de layout otimizado.

## Arquitetura

### Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express 4 + tRPC 11
- **Banco de Dados**: MySQL/TiDB (via Drizzle ORM)
- **Autenticação**: Manus OAuth
- **IA**: Integração com LLM via API Manus

### Estrutura de Pastas

```
stripmall-volumetria-ia/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── Projects.tsx  # Lista de projetos
│   │   │   ├── NewProject.tsx        # Formulário novo projeto
│   │   │   └── ProjectDetail.tsx     # Detalhes e análise
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/trpc.ts       # Cliente tRPC
│   │   └── App.tsx           # Rotas principais
├── server/                    # Backend Node.js
│   ├── db.ts                 # Queries do banco de dados
│   ├── routers.ts            # Router principal tRPC
│   ├── projectRouters.ts     # Routers de projetos
│   └── _core/                # Infraestrutura (OAuth, LLM)
├── drizzle/                   # Schema e migrações
│   └── schema.ts             # Definição das tabelas
└── shared/                    # Tipos e constantes compartilhadas
```

## Modelo de Dados

### Tabela: `projects`

Armazena informações básicas dos projetos de terrenos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int (PK) | Identificador único |
| userId | int | ID do usuário proprietário |
| name | varchar(255) | Nome do projeto |
| description | text | Descrição opcional |
| address | text | Endereço do terreno |
| totalArea | int | Área total em m² |
| width | int | Largura em metros |
| length | int | Comprimento em metros |
| occupancyRate | int | Taxa de ocupação (%) |
| floorAreaRatio | int | Coeficiente de aproveitamento (×100) |
| frontSetback | int | Recuo frontal em metros |
| sideSetback | int | Recuo lateral em metros |
| rearSetback | int | Recuo de fundos em metros |
| status | enum | 'draft', 'analyzing', 'completed' |
| createdAt | timestamp | Data de criação |
| updatedAt | timestamp | Última atualização |

### Tabela: `analyses`

Armazena os resultados das análises volumétricas geradas pela IA.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int (PK) | Identificador único |
| projectId | int (FK) | Referência ao projeto |
| buildableArea | int | Área construível em m² |
| maxFloors | int | Número máximo de pavimentos |
| storeCount | int | Quantidade de lojas sugerida |
| parkingSpaces | int | Vagas de estacionamento |
| aiAnalysis | text | Análise completa da IA (JSON) |
| recommendations | text | Recomendações textuais |
| viabilityScore | int | Pontuação de viabilidade (0-100) |
| createdAt | timestamp | Data da análise |

## Funcionalidades Principais

### 1. Gestão de Projetos

**Endpoint**: `trpc.project.*`

- **create**: Cria novo projeto com dados do terreno
- **list**: Lista todos os projetos do usuário
- **getById**: Obtém detalhes de um projeto específico
- **update**: Atualiza informações do projeto
- **delete**: Remove projeto e análises associadas

### 2. Análise com IA

**Endpoint**: `trpc.project.analyze`

Realiza análise volumétrica completa utilizando LLM. O processo inclui:

1. **Coleta de dados**: Extrai informações do projeto (área, dimensões, parâmetros urbanísticos)
2. **Cálculos automáticos**:
   - Área construível máxima
   - Número de pavimentos viáveis
   - Quantidade otimizada de lojas
   - Vagas de estacionamento (conforme normas)
3. **Análise com IA**: Envia prompt estruturado para o LLM com:
   - Contexto do projeto (strip mall comercial)
   - Dados técnicos do terreno
   - Parâmetros urbanísticos
   - Solicitação de análise de viabilidade, layout e recomendações
4. **Processamento da resposta**: Extrai JSON estruturado com:
   - Cálculos validados
   - Distribuição de lojas
   - Análise de viabilidade
   - Recomendações específicas
   - Pontuação de viabilidade (0-100)

**Prompt da IA**:

```
Você é um especialista em planejamento urbano e desenvolvimento de strip malls comerciais.

Analise o seguinte terreno e forneça um estudo de massa e volumetria detalhado:

DADOS DO TERRENO:
- Área total: {totalArea} m²
- Dimensões: {width}m x {length}m
- Taxa de ocupação: {occupancyRate}%
- Coeficiente de aproveitamento: {floorAreaRatio}
- Recuos: frontal {frontSetback}m, lateral {sideSetback}m, fundos {rearSetback}m

Forneça uma análise completa incluindo:
1. Cálculo de área construível máxima
2. Número de pavimentos recomendado
3. Quantidade ideal de lojas e suas dimensões
4. Vagas de estacionamento necessárias
5. Layout otimizado
6. Análise de viabilidade comercial
7. Recomendações específicas

Responda em JSON estruturado com os campos:
buildableArea, maxFloors, storeCount, parkingSpaces, 
layoutDescription, viabilityAnalysis, recommendations, viabilityScore
```

### 3. Visualização de Resultados

A página de detalhes do projeto (`ProjectDetail.tsx`) apresenta:

- **Aba "Dados do Terreno"**: Dimensões e parâmetros urbanísticos
- **Aba "Análise Volumétrica"**: Resultados dos cálculos e análise da IA
- **Aba "Relatório"**: Visualização completa para exportação

## Fluxo de Uso

1. **Usuário faz login** via Manus OAuth
2. **Cria novo projeto** preenchendo formulário com dados do terreno
3. **Acessa detalhes** do projeto criado
4. **Clica em "Analisar com IA"** para gerar estudo volumétrico
5. **Visualiza resultados** nas abas de análise
6. **Exporta relatório** (funcionalidade futura)

## Cálculos Implementados

### Área Construível

```
área_ocupada = área_total × (taxa_ocupação / 100)
área_construível = área_ocupada × coeficiente_aproveitamento
```

### Vagas de Estacionamento

Baseado em normas típicas brasileiras:
- 1 vaga a cada 25-30 m² de área construída para comércio
- Mínimo de 1 vaga por loja

```
vagas = max(
  área_construível / 25,
  quantidade_lojas
)
```

### Distribuição de Lojas

A IA analisa a área disponível e sugere:
- Lojas pequenas: 40-60 m²
- Lojas médias: 80-120 m²
- Lojas âncora: 200-400 m²

## Segurança

- **Autenticação**: OAuth via Manus (JWT em cookies HTTP-only)
- **Autorização**: Procedures protegidas com `protectedProcedure`
- **Validação**: Inputs validados via Zod no tRPC
- **Isolamento**: Usuários só acessam seus próprios projetos

## Performance

- **Queries otimizadas**: Uso de índices no banco de dados
- **Lazy loading**: Componentes carregados sob demanda
- **Cache**: tRPC gerencia cache automático de queries
- **Análise assíncrona**: IA processa em background sem bloquear UI

## Próximas Funcionalidades

- [ ] Upload de plantas e arquivos CAD
- [ ] Visualização 2D do terreno com desenho
- [ ] Visualização 3D interativa da volumetria
- [ ] Geração de relatórios em PDF
- [ ] Análise de insolação e sombreamento
- [ ] Integração com APIs de mapas (coordenadas geográficas)
- [ ] Comparação entre múltiplos cenários
- [ ] Exportação para ferramentas CAD

## Manutenção

### Adicionar Nova Análise

1. Atualizar schema em `drizzle/schema.ts`
2. Executar `pnpm db:push`
3. Adicionar query em `server/db.ts`
4. Criar procedure em `server/projectRouters.ts`
5. Atualizar UI em `client/src/pages/ProjectDetail.tsx`

### Modificar Prompt da IA

Editar função `analyzeProject` em `server/projectRouters.ts`, ajustando:
- Contexto fornecido
- Instruções específicas
- Formato da resposta JSON esperada

### Deploy

A aplicação está configurada para deploy automático via Manus:
1. Criar checkpoint via `webdev_save_checkpoint`
2. Clicar em "Publish" na UI de gerenciamento
3. Aplicação será publicada em `*.manus.space`

## Suporte

Para dúvidas ou problemas técnicos, consulte:
- Documentação do template: `README.md`
- Guia do usuário: `userGuide.md`
- Suporte Manus: https://help.manus.im
