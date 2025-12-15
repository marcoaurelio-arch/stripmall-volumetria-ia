import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Trash2, Check, Layers, Download, Upload, Combine } from "lucide-react";

interface ScenarioManagerProps {
  projectId: number;
  currentPolygon?: string;
  currentArea?: number;
  onScenarioLoad: (polygon: string, area: number) => void;
}

export default function ScenarioManager({ 
  projectId, 
  currentPolygon, 
  currentArea,
  onScenarioLoad 
}: ScenarioManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<number[]>([]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [mergedName, setMergedName] = useState("");

  const utils = trpc.useUtils();

  // Listar cenários
  const { data: scenarios = [], isLoading } = trpc.scenario.list.useQuery({ projectId });

  // Criar cenário
  const createMutation = trpc.scenario.create.useMutation({
    onSuccess: () => {
      toast.success("Cenário salvo com sucesso!");
      setShowSaveDialog(false);
      setScenarioName("");
      setScenarioDescription("");
      utils.scenario.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao salvar cenário: ${error.message}`);
    },
  });

  // Deletar cenário
  const deleteMutation = trpc.scenario.delete.useMutation({
    onSuccess: () => {
      toast.success("Cenário excluído com sucesso!");
      utils.scenario.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cenário: ${error.message}`);
    },
  });

  // Ativar cenário
  const setActiveMutation = trpc.scenario.setActive.useMutation({
    onSuccess: () => {
      toast.success("Cenário ativado!");
      utils.scenario.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao ativar cenário: ${error.message}`);
    },
  });

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) {
      toast.error("Por favor, insira um nome para o cenário");
      return;
    }

    if (!currentPolygon || !currentArea) {
      toast.error("Desenhe um polígono no mapa antes de salvar");
      return;
    }

    createMutation.mutate({
      projectId,
      name: scenarioName,
      description: scenarioDescription,
      polygonCoordinates: currentPolygon,
      area: currentArea,
    });
  };

  const handleLoadScenario = (scenario: any) => {
    onScenarioLoad(scenario.polygonCoordinates, scenario.area);
    setActiveMutation.mutate({
      projectId,
      scenarioId: scenario.id,
    });
  };

  const handleDeleteScenario = (scenarioId: number) => {
    if (confirm("Tem certeza que deseja excluir este cenário?")) {
      deleteMutation.mutate({ id: scenarioId });
    }
  };

  const handleExportCSV = () => {
    if (scenarios.length === 0) {
      toast.error("Nenhum cenário para exportar");
      return;
    }

    // Cabeçalho do CSV
    const headers = [
      "ID",
      "Nome",
      "Descrição",
      "\u00c1rea (m\u00b2)",
      "Ativo",
      "Data de Criação",
      "Número de Pontos",
      "Coordenadas (JSON)"
    ];

    // Linhas de dados
    const rows = scenarios.map(scenario => {
      const coordinates = JSON.parse(scenario.polygonCoordinates || "[]");
      return [
        scenario.id,
        `"${scenario.name}"`,
        `"${scenario.description || ""}"`,
        scenario.area,
        scenario.isActive === 1 ? "Sim" : "N\u00e3o",
        new Date(scenario.createdAt).toLocaleString("pt-BR"),
        coordinates.length,
        `"${scenario.polygonCoordinates}"`
      ];
    });

    // Montar CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Criar blob e fazer download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `cenarios-projeto-${projectId}-${Date.now()}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${scenarios.length} cenário(s) exportado(s) com sucesso!`);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Por favor, selecione um arquivo CSV");
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.error("Arquivo CSV vazio ou inválido");
          setIsImporting(false);
          return;
        }

        // Pular cabeçalho
        const dataLines = lines.slice(1);
        let importedCount = 0;
        let errorCount = 0;

        for (const line of dataLines) {
          try {
            // Parse CSV line (considerando campos entre aspas)
            const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
            const fields = line.split(regex).map(field => 
              field.trim().replace(/^"|"$/g, '')
            );

            if (fields.length < 8) {
              errorCount++;
              continue;
            }

            const [id, name, description, area, isActive, createdAt, numPoints, coordinates] = fields;

            // Validar dados
            if (!name || !coordinates || !area) {
              errorCount++;
              continue;
            }

            // Criar cenário
            await createMutation.mutateAsync({
              projectId,
              name: name,
              description: description || undefined,
              polygonCoordinates: coordinates,
              area: parseFloat(area),
            });

            importedCount++;
          } catch (error) {
            console.error('Erro ao importar linha:', error);
            errorCount++;
          }
        }

        if (importedCount > 0) {
          toast.success(`${importedCount} cenário(s) importado(s) com sucesso!`);
          utils.scenario.list.invalidate({ projectId });
        }
        
        if (errorCount > 0) {
          toast.warning(`${errorCount} linha(s) não puderam ser importadas`);
        }

      } catch (error) {
        console.error('Erro ao processar CSV:', error);
        toast.error("Erro ao processar arquivo CSV");
      } finally {
        setIsImporting(false);
        // Limpar input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      toast.error("Erro ao ler arquivo");
      setIsImporting(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Função para calcular convex hull (envoltória convexa)
  const calculateConvexHull = (points: Array<{lat: number, lng: number}>) => {
    if (points.length < 3) return points;

    // Ordenar pontos por x, depois por y
    const sorted = [...points].sort((a, b) => {
      if (a.lng === b.lng) return a.lat - b.lat;
      return a.lng - b.lng;
    });

    // Construir hull inferior
    const lower: Array<{lat: number, lng: number}> = [];
    for (const point of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    // Construir hull superior
    const upper: Array<{lat: number, lng: number}> = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const point = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }

    // Remover último ponto de cada metade (duplicado)
    lower.pop();
    upper.pop();

    return lower.concat(upper);
  };

  // Produto vetorial para determinar direção
  const cross = (o: {lat: number, lng: number}, a: {lat: number, lng: number}, b: {lat: number, lng: number}) => {
    return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
  };

  // Calcular área do polígono usando fórmula de Shoelace
  const calculatePolygonArea = (points: Array<{lat: number, lng: number}>) => {
    if (points.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].lng * points[j].lat;
      area -= points[j].lng * points[i].lat;
    }
    area = Math.abs(area) / 2;

    // Converter de graus quadrados para metros quadrados (aproximado)
    // 1 grau de latitude ≈ 111 km
    // 1 grau de longitude varia com latitude, usando aproximação
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const latToMeters = 111000;
    const lngToMeters = 111000 * Math.cos(avgLat * Math.PI / 180);
    
    return area * latToMeters * lngToMeters;
  };

  const handleMergeScenarios = () => {
    if (selectedScenarios.length < 2) {
      toast.error("Selecione pelo menos 2 cenários para mesclar");
      return;
    }

    setShowMergeDialog(true);
  };

  const confirmMerge = async () => {
    if (!mergedName.trim()) {
      toast.error("Por favor, insira um nome para o cenário mesclado");
      return;
    }

    try {
      // Coletar todos os pontos dos cenários selecionados
      const allPoints: Array<{lat: number, lng: number}> = [];
      
      for (const scenarioId of selectedScenarios) {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (scenario && scenario.polygonCoordinates) {
          const coords = JSON.parse(scenario.polygonCoordinates);
          allPoints.push(...coords);
        }
      }

      if (allPoints.length === 0) {
        toast.error("Nenhum ponto encontrado nos cenários selecionados");
        return;
      }

      // Calcular convex hull
      const mergedPolygon = calculateConvexHull(allPoints);
      const mergedArea = calculatePolygonArea(mergedPolygon);

      // Criar novo cenário com polígono mesclado
      await createMutation.mutateAsync({
        projectId,
        name: mergedName,
        description: `Mesclagem de ${selectedScenarios.length} cenários`,
        polygonCoordinates: JSON.stringify(mergedPolygon),
        area: mergedArea,
      });

      toast.success("Cenários mesclados com sucesso!");
      setShowMergeDialog(false);
      setMergedName("");
      setSelectedScenarios([]);
      utils.scenario.list.invalidate({ projectId });
    } catch (error) {
      console.error('Erro ao mesclar cenários:', error);
      toast.error("Erro ao mesclar cenários");
    }
  };

  const toggleScenarioSelection = (scenarioId: number) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Cenários de Polígonos
              </CardTitle>
              <CardDescription>
                Salve e compare diferentes configurações de terreno
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleMergeScenarios}
                variant="outline"
                size="sm"
                disabled={selectedScenarios.length < 2}
              >
                <Combine className="h-4 w-4 mr-2" />
                Mesclar ({selectedScenarios.length})
              </Button>
              <Button 
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                disabled={scenarios.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button 
                variant="outline"
                size="sm"
                disabled={isImporting}
                onClick={() => document.getElementById('csv-import-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importando..." : "Importar CSV"}
              </Button>
              <input
                id="csv-import-input"
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                style={{ display: 'none' }}
              />
              <Button 
                onClick={() => setShowSaveDialog(true)}
                disabled={!currentPolygon || !currentArea}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Cenário Atual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando cenários...</p>
          ) : scenarios.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum cenário salvo ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Desenhe um polígono no mapa e salve para começar
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {scenarios.map((scenario) => (
                <Card 
                  key={scenario.id} 
                  className={`${scenario.isActive ? 'border-primary bg-primary/5' : ''} ${selectedScenarios.includes(scenario.id) ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={() => toggleScenarioSelection(scenario.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{scenario.name}</h4>
                          {scenario.isActive === 1 && (
                            <span className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              <Check className="h-3 w-3" />
                              Ativo
                            </span>
                          )}
                        </div>
                        {scenario.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {scenario.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Área: <span className="font-semibold text-foreground">{scenario.area.toLocaleString()} m²</span>
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(scenario.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleLoadScenario(scenario)}
                          variant="secondary"
                          size="sm"
                          disabled={scenario.isActive === 1}
                        >
                          Carregar
                        </Button>
                        <Button
                          onClick={() => handleDeleteScenario(scenario.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para salvar cenário */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Cenário</DialogTitle>
            <DialogDescription>
              Dê um nome ao cenário atual para salvá-lo e poder compará-lo com outras configurações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="scenario-name">Nome do Cenário *</Label>
              <Input
                id="scenario-name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Ex: Configuração 1, Opção A, etc."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="scenario-description">Descrição (opcional)</Label>
              <Textarea
                id="scenario-description"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                placeholder="Adicione detalhes sobre este cenário..."
                rows={3}
                className="mt-1.5"
              />
            </div>
            {currentArea && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Área do polígono: <span className="font-semibold text-foreground">{currentArea.toLocaleString()} m²</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveScenario} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar Cenário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para mesclar cenários */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar Cenários</DialogTitle>
            <DialogDescription>
              Os {selectedScenarios.length} cenários selecionados serão mesclados em um único polígono consolidado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="merged-name">Nome do Cenário Mesclado *</Label>
              <Input
                id="merged-name"
                value={mergedName}
                onChange={(e) => setMergedName(e.target.value)}
                placeholder="Ex: Terrenos Combinados"
                className="mt-1.5"
              />
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{selectedScenarios.length}</strong> cenários serão mesclados usando convex hull (envoltória convexa)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmMerge} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Mesclando..." : "Mesclar Cenários"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
