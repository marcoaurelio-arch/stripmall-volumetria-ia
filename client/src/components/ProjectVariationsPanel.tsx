import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, Building2, Car, Trees, Layers } from "lucide-react";
import { toast } from "sonner";

interface ProjectVariationsPanelProps {
  projectId: number;
  totalArea: number;
  buildableArea: number;
  occupancyRate: number;
  buildingCoefficient: number;
  setbackFront: number;
  setbackSide: number;
  setbackRear: number;
  minParkingSpaces: number;
  permeableAreaRequired: number;
}

export default function ProjectVariationsPanel(props: ProjectVariationsPanelProps) {
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const generateMutation = trpc.variations.generate.useMutation({
    onSuccess: (data) => {
      if (data.success && data.data) {
        toast.success("Variações geradas com sucesso!");
        setSelectedVariationId(data.data.bestVariation.id);
      } else {
        toast.error(data.error || "Erro ao gerar variações");
      }
    },
    onError: (error) => {
      toast.error("Erro ao gerar variações: " + error.message);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      projectId: props.projectId,
      totalArea: props.totalArea,
      buildableArea: props.buildableArea,
      occupancyRate: props.occupancyRate,
      buildingCoefficient: props.buildingCoefficient,
      setbackFront: props.setbackFront,
      setbackSide: props.setbackSide,
      setbackRear: props.setbackRear,
      minParkingSpaces: props.minParkingSpaces,
      permeableAreaRequired: props.permeableAreaRequired,
      count: 5,
    });
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((cid) => cid !== id));
    } else if (compareIds.length < 3) {
      setCompareIds([...compareIds, id]);
    } else {
      toast.warning("Você pode comparar no máximo 3 variações");
    }
  };

  const result = generateMutation.data?.success ? generateMutation.data.data : undefined;
  const selectedVariation = result?.variations.find((v) => v.id === selectedVariationId);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Variações de Projeto Geradas por IA
        </CardTitle>
        <CardDescription>
          Explore diferentes configurações de layout otimizadas para seu strip mall
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!result && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Sparkles className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Gere Variações Inteligentes</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Nossa IA irá criar 5 variações de layout otimizadas para diferentes objetivos:
                eficiência comercial, mix equilibrado, lojas âncora, sustentabilidade e baixo custo.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending} size="lg">
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {generateMutation.isPending ? "Gerando Variações..." : "Gerar Variações com IA"}
            </Button>
          </div>
        )}

        {result && (
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="grid">Visão Geral</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="compare">Comparar</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-6 mt-6">
              {/* Melhor Variação Destacada */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Melhor Variação Recomendada
                    </CardTitle>
                    <Badge variant="default" className="text-sm">
                      Score: {result.bestVariation.scores.overall}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{result.bestVariation.name}</h3>
                      <p className="text-sm text-muted-foreground">{result.bestVariation.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Lojas</div>
                        <div className="text-xl font-bold">{result.bestVariation.numberOfStores}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Vagas</div>
                        <div className="text-xl font-bold">{result.bestVariation.parkingSpaces}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Pavimentos</div>
                        <div className="text-xl font-bold">{result.bestVariation.floors}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Área Construída</div>
                        <div className="text-xl font-bold">{result.bestVariation.totalBuiltArea.toFixed(0)}m²</div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedVariationId(result.bestVariation.id)}
                      variant="default"
                      className="w-full mt-4"
                    >
                      Ver Detalhes Completos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Grid de Todas as Variações */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {result.variations.map((variation) => {
                  const isBest = variation.id === result.bestVariation.id;
                  return (
                    <Card
                      key={variation.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedVariationId === variation.id
                          ? "ring-2 ring-primary"
                          : ""
                      } ${isBest ? "border-green-300 dark:border-green-700" : ""}`}
                      onClick={() => setSelectedVariationId(variation.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{variation.name}</CardTitle>
                          {isBest && (
                            <Badge variant="default" className="text-xs">
                              Melhor
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs line-clamp-2">
                          {variation.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{variation.numberOfStores} lojas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>{variation.parkingSpaces} vagas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span>{variation.floors} pav.</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trees className="h-4 w-4 text-muted-foreground" />
                            <span>{variation.greenArea.toFixed(0)}m²</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span>Score Geral</span>
                            <Badge variant={getScoreVariant(variation.scores.overall)}>
                              {variation.scores.overall}/100
                            </Badge>
                          </div>
                          <Progress value={variation.scores.overall} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleGenerate} variant="outline" disabled={generateMutation.isPending}>
                  {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gerar Novas Variações
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              {selectedVariation ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedVariation.name}</CardTitle>
                      <CardDescription>{selectedVariation.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Configuração de Lojas */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Configuração de Lojas</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Pequenas (&lt; 50m²)</div>
                            <div className="text-2xl font-bold">{selectedVariation.storeConfiguration.small}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Médias (50-100m²)</div>
                            <div className="text-2xl font-bold">{selectedVariation.storeConfiguration.medium}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Grandes (&gt; 100m²)</div>
                            <div className="text-2xl font-bold">{selectedVariation.storeConfiguration.large}</div>
                          </div>
                        </div>
                      </div>

                      {/* Áreas Detalhadas */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Distribuição de Áreas</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Área Comercial</span>
                              <span className="text-sm font-medium">{selectedVariation.commercialArea.toFixed(0)}m²</span>
                            </div>
                            <Progress
                              value={(selectedVariation.commercialArea / selectedVariation.totalBuiltArea) * 100}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Circulação</span>
                              <span className="text-sm font-medium">{selectedVariation.circulationArea.toFixed(0)}m²</span>
                            </div>
                            <Progress
                              value={(selectedVariation.circulationArea / selectedVariation.totalBuiltArea) * 100}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Serviço</span>
                              <span className="text-sm font-medium">{selectedVariation.serviceArea.toFixed(0)}m²</span>
                            </div>
                            <Progress
                              value={(selectedVariation.serviceArea / selectedVariation.totalBuiltArea) * 100}
                              className="h-2"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">Área Verde</span>
                              <span className="text-sm font-medium">{selectedVariation.greenArea.toFixed(0)}m²</span>
                            </div>
                            <Progress
                              value={(selectedVariation.greenArea / props.totalArea) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Scores Detalhados */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Avaliação por Critério</h4>
                        <div className="grid gap-3">
                          {Object.entries({
                            efficiency: "Eficiência",
                            accessibility: "Acessibilidade",
                            flexibility: "Flexibilidade",
                            sustainability: "Sustentabilidade",
                            cost: "Custo",
                          }).map(([key, label]) => {
                            const score = selectedVariation.scores[key as keyof typeof selectedVariation.scores];
                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm">{label}</span>
                                  <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                                    {score}/100
                                  </span>
                                </div>
                                <Progress value={score} className="h-2" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Vantagens */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          Vantagens
                        </h4>
                        <ul className="space-y-2">
                          {selectedVariation.advantages.map((adv, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Desvantagens */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <TrendingDown className="h-4 w-4" />
                          Desvantagens
                        </h4>
                        <ul className="space-y-2">
                          {selectedVariation.disadvantages.map((dis, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                              <span>{dis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recomendações */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <Sparkles className="h-4 w-4" />
                          Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {selectedVariation.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">💡</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Informações Técnicas */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Layout de Estacionamento</div>
                          <div className="text-sm font-medium capitalize">{selectedVariation.parkingLayout}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Orientação do Edifício</div>
                          <div className="text-sm font-medium capitalize">{selectedVariation.buildingOrientation}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      Selecione uma variação na aba "Visão Geral" para ver os detalhes completos
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compare" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Matriz de Comparação</CardTitle>
                  <CardDescription>
                    Compare diferentes variações lado a lado por critério
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">Critério</th>
                          {result.variations.map((v) => (
                            <th key={v.id} className="text-center py-3 px-2 font-semibold">
                              <div className="space-y-1">
                                <div className="text-xs">{v.name}</div>
                                {v.id === result.bestVariation.id && (
                                  <Badge variant="default" className="text-xs">
                                    Melhor
                                  </Badge>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.comparisonMatrix.map((row) => (
                          <tr key={row.criterion} className="border-b">
                            <td className="py-3 px-2 font-medium">{row.criterion}</td>
                            {result.variations.map((v) => {
                              const score = row.variations[v.id];
                              const isHighest = score === Math.max(...Object.values(row.variations));
                              return (
                                <td key={v.id} className="text-center py-3 px-2">
                                  <span
                                    className={`font-semibold ${
                                      isHighest ? "text-green-600 dark:text-green-400" : getScoreColor(score)
                                    }`}
                                  >
                                    {score}
                                    {isHighest && " 🏆"}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
