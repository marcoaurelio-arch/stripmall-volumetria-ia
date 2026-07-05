# Guia de Implementação - Fases 2 e 3

## 📋 Status Atual

### ✅ FASE 1 - COMPLETA (95%)
- Upload de arquivos com drag-and-drop ✅
- Processamento automático de KMZ ✅
- Extração de dados de PDFs com OCR ✅
- Galeria de imagens de referência para IA ✅
- Campo de upload de inspiração ✅
- Integração com legislação urbanística (12 estados) ✅
- Análise de custos CUB/SINAPI ✅
- Checklist automatizado de conformidade (28 validações) ✅
- Integração no formulário de criação ⏳ (não implementado)

### ⏳ FASE 2 - EM ANDAMENTO (33%)
- **Simulação de insolação e ventilação** - Backend completo ✅ | Frontend pendente ⏳
- **IA para variações de projeto** - Não implementado ⏳
- **Dados de mercado imobiliário** - Não implementado ⏳

### ⏳ FASE 3 - NÃO INICIADA (0%)
- **Tour virtual 360°** - Não implementado ⏳
- **Exportação BIM** - Não implementado ⏳
- **Simulador de fluxo de pessoas** - Não implementado ⏳

---

## 🎯 FASE 2: Diferencial Competitivo

### 1. Simulação de Insolação e Ventilação

#### ✅ Backend Implementado
- **Arquivo:** `server/solarAnalysisService.ts`
- **Router:** `server/solarRouter.ts`
- **Biblioteca:** `suncalc` (já instalada)

**Funcionalidades Backend:**
- Cálculo de trajetória solar por localização (latitude/longitude)
- Horas de luz solar por estação (verão, inverno, primavera, outono)
- Análise de conforto térmico por estação
- Análise de orientações de fachadas (norte, sul, leste, oeste)
- Recomendações específicas por orientação
- Análise de ventilação natural

#### ⏳ Frontend Pendente

**Componente a Criar:** `client/src/components/SolarAnalysisPanel.tsx`

```tsx
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sun, Wind, ThermometerSun } from "lucide-react";

interface SolarAnalysisPanelProps {
  projectId: number;
  latitude: number;
  longitude: number;
}

export default function SolarAnalysisPanel({ projectId, latitude, longitude }: SolarAnalysisPanelProps) {
  const analysisMutation = trpc.solar.analyzeSolar.useMutation();
  
  const handleAnalyze = () => {
    analysisMutation.mutate({ latitude, longitude });
  };
  
  const analysis = analysisMutation.data?.data;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Análise de Insolação e Conforto Térmico
        </CardTitle>
        <CardDescription>
          Análise solar baseada na localização do terreno
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis && (
          <Button onClick={handleAnalyze} disabled={analysisMutation.isLoading}>
            {analysisMutation.isLoading ? "Analisando..." : "Realizar Análise Solar"}
          </Button>
        )}
        
        {analysis && (
          <Tabs defaultValue="orientacoes">
            <TabsList>
              <TabsTrigger value="orientacoes">Orientações de Fachadas</TabsTrigger>
              <TabsTrigger value="conforto">Conforto Térmico</TabsTrigger>
              <TabsTrigger value="ventilacao">Ventilação</TabsTrigger>
              <TabsTrigger value="trajetoria">Trajetória Solar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orientacoes" className="space-y-4">
              {/* Exibir análise de orientações */}
              {analysis.facadeOrientations.map((orientation) => (
                <Card key={orientation.direction}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{orientation.direction}</span>
                      <Badge variant={
                        orientation.suitability === 'ótima' ? 'default' :
                        orientation.suitability === 'boa' ? 'secondary' :
                        orientation.suitability === 'regular' ? 'outline' : 'destructive'
                      }>
                        {orientation.suitability}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Exposição Solar:</strong> {orientation.sunExposure}
                    </div>
                    <div>
                      <strong>Vantagens:</strong>
                      <ul className="list-disc list-inside">
                        {orientation.advantages.map((adv, i) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Recomendações:</strong>
                      <ul className="list-disc list-inside">
                        {orientation.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="conforto" className="space-y-4">
              {/* Exibir análise de conforto térmico por estação */}
              {Object.entries(analysis.thermalComfort).map(([season, comfort]) => (
                <Card key={season}>
                  <CardHeader>
                    <CardTitle className="capitalize">{comfort.season}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Horas de Sol:</strong> {comfort.avgSunExposure.toFixed(1)}h/dia
                      </div>
                      <div>
                        <strong>Risco de Ganho Térmico:</strong>{" "}
                        <Badge variant={
                          comfort.heatGainRisk === 'muito alto' ? 'destructive' :
                          comfort.heatGainRisk === 'alto' ? 'destructive' :
                          comfort.heatGainRisk === 'médio' ? 'outline' : 'secondary'
                        }>
                          {comfort.heatGainRisk}
                        </Badge>
                      </div>
                      <div>
                        <strong>Necessidade de Refrigeração:</strong> {comfort.coolingNeed}
                      </div>
                      <div>
                        <strong>Necessidade de Aquecimento:</strong> {comfort.heatingNeed}
                      </div>
                    </div>
                    <div>
                      <strong>Recomendações:</strong>
                      <ul className="list-disc list-inside">
                        {comfort.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="ventilacao">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Análise de Ventilação Natural
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Ventos Predominantes:</strong> {analysis.ventilationAnalysis.predominantWinds}
                  </div>
                  <div>
                    <strong>Potencial de Ventilação Natural:</strong>{" "}
                    <Badge variant="default">
                      {analysis.ventilationAnalysis.naturalVentilationPotential}
                    </Badge>
                  </div>
                  <div>
                    <strong>Recomendações:</strong>
                    <ul className="list-disc list-inside">
                      {analysis.ventilationAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trajetoria">
              {/* Implementar visualização de trajetória solar com gráfico */}
              <Card>
                <CardHeader>
                  <CardTitle>Trajetória Solar</CardTitle>
                  <CardDescription>
                    Posição do sol ao longo do dia no verão e inverno
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* TODO: Adicionar gráfico com Chart.js ou D3.js */}
                  <p className="text-muted-foreground">
                    Gráfico de trajetória solar (implementar com Chart.js)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
```

**Integração:**
1. Adicionar nova aba "Conforto Ambiental" em `client/src/pages/ProjectDetail.tsx`
2. Importar e usar `SolarAnalysisPanel` passando latitude e longitude do projeto
3. Adicionar ícone `ThermometerSun` na lista de tabs

---

### 2. IA para Variações de Projeto

**Objetivo:** Gerar automaticamente 3-5 variações de layout otimizadas por IA

#### Backend a Implementar

**Arquivo:** `server/projectVariationsService.ts`

```typescript
import { invokeLLM } from "./_core/llm";

interface ProjectVariationInput {
  projectId: number;
  area: number;
  taxaOcupacao: number;
  coeficienteAproveitamento: number;
  numberOfVariations: number; // 3-5
}

interface LayoutVariation {
  id: string;
  name: string;
  description: string;
  numberOfStores: number;
  storeDistribution: string; // ex: "10 lojas de 50m² + 5 lojas de 100m²"
  parkingSpaces: number;
  parkingLayout: 'frontal' | 'lateral' | 'traseira' | 'mista';
  buildingFootprint: number; // m²
  totalBuiltArea: number; // m²
  efficiency: number; // % de área útil
  estimatedCost: number;
  score: number; // Pontuação geral (0-100)
  pros: string[];
  cons: string[];
  recommendations: string[];
}

export async function generateProjectVariations(
  input: ProjectVariationInput
): Promise<LayoutVariation[]> {
  const { area, taxaOcupacao, coeficienteAproveitamento, numberOfVariations } = input;
  
  const maxFootprint = area * (taxaOcupacao / 100);
  const maxBuiltArea = area * coeficienteAproveitamento;
  
  const prompt = `Você é um arquiteto especializado em strip malls. Gere ${numberOfVariations} variações de layout para um terreno com as seguintes características:

- Área do terreno: ${area}m²
- Taxa de ocupação máxima: ${taxaOcupacao}%
- Coeficiente de aproveitamento máximo: ${coeficienteAproveitamento}
- Área máxima de projeção: ${maxFootprint}m²
- Área máxima construída: ${maxBuiltArea}m²

Para cada variação, forneça:
1. Nome descritivo da variação
2. Descrição do conceito
3. Número de lojas e distribuição de tamanhos
4. Número de vagas de estacionamento
5. Layout do estacionamento (frontal, lateral, traseira, mista)
6. Área de projeção da edificação
7. Área total construída (considere possível segundo pavimento)
8. Eficiência (% de área útil comercial)
9. Vantagens (pros)
10. Desvantagens (cons)
11. Recomendações específicas

Varie os conceitos entre:
- Lojas pequenas (muitas unidades menores)
- Lojas médias (mix equilibrado)
- Âncoras (poucas lojas grandes)
- Dois pavimentos vs térreo
- Diferentes layouts de estacionamento

Retorne em formato JSON.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você é um arquiteto especializado em strip malls e centros comerciais." },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "project_variations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: "string" },
                  numberOfStores: { type: "number" },
                  storeDistribution: { type: "string" },
                  parkingSpaces: { type: "number" },
                  parkingLayout: { type: "string", enum: ["frontal", "lateral", "traseira", "mista"] },
                  buildingFootprint: { type: "number" },
                  totalBuiltArea: { type: "number" },
                  efficiency: { type: "number" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } },
                  recommendations: { type: "array", items: { type: "string" } },
                },
                required: [
                  "id", "name", "description", "numberOfStores", "storeDistribution",
                  "parkingSpaces", "parkingLayout", "buildingFootprint", "totalBuiltArea",
                  "efficiency", "pros", "cons", "recommendations"
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["variations"],
          additionalProperties: false,
        },
      },
    },
  });
  
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("IA não retornou conteúdo");
  }
  
  const result = JSON.parse(content);
  const variations: LayoutVariation[] = result.variations.map((v: any, index: number) => {
    // Calcular custo estimado (baseado em CUB médio)
    const estimatedCost = v.totalBuiltArea * 2200; // R$ 2.200/m² (média)
    
    // Calcular score baseado em eficiência, aproveitamento e custo
    const efficiencyScore = v.efficiency;
    const utilizationScore = (v.totalBuiltArea / maxBuiltArea) * 100;
    const costScore = 100 - ((estimatedCost / (maxBuiltArea * 2500)) * 100);
    const score = (efficiencyScore * 0.4 + utilizationScore * 0.4 + costScore * 0.2);
    
    return {
      ...v,
      estimatedCost,
      score: Math.round(score),
    };
  });
  
  // Ordenar por score (maior primeiro)
  variations.sort((a, b) => b.score - a.score);
  
  return variations;
}
```

**Router:** `server/projectVariationsRouter.ts`

```typescript
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { generateProjectVariations } from "./projectVariationsService";

export const projectVariationsRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        area: z.number(),
        taxaOcupacao: z.number(),
        coeficienteAproveitamento: z.number(),
        numberOfVariations: z.number().min(3).max(5).default(3),
      })
    )
    .mutation(async ({ input }) => {
      const variations = await generateProjectVariations(input);
      return { success: true, variations };
    }),
});
```

**Adicionar no `server/routers.ts`:**
```typescript
import { projectVariationsRouter } from "./projectVariationsRouter";
// ...
projectVariations: projectVariationsRouter,
```

#### Frontend a Implementar

**Componente:** `client/src/components/ProjectVariationsPanel.tsx`

- Grid de cards com cada variação
- Comparação lado a lado
- Filtros por score, eficiência, custo
- Botão "Gerar Variações"
- Salvar variação favorita

**Integração:**
- Adicionar nova aba "Variações de Projeto" em `ProjectDetail.tsx`

---

### 3. Dados de Mercado Imobiliário

**Objetivo:** Integrar dados demográficos, concorrência e potencial de mercado

#### Backend a Implementar

**Arquivo:** `server/marketAnalysisService.ts`

```typescript
// Integrar com APIs:
// - IBGE (dados demográficos) - API pública
// - Google Places API (concorrentes num raio de 5km)
// - Dados de renda média por região

interface MarketAnalysisInput {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
}

interface MarketAnalysisResult {
  demographics: {
    population: number;
    populationDensity: number; // hab/km²
    avgIncome: number; // R$ per capita
    economicClass: 'A' | 'B' | 'C' | 'D';
  };
  competition: {
    totalCompetitors: number;
    competitors: Array<{
      name: string;
      distance: number; // km
      rating: number;
      address: string;
    }>;
  };
  marketPotential: {
    score: number; // 0-100
    demand: 'baixa' | 'média' | 'alta' | 'muito alta';
    saturation: 'baixa' | 'média' | 'alta';
    recommendations: string[];
  };
}
```

**APIs a Integrar:**
1. **IBGE API** (gratuita): https://servicodados.ibge.gov.br/api/docs
2. **Google Places API** (paga): Buscar "shopping" num raio de 5km
3. **Dados de renda**: Usar dados do IBGE por município

---

## 🚀 FASE 3: Inovação

### 1. Tour Virtual 360°

**Biblioteca Recomendada:** `three.js` + `@react-three/fiber`

**Instalação:**
```bash
pnpm add three @react-three/fiber @react-three/drei
```

**Componente:** `client/src/components/VirtualTour360.tsx`

- Renderização 360° de imagens geradas pela IA
- Navegação entre pontos de vista (entrada, interior, estacionamento)
- Hotspots interativos
- Controles de mouse/touch
- Modo VR (opcional)

**Backend:**
- Gerar múltiplas imagens de diferentes ângulos
- Armazenar no S3
- Criar tour virtual linkando imagens

---

### 2. Exportação BIM

**Formato:** IFC (Industry Foundation Classes)

**Biblioteca Recomendada:** `ifc.js` ou gerar XML manualmente

**Instalação:**
```bash
pnpm add web-ifc
```

**Arquivo:** `server/bifExportService.ts`

- Converter geometria do projeto para IFC
- Exportar parâmetros e metadados
- Gerar arquivo `.ifc` para download

**Elementos a Exportar:**
- Geometria do terreno
- Edificação (footprint, altura)
- Lojas (divisões internas)
- Estacionamento (vagas)
- Parâmetros urbanísticos (metadados)

---

### 3. Simulador de Fluxo de Pessoas

**Algoritmo:** Modelo de fluxo de pedestres (Social Force Model)

**Biblioteca Recomendada:** Implementação customizada ou `matter.js` (física 2D)

**Instalação:**
```bash
pnpm add matter-js
```

**Arquivo:** `server/pedestrianFlowService.ts`

- Simular fluxo de pessoas em horários de pico
- Identificar gargalos
- Analisar circulação
- Otimizar posicionamento de acessos

**Frontend:**
- Visualização animada do fluxo
- Heatmap de densidade
- Identificação de pontos críticos

---

## 📝 Ordem de Implementação Recomendada

### Prioridade Alta (Implementar Primeiro)
1. ✅ Simulação de insolação - Backend (COMPLETO)
2. ⏳ Simulação de insolação - Frontend (componente + integração)
3. ⏳ IA para variações de projeto (backend + frontend)

### Prioridade Média
4. ⏳ Dados de mercado imobiliário (integração IBGE + Google Places)
5. ⏳ Integração no formulário de criação (busca automática de legislação por CEP)

### Prioridade Baixa (Funcionalidades Avançadas)
6. ⏳ Tour virtual 360° (three.js)
7. ⏳ Exportação BIM (IFC)
8. ⏳ Simulador de fluxo de pessoas (matter.js)

---

## 🔧 Comandos Úteis

```bash
# Instalar dependências
pnpm add <package>

# Aplicar migrações do banco
pnpm db:push

# Reiniciar servidor
pnpm dev

# Verificar erros TypeScript
pnpm tsc --noEmit
```

---

## 📚 Recursos e Referências

### Documentação
- **SunCalc:** https://github.com/mourner/suncalc
- **Three.js:** https://threejs.org/docs/
- **IFC.js:** https://ifcjs.github.io/info/
- **Matter.js:** https://brm.io/matter-js/

### APIs Públicas
- **IBGE:** https://servicodados.ibge.gov.br/api/docs
- **ViaCEP:** https://viacep.com.br/
- **Google Places:** https://developers.google.com/maps/documentation/places/web-service

### Algoritmos
- **Social Force Model:** https://en.wikipedia.org/wiki/Social_force_model
- **Genetic Algorithms:** Para otimização de layouts

---

## ✅ Checklist de Conclusão

### Fase 2
- [ ] Componente SolarAnalysisPanel implementado
- [ ] Aba "Conforto Ambiental" adicionada
- [ ] Gráficos de trajetória solar
- [ ] Serviço de variações de projeto
- [ ] Componente ProjectVariationsPanel
- [ ] Integração com IBGE API
- [ ] Integração com Google Places API
- [ ] Componente MarketAnalysisPanel

### Fase 3
- [ ] Componente VirtualTour360
- [ ] Serviço de exportação BIM
- [ ] Download de arquivo IFC
- [ ] Serviço de simulação de fluxo
- [ ] Visualização animada de fluxo
- [ ] Heatmap de densidade

---

**Última atualização:** 16 de novembro de 2025  
**Versão do sistema:** 4b510372 + simulação solar backend  
**Desenvolvido por:** Equipe Nexa Malls
