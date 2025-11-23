import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layers, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LayoutTemplatesGalleryProps {
  terrain: {
    width: number;
    length: number;
    area: number;
  };
  setbacks: {
    frontal: number;
    lateral: number;
    fundos: number;
  };
  onApplyTemplate: (layout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  }) => void;
}

export function LayoutTemplatesGallery({
  terrain,
  setbacks,
  onApplyTemplate,
}: LayoutTemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'retangular' | 'L' | 'esquina' | 'irregular' | 'estreito' | 'triangular' | 'patio'>('retangular');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Query para listar templates
  const { data: allTemplates } = trpc.layoutTemplates.list.useQuery();

  // Query para templates recomendados
  const { data: recommendedTemplates } = trpc.layoutTemplates.recommend.useQuery({
    width: terrain.width,
    length: terrain.length,
    area: terrain.area,
    isCorner: false,
    isIrregular: false,
    hasLShape: false,
  });

  // Mutation para aplicar template
  const applyMutation = trpc.layoutTemplates.applyTemplate.useMutation({
    onSuccess: (layout) => {
      onApplyTemplate(layout);
      setShowDialog(false);
      toast.success(`Template "${selectedTemplate.name}" aplicado com sucesso!`);
    },
    onError: (error) => {
      toast.error(`Erro ao aplicar template: ${error.message}`);
    },
  });

  // Filtrar templates por categoria
  const templatesByCategory = allTemplates?.filter((t) => t.category === selectedCategory) || [];

  // Verificar se template é recomendado
  const isRecommended = (templateId: string) => {
    return recommendedTemplates?.some((t) => t.id === templateId);
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    applyMutation.mutate({
      templateId: selectedTemplate.id,
      terrain: {
        width: terrain.width,
        length: terrain.length,
        area: terrain.area,
        setbacks,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Templates de Layout
        </CardTitle>
        <CardDescription>
          Aplique layouts pré-configurados otimizados para diferentes tipos de terreno
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs de categorias */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
          <TabsList className="grid w-full grid-cols-7 gap-1">
            <TabsTrigger value="retangular">Retangular</TabsTrigger>
            <TabsTrigger value="L">Em L</TabsTrigger>
            <TabsTrigger value="esquina">Esquina</TabsTrigger>
            <TabsTrigger value="irregular">Irregular</TabsTrigger>
            <TabsTrigger value="estreito">Estreito</TabsTrigger>
            <TabsTrigger value="triangular">Triangular</TabsTrigger>
            <TabsTrigger value="patio">Pátio</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Grid de templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templatesByCategory.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary ${
                isRecommended(template.id) ? 'bg-primary/5 border-primary' : 'border-border'
              }`}
              onClick={() => {
                setSelectedTemplate(template);
                setShowDialog(true);
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{template.name}</h4>
                {isRecommended(template.id) && (
                  <Badge variant="default" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recomendado
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              
              {/* Preview visual simplificado */}
              <div className="bg-muted rounded-md p-2 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-20">
                  {/* Terreno */}
                  <rect x="5" y="5" width="90" height="90" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
                  {/* Edifício (baseado no preview do template) */}
                  <path d={template.preview} fill="#3b82f6" opacity="0.7" />
                </svg>
              </div>

              {/* Parâmetros */}
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>Escala: {template.layout.scale}%</span>
                <span>Rotação: {template.layout.rotation}°</span>
              </div>
            </div>
          ))}
        </div>

        {templatesByCategory.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nenhum template disponível para esta categoria
          </div>
        )}

        {/* Dialog de detalhes do template */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate?.name}</DialogTitle>
              <DialogDescription>{selectedTemplate?.description}</DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-4">
                {/* Preview maior */}
                <div className="bg-muted rounded-lg p-4">
                  <svg viewBox="0 0 100 100" className="w-full h-48">
                    <rect x="5" y="5" width="90" height="90" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
                    <path d={selectedTemplate.preview} fill="#3b82f6" opacity="0.7" />
                  </svg>
                </div>

                {/* Parâmetros */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Parâmetros do Layout</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Posição X</p>
                      <p className="text-sm font-semibold">{selectedTemplate.layout.offsetX}%</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Posição Y</p>
                      <p className="text-sm font-semibold">{selectedTemplate.layout.offsetY}%</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Rotação</p>
                      <p className="text-sm font-semibold">{selectedTemplate.layout.rotation}°</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Escala</p>
                      <p className="text-sm font-semibold">{selectedTemplate.layout.scale}%</p>
                    </div>
                  </div>
                </div>

                {/* Vantagens */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Vantagens
                  </h4>
                  <ul className="space-y-1">
                    {selectedTemplate.pros.map((pro: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Desvantagens */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-orange-600" />
                    Considerações
                  </h4>
                  <ul className="space-y-1">
                    {selectedTemplate.cons.map((con: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">•</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recomendado para */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Recomendado Para</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.recommendedFor.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleApplyTemplate} disabled={applyMutation.isPending}>
                {applyMutation.isPending ? "Aplicando..." : "Aplicar Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
