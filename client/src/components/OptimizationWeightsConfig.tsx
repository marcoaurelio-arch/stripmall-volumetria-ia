import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sliders, RotateCcw } from "lucide-react";

export interface OptimizationWeights {
  occupancy: number;
  solar: number;
  aesthetics: number;
  cost: number;
}

interface OptimizationWeightsConfigProps {
  weights: OptimizationWeights;
  onChange: (weights: OptimizationWeights) => void;
}

const DEFAULT_WEIGHTS: OptimizationWeights = {
  occupancy: 40,
  solar: 30,
  aesthetics: 20,
  cost: 10,
};

export function OptimizationWeightsConfig({
  weights,
  onChange,
}: OptimizationWeightsConfigProps) {
  const [localWeights, setLocalWeights] = useState<OptimizationWeights>(weights);

  const handleWeightChange = (key: keyof OptimizationWeights, value: number) => {
    const newWeights = { ...localWeights, [key]: value };
    setLocalWeights(newWeights);
    onChange(newWeights);
  };

  const handleReset = () => {
    setLocalWeights(DEFAULT_WEIGHTS);
    onChange(DEFAULT_WEIGHTS);
  };

  const total = localWeights.occupancy + localWeights.solar + localWeights.aesthetics + localWeights.cost;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Configuração de Prioridades
        </CardTitle>
        <CardDescription>
          Ajuste os pesos de cada critério para personalizar a otimização (total: {total})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aproveitamento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Aproveitamento do Terreno</Label>
            <span className="text-sm font-semibold text-primary">{localWeights.occupancy}%</span>
          </div>
          <Slider
            value={[localWeights.occupancy]}
            onValueChange={(v) => handleWeightChange('occupancy', v[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Prioriza maximizar a área construída e taxa de ocupação
          </p>
        </div>

        {/* Orientação Solar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Orientação Solar</Label>
            <span className="text-sm font-semibold text-primary">{localWeights.solar}%</span>
          </div>
          <Slider
            value={[localWeights.solar]}
            onValueChange={(v) => handleWeightChange('solar', v[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Prioriza orientação norte para eficiência energética
          </p>
        </div>

        {/* Estética */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Estética e Simetria</Label>
            <span className="text-sm font-semibold text-primary">{localWeights.aesthetics}%</span>
          </div>
          <Slider
            value={[localWeights.aesthetics]}
            onValueChange={(v) => handleWeightChange('aesthetics', v[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Prioriza centralização, simetria e proporções harmoniosas
          </p>
        </div>

        {/* Custo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custo Estimado</Label>
            <span className="text-sm font-semibold text-primary">{localWeights.cost}%</span>
          </div>
          <Slider
            value={[localWeights.cost]}
            onValueChange={(v) => handleWeightChange('cost', v[0])}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Prioriza redução de custos através de menor escala
          </p>
        </div>

        {/* Botão de Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restaurar Padrão
        </Button>

        {/* Aviso se total não é 100 */}
        {total !== 100 && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ℹ️ O total dos pesos é {total}%. Os pesos serão normalizados automaticamente para somar 100%.
            </p>
          </div>
        )}

        {/* Visualização de distribuição */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Distribuição de Prioridades</Label>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div
              className="bg-blue-500"
              style={{ width: `${(localWeights.occupancy / total) * 100}%` }}
              title={`Aproveitamento: ${localWeights.occupancy}%`}
            />
            <div
              className="bg-yellow-500"
              style={{ width: `${(localWeights.solar / total) * 100}%` }}
              title={`Solar: ${localWeights.solar}%`}
            />
            <div
              className="bg-purple-500"
              style={{ width: `${(localWeights.aesthetics / total) * 100}%` }}
              title={`Estética: ${localWeights.aesthetics}%`}
            />
            <div
              className="bg-green-500"
              style={{ width: `${(localWeights.cost / total) * 100}%` }}
              title={`Custo: ${localWeights.cost}%`}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              <span>Aproveitamento ({((localWeights.occupancy / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm" />
              <span>Solar ({((localWeights.solar / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-sm" />
              <span>Estética ({((localWeights.aesthetics / total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <span>Custo ({((localWeights.cost / total) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
