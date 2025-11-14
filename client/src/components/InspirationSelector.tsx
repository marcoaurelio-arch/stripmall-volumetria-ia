import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Building2, MapPin, Users, Check } from "lucide-react";
import { toast } from "sonner";

interface InspirationSelectorProps {
  projectArea: number;
  onSelect: (inspiration: any) => void;
  selectedId?: number;
}

/**
 * Componente para selecionar um projeto de inspiração como referência
 */
export default function InspirationSelector({ projectArea, onSelect, selectedId }: InspirationSelectorProps) {
  const [open, setOpen] = useState(false);

  // Buscar projetos similares baseado na área do terreno
  const { data: similarProjects, isLoading } = trpc.inspiration.findSimilar.useQuery({
    area: projectArea,
    limit: 10,
  });

  const handleSelect = (project: any) => {
    onSelect(project);
    setOpen(false);
    toast.success(`Projeto "${project.name}" selecionado como referência`);
  };

  const categoryLabels = {
    strip_mall: "Strip Mall",
    open_mall: "Open Mall",
    shopping_center: "Shopping Center",
    neighborhood_center: "Centro de Bairro",
  };

  const segmentLabels = {
    popular: "Popular",
    medio: "Médio",
    alto_padrao: "Alto Padrão",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          {selectedId ? "Alterar Referência" : "Usar Projeto de Inspiração"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Selecionar Projeto de Inspiração
          </DialogTitle>
          <DialogDescription>
            Escolha um projeto similar para usar como referência na análise volumétrica
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Carregando projetos similares...</div>
        ) : !similarProjects || similarProjects.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum projeto similar encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {similarProjects.map((project) => {
              const isSelected = selectedId === project.id;
              const images = project.images ? JSON.parse(project.images) : [];
              const mainImage = project.mainImageUrl || images[0];

              return (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelect(project)}
                >
                  {mainImage && (
                    <div className="h-32 bg-slate-200 overflow-hidden rounded-t-lg">
                      <img
                        src={mainImage}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {isSelected && (
                        <Badge className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Selecionado
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      {project.area && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          <span className="text-xs">{project.area.toLocaleString("pt-BR")} m²</span>
                        </div>
                      )}
                      {project.storeCount && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span className="text-xs">{project.storeCount} lojas</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[project.category]}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {segmentLabels[project.segment]}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
