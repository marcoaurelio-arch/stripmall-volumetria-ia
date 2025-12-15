# Funcionalidades Avançadas de Layout - Documentação Completa

## Visão Geral

Este documento descreve as funcionalidades avançadas implementadas no sistema de estudos volumétricos, focadas em análise de sombreamento, templates de layout e otimização multi-objetivo.

---

## 1. Análise de Sombreamento Solar

### Descrição
Sistema completo de cálculo e visualização de sombreamento baseado na posição do sol ao longo do dia e estações do ano.

### Componentes

#### 1.1 Serviço de Cálculo Solar (`shadowAnalysisService.ts`)
- **`calculateSolarPosition(latitude, longitude, datetime)`**: Calcula azimute e elevação do sol
- **`projectShadow(input, solarPosition)`**: Projeta polígono de sombra do edifício
- **`analyzeShadow(input)`**: Análise completa de sombreamento para um horário específico
- **`analyzeShadowMultipleHours(input, date, hours)`**: Análise em múltiplos horários
- **`analyzeShadowSeasons(input, year)`**: Análise em diferentes estações

#### 1.2 Router tRPC (`shadowAnalysisRouter.ts`)
- **`analyze`**: Analisa sombreamento para layout e horário específicos
- **`analyzeMultipleHours`**: Analisa sombreamento em 3 horários (8h, 12h, 16h)
- **`analyzeSeasons`**: Analisa sombreamento nas 4 estações do ano

#### 1.3 Componente de Visualização (`ShadowVisualization.tsx`)
- Canvas interativo mostrando terreno, edifício e sombra projetada
- Controles de horário (slider 6h-18h)
- Seleção de estação (verão, inverno, primavera, outono)
- Métricas em tempo real:
  - Comprimento da sombra
  - Direção da sombra
  - Percentual de cobertura do terreno
  - Horas de sol estimadas

### Algoritmo de Cálculo Solar

Baseado no **NOAA Solar Calculator**, o algoritmo calcula:

1. **Dia Juliano** e **Século Juliano** a partir da data
2. **Longitude média do sol** e **anomalia média**
3. **Equação do centro** e **longitude verdadeira**
4. **Ascensão reta** e **declinação**
5. **Equação do tempo** para correção
6. **Ângulo horário** baseado em longitude e tempo
7. **Azimute** e **Elevação** finais

### Exemplo de Uso

```typescript
const analysis = await trpc.shadowAnalysis.analyze.mutate({
  buildingLayout: {
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    scale: 80,
  },
  buildingHeight: 8,
  terrain: {
    width: 50,
    length: 100,
    area: 5000,
  },
  location: {
    latitude: -23.55,
    longitude: -46.63,
  },
  datetime: new Date('2024-06-21T12:00:00Z'),
});

console.log(analysis.shadow.length); // Comprimento da sombra em metros
console.log(analysis.shadow.coverage); // Percentual do terreno sombreado
```

---

## 2. Templates de Layout

### Descrição
Biblioteca de 9 templates pré-configurados para diferentes tipos de terreno, permitindo aplicação rápida de layouts otimizados.

### Categorias de Templates

#### 2.1 Terreno Retangular (3 templates)
- **Centralizado**: Layout simétrico no centro do terreno
- **Frontal**: Edifício posicionado próximo à frente
- **Maximizado**: Escala máxima respeitando recuos

#### 2.2 Terreno em L (2 templates)
- **Canto Interno**: Aproveitamento do canto interno do L
- **Distribuído**: Layout distribuído ao longo do L

#### 2.3 Terreno de Esquina (2 templates)
- **Dupla Fachada**: Destaque para ambas as frentes
- **Esquina Chanfrada**: Layout angular para esquina

#### 2.4 Terreno Irregular (2 templates)
- **Adaptativo**: Ajusta-se à forma irregular
- **Compacto**: Minimiza desperdício em terrenos irregulares

### Estrutura de Template

```typescript
interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'retangular' | 'L' | 'esquina' | 'irregular';
  layout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  };
  preview: string; // SVG path para visualização
  pros: string[];
  cons: string[];
  recommendedFor: string[];
}
```

### Componentes

#### 2.1 Serviço de Templates (`layoutTemplatesService.ts`)
- **`LAYOUT_TEMPLATES`**: Array com 9 templates pré-definidos
- **`getTemplatesByCategory(category)`**: Filtra templates por categoria
- **`getTemplateById(id)`**: Busca template específico
- **`recommendTemplates(terrain)`**: Recomenda templates baseado em características do terreno
- **`applyTemplate(templateId, terrain)`**: Aplica template ajustando para terreno específico

#### 2.2 Router tRPC (`layoutTemplatesRouter.ts`)
- **`list`**: Lista todos os templates
- **`byCategory`**: Busca por categoria
- **`byId`**: Busca por ID
- **`recommend`**: Recomenda templates
- **`applyTemplate`**: Aplica template

#### 2.3 Componente de Galeria (`LayoutTemplatesGallery.tsx`)
- Grid de templates com preview visual
- Tabs para filtrar por categoria
- Badge "Recomendado" para templates sugeridos
- Dialog de detalhes com:
  - Preview ampliado
  - Parâmetros do layout
  - Vantagens e considerações
  - Casos de uso recomendados

### Sistema de Recomendação

O algoritmo de recomendação considera:

1. **Forma do terreno**: Retangular, L, esquina ou irregular
2. **Proporções**: Largura vs. comprimento
3. **Área total**: Templates adequados para o tamanho
4. **Características especiais**: Esquina, formato L, etc.

### Exemplo de Uso

```typescript
// Recomendar templates
const recommendations = await trpc.layoutTemplates.recommend.query({
  width: 50,
  length: 100,
  area: 5000,
  isCorner: true,
});

// Aplicar template
const layout = await trpc.layoutTemplates.applyTemplate.mutate({
  templateId: 'esquina-dupla-fachada',
  terrain: {
    width: 50,
    length: 100,
    area: 5000,
    setbacks: {
      frontal: 5,
      lateral: 3,
      fundos: 3,
    },
  },
});

// Usar layout retornado
updateProject({
  buildingOffsetX: layout.offsetX,
  buildingOffsetY: layout.offsetY,
  buildingRotation: layout.rotation,
  buildingScale: layout.scale,
});
```

---

## 3. Otimização Multi-Objetivo

### Descrição
Sistema avançado de otimização que considera múltiplos critérios com pesos configuráveis pelo usuário.

### Critérios de Otimização

#### 3.1 Aproveitamento do Terreno (0-100 pontos)
- Maximiza a taxa de ocupação
- Calcula área construída vs. área total
- Penaliza desperdício de espaço

#### 3.2 Orientação Solar (0-100 pontos)
- **Norte**: 100 pontos (melhor orientação)
- **Sul**: 0 pontos (pior orientação)
- **Leste/Oeste**: 50 pontos
- **Nordeste/Noroeste/Sudeste/Sudoeste**: 75 pontos

#### 3.3 Estética e Simetria (0-100 pontos)
- **Centralização** (0-30 pontos): Proximidade ao centro do terreno
- **Rotação ortogonal** (0-20 pontos): Bonus para rotações 0°, 90°, 180°, 270°
- **Proporção** (0-30 pontos): Escala entre 70-85% recebe pontuação máxima

#### 3.4 Custo Estimado (0-100 pontos)
- Menor escala = menor custo = maior pontuação
- Score = 100 - escala

### Cálculo do Score Final

```typescript
finalScore = 
  (occupancyScore * weightOccupancy / 100) +
  (solarScore * weightSolar / 100) +
  (aestheticsScore * weightAesthetics / 100) +
  (costScore * weightCost / 100)
```

Os pesos são normalizados automaticamente para somar 100%.

### Componentes

#### 3.1 Serviço de Otimização Atualizado (`layoutOptimizationService.ts`)
- **`OptimizationWeights`**: Interface para pesos configuráveis
- **`calculateMultiObjectiveScore()`**: Calcula score baseado em pesos
- **`optimizeLayout(input)`**: Otimização principal com suporte a pesos

#### 3.2 Componente de Configuração (`OptimizationWeightsConfig.tsx`)
- Sliders para ajuste de cada critério (0-100%)
- Visualização em tempo real da distribuição de pesos
- Botão para restaurar pesos padrão
- Gráfico de barras mostrando proporção de cada critério

#### 3.3 Integração no BuildingLayoutAdjuster
- Estado de pesos configuráveis
- Passa pesos para mutation de otimização
- Permite personalização antes de otimizar

### Pesos Padrão

```typescript
{
  occupancy: 40,    // 40% - Aproveitamento
  solar: 30,        // 30% - Orientação Solar
  aesthetics: 20,   // 20% - Estética
  cost: 10,         // 10% - Custo
}
```

### Exemplo de Uso

```typescript
// Otimização com pesos padrão
const result1 = await trpc.layoutOptimization.optimize.mutate({
  terrain: { width: 50, length: 100, area: 5000 },
  setbacks: { frontal: 5, lateral: 3, fundos: 3 },
});

// Otimização priorizando aproveitamento
const result2 = await trpc.layoutOptimization.optimize.mutate({
  terrain: { width: 50, length: 100, area: 5000 },
  setbacks: { frontal: 5, lateral: 3, fundos: 3 },
  weights: {
    occupancy: 70,
    solar: 10,
    aesthetics: 10,
    cost: 10,
  },
});

// Otimização priorizando orientação solar
const result3 = await trpc.layoutOptimization.optimize.mutate({
  terrain: { width: 50, length: 100, area: 5000 },
  setbacks: { frontal: 5, lateral: 3, fundos: 3 },
  weights: {
    occupancy: 10,
    solar: 70,
    aesthetics: 10,
    cost: 10,
  },
});

console.log(result1.score); // Score total (0-100)
console.log(result1.reasoning); // Justificativa textual
console.log(result1.metrics); // Métricas detalhadas
```

---

## Integração no Sistema

### Localização no Projeto

Todas as funcionalidades estão integradas na **aba "Dados"** da página de detalhes do projeto (`ProjectDetail.tsx`):

1. **BuildingLayoutAdjuster**: Ajuste manual + botão "Otimizar" (agora com pesos)
2. **SavedLayoutsManager**: Gerenciamento de layouts salvos
3. **LayoutComparison**: Comparação visual de múltiplos layouts
4. **ShadowVisualization**: Análise de sombreamento
5. **LayoutTemplatesGallery**: Galeria de templates

### Fluxo de Trabalho Recomendado

1. **Escolher Template**: Aplicar template adequado ao tipo de terreno
2. **Ajustar Manualmente**: Refinar posição, rotação e escala
3. **Analisar Sombreamento**: Verificar impacto solar
4. **Configurar Pesos**: Definir prioridades de otimização
5. **Otimizar Automaticamente**: Gerar layout ótimo baseado em pesos
6. **Validar Recuos**: Confirmar conformidade com legislação
7. **Salvar Layout**: Armazenar configuração para comparação
8. **Comparar Layouts**: Avaliar múltiplas opções lado a lado
9. **Exportar PDF**: Gerar documento comparativo profissional

---

## Testes

### Cobertura de Testes

Arquivo: `server/__tests__/advancedLayoutFeatures.test.ts`

#### Shadow Analysis Service (3 testes)
- ✅ Cálculo de posição solar para São Paulo ao meio-dia
- ✅ Cálculo de projeção de sombra
- ✅ Análise de sombreamento ao longo do dia

#### Layout Templates Service (4 testes)
- ✅ Verificação de templates pré-definidos
- ✅ Filtro por categoria
- ✅ Recomendação baseada em características do terreno
- ✅ Aplicação de template com ajuste

#### Multi-Objective Optimization (5 testes)
- ✅ Otimização com pesos padrão
- ✅ Otimização priorizando aproveitamento
- ✅ Otimização priorizando orientação solar
- ✅ Otimização priorizando custo
- ✅ Normalização automática de pesos

**Total: 12/12 testes passando ✅**

---

## Melhorias Futuras Sugeridas

### 1. Análise de Sombreamento
- [ ] Animação de movimento do sol ao longo do dia
- [ ] Mapa de calor de insolação anual
- [ ] Cálculo de potencial fotovoltaico
- [ ] Análise de sombreamento entre edifícios adjacentes

### 2. Templates de Layout
- [ ] Editor visual de templates personalizados
- [ ] Importação/exportação de templates
- [ ] Biblioteca comunitária de templates
- [ ] Templates específicos por região/legislação

### 3. Otimização Multi-Objetivo
- [ ] Salvamento de preferências de pesos do usuário
- [ ] Algoritmo genético para otimização global
- [ ] Otimização considerando custos reais de construção
- [ ] Integração com dados de mercado imobiliário

### 4. Geral
- [ ] Modo de comparação com overlay de sombras
- [ ] Relatório técnico completo em PDF
- [ ] Integração com BIM (Building Information Modeling)
- [ ] API pública para integrações externas

---

## Conclusão

As funcionalidades avançadas implementadas transformam o sistema de estudos volumétricos em uma ferramenta profissional completa, oferecendo:

- **Precisão técnica**: Cálculos baseados em algoritmos científicos
- **Flexibilidade**: Templates e otimização configurável
- **Usabilidade**: Interfaces visuais intuitivas
- **Profissionalismo**: Documentação e validação completas

O sistema agora permite que arquitetos e engenheiros tomem decisões informadas sobre o posicionamento de edifícios, considerando múltiplos fatores técnicos, ambientais e econômicos de forma integrada e eficiente.
