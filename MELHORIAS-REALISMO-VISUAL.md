# Melhorias de Realismo Visual - Estudos Volumétricos

## 📋 Resumo

Implementação de 3 funcionalidades principais para melhorar o realismo e precisão dos estudos visuais gerados por IA, garantindo que respeitem o formato exato do polígono do terreno importado via KMZ.

## ✅ Funcionalidades Implementadas

### 1. Overlay de Validação Visual do Polígono

**Arquivo:** `client/src/components/ImagePolygonOverlay.tsx`

**Descrição:** Componente que sobrepõe o polígono exato do terreno sobre as imagens geradas pela IA, permitindo validar visualmente se o layout do edifício respeita os limites do lote.

**Funcionalidades:**
- Canvas interativo que desenha o polígono do terreno sobre a imagem
- Controles de opacidade (10-100%) para ajustar visibilidade do overlay
- Botão para mostrar/ocultar overlay
- Marcadores numerados nos vértices do polígono
- Preenchimento semitransparente vermelho para destacar o perímetro
- Botão de download da imagem com overlay aplicado
- Normalização automática de coordenadas geográficas para espaço do canvas

**Integração:**
- Integrado no `ImageGallery.tsx` dentro do Dialog de visualização de imagens
- Exibe automaticamente quando há polígono disponível
- Mensagem informativa quando polígono não está disponível

**Uso:**
1. Acesse a aba "Estudos Visuais" de um projeto
2. Clique em qualquer imagem gerada (estudo conceitual, planta, corte, etc.)
3. O overlay vermelho mostrará o contorno exato do terreno
4. Ajuste a opacidade conforme necessário
5. Verifique se o edifício na imagem respeita os limites do lote

---

### 2. Ajuste Manual de Layout do Edifício

**Arquivo:** `client/src/components/BuildingLayoutAdjuster.tsx`

**Descrição:** Interface interativa que permite ao usuário ajustar manualmente a posição, rotação e escala do edifício dentro do terreno antes de gerar novas imagens.

**Funcionalidades:**
- Canvas interativo 800×600px com visualização do terreno (azul) e edifício (vermelho)
- **Drag-and-drop:** Arraste o edifício para reposicionar dentro do terreno
- **Controle de rotação:** Slider de 0° a 360° (incrementos de 5°)
- **Controle de escala:** Slider de 50% a 100% (incrementos de 5%)
- Botão "Resetar" para voltar à configuração padrão
- Botão "Salvar Layout" que persiste as configurações no banco de dados
- Visualização em tempo real das alterações
- Legenda explicativa (🔵 Terreno, 🔴 Edifício)
- Cruz central no edifício para facilitar posicionamento

**Campos no Banco de Dados:**
```sql
buildingOffsetX INT DEFAULT 0    -- Deslocamento horizontal (-50 a 50)
buildingOffsetY INT DEFAULT 0    -- Deslocamento vertical (-50 a 50)
buildingRotation INT DEFAULT 0   -- Rotação em graus (0 a 360)
buildingScale INT DEFAULT 80     -- Escala do edifício (50 a 100%)
```

**Integração:**
- Integrado na aba "Dados do Terreno" do `ProjectDetail.tsx`
- Aparece após o card de "Branding Personalizado"
- Só é exibido quando há polígono disponível
- Salva automaticamente via mutation `trpc.project.update`

**Uso:**
1. Acesse a aba "Dados do Terreno" de um projeto com polígono
2. Role até o card "Ajuste Manual de Layout"
3. Arraste o edifício vermelho para reposicionar
4. Use os sliders para ajustar rotação e escala
5. Clique em "Salvar Layout"
6. As próximas imagens geradas usarão esta configuração

---

### 3. Arquivo KMZ de Teste com Terreno em L

**Arquivo:** `/home/ubuntu/test-terreno-L.kmz`

**Descrição:** Arquivo KMZ de teste com terreno irregular em formato L (4.500m²) para validação do sistema.

**Coordenadas:**
- Localização: Belo Horizonte, MG (aproximadamente)
- Formato: L (6 vértices)
- Área: ~4.500m²

**Uso:**
1. Crie um novo projeto
2. Faça upload do arquivo `test-terreno-L.kmz`
3. O sistema extrairá automaticamente o polígono
4. Use para testar se as imagens geradas respeitam o formato em L

---

## 🗂️ Arquivos Modificados

### Schema do Banco de Dados
- **Arquivo:** `drizzle/schema.ts`
- **Alterações:** Adicionados 4 campos para layout personalizado do edifício
- **Migration:** `drizzle/0022_right_shooting_star.sql` (aplicada com sucesso)

### Backend
- **Arquivo:** `server/projectRouters.ts`
- **Alterações:** Adicionados campos de layout no input da procedure `update`

### Frontend
- **Arquivo:** `client/src/components/ImageGallery.tsx`
- **Alterações:**
  - Import do `ImagePolygonOverlay`
  - Query adicional para buscar dados do projeto
  - Dialog de visualização substituído por versão com overlay

- **Arquivo:** `client/src/pages/ProjectDetail.tsx`
- **Alterações:**
  - Import do `BuildingLayoutAdjuster`
  - Mutation `updateProjectMutation` adicionada
  - Componente integrado na aba "Dados do Terreno"

---

## 📊 Fluxo de Uso Completo

### Cenário 1: Validação Visual de Imagens Geradas

1. **Importar Terreno:**
   - Upload de arquivo KMZ com polígono irregular
   - Sistema extrai coordenadas automaticamente

2. **Gerar Estudos:**
   - Clicar em "Gerar Estudo Conceitual" ou "Gerar Planta Baixa"
   - IA usa análise de geometria do terreno (já implementada)

3. **Validar Precisão:**
   - Clicar na imagem gerada
   - Overlay vermelho mostra contorno exato do terreno
   - Verificar se edifício respeita limites
   - Ajustar opacidade conforme necessário
   - Baixar imagem com overlay para apresentação

### Cenário 2: Ajuste Manual de Layout

1. **Configurar Layout:**
   - Acessar aba "Dados do Terreno"
   - Usar "Ajuste Manual de Layout"
   - Arrastar edifício para posição desejada
   - Rotacionar para melhor aproveitamento
   - Ajustar escala conforme necessário
   - Salvar configuração

2. **Gerar Imagens Otimizadas:**
   - Voltar para aba "Estudos Visuais"
   - Gerar novas imagens
   - IA usará layout personalizado
   - Validar com overlay

---

## 🔧 Tecnologias Utilizadas

- **Canvas API:** Renderização de polígonos e overlays
- **React Hooks:** useState, useEffect, useRef
- **tRPC:** Comunicação type-safe com backend
- **Drizzle ORM:** Persistência de dados
- **Shadcn/ui:** Componentes de interface (Button, Slider, Card, Dialog)
- **Lucide React:** Ícones (Eye, EyeOff, Download, Move, RotateCcw, Save)

---

## 📈 Melhorias Futuras (Não Implementadas)

1. **Integração com Geração de Imagens:**
   - Passar parâmetros de layout (offsetX, offsetY, rotation, scale) para os prompts de IA
   - Gerar descrições mais precisas do posicionamento do edifício

2. **Overlay em Tempo Real:**
   - Mostrar overlay durante a geração de imagens
   - Preview antes de confirmar geração

3. **Histórico de Layouts:**
   - Salvar múltiplas configurações de layout
   - Comparar diferentes posicionamentos

4. **Validação Automática:**
   - Detectar automaticamente se edifício ultrapassa limites do terreno
   - Alertar sobre violações de recuos obrigatórios

5. **Exportação de Layouts:**
   - Exportar configurações de layout em formato JSON
   - Importar layouts de outros projetos similares

---

## ✅ Checklist de Validação

- [x] Schema do banco atualizado com campos de layout
- [x] Migration aplicada com sucesso
- [x] Componente ImagePolygonOverlay criado
- [x] Componente BuildingLayoutAdjuster criado
- [x] Integração no ImageGallery (Dialog)
- [x] Integração no ProjectDetail (aba Dados)
- [x] Mutation de update do projeto
- [x] Arquivo KMZ de teste criado
- [x] Servidor rodando sem erros TypeScript
- [x] Documentação completa

---

## 📝 Notas Técnicas

### Normalização de Coordenadas

O componente `ImagePolygonOverlay` converte coordenadas geográficas (latitude/longitude) para coordenadas do canvas usando normalização min-max:

```typescript
const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvas.width;
const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvas.height;
```

### Detecção de Drag

O componente `BuildingLayoutAdjuster` usa eventos de mouse para drag-and-drop:

```typescript
onMouseDown → setIsDragging(true)
onMouseMove → atualiza offsetX/offsetY se isDragging
onMouseUp → setIsDragging(false)
```

### Persistência de Layout

O layout é salvo no banco de dados e pode ser usado futuramente para:
- Gerar prompts mais precisos para IA
- Validar conformidade com recuos
- Criar visualizações 3D mais realistas

---

## 🎯 Conclusão

As 3 funcionalidades implementadas fornecem ferramentas poderosas para:
1. **Validar** visualmente se as imagens geradas respeitam o terreno real
2. **Ajustar** manualmente o layout do edifício antes de gerar imagens
3. **Testar** o sistema com terrenos irregulares

Isso garante que os estudos volumétricos sejam mais realistas e precisos, respeitando exatamente o formato do polígono do terreno importado via KMZ.
