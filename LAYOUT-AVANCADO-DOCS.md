# Funcionalidades Avançadas de Layout

Documentação completa das funcionalidades avançadas de gerenciamento de layout implementadas no sistema Strip Mall Volumetria IA.

---

## 📋 Índice

1. [Visualização Comparativa de Layouts](#visualização-comparativa-de-layouts)
2. [Otimização Automática com IA](#otimização-automática-com-ia)
3. [Exportação para PDF](#exportação-para-pdf)
4. [Arquitetura Técnica](#arquitetura-técnica)
5. [Testes](#testes)

---

## 1. Visualização Comparativa de Layouts

### Descrição

Permite selecionar e comparar **2 a 3 layouts salvos** lado a lado, visualizando métricas detalhadas e identificando o layout recomendado.

### Funcionalidades

- **Seleção Múltipla**: Escolha até 3 layouts para comparação simultânea
- **Canvas Visual**: Visualização gráfica de cada layout com polígono do terreno e edifício
- **Métricas Comparativas**:
  - Taxa de Ocupação (%)
  - Área Construída (m²)
  - Área Desperdiçada (m²)
  - Score Geral (0-100)
  - Conformidade com Recuos (✅/❌)
- **Layout Recomendado**: Destaque automático do layout com melhor score
- **Indicadores Visuais**: Cores e ícones para facilitar comparação

### Componente

**`client/src/components/LayoutComparison.tsx`**

```typescript
<LayoutComparison
  projectId={project.id}
  polygonCoordinates={project.polygonCoordinates}
  terrainDimensions={{
    width: project.width || 50,
    length: project.length || 100,
    area: project.area,
  }}
  setbacks={{
    frontal: project.recuoFrontal || 5,
    lateral: project.recuoLateral || 3,
    fundos: project.recuoFundos || 3,
  }}
/>
```

### Cálculo de Score

```
Score Base = 100 pontos

Penalidades:
- Violação de recuo: -20 pontos por violação

Bônus:
- Aproveitamento acima de 50%: +10 pontos por cada 10% adicional
- Rotação ortogonal (0°, 90°, 180°, 270°): +10 pontos

Score Final = max(0, min(100, Score Base + Bônus - Penalidades))
```

---

## 2. Otimização Automática com IA

### Descrição

Algoritmo inteligente que **sugere automaticamente o layout ótimo** considerando múltiplos fatores: maximização de aproveitamento, respeito aos recuos, orientação solar ideal e minimização de áreas mortas.

### Funcionalidades

- **Análise Inteligente**: Considera terreno, recuos e preferências do usuário
- **Múltiplos Critérios**:
  - Maximização da taxa de ocupação
  - Respeito obrigatório aos recuos
  - Orientação solar ideal (fachada norte no hemisfério sul)
  - Minimização de áreas desperdiçadas
  - Preferência por rotações ortogonais
- **Justificativa Detalhada**: Explicação textual das decisões tomadas
- **Métricas Completas**: Taxa de ocupação, área construída, desperdício, orientação solar
- **Aplicação Opcional**: Usuário pode aceitar ou rejeitar a sugestão

### Serviço

**`server/services/layoutOptimizationService.ts`**

#### Algoritmo de Otimização

1. **Calcular Escala Máxima**
   ```typescript
   availableWidth = terrainWidth - (lateralSetback * 2)
   availableLength = terrainLength - frontalSetback - fundosSetback
   maxScale = min(availableWidth/terrainWidth, availableLength/terrainLength) * 100
   ```

2. **Calcular Posição Ideal**
   ```typescript
   offsetX = 0 // Centralizado horizontalmente
   offsetY = (fundosSetback - frontalSetback) / terrainLength * 50
   ```

3. **Calcular Rotação Ideal**
   - Se `prioritizeSolar = true`: rotação = 0° (fachada norte)
   - Caso contrário: rotação = 0° (sem rotação)

4. **Validar Recuos**
   - Verificar se layout proposto respeita todos os recuos
   - Se houver violações, ajustar escala e posição

5. **Calcular Score**
   - Score base: 100 pontos
   - Bônus por aproveitamento: +(ocupação - 50) * 0.5
   - Penalidade por desperdício: -área_desperdiçada * 0.01
   - Bônus por rotação ortogonal: +10 pontos
   - Limitar entre 0 e 100

### Uso no Frontend

**Botão "Otimizar" no `BuildingLayoutAdjuster`**

```typescript
<Button 
  onClick={() => {
    optimizeMutation.mutate({
      terrain: terrainDimensions,
      setbacks,
      preferences: {
        prioritizeOccupancy: true,
        prioritizeSolar: true,
      },
    });
  }}
  variant="outline"
>
  <Sparkles className="h-4 w-4 mr-2" />
  Otimizar
</Button>
```

### Dialog de Resultado

Exibe:
- **Score Geral** (0-100) com código de cores
- **Justificativa** textual das decisões
- **Métricas**: Taxa de ocupação, área construída, desperdício, orientação solar
- **Parâmetros**: Posição X/Y, rotação, escala
- **Botões**: "Cancelar" ou "Aplicar Layout"

---

## 3. Exportação para PDF

### Descrição

Gera **documento PDF comparativo** com todos os layouts salvos, incluindo visualizações, parâmetros técnicos, validação de recuos e recomendação do melhor layout.

### Funcionalidades

- **Exportação Completa**: Todos os layouts salvos ou seleção específica
- **Conteúdo do PDF**:
  - Informações do terreno (área, dimensões, recuos)
  - Tabela comparativa (ocupação, área, recuos, score)
  - Detalhes de cada layout:
    - Parâmetros (posição, rotação, escala)
    - Métricas (aproveitamento, desperdício)
    - Validação de recuos (✅ OK ou ❌ violações)
    - Avisos (rotações não-ortogonais, taxa alta)
  - Recomendação final (layout com melhor score)
- **Download Automático**: Arquivo PDF baixado diretamente no navegador
- **Nome Inteligente**: `comparacao-layouts-{nome-projeto}.pdf`

### Serviço

**`server/services/layoutPdfExportService.ts`**

Gera markdown estruturado que é convertido para PDF usando `manus-md-to-pdf`.

#### Estrutura do Markdown

```markdown
# Comparação de Layouts

**Projeto:** Nome do Projeto
**Data:** DD/MM/AAAA

---

## Informações do Terreno

- **Área Total:** X m²
- **Dimensões:** X m × Y m
- **Recuo Frontal:** X m
- **Recuo Lateral:** X m
- **Recuo de Fundos:** X m

---

## Tabela Comparativa

| Layout | Taxa de Ocupação | Área Construída | Área Desperdiçada | Recuos | Score |
|--------|------------------|-----------------|-------------------|--------|-------|
| ...    | ...              | ...             | ...               | ...    | ...   |

---

## Detalhes dos Layouts

### Nome do Layout

**Parâmetros:**
- Posição X: X%
- Posição Y: Y%
- Rotação: X°
- Escala: X%

**Métricas:**
- Taxa de Ocupação: X%
- Área Construída: X m²
- Área Desperdiçada: X m²
- Score Geral: X/100

**Validação de Recuos:**
✅ Todos os recuos obrigatórios respeitados
ou
❌ X violação(ões) detectada(s):
- tipo: Exigido Xm, atual Xm (faltam Xm)

---

## 🎯 Recomendação

O layout "Nome" apresenta o melhor score geral (X/100) e é recomendado para este projeto.
```

### Uso no Frontend

**Botão "Exportar Comparação PDF" no `SavedLayoutsManager`**

```typescript
<Button
  onClick={() => exportPdfMutation.mutate({ projectId })}
  variant="outline"
  disabled={!layouts || layouts.length === 0}
>
  <FileDown className="h-4 w-4 mr-2" />
  Exportar Comparação PDF
</Button>
```

### Processo de Exportação

1. **Buscar layouts** do projeto no banco de dados
2. **Gerar markdown** com todas as informações
3. **Salvar markdown** temporário em `/tmp`
4. **Converter para PDF** usando `manus-md-to-pdf`
5. **Ler PDF** e converter para base64
6. **Enviar para frontend** como base64
7. **Download automático** no navegador
8. **Limpar arquivos** temporários

---

## 4. Arquitetura Técnica

### Backend

#### Routers tRPC

1. **`layoutValidationRouter`** (`server/layoutValidationRouter.ts`)
   - `validateSetbacks`: Valida recuos de um layout

2. **`savedLayoutRouter`** (`server/savedLayoutRouter.ts`)
   - `create`: Salva novo layout
   - `list`: Lista layouts de um projeto
   - `load`: Carrega layout específico
   - `delete`: Remove layout

3. **`layoutOptimizationRouter`** (`server/layoutOptimizationRouter.ts`)
   - `optimize`: Otimiza layout automaticamente

4. **`layoutPdfExportRouter`** (`server/layoutPdfExportRouter.ts`)
   - `exportPdf`: Exporta comparação para PDF

#### Serviços

1. **`setbackValidationService.ts`**
   - `validateSetbacks()`: Valida recuos
   - Retorna: `{ isValid, violations, warnings, actualSetbacks }`

2. **`layoutOptimizationService.ts`**
   - `optimizeLayout()`: Otimiza layout
   - `calculateMaxScale()`: Calcula escala máxima
   - `calculateIdealPosition()`: Calcula posição ideal
   - `calculateIdealRotation()`: Calcula rotação ideal
   - `adjustForViolations()`: Ajusta layout para corrigir violações

3. **`layoutPdfExportService.ts`**
   - `generateLayoutComparisonMarkdown()`: Gera markdown
   - Inclui tabelas, métricas, validações e recomendação

4. **`layoutDescriptionService.ts`**
   - `generateLayoutDescription()`: Gera descrição textual do layout
   - Usado nos prompts de geração de imagens

#### Schema do Banco

**Tabela `savedLayouts`** (`drizzle/schema.ts`)

```typescript
export const savedLayouts = mysqlTable("savedLayouts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  offsetX: int("offsetX").notNull().default(0),
  offsetY: int("offsetY").notNull().default(0),
  rotation: int("rotation").notNull().default(0),
  scale: int("scale").notNull().default(80),
  isValid: int("isValid").notNull().default(1), // 1 = válido, 0 = inválido
  isActive: int("isActive").notNull().default(1), // 1 = ativo, 0 = deletado
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

**Campos adicionados em `projects`**

```typescript
buildingOffsetX: int("buildingOffsetX").default(0),
buildingOffsetY: int("buildingOffsetY").default(0),
buildingRotation: int("buildingRotation").default(0),
buildingScale: int("buildingScale").default(80),
```

### Frontend

#### Componentes

1. **`BuildingLayoutAdjuster.tsx`**
   - Controles interativos de layout
   - Validação em tempo real
   - Botão "Otimizar"
   - Dialog de resultado da otimização

2. **`SavedLayoutsManager.tsx`**
   - Lista de layouts salvos
   - Botão "Salvar Layout Atual"
   - Botão "Exportar Comparação PDF"
   - Carregar/deletar layouts

3. **`LayoutComparison.tsx`**
   - Seleção de 2-3 layouts
   - Canvas visual de cada layout
   - Métricas comparativas
   - Destaque do layout recomendado

4. **`ImagePolygonOverlay.tsx`**
   - Overlay de validação visual
   - Sobreposição do polígono do terreno sobre imagens
   - Controles de opacidade

#### Integração

**Página `ProjectDetail.tsx`**

```typescript
<BuildingLayoutAdjuster
  polygonCoordinates={project.polygonCoordinates}
  terrainDimensions={...}
  setbacks={...}
  onSave={(layout) => updateProjectMutation.mutate({...})}
/>

<SavedLayoutsManager
  projectId={project.id}
  currentLayout={...}
  onLoadLayout={(layout) => updateProjectMutation.mutate({...})}
/>

<LayoutComparison
  projectId={project.id}
  polygonCoordinates={...}
  terrainDimensions={...}
  setbacks={...}
/>
```

---

## 5. Testes

### Arquivo de Testes

**`server/__tests__/layoutAdvancedFeatures.test.ts`**

### Cobertura

**Layout Optimization Service (5 testes)**

1. ✅ `should optimize layout for maximum occupancy`
2. ✅ `should respect setbacks in optimized layout`
3. ✅ `should prioritize solar orientation when requested`
4. ✅ `should calculate metrics correctly`
5. ✅ `should generate higher scores for better layouts`

**Layout PDF Export Service (5 testes)**

1. ✅ `should generate markdown for single layout`
2. ✅ `should generate markdown for multiple layouts`
3. ✅ `should include recommendation for best layout`
4. ✅ `should show validation status correctly`
5. ✅ `should include all required sections`

### Executar Testes

```bash
pnpm test layoutAdvancedFeatures
```

**Resultado:**
```
✓ server/__tests__/layoutAdvancedFeatures.test.ts (10)
  ✓ Layout Optimization Service (5)
  ✓ Layout PDF Export Service (5)

Test Files  1 passed (1)
     Tests  10 passed (10)
  Duration  404ms
```

---

## 🎯 Fluxo de Uso Completo

1. **Ajustar Layout Manualmente**
   - Usar `BuildingLayoutAdjuster` para posicionar edifício
   - Validação automática de recuos em tempo real
   - Salvar layout com nome e descrição

2. **Otimizar Automaticamente** (Opcional)
   - Clicar em "Otimizar" no `BuildingLayoutAdjuster`
   - Revisar sugestão da IA
   - Aplicar ou rejeitar

3. **Salvar Múltiplos Layouts**
   - Criar variações (frontal, lateral, aproveitamento máximo, etc.)
   - Cada layout salvo no banco de dados

4. **Comparar Layouts**
   - Usar `LayoutComparison` para selecionar 2-3 layouts
   - Visualizar métricas lado a lado
   - Identificar layout recomendado

5. **Exportar para PDF**
   - Clicar em "Exportar Comparação PDF"
   - Documento gerado automaticamente
   - Download direto no navegador

6. **Gerar Imagens com Layout**
   - Parâmetros de layout são incluídos nos prompts de IA
   - Imagens geradas respeitam posicionamento configurado

---

## 📊 Benefícios

- ✅ **Precisão**: Validação automática de recuos evita erros
- ✅ **Eficiência**: Otimização automática economiza tempo
- ✅ **Comparação**: Visualização lado a lado facilita decisão
- ✅ **Documentação**: PDF profissional para apresentação ao cliente
- ✅ **Flexibilidade**: Múltiplos layouts salvos para diferentes cenários
- ✅ **Inteligência**: IA sugere melhor aproveitamento do terreno

---

## 🔄 Próximas Melhorias Sugeridas

1. **Histórico de Versões**: Rastrear mudanças em cada layout ao longo do tempo
2. **Compartilhamento**: Permitir compartilhar layouts entre projetos similares
3. **Templates**: Criar templates de layout para tipos comuns de terreno
4. **Análise de Sombreamento**: Considerar sombreamento entre edifícios vizinhos
5. **Otimização Multi-Objetivo**: Balancear múltiplos critérios com pesos configuráveis

---

**Documentação gerada em:** 23/11/2025  
**Versão do Sistema:** 1.0.0  
**Autor:** Strip Mall Volumetria IA
