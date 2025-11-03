import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Trash2, Check, Layers } from "lucide-react";

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
            <Button 
              onClick={() => setShowSaveDialog(true)}
              disabled={!currentPolygon || !currentArea}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Cenário Atual
            </Button>
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
                  className={`${scenario.isActive ? 'border-primary bg-primary/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
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
    </div>
  );
}
