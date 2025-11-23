import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Save, RefreshCw, Palette } from "lucide-react";
import { toast } from "sonner";

interface ProjectDNAEditorProps {
  projectId: number;
}

export default function ProjectDNAEditor({ projectId }: ProjectDNAEditorProps) {
  const utils = trpc.useUtils();
  
  const { data, isLoading } = trpc.projectDNA.get.useQuery({ projectId });
  
  const generateMutation = trpc.projectDNA.generate.useMutation({
    onSuccess: () => {
      utils.projectDNA.get.invalidate({ projectId });
      toast.success("DNA do projeto gerado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao gerar DNA: ${error.message}`);
    },
  });
  
  const updateMutation = trpc.projectDNA.update.useMutation({
    onSuccess: () => {
      utils.projectDNA.get.invalidate({ projectId });
      toast.success("DNA do projeto atualizado!");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar DNA: ${error.message}`);
    },
  });

  const [editedDNA, setEditedDNA] = useState({
    buildingShape: "",
    style: "",
    features: [] as string[],
    primaryColor: "#FFFFFF",
    accentColor: "#404040",
    materials: [] as string[],
    landscaping: "",
    layout: "",
    context: "",
  });

  // Atualizar editedDNA quando DNA carregar
  useEffect(() => {
    if (data?.dna) {
      setEditedDNA({
        buildingShape: data.dna.buildingShape || "",
        style: data.dna.style || "",
        features: data.dna.features || [],
        primaryColor: data.dna.primaryColor || "#FFFFFF",
        accentColor: data.dna.accentColor || "#404040",
        materials: data.dna.materials || [],
        landscaping: data.dna.landscaping || "",
        layout: data.dna.layout || "",
        context: data.dna.context || "",
      });
    }
  }, [data]);

  const handleGenerate = () => {
    generateMutation.mutate({ projectId });
  };

  const handleSave = () => {
    updateMutation.mutate({
      projectId,
      dna: editedDNA,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              DNA Arquitetônico do Projeto
            </CardTitle>
            <CardDescription>
              Define a identidade visual que será mantida em todos os estudos (conceitual, planta, fachada, cortes)
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Gerar Automaticamente
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data?.generated ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhum DNA arquitetônico definido ainda.
            </p>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar DNA Automaticamente"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="buildingShape">Forma do Edifício</Label>
              <Textarea
                id="buildingShape"
                placeholder="Ex: Edifício horizontal de 1 pavimento com layout linear, cobertura plana..."
                value={editedDNA.buildingShape}
                onChange={(e) => setEditedDNA({ ...editedDNA, buildingShape: e.target.value })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Volumetria, forma e organização espacial
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Estilo Arquitetônico</Label>
              <Textarea
                id="style"
                placeholder="Ex: Minimalista contemporâneo com linhas horizontais marcantes..."
                value={editedDNA.style}
                onChange={(e) => setEditedDNA({ ...editedDNA, style: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={editedDNA.primaryColor}
                    onChange={(e) => setEditedDNA({ ...editedDNA, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={editedDNA.primaryColor}
                    onChange={(e) => setEditedDNA({ ...editedDNA, primaryColor: e.target.value })}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={editedDNA.accentColor}
                    onChange={(e) => setEditedDNA({ ...editedDNA, accentColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={editedDNA.accentColor}
                    onChange={(e) => setEditedDNA({ ...editedDNA, accentColor: e.target.value })}
                    placeholder="#404040"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Materiais</Label>
              <Input
                id="materials"
                placeholder="Ex: Concreto, vidro, cerâmica (separados por vírgula)"
                value={editedDNA.materials.join(", ")}
                onChange={(e) => setEditedDNA({ ...editedDNA, materials: e.target.value.split(",").map(m => m.trim()) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landscaping">Paisagismo</Label>
              <Textarea
                id="landscaping"
                placeholder="Ex: Árvores de médio porte no pátio central, jardins lineares..."
                value={editedDNA.landscaping}
                onChange={(e) => setEditedDNA({ ...editedDNA, landscaping: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Textarea
                id="layout"
                placeholder="Ex: Lojas dispostas em linha com pátio central, estacionamento frontal..."
                value={editedDNA.layout}
                onChange={(e) => setEditedDNA({ ...editedDNA, layout: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar DNA
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Dica:</strong> Após salvar o DNA, todas as novas imagens geradas (conceitual, planta, fachada, cortes) manterão automaticamente esta identidade visual, garantindo consistência entre todos os estudos.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
