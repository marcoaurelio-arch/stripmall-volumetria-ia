import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Download, Image as ImageIcon, Loader2, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImageGalleryProps {
  projectId: number;
}

export default function ImageGallery({ projectId }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: images, isLoading } = trpc.image.list.useQuery({ projectId });

  const generateConceptualMutation = trpc.image.generateConceptual.useMutation({
    onSuccess: () => {
      toast.success("Estudo conceitual gerado com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar estudo conceitual");
    },
  });

  const generateFloorplanMutation = trpc.image.generateFloorplan.useMutation({
    onSuccess: () => {
      toast.success("Planta baixa gerada com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar planta baixa");
    },
  });

  const generateElectronicModelMutation = trpc.image.generateElectronicModel.useMutation({
    onSuccess: () => {
      toast.success("Maquete eletrônica gerada com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar maquete eletrônica");
    },
  });

  const generateFacadeViewMutation = trpc.image.generateFacadeView.useMutation({
    onSuccess: () => {
      toast.success("Vista de fachada gerada com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar vista de fachada");
    },
  });

  const generateLongitudinalSectionMutation = trpc.image.generateLongitudinalSection.useMutation({
    onSuccess: () => {
      toast.success("Corte longitudinal gerado com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar corte longitudinal");
    },
  });

  const generateTransversalSectionMutation = trpc.image.generateTransversalSection.useMutation({
    onSuccess: () => {
      toast.success("Corte transversal gerado com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar corte transversal");
    },
  });

  const generateBothSectionsMutation = trpc.image.generateBothSections.useMutation({
    onSuccess: () => {
      toast.success("Cortes arquitetônicos gerados com sucesso!");
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar cortes arquitetônicos");
    },
  });

  const generateAllFacadeViewsMutation = trpc.image.generateAllFacadeViews.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} vistas de fachada geradas com sucesso!`);
      utils.image.list.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar vistas de fachada");
    },
  });

  const deleteMutation = trpc.image.delete.useMutation({
    onSuccess: () => {
      toast.success("Imagem excluída");
      utils.image.list.invalidate({ projectId });
    },
    onError: () => {
      toast.error("Erro ao excluir imagem");
    },
  });

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const conceptualImages = images?.filter((img) => img.type === "conceptual") || [];
  const floorplanImages = images?.filter((img) => img.type === "floorplan") || [];

  return (
    <div className="space-y-8">
      {/* Estudos Conceituais 3D */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Estudos Conceituais 3D
              </CardTitle>
              <CardDescription>
                Visualizações realistas do projeto de strip mall
              </CardDescription>
            </div>
            <Button
              onClick={() => generateConceptualMutation.mutate({ projectId })}
              disabled={generateConceptualMutation.isPending}
            >
              {generateConceptualMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Estudo Conceitual
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : conceptualImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conceptualImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <img
                    src={image.imageUrl}
                    alt="Estudo conceitual"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() =>
                        handleDownload(image.imageUrl, `conceitual-${image.id}.png`)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate({ id: image.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2 bg-background/95 backdrop-blur">
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum estudo conceitual gerado ainda
              </p>
              <Button
                onClick={() => generateConceptualMutation.mutate({ projectId })}
                disabled={generateConceptualMutation.isPending}
              >
                {generateConceptualMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Primeiro Estudo
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plantas Baixas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Plantas Baixas
              </CardTitle>
              <CardDescription>
                Desenhos técnicos e layouts do projeto
              </CardDescription>
            </div>
            <Button
              onClick={() => generateFloorplanMutation.mutate({ projectId })}
              disabled={generateFloorplanMutation.isPending}
              variant="outline"
            >
              {generateFloorplanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gerar Planta Baixa
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : floorplanImages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {floorplanImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <img
                    src={image.imageUrl}
                    alt="Planta baixa"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() =>
                        handleDownload(image.imageUrl, `planta-${image.id}.png`)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate({ id: image.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2 bg-background/95 backdrop-blur">
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma planta baixa gerada ainda
              </p>
              <Button
                variant="outline"
                onClick={() => generateFloorplanMutation.mutate({ projectId })}
                disabled={generateFloorplanMutation.isPending}
              >
                {generateFloorplanMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Gerar Primeira Planta
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Maquetes Eletrônicas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Maquetes Eletrônicas
              </CardTitle>
              <CardDescription>
                Estudos volumétricos com volumes coloridos por função
              </CardDescription>
            </div>
            <Button
              onClick={() => generateElectronicModelMutation.mutate({ projectId })}
              disabled={generateElectronicModelMutation.isPending}
              variant="outline"
            >
              {generateElectronicModelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Maquete Eletrônica
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : (images?.filter((img) => img.type === "electronic_model").length ?? 0) > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images?.filter((img) => img.type === "electronic_model").map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <img
                    src={image.imageUrl}
                    alt="Maquete eletrônica"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.imageUrl, `maquete-eletronica-${image.id}.png`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Deseja excluir esta imagem?")) {
                          deleteMutation.mutate({ id: image.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma maquete eletrônica gerada ainda
              </p>
              <Button
                variant="outline"
                onClick={() => generateElectronicModelMutation.mutate({ projectId })}
                disabled={generateElectronicModelMutation.isPending}
              >
                {generateElectronicModelMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Primeira Maquete
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vistas de Fachada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Vistas de Fachada
              </CardTitle>
              <CardDescription>
                Elevações e vistas externas do projeto
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => generateAllFacadeViewsMutation.mutate({ projectId })}
                disabled={generateAllFacadeViewsMutation.isPending || generateFacadeViewMutation.isPending}
                variant="default"
                size="sm"
              >
                {generateAllFacadeViewsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando 4 vistas...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Todas as Vistas
                  </>
                )}
              </Button>
              <div className="w-px bg-border" />
              <Button
                onClick={() => generateFacadeViewMutation.mutate({ projectId, viewAngle: "front" })}
                disabled={generateFacadeViewMutation.isPending || generateAllFacadeViewsMutation.isPending}
                variant="outline"
                size="sm"
              >
                {generateFacadeViewMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-2" />
                )}
                Frontal
              </Button>
              <Button
                onClick={() => generateFacadeViewMutation.mutate({ projectId, viewAngle: "back" })}
                disabled={generateFacadeViewMutation.isPending}
                variant="outline"
                size="sm"
              >
                Fundos
              </Button>
              <Button
                onClick={() => generateFacadeViewMutation.mutate({ projectId, viewAngle: "left" })}
                disabled={generateFacadeViewMutation.isPending}
                variant="outline"
                size="sm"
              >
                Lateral Esq.
              </Button>
              <Button
                onClick={() => generateFacadeViewMutation.mutate({ projectId, viewAngle: "right" })}
                disabled={generateFacadeViewMutation.isPending}
                variant="outline"
                size="sm"
              >
                Lateral Dir.
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : (images?.filter((img) => img.type === "facade_view").length ?? 0) > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images?.filter((img) => img.type === "facade_view").map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <img
                    src={image.imageUrl}
                    alt="Vista de fachada"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.imageUrl, `fachada-${image.id}.png`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Deseja excluir esta imagem?")) {
                          deleteMutation.mutate({ id: image.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma vista de fachada gerada ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Use os botões acima para gerar vistas de diferentes ângulos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cortes Arquitetônicos ABNT */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Cortes Arquitetônicos ABNT
              </CardTitle>
              <CardDescription>
                Cortes longitudinais e transversais seguindo normas ABNT
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => generateBothSectionsMutation.mutate({ projectId })}
                disabled={generateBothSectionsMutation.isPending || generateLongitudinalSectionMutation.isPending || generateTransversalSectionMutation.isPending}
                variant="default"
                size="sm"
              >
                {generateBothSectionsMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Ambos os Cortes
                  </>
                )}
              </Button>
              <Button
                onClick={() => generateLongitudinalSectionMutation.mutate({ projectId })}
                disabled={generateLongitudinalSectionMutation.isPending || generateBothSectionsMutation.isPending}
                variant="outline"
                size="sm"
              >
                {generateLongitudinalSectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Corte Longitudinal
                  </>
                )}
              </Button>
              <Button
                onClick={() => generateTransversalSectionMutation.mutate({ projectId })}
                disabled={generateTransversalSectionMutation.isPending || generateBothSectionsMutation.isPending}
                variant="outline"
                size="sm"
              >
                {generateTransversalSectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Corte Transversal
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          ) : ((images?.filter((img) => img.type === "longitudinal_section" || img.type === "transversal_section").length ?? 0) > 0) ? (
            <div className="grid gap-4 md:grid-cols-2">
              {images?.filter((img) => img.type === "longitudinal_section").map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Longitudinal</span>
                  </div>
                  <img
                    src={image.imageUrl}
                    alt="Corte longitudinal"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.imageUrl, `corte-longitudinal-${image.id}.png`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Deseja excluir esta imagem?")) {
                          deleteMutation.mutate({ id: image.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {images?.filter((img) => img.type === "transversal_section").map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Transversal</span>
                  </div>
                  <img
                    src={image.imageUrl}
                    alt="Corte transversal"
                    className="h-48 w-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.imageUrl, `corte-transversal-${image.id}.png`);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Deseja excluir esta imagem?")) {
                          deleteMutation.mutate({ id: image.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum corte arquitetônico gerado ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Use os botões acima para gerar cortes seguindo normas ABNT
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualizar imagem em tamanho completo */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualização</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Visualização completa"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
