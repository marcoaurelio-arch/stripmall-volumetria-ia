import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CostCalculatorProps {
  defaultArea?: number;
  defaultFloors?: number;
}

export function CostCalculator({
  defaultArea = 5000,
  defaultFloors = 1,
}: CostCalculatorProps) {
  const [state, setState] = useState("SP");
  const [buildingType, setBuildingType] = useState<'comercial_padrao' | 'comercial_alto' | 'industrial_padrao' | 'shopping_center'>('shopping_center');
  const [totalArea, setTotalArea] = useState(defaultArea.toString());
  const [floors, setFloors] = useState(defaultFloors.toString());
  const [qualityFactor, setQualityFactor] = useState("1.0");
  const [complexityFactor, setComplexityFactor] = useState("1.0");

  const { data: states } = trpc.cubCost.getStates.useQuery();
  const { data: buildingTypes } = trpc.cubCost.getBuildingTypes.useQuery();

  const { data: costBreakdown, isLoading, refetch } = trpc.cubCost.calculate.useQuery(
    {
      state,
      buildingType,
      totalArea: parseFloat(totalArea) || defaultArea,
      floors: parseInt(floors) || defaultFloors,
      qualityFactor: parseFloat(qualityFactor) || 1.0,
      complexityFactor: parseFloat(complexityFactor) || 1.0,
    },
    {
      enabled: false, // Não calcular automaticamente
    }
  );

  const handleCalculate = () => {
    if (!totalArea || !floors) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    refetch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora de Custos CUB
        </CardTitle>
        <CardDescription>
          Estime o custo de construção baseado em tabelas CUB regionais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parâmetros */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">Estado (UF)</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {states?.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building-type">Tipo de Construção</Label>
            <Select value={buildingType} onValueChange={(v: any) => setBuildingType(v)}>
              <SelectTrigger id="building-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {buildingTypes?.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value}>
                    {bt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total-area">Área Total Construída (m²)</Label>
            <Input
              id="total-area"
              type="number"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              placeholder="Ex: 5000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floors">Número de Pavimentos</Label>
            <Input
              id="floors"
              type="number"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              placeholder="Ex: 1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality-factor">Fator de Qualidade (0.8 - 1.2)</Label>
            <Input
              id="quality-factor"
              type="number"
              step="0.1"
              min="0.8"
              max="1.2"
              value={qualityFactor}
              onChange={(e) => setQualityFactor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="complexity-factor">Fator de Complexidade (0.9 - 1.3)</Label>
            <Input
              id="complexity-factor"
              type="number"
              step="0.1"
              min="0.9"
              max="1.3"
              value={complexityFactor}
              onChange={(e) => setComplexityFactor(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          {isLoading ? "Calculando..." : "Calcular Custo"}
        </Button>

        {/* Resultado */}
        {costBreakdown && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Valor CUB</p>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.cubValue)}/m²</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Custo por m²</p>
                <p className="text-lg font-semibold">{formatCurrency(costBreakdown.costPerSqm)}</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm">Custo Base</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.baseCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ajuste de Qualidade</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.qualityAdjustment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ajuste de Complexidade</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.complexityAdjustment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ajuste de Pavimentos</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.floorsAdjustment)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Custo Direto</span>
                <span className="text-sm font-semibold">{formatCurrency(costBreakdown.directCost)}</span>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm">Projeto (6%)</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.projectCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Aprovações (2.5%)</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.approvalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Gerenciamento (4%)</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.managementCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Contingência (8%)</span>
                <span className="text-sm font-medium">{formatCurrency(costBreakdown.contingency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-sm font-semibold">Custo Indireto</span>
                <span className="text-sm font-semibold">{formatCurrency(costBreakdown.indirectCost)}</span>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Custo Total Estimado</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(costBreakdown.totalCost)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * Valores baseados em tabelas CUB regionais (2024). Estimativa sujeita a variações de mercado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
