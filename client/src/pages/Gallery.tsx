/**
 * Gallery Page
 * Galeria de projetos exemplo com alta consistência
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Eye, Copy, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

export default function Gallery() {
  const [, setLocation] = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Buscar projetos exemplo
  const { data: examples, isLoading } = trpc.gallery.list.useQuery();

  // Buscar detalhes do projeto selecionado
  const { data: selectedProject } = trpc.gallery.getById.useQuery(
    { id: selectedProjectId! },
    { enabled: selectedProjectId !== null }
  );

  // Mutation para duplicar projeto
  const duplicateMutation = trpc.gallery.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success('Projeto duplicado com sucesso!', {
        description: 'Redirecionando para o novo projeto...',
      });
      setTimeout(() => {
        setLocation(`/project/${data.projectId}`);
      }, 1500);
    },
    onError: (error) => {
      toast.error('Erro ao duplicar projeto', {
        description: error.message,
      });
    },
  });

  const handleDuplicate = (exampleId: number) => {
    duplicateMutation.mutate({ exampleId });
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50';
    if (score >= 90) return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 95) return 'Excelente';
    if (score >= 90) return 'Ótimo';
    return 'Bom';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Carregando galeria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Galeria de Inspiração</h1>
              </div>
              <p className="text-slate-600">
                Projetos exemplo com alta consistência (score 90%+) para servir como referência
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/')}>
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples?.map((example) => (
            <Card key={example.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative h-48 bg-slate-200">
                {example.thumbnailUrl ? (
                  <img
                    src={example.thumbnailUrl}
                    alt={example.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                
                {/* Featured Badge */}
                {example.featured === 1 && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Destaque
                  </Badge>
                )}

                {/* Consistency Score */}
                <Badge className={`absolute top-2 right-2 ${getScoreColor(example.consistencyScore)}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {example.consistencyScore}% - {getScoreLabel(example.consistencyScore)}
                </Badge>

                {/* Category */}
                <Badge variant="secondary" className="absolute bottom-2 left-2">
                  {example.category}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{example.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {example.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-sm text-slate-600">
                  <div>
                    <div className="font-semibold">{Number(example.landArea).toLocaleString('pt-BR')}m²</div>
                    <div className="text-xs">Terreno</div>
                  </div>
                  <div>
                    <div className="font-semibold">{example.numberOfStores}</div>
                    <div className="text-xs">Lojas</div>
                  </div>
                  <div>
                    <div className="font-semibold">{example.parkingSpaces}</div>
                    <div className="text-xs">Vagas</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {example.viewCount} visualizações
                  </div>
                  <div className="flex items-center gap-1">
                    <Copy className="w-3 h-3" />
                    {example.duplicateCount} duplicações
                  </div>
                </div>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedProjectId(example.id)}
                >
                  Ver Detalhes
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleDuplicate(example.id)}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Usar como Base
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={selectedProjectId !== null} onOpenChange={() => setSelectedProjectId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                <DialogDescription>{selectedProject.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Galeria de Imagens */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-600 rounded"></span>
                    Imagens do Projeto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Estudo Conceitual */}
                    {selectedProject.conceptualImageUrl && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Estudo Conceitual 3D</div>
                        <div className="relative h-48 bg-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedProject.conceptualImageUrl}
                            alt="Estudo Conceitual"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => selectedProject.conceptualImageUrl && window.open(selectedProject.conceptualImageUrl, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Planta Baixa */}
                    {selectedProject.floorplanImageUrl && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Planta Baixa Técnica</div>
                        <div className="relative h-48 bg-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedProject.floorplanImageUrl}
                            alt="Planta Baixa"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => selectedProject.floorplanImageUrl && window.open(selectedProject.floorplanImageUrl, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Corte Longitudinal */}
                    {selectedProject.sectionImageUrl && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-slate-700">Corte Longitudinal</div>
                        <div className="relative h-48 bg-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={selectedProject.sectionImageUrl}
                            alt="Corte Longitudinal"
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => selectedProject.sectionImageUrl && window.open(selectedProject.sectionImageUrl, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Placeholder para corte transversal (se houver) */}
                    {!selectedProject.conceptualImageUrl && !selectedProject.floorplanImageUrl && !selectedProject.sectionImageUrl && (
                      <div className="col-span-2 flex items-center justify-center h-48 bg-slate-100 rounded-lg">
                        <div className="text-center text-slate-500">
                          <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Imagens em geração</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    🔍 Clique nas imagens para visualizar em tamanho completo
                  </p>
                </div>

                {/* Dados do Terreno */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded"></span>
                    Dados do Terreno
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Área Total</div>
                      <div className="font-semibold">{Number(selectedProject.landArea).toLocaleString('pt-BR')}m²</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Taxa de Ocupação</div>
                      <div className="font-semibold">{(Number(selectedProject.occupancyRate) * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Recuo Frontal</div>
                      <div className="font-semibold">{Number(selectedProject.frontSetback)}m</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Recuo Lateral</div>
                      <div className="font-semibold">{Number(selectedProject.sideSetback)}m</div>
                    </div>
                  </div>
                </div>

                {/* DNA do Projeto */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-600 rounded"></span>
                    DNA do Projeto
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Estilo Arquitetônico</div>
                      <div className="font-semibold">{selectedProject.dnaStyle}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Forma do Edifício</div>
                      <div className="font-semibold">{selectedProject.dnaBuildingShape}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Cores</div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: selectedProject.dnaPrimaryColor }}
                          ></div>
                          <span className="text-sm">{selectedProject.dnaPrimaryColor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: selectedProject.dnaAccentColor }}
                          ></div>
                          <span className="text-sm">{selectedProject.dnaAccentColor}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="text-xs text-slate-600 mb-1">Materiais</div>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedProject.dnaMaterials).map((material: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{material}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score de Consistência */}
                <div className={`p-4 rounded-lg ${getScoreColor(selectedProject.consistencyScore)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">Score de Consistência</div>
                      <div className="text-sm opacity-80">
                        Este projeto mantém {selectedProject.consistencyScore}% de consistência visual entre todos os estudos
                      </div>
                    </div>
                    <div className="text-4xl font-bold">{selectedProject.consistencyScore}%</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleDuplicate(selectedProject.id)}
                  disabled={duplicateMutation.isPending}
                >
                  {duplicateMutation.isPending ? (
                    'Duplicando...'
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Usar este Projeto como Base
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
