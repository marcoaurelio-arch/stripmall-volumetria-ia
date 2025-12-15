import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sun, Wind, ThermometerSun, Compass, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SolarAnalysisPanelProps {
  projectId: number;
  latitude: number;
  longitude: number;
}

export default function SolarAnalysisPanel({ projectId, latitude, longitude }: SolarAnalysisPanelProps) {
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const analysisMutation = trpc.solar.analyzeSolar.useMutation({
    onSuccess: () => {
      setHasAnalyzed(true);
    },
  });

  const handleAnalyze = () => {
    analysisMutation.mutate({ latitude, longitude });
  };

  const analysis = analysisMutation.data?.data;

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'ótima':
        return 'default';
      case 'boa':
        return 'secondary';
      case 'regular':
        return 'outline';
      case 'ruim':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'muito alto':
      case 'muito alta':
        return 'destructive';
      case 'alto':
      case 'alta':
        return 'destructive';
      case 'médio':
      case 'média':
        return 'outline';
      case 'baixo':
      case 'baixa':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getExposureValue = (exposure: string) => {
    switch (exposure) {
      case 'muito alta':
        return 100;
      case 'alta':
        return 75;
      case 'média':
        return 50;
      case 'baixa':
        return 25;
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Análise de Insolação e Conforto Térmico
        </CardTitle>
        <CardDescription>
          Análise solar baseada na localização do terreno ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasAnalyzed && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Sun className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Realize a análise solar para obter recomendações de orientação de fachadas,
              conforto térmico e ventilação natural.
            </p>
            <Button onClick={handleAnalyze} disabled={analysisMutation.isPending} size="lg">
              {analysisMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {analysisMutation.isPending ? "Analisando..." : "Realizar Análise Solar"}
            </Button>
          </div>
        )}

        {analysis && (
          <Tabs defaultValue="orientacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orientacoes">
                <Compass className="h-4 w-4 mr-2" />
                Orientações
              </TabsTrigger>
              <TabsTrigger value="conforto">
                <ThermometerSun className="h-4 w-4 mr-2" />
                Conforto
              </TabsTrigger>
              <TabsTrigger value="ventilacao">
                <Wind className="h-4 w-4 mr-2" />
                Ventilação
              </TabsTrigger>
              <TabsTrigger value="resumo">
                <Sun className="h-4 w-4 mr-2" />
                Resumo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orientacoes" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {analysis.facadeOrientations.map((orientation) => (
                  <Card key={orientation.direction} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg capitalize flex items-center gap-2">
                          <Compass className="h-5 w-5" />
                          Fachada {orientation.direction}
                        </CardTitle>
                        <Badge variant={getSuitabilityColor(orientation.suitability)}>
                          {orientation.suitability}
                        </Badge>
                      </div>
                      <CardDescription>
                        Azimute: {orientation.azimuth}°
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Exposição Solar</span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {orientation.sunExposure}
                          </span>
                        </div>
                        <Progress value={getExposureValue(orientation.sunExposure)} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          ✓ Vantagens:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {orientation.advantages.map((adv, i) => (
                            <li key={i}>{adv}</li>
                          ))}
                        </ul>
                      </div>

                      {orientation.disadvantages.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                            ⚠ Desvantagens:
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {orientation.disadvantages.map((dis, i) => (
                              <li key={i}>{dis}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          💡 Recomendações:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {orientation.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conforto" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {Object.entries(analysis.thermalComfort).map(([season, comfort]) => (
                  <Card key={season}>
                    <CardHeader>
                      <CardTitle className="capitalize flex items-center gap-2">
                        <ThermometerSun className="h-5 w-5" />
                        {comfort.season}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Horas de Sol por Dia</div>
                          <div className="text-2xl font-bold">
                            {comfort.avgSunExposure.toFixed(1)}h
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Risco de Ganho Térmico</div>
                          <Badge variant={getRiskColor(comfort.heatGainRisk)} className="text-sm">
                            {comfort.heatGainRisk}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Necessidade de Refrigeração</div>
                          <Badge variant={getRiskColor(comfort.coolingNeed)} className="text-sm">
                            {comfort.coolingNeed}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Necessidade de Aquecimento</div>
                          <Badge variant={getRiskColor(comfort.heatingNeed)} className="text-sm">
                            {comfort.heatingNeed}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          💡 Recomendações:
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {comfort.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ventilacao" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wind className="h-5 w-5" />
                    Análise de Ventilação Natural
                  </CardTitle>
                  <CardDescription>
                    Potencial de ventilação natural baseado em ventos predominantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Ventos Predominantes</div>
                      <div className="text-lg font-semibold">
                        {analysis.ventilationAnalysis.predominantWinds}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Potencial de Ventilação Natural</div>
                      <Badge variant="default" className="text-sm capitalize">
                        {analysis.ventilationAnalysis.naturalVentilationPotential}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      💡 Recomendações:
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                      {analysis.ventilationAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resumo" className="space-y-4 mt-6">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      Resumo da Análise Solar
                    </CardTitle>
                    <CardDescription>
                      Hemisfério {analysis.location.hemisphere === 'sul' ? 'Sul' : 'Norte'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-green-700 dark:text-green-300">
                            ✓ Melhor Orientação
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold capitalize mb-2">
                            {analysis.bestOrientation.direction}
                          </div>
                          <Badge variant="default" className="mb-3">
                            {analysis.bestOrientation.suitability}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {analysis.bestOrientation.advantages[0]}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-orange-700 dark:text-orange-300">
                            ⚠ Pior Orientação
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold capitalize mb-2">
                            {analysis.worstOrientation.direction}
                          </div>
                          <Badge variant="destructive" className="mb-3">
                            {analysis.worstOrientation.suitability}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {analysis.worstOrientation.disadvantages[0]}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="text-sm font-medium">Horas de Luz Solar por Estação</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Verão</div>
                          <div className="text-lg font-semibold">
                            {analysis.sunlightHours.summer.totalHours.toFixed(1)}h
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Outono</div>
                          <div className="text-lg font-semibold">
                            {analysis.sunlightHours.fall.totalHours.toFixed(1)}h
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Inverno</div>
                          <div className="text-lg font-semibold">
                            {analysis.sunlightHours.winter.totalHours.toFixed(1)}h
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Primavera</div>
                          <div className="text-lg font-semibold">
                            {analysis.sunlightHours.spring.totalHours.toFixed(1)}h
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
