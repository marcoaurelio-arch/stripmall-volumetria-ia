import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dna, RefreshCw, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DNACardProps {
  projectId: number;
}

export function DNACard({ projectId }: DNACardProps) {
  const { data: dnaData, isLoading, refetch } = trpc.dna.get.useQuery({ projectId });
  const regenerateMutation = trpc.dna.regenerate.useMutation({
    onSuccess: (result) => {
      toast.success(result.message);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao regenerar DNA: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            DNA do Projeto
          </CardTitle>
          <CardDescription>Carregando identidade visual...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!dnaData) {
    return null;
  }

  const { dna, generated } = dnaData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5" />
            <CardTitle>DNA do Projeto</CardTitle>
            {generated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Gerado
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateMutation.mutate({ projectId })}
            disabled={regenerateMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            Regenerar
          </Button>
        </div>
        <CardDescription>
          Identidade visual que garante consistência entre todos os estudos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Volumetria */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Volumetria</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Forma:</span>
              <p className="font-medium">{dna.buildingShape}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pavimentos:</span>
              <p className="font-medium">{dna.floors}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Cobertura:</span>
              <p className="font-medium">{dna.roofType}</p>
            </div>
          </div>
        </div>

        {/* Linguagem Arquitetônica */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Linguagem Arquitetônica</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Estilo:</span>
              <p className="font-medium">{dna.style}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Características:</span>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                {dna.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Cores e Materiais */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Cores e Materiais</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Cor Principal:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: dna.primaryColor }}
                />
                <span className="font-mono text-xs">{dna.primaryColor}</span>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Cor de Destaque:</span>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: dna.accentColor }}
                />
                <span className="font-mono text-xs">{dna.accentColor}</span>
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Materiais:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {dna.materials.map((material, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Paisagismo e Layout */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Paisagismo:</span>
            <p className="font-medium text-xs mt-1">{dna.landscaping}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Layout:</span>
            <p className="font-medium text-xs mt-1">{dna.layout}</p>
          </div>
        </div>

        {/* Contexto */}
        <div>
          <span className="text-muted-foreground text-sm">Contexto Urbano:</span>
          <p className="font-medium text-xs mt-1">{dna.context}</p>
        </div>

        <div className="pt-3 border-t text-xs text-muted-foreground">
          💡 <strong>Dica:</strong> Regenere o DNA se alterou dados importantes do projeto (área, altura, briefing).
          Todos os próximos estudos usarão a nova identidade visual.
        </div>
      </CardContent>
    </Card>
  );
}
