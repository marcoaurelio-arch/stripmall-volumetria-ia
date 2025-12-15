# Documentação: Sistema de Layout Personalizado e Validação de Recuos

## 📋 Visão Geral

Este documento descreve as funcionalidades avançadas implementadas para permitir controle preciso do posicionamento do edifício dentro do terreno, validação automática de recuos obrigatórios e gerenciamento de múltiplos layouts salvos.

---

## 🎯 Funcionalidades Implementadas

### 1. **Integração de Layout nos Prompts de IA**

**Objetivo:** Permitir que o layout personalizado (posição, rotação, escala) seja considerado pela IA ao gerar imagens.

**Implementação:**

- **Serviço de Descrição de Layout** (`server/services/layoutDescriptionService.ts`)
  - `generateLayoutDescription()`: Gera descrição textual para estudos conceituais 3D
  - `generateFloorplanLayoutDescription()`: Descrição técnica para plantas baixas
  - `generateSiteplanLayoutDescription()`: Descrição para implantação
  - Converte parâmetros numéricos em instruções textuais para a IA

- **Integração nos Prompts:**
  - `generateConceptual`: Adiciona descrição de layout ao prompt de estudo conceitual
  - `generateFloorplan`: Adiciona parâmetros de layout à planta baixa
  - `generateSitePlan`: Integra configuração de layout na implantação
  - `generateFacadeView`: Considera rotação e posicionamento nas fachadas

**Parâmetros de Layout:**
```typescript
{
  offsetX: number;    // -50 a 50 (percentual horizontal)
  offsetY: number;    // -50 a 50 (percentual vertical)
  rotation: number;   // 0 a 360 graus
  scale: number;      // 50 a 100 (percentual da área)
}
```

**Exemplo de Descrição Gerada:**
```
CUSTOM BUILDING LAYOUT (CRITICAL - MUST FOLLOW EXACTLY):
- Building positioned 20% to the right of lot center
- Building positioned 10% towards the front of the lot
- Building rotated 45° clockwise (main facade facing Northeast)
- Building footprint scaled to 90% of default size (larger than typical)
- Ensure the building respects these positioning parameters while staying within lot boundaries
- Parking and circulation must adapt to this custom building placement
```

---

### 2. **Validação Automática de Recuos Obrigatórios**

**Objetivo:** Detectar automaticamente se o edifício posicionado viola os recuos obrigatórios (frontal, lateral, fundos).

**Implementação:**

- **Serviço de Validação** (`server/services/setbackValidationService.ts`)
  - `validateSetbacks()`: Calcula e valida recuos em todas as direções
  - `formatViolationMessage()`: Formata mensagens de violação para o usuário
  - `suggestCorrection()`: Sugere correção automática para resolver violações

- **Router tRPC** (`server/layoutValidationRouter.ts`)
  - `validateSetbacks`: Query que retorna resultado de validação
  - `suggestCorrection`: Mutation que sugere layout corrigido

- **Componente Visual** (`client/src/components/BuildingLayoutAdjuster.tsx`)
  - Validação em tempo real enquanto o usuário ajusta o layout
  - Indicadores visuais: ✅ verde (válido) ou ⚠️ vermelho (violações)
  - Lista detalhada de violações com valores exigidos vs. atuais
  - Botão "Salvar" desabilitado quando há violações

**Tipos de Violação:**
- **Frontal:** Distância da borda frontal do terreno
- **Lateral Esquerda:** Distância da borda esquerda
- **Lateral Direita:** Distância da borda direita
- **Fundos:** Distância da borda de fundos

**Severidade:**
- **Critical:** Violação ≥ 2.0m
- **Moderate:** Violação ≥ 1.0m e < 2.0m
- **Minor:** Violação < 1.0m

**Avisos Adicionais:**
- Rotação não-ortogonal (pode dificultar aprovação)
- Taxa de ocupação alta (> 70%)

**Exemplo de Validação:**
```typescript
{
  isValid: false,
  violations: [
    {
      type: "frontal",
      required: 5.00,
      actual: 2.50,
      violation: 2.50,
      severity: "critical",
      message: "Recuo Frontal: Exigido 5.00m, atual 2.50m (faltam 2.50m)"
    }
  ],
  warnings: [
    "⚠️ 1 violação(ões) de recuo detectada(s)",
    "⚠️ Rotação não-ortogonal pode dificultar aprovação"
  ],
  buildingFootprint: {
    width: 40,
    height: 32
  },
  actualSetbacks: {
    frontal: 2.50,
    lateral_esquerda: 5.00,
    lateral_direita: 5.00,
    fundos: 4.00
  }
}
```

---

### 3. **Sistema de Histórico de Layouts**

**Objetivo:** Permitir salvar, carregar, comparar e gerenciar múltiplas configurações de layout por projeto.

**Implementação:**

- **Schema do Banco** (`drizzle/schema.ts`)
  - Tabela `savedLayouts` com campos:
    - `id`, `projectId`, `name`, `description`
    - `offsetX`, `offsetY`, `rotation`, `scale`
    - `isValid`, `validationNotes`
    - `isActive`, `createdAt`, `updatedAt`

- **Router tRPC** (`server/savedLayoutRouter.ts`)
  - `list`: Listar layouts salvos de um projeto
  - `create`: Criar novo layout salvo
  - `load`: Carregar layout salvo (retorna parâmetros)
  - `delete`: Deletar layout (soft delete)
  - `get`: Obter detalhes de um layout específico

- **Componente de Gerenciamento** (`client/src/components/SavedLayoutsManager.tsx`)
  - Botão "Salvar Layout Atual" com dialog
  - Lista de layouts salvos com informações resumidas
  - Botões para carregar (⬇️) ou deletar (🗑️) cada layout
  - Indicadores visuais de validade (✅ válido, ⚠️ inválido)
  - Exibição de parâmetros: posição, rotação, escala

**Fluxo de Uso:**

1. **Salvar Layout:**
   - Usuário ajusta layout no BuildingLayoutAdjuster
   - Clica em "Salvar Layout Atual" no SavedLayoutsManager
   - Preenche nome e descrição opcional
   - Layout é salvo no banco de dados

2. **Carregar Layout:**
   - Usuário visualiza lista de layouts salvos
   - Clica no botão ⬇️ do layout desejado
   - Layout é aplicado ao projeto (atualiza buildingOffsetX/Y, rotation, scale)
   - BuildingLayoutAdjuster reflete as mudanças

3. **Comparar Layouts:**
   - Usuário pode salvar múltiplas variações
   - Cada layout mostra resumo dos parâmetros
   - Facilita escolha do melhor aproveitamento

4. **Deletar Layout:**
   - Usuário clica no botão 🗑️
   - Confirmação é solicitada
   - Layout é marcado como inativo (soft delete)

**Exemplo de Layout Salvo:**
```
Nome: Layout Frontal Otimizado
Descrição: Maximiza visibilidade da rua principal
Parâmetros:
  - Posição: X=-10%, Y=-15%
  - Rotação: 0°
  - Escala: 85%
Status: ✅ Válido
```

---

## 🗂️ Estrutura de Arquivos

### Backend

```
server/
├── services/
│   ├── layoutDescriptionService.ts       # Geração de descrições de layout
│   └── setbackValidationService.ts       # Validação de recuos
├── layoutValidationRouter.ts             # Router tRPC de validação
├── savedLayoutRouter.ts                  # Router tRPC de layouts salvos
└── __tests__/
    └── layoutValidation.test.ts          # Testes unitários (15 testes)
```

### Frontend

```
client/src/components/
├── BuildingLayoutAdjuster.tsx            # Ajuste visual de layout
├── SavedLayoutsManager.tsx               # Gerenciamento de layouts salvos
└── ImagePolygonOverlay.tsx               # Overlay de validação visual
```

### Database

```
drizzle/
├── schema.ts                             # Schema com tabela savedLayouts
└── migrations/
    └── 0023_strong_stingray.sql          # Migration da tabela
```

---

## 🧪 Testes

**Arquivo:** `server/__tests__/layoutValidation.test.ts`

**Cobertura:** 15 testes, todos passando ✅

**Categorias:**

1. **Validação de Recuos (13 testes)**
   - Layout centralizado sem violações
   - Detecção de violação frontal
   - Detecção de violação lateral esquerda
   - Detecção de violação lateral direita
   - Detecção de violação de fundos
   - Cálculo correto de recuos atuais
   - Classificação de severidade
   - Avisos para rotações não-ortogonais
   - Formatação de mensagens
   - Sugestão de correção
   - Edifícios rotacionados
   - Escala máxima e mínima

2. **Descrição de Layout (2 testes)**
   - Descrição vazia para layout padrão
   - Descrição completa para layout customizado

**Executar Testes:**
```bash
pnpm test layoutValidation.test.ts
```

---

## 📊 Fluxo de Dados

### 1. Ajuste de Layout

```
Usuário arrasta edifício no canvas
    ↓
BuildingLayoutAdjuster atualiza estado local
    ↓
trpc.layoutValidation.validateSetbacks (query)
    ↓
Validação em tempo real
    ↓
Exibe resultado (válido/inválido)
    ↓
Usuário clica "Salvar Layout"
    ↓
trpc.project.update (mutation)
    ↓
Atualiza buildingOffsetX/Y/Rotation/Scale no banco
```

### 2. Geração de Imagens

```
Usuário clica "Gerar Estudo Conceitual"
    ↓
trpc.image.generateConceptual (mutation)
    ↓
Carrega projeto do banco (com buildingOffsetX/Y/Rotation/Scale)
    ↓
generateLayoutDescription() gera descrição textual
    ↓
Descrição é adicionada ao prompt
    ↓
Prompt enviado para IA de geração de imagens
    ↓
Imagem gerada considera layout personalizado
```

### 3. Salvamento de Layout

```
Usuário clica "Salvar Layout Atual"
    ↓
Dialog abre com campos de nome e descrição
    ↓
Usuário preenche e confirma
    ↓
trpc.savedLayout.create (mutation)
    ↓
Layout salvo no banco (savedLayouts table)
    ↓
Lista de layouts atualizada
```

### 4. Carregamento de Layout

```
Usuário clica botão ⬇️ de um layout salvo
    ↓
trpc.savedLayout.load (mutation)
    ↓
Retorna parâmetros do layout
    ↓
trpc.project.update aplica ao projeto
    ↓
BuildingLayoutAdjuster reflete mudanças
```

---

## 🎨 Interface do Usuário

### BuildingLayoutAdjuster

**Localização:** Aba "Dados" → Seção "Ajuste Manual de Layout"

**Componentes:**
- **Canvas Interativo (800x600px)**
  - Terreno em azul (borda sólida, preenchimento transparente)
  - Edifício em vermelho (borda tracejada, preenchimento transparente)
  - Marcador de centro (cruz)
  - Drag-and-drop para mover edifício

- **Controles:**
  - Slider de Rotação (0-360°, step 5°)
  - Slider de Escala (50-100%, step 5%)
  - Botão "Resetar" (volta para padrão)
  - Botão "Salvar Layout" (desabilitado se inválido)

- **Painel de Validação:**
  - Fundo verde (✅) se válido, vermelho (⚠️) se inválido
  - Lista de violações com detalhes
  - Avisos adicionais

### SavedLayoutsManager

**Localização:** Aba "Dados" → Logo após BuildingLayoutAdjuster

**Componentes:**
- **Botão "Salvar Layout Atual"**
  - Abre dialog com campos de nome e descrição
  - Mostra resumo da configuração atual

- **Lista de Layouts Salvos:**
  - Card para cada layout com:
    - Nome e ícone de status (✅/⚠️)
    - Descrição (se houver)
    - Parâmetros resumidos
    - Botões de ação (⬇️ Carregar, 🗑️ Deletar)

- **Estado Vazio:**
  - Ícone de camadas
  - Mensagem "Nenhum layout salvo ainda"
  - Instrução para salvar primeiro layout

---

## 🔧 Configuração

### Recuos Padrão

Se o projeto não tiver recuos definidos, os seguintes valores padrão são usados:

```typescript
{
  frontal: 5,  // 5 metros
  lateral: 3,  // 3 metros
  fundos: 3,   // 3 metros
}
```

### Layout Padrão

Quando nenhum layout personalizado foi configurado:

```typescript
{
  offsetX: 0,      // Centralizado horizontalmente
  offsetY: 0,      // Centralizado verticalmente
  rotation: 0,     // Sem rotação
  scale: 80,       // 80% da área disponível
}
```

---

## 🚀 Próximas Melhorias Sugeridas

1. **Visualização Comparativa:**
   - Exibir múltiplos layouts lado a lado
   - Destacar diferenças entre layouts
   - Métricas de comparação (aproveitamento, recuos, etc.)

2. **Otimização Automática:**
   - Algoritmo para sugerir layout ótimo
   - Maximizar aproveitamento respeitando recuos
   - Considerar orientação solar

3. **Exportação de Layouts:**
   - Exportar layouts como PDF ou imagem
   - Incluir validação e parâmetros
   - Facilitar apresentação para clientes

4. **Histórico de Versões:**
   - Rastrear mudanças em cada layout
   - Permitir reverter para versões anteriores
   - Comparar versões de um mesmo layout

5. **Integração com Relatórios:**
   - Incluir layout escolhido em relatórios PDF
   - Gráficos comparativos de layouts
   - Justificativa da escolha

---

## 📝 Notas Técnicas

### Cálculo de Recuos

O algoritmo de validação:

1. Calcula dimensões do edifício baseado na escala
2. Calcula posição do centro baseado nos offsets
3. Calcula limites do edifício (bounding box)
4. Ajusta para rotação (usa bounding box rotacionado)
5. Calcula distâncias até as bordas do terreno
6. Compara com recuos exigidos
7. Gera lista de violações e avisos

### Persistência

- **Layout Atual:** Armazenado nos campos do projeto (`buildingOffsetX`, `buildingOffsetY`, `buildingRotation`, `buildingScale`)
- **Layouts Salvos:** Armazenados na tabela `savedLayouts` com soft delete
- **Validação:** Calculada em tempo real, não armazenada (sempre recalculada)

### Performance

- Validação é query (não mutation) → pode ser cached
- Canvas redesenha apenas quando layout muda
- Layouts salvos carregados sob demanda

---

## 🐛 Troubleshooting

### Layout não aparece no canvas

**Causa:** Coordenadas do polígono inválidas

**Solução:** Verificar se `project.polygonCoordinates` está preenchido corretamente

### Validação sempre retorna inválido

**Causa:** Recuos muito grandes para o terreno

**Solução:** Ajustar recuos ou aumentar escala do terreno

### Layouts salvos não aparecem

**Causa:** `isActive = 0` (soft delete)

**Solução:** Verificar query que filtra por `isActive = 1`

### Imagens geradas não respeitam layout

**Causa:** Descrição de layout não está sendo adicionada ao prompt

**Solução:** Verificar se `generateLayoutDescription()` está sendo chamado e adicionado ao prompt

---

## ✅ Checklist de Implementação

- [x] Serviço de descrição de layout
- [x] Integração nos prompts de IA
- [x] Serviço de validação de recuos
- [x] Router tRPC de validação
- [x] Componente BuildingLayoutAdjuster
- [x] Validação em tempo real
- [x] Schema de layouts salvos
- [x] Migration do banco
- [x] Router tRPC de layouts salvos
- [x] Componente SavedLayoutsManager
- [x] Integração na página ProjectDetail
- [x] Testes unitários (15 testes)
- [x] Documentação completa

---

**Versão:** 1.0  
**Data:** 23/01/2025  
**Autor:** Sistema Manus AI
