import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calculator, TrendingUp, DollarSign, PieChart, Info } from "lucide-react";
import { toast } from "sonner";

interface CostAnalysisPanelProps {
  projectId: number;
  totalArea?: number;
  state?: string;
  commercialArea?: number;
}

export default function CostAnalysisPanel({
  projectId,
  totalArea: initialTotalArea,
  state: initialState,
  commercialArea: initialCommercialArea,
}: CostAnalysisPanelProps) {
  const [totalArea, setTotalArea] = useState(initialTotalArea || 0);
  const [state, setState] = useState(initialState || "SP");
  const [standard, setStandard] = useState<"low" | "medium" | "high" | "luxury">("medium");
  const [commercialArea, setCommercialArea] = useState(initialCommercialArea || 0);
  const [parkingArea, setParkingArea] = useState(0);
  const [commonArea, setCommonArea] = useState(0);
  
  // Parâmetros de viabilidade
  const [averageRent, setAverageRent] = useState(80); // R$/m² por mês
  const [occupancyRate, setOccupancyRate] = useState(85); // %
  const [operatingCosts, setOperatingCosts] = useState(0);

  const [showViability, setShowViability] = useState(false);

  // Buscar estados disponíveis
  const { data: statesData } = trpc.cost.getAvailableStates.useQuery();

  // Calcular análise completa
  const { data: analysis, isLoading, refetch } = trpc.cost.getCompleteAnalysis.useQuery(
    {
      projectId,
      totalArea,
      state,
      standard,
      commercialArea,
      parkingArea: parkingArea || undefined,
      commonArea: commonArea || undefined,
      averageRentPerSqm: showViability ? averageRent : undefined,
      occupancyRate: showViability ? occupancyRate : undefined,
      operatingCosts: showViability ? operatingCosts : undefined,
    },
    {
      enabled: totalArea > 0 && commercialArea > 0,
    }
  );

  // Atualizar áreas quando props mudarem
  useEffect(() => {
    if (initialTotalArea) setTotalArea(initialTotalArea);
    if (initialState) setState(initialState);
    if (initialCommercialArea) setCommercialArea(initialCommercialArea);
  }, [initialTotalArea, initialState, initialCommercialArea]);

  // Calcular custos operacionais estimados (3% da receita mensal)
  useEffect(() => {
    if (commercialArea && averageRent) {
      const monthlyRevenue = commercialArea * averageRent * (occupancyRate / 100);
      setOperatingCosts(Math.round(monthlyRevenue * 0.03));
    }
  }, [commercialArea, averageRent, occupancyRate]);

  const handleCalculate = () => {
    if (totalArea === 0) {
      toast.error("Informe a área total");
      return;
    }
    if (commercialArea === 0) {
      toast.error("Informe a área comercial");
      return;
    }
    refetch();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Parâmetros de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Parâmetros do Projeto
          </CardTitle>
          <CardDescription>
            Configure os parâmetros para calcular o custo estimado de construção
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="totalArea">Área Total (m²)</Label>
              <Input
                id="totalArea"
                type="number"
                value={totalArea || ""}
                onChange={(e) => setTotalArea(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="commercialArea">Área Comercial (m²)</Label>
              <Input
                id="commercialArea"
                type="number"
                value={commercialArea || ""}
                onChange={(e) => setCommercialArea(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="parkingArea">Área de Estacionamento (m²)</Label>
              <Input
                id="parkingArea"
                type="number"
                value={parkingArea || ""}
                onChange={(e) => setParkingArea(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statesData?.states.map((s) => (
                    <SelectItem key={s.state} value={s.state}>
                      {s.stateName} ({s.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="standard">Padrão Construtivo</Label>
              <Select value={standard} onValueChange={(v: any) => setStandard(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                  <SelectItem value="luxury">Luxo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            Calcular Custos
          </Button>
        </CardContent>
      </Card>

      {/* Resultado da Análise de Custos */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : analysis?.success && analysis.costs ? (
        <>
          {/* Resumo de Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Análise de Custos
              </CardTitle>
              <CardDescription>
                Estimativa baseada em CUB {state} - Padrão {standard === "low" ? "Baixo" : standard === "medium" ? "Médio" : standard === "high" ? "Alto" : "Luxo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Custo Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(analysis.costs.totalCost)}</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Custo por m²</p>
                  <p className="text-2xl font-bold">{formatCurrency(analysis.costs.costPerSqm)}</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Área Total</p>
                  <p className="text-2xl font-bold">{totalArea.toLocaleString("pt-BR")} m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown de Custos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribuição de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estrutura (35%)</span>
                    <span className="font-semibold">{formatCurrency(analysis.costs.breakdown.structure)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: "35%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Acabamento (25%)</span>
                    <span className="font-semibold">{formatCurrency(analysis.costs.breakdown.finishing)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: "25%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Instalações (20%)</span>
                    <span className="font-semibold">{formatCurrency(analysis.costs.breakdown.installations)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: "20%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Estacionamento (10%)</span>
                    <span className="font-semibold">{formatCurrency(analysis.costs.breakdown.parking)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: "10%" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Áreas Comuns (10%)</span>
                    <span className="font-semibold">{formatCurrency(analysis.costs.breakdown.commonAreas)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: "10%" }} />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Projetos (5%)</span>
                    <span>{formatCurrency(analysis.costs.breakdown.project)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Gerenciamento (8%)</span>
                    <span>{formatCurrency(analysis.costs.breakdown.management)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Contingência (10%)</span>
                    <span>{formatCurrency(analysis.costs.breakdown.contingency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Viabilidade (opcional) */}
          {!showViability ? (
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowViability(true)}
                  className="w-full"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Calcular Viabilidade Financeira
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Parâmetros de Viabilidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="averageRent">Aluguel Médio (R$/m²/mês)</Label>
                    <Input
                      id="averageRent"
                      type="number"
                      value={averageRent}
                      onChange={(e) => setAverageRent(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupancyRate">Taxa de Ocupação (%)</Label>
                    <Input
                      id="occupancyRate"
                      type="number"
                      value={occupancyRate}
                      onChange={(e) => setOccupancyRate(Number(e.target.value))}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="operatingCosts">Custos Operacionais (R$/mês)</Label>
                    <Input
                      id="operatingCosts"
                      type="number"
                      value={operatingCosts}
                      onChange={(e) => setOperatingCosts(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={handleCalculate} className="w-full">
                  Recalcular com Viabilidade
                </Button>

                {analysis.viability && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">ROI Anual</p>
                        <p className="text-2xl font-bold text-green-600">{analysis.viability.roi}%</p>
                      </div>
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Payback</p>
                        <p className="text-2xl font-bold text-blue-600">{analysis.viability.paybackMonths} meses</p>
                      </div>
                      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Receita Mensal</p>
                        <p className="text-xl font-bold text-purple-600">{formatCurrency(analysis.viability.monthlyRevenue)}</p>
                      </div>
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Lucro Mensal</p>
                        <p className="text-xl font-bold text-yellow-600">{formatCurrency(analysis.viability.monthlyProfit)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
