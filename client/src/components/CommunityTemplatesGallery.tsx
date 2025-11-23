import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Download, Eye, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CommunityTemplatesGalleryProps {
  onApplyTemplate?: (layout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  }) => void;
}

export function CommunityTemplatesGallery({
  onApplyTemplate,
}: CommunityTemplatesGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<'retangular' | 'L' | 'esquina' | 'irregular' | 'outro' | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: templates, isLoading } = trpc.customTemplates.publicTemplates.useQuery({
    category: selectedCategory,
    limit: 20,
  });

  const { data: myTemplates } = trpc.customTemplates.myTemplates.useQuery();

  const incrementUsageMutation = trpc.customTemplates.incrementUsage.useMutation();
  const rateMutation = trpc.customTemplates.rate.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada!");
    },
  });

  const handleApplyTemplate = (template: any) => {
    incrementUsageMutation.mutate({ id: template.id });
    
    onApplyTemplate?.({
      offsetX: template.offsetX,
      offsetY: template.offsetY,
      rotation: template.rotation,
      scale: template.scale,
    });

    toast.success(`Template "${template.name}" aplicado!`);
    setDetailsOpen(false);
  };

  const handleRate = (templateId: number, rating: number) => {
    rateMutation.mutate({ id: templateId, rating });
  };

  const renderTemplateCard = (template: any) => (
    <Card
      key={template.id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        setSelectedTemplate(template);
        setDetailsOpen(true);
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-xs mt-1">
              {template.description || "Sem descrição"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Estatísticas */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{template.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({template.ratingCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>{template.usageCount}</span>
            </div>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Área recomendada */}
          {(template.recommendedMinArea || template.recommendedMaxArea) && (
            <p className="text-xs text-muted-foreground">
              Área: {template.recommendedMinArea || '?'} - {template.recommendedMaxArea || '?'} m²
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Templates da Comunidade
              </CardTitle>
              <CardDescription>
                Explore e use templates criados por outros usuários
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory || 'all'} onValueChange={(v) => setSelectedCategory(v === 'all' ? undefined : v as any)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="retangular">Retangular</TabsTrigger>
              <TabsTrigger value="L">L</TabsTrigger>
              <TabsTrigger value="esquina">Esquina</TabsTrigger>
              <TabsTrigger value="irregular">Irregular</TabsTrigger>
              <TabsTrigger value="outro">Outro</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory || 'all'} className="mt-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando templates...
                </div>
              ) : templates && templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map(renderTemplateCard)}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum template encontrado nesta categoria
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Meus Templates */}
          {myTemplates && myTemplates.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3">Meus Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myTemplates.map(renderTemplateCard)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      {selectedTemplate && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                {selectedTemplate.description || "Sem descrição"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{selectedTemplate.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({selectedTemplate.ratingCount} avaliações)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="font-semibold">{selectedTemplate.usageCount}</span>
                  <span className="text-sm text-muted-foreground">usos</span>
                </div>
              </div>

              {/* Parâmetros */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Offset X</p>
                  <p className="font-semibold">{selectedTemplate.offsetX}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offset Y</p>
                  <p className="font-semibold">{selectedTemplate.offsetY}m</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rotação</p>
                  <p className="font-semibold">{selectedTemplate.rotation}°</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Escala</p>
                  <p className="font-semibold">{selectedTemplate.scale}%</p>
                </div>
              </div>

              {/* Tags */}
              {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Avaliação */}
              <div>
                <p className="text-sm font-semibold mb-2">Avaliar este template</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRate(selectedTemplate.id, rating)}
                      className="hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= selectedTemplate.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => handleApplyTemplate(selectedTemplate)}>
                  <Download className="h-4 w-4 mr-2" />
                  Aplicar Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
