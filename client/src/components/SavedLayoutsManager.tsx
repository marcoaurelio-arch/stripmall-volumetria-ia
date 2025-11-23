import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Trash2, Download, CheckCircle, AlertTriangle, Layers } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { BuildingLayout } from "./BuildingLayoutAdjuster";

interface SavedLayoutsManagerProps {
  projectId: number;
  currentLayout: BuildingLayout;
  onLoadLayout: (layout: BuildingLayout) => void;
}

export function SavedLayoutsManager({
  projectId,
  currentLayout,
  onLoadLayout,
}: SavedLayoutsManagerProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState("");
  const [layoutDescription, setLayoutDescription] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: layouts, isLoading } = trpc.savedLayout.list.useQuery({ projectId });

  // Mutations
  const createMutation = trpc.savedLayout.create.useMutation({
    onSuccess: () => {
      utils.savedLayout.list.invalidate({ projectId });
      setSaveDialogOpen(false);
      setLayoutName("");
      setLayoutDescription("");
      toast.success("Layout salvo com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar layout: ${error.message}`);
    },
  });

  const deleteMutation = trpc.savedLayout.delete.useMutation({
    onSuccess: () => {
      utils.savedLayout.list.invalidate({ projectId });
      toast.success("Layout removido");
    },
    onError: (error) => {
      toast.error(`Erro ao remover layout: ${error.message}`);
    },
  });

  const loadMutation = trpc.savedLayout.load.useMutation({
    onSuccess: (data) => {
      onLoadLayout(data);
      toast.success("Layout carregado!");
    },
    onError: (error) => {
      toast.error(`Erro ao carregar layout: ${error.message}`);
    },
  });

  const handleSaveLayout = () => {
    if (!layoutName.trim()) {
      toast.error("Digite um nome para o layout");
      return;
    }

    createMutation.mutate({
      projectId,
      name: layoutName,
      description: layoutDescription,
      offsetX: currentLayout.offsetX,
      offsetY: currentLayout.offsetY,
      rotation: currentLayout.rotation,
      scale: currentLayout.scale,
      isValid: true, // TODO: pegar do validation result
      validationNotes: undefined,
    });
  };

  const handleLoadLayout = (layoutId: number) => {
    loadMutation.mutate({ layoutId });
  };

  const handleDeleteLayout = (layoutId: number, layoutName: string) => {
    if (confirm(`Tem certeza que deseja remover o layout "${layoutName}"?`)) {
      deleteMutation.mutate({ layoutId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Layouts Salvos
        </CardTitle>
        <CardDescription>
          Salve e compare diferentes configurações de layout do edifício
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botão para salvar layout atual */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Salvar Layout Atual
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Salvar Layout</DialogTitle>
              <DialogDescription>
                Dê um nome e descrição para este layout. Você poderá carregá-lo depois.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="layout-name">Nome do Layout</Label>
                <Input
                  id="layout-name"
                  placeholder="Ex: Layout Frontal, Aproveitamento Máximo, etc."
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="layout-description">Descrição (opcional)</Label>
                <Textarea
                  id="layout-description"
                  placeholder="Descreva as características deste layout..."
                  value={layoutDescription}
                  onChange={(e) => setLayoutDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                <p className="font-medium">Configuração Atual:</p>
                <p>• Posição: X={currentLayout.offsetX}%, Y={currentLayout.offsetY}%</p>
                <p>• Rotação: {currentLayout.rotation}°</p>
                <p>• Escala: {currentLayout.scale}%</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveLayout} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lista de layouts salvos */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Carregando layouts...</div>
        ) : layouts && layouts.length > 0 ? (
          <div className="space-y-2">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{layout.name}</h4>
                      {layout.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                      )}
                    </div>
                    {layout.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {layout.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Pos: X={layout.offsetX}%, Y={layout.offsetY}%</span>
                      <span>Rot: {layout.rotation}°</span>
                      <span>Escala: {layout.scale}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoadLayout(layout.id)}
                      disabled={loadMutation.isPending}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLayout(layout.id, layout.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
            <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum layout salvo ainda</p>
            <p className="text-xs mt-1">
              Ajuste o layout acima e clique em "Salvar Layout Atual"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
