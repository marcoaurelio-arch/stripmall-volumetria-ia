import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface DNAPresetsGalleryProps {
  projectId: number;
  onPresetApplied?: () => void;
}

const CATEGORY_LABELS = {
  moderno: "Moderno",
  tropical: "Tropical",
  industrial: "Industrial",
  classico: "Clássico",
  sustentavel: "Sustentável",
};

const CATEGORY_COLORS = {
  moderno: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  tropical: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  industrial: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  classico: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  sustentavel: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

export function DNAPresetsGallery({ projectId, onPresetApplied }: DNAPresetsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: presets, isLoading } = trpc.dna.listPresets.useQuery();
  const applyPresetMutation = trpc.dna.applyPreset.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      onPresetApplied?.();
    },
    onError: (error) => {
      toast.error(`Erro ao aplicar estilo: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Galeria de Estilos
          </CardTitle>
          <CardDescription>Carregando estilos disponíveis...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!presets || presets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Galeria de Estilos
          </CardTitle>
          <CardDescription>Nenhum estilo disponível no momento.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Agrupar presets por categoria
  const categories = Array.from(new Set(presets.map((p) => p.category)));
  const filteredPresets = selectedCategory
    ? presets.filter((p) => p.category === selectedCategory)
    : presets;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Galeria de Estilos Arquitetônicos
        </CardTitle>
        <CardDescription>
          Escolha um estilo pré-configurado para aplicar ao seu projeto. A volumetria será mantida.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtro por categoria */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todos ({presets.length})
          </Button>
          {categories.map((category) => {
            const count = presets.filter((p) => p.category === category).length;
            return (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} ({count})
              </Button>
            );
          })}
        </div>

        {/* Grid de presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => (
            <Card key={preset.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {/* Thumbnail */}
              {preset.thumbnail && (
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <img
                    src={preset.thumbnail}
                    alt={preset.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  <Badge
                    variant="secondary"
                    className={`absolute top-2 right-2 ${CATEGORY_COLORS[preset.category as keyof typeof CATEGORY_COLORS]}`}
                  >
                    {CATEGORY_LABELS[preset.category as keyof typeof CATEGORY_LABELS]}
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{preset.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{preset.description}</p>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() =>
                    applyPresetMutation.mutate({
                      projectId,
                      presetId: preset.id,
                    })
                  }
                  disabled={applyPresetMutation.isPending}
                >
                  {applyPresetMutation.isPending ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Aplicar Estilo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum estilo encontrado nesta categoria.
          </div>
        )}

        <div className="pt-3 border-t text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Após aplicar um estilo, gere novamente todos os estudos (conceitual, plantas, cortes)
          para garantir consistência visual completa.
        </div>
      </CardContent>
    </Card>
  );
}
