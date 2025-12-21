import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Undo2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DNAHistoryTimelineProps {
  projectId: number;
}

const CHANGE_TYPE_LABELS = {
  preset_applied: "Preset Aplicado",
  manual_regeneration: "Regeneração Manual",
  initial_generation: "Geração Inicial",
};

const CHANGE_TYPE_ICONS = {
  preset_applied: Sparkles,
  manual_regeneration: RefreshCw,
  initial_generation: Clock,
};

export default function DNAHistoryTimeline({ projectId }: DNAHistoryTimelineProps) {
  const utils = trpc.useUtils();

  // Buscar histórico
  const { data: history, isLoading } = trpc.dna.listHistory.useQuery({
    projectId,
  });

  // Mutation para reverter
  const revertMutation = trpc.dna.revertToHistory.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalidar queries relacionadas
      utils.dna.get.invalidate({ projectId });
      utils.dna.listHistory.invalidate({ projectId });
      utils.project.get.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao reverter: ${error.message}`);
    },
  });

  const handleRevert = (historyId: number, presetName: string | null) => {
    if (
      confirm(
        `Tem certeza que deseja reverter para o estilo "${presetName || "anterior"}"?\n\nTodos os próximos estudos usarão esta identidade visual.`
      )
    ) {
      revertMutation.mutate({ projectId, historyId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum estilo aplicado ainda.</p>
            <p className="text-sm mt-2">
              Aplique um estilo da galeria para começar o histórico.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Estilos
          </CardTitle>
          <CardDescription>
            Linha do tempo de todos os estilos aplicados ao projeto. Clique em "Reverter" para
            voltar a um estilo anterior.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {history.map((entry, index) => {
          const Icon = CHANGE_TYPE_ICONS[entry.changeType as keyof typeof CHANGE_TYPE_ICONS];
          const isFirst = index === 0;

          return (
            <Card
              key={entry.id}
              className={`relative ${isFirst ? "border-primary shadow-md" : ""}`}
            >
              {/* Linha vertical conectando os cards */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-full h-4 w-0.5 bg-border" />
              )}

              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div
                    className={`rounded-full p-2 ${
                      isFirst ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">
                            {entry.presetName || "Estilo Personalizado"}
                          </h4>
                          {isFirst && (
                            <Badge variant="default" className="text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {CHANGE_TYPE_LABELS[entry.changeType as keyof typeof CHANGE_TYPE_LABELS]}
                          {" • "}
                          {formatDistanceToNow(new Date(entry.appliedAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>

                      {/* Botão Reverter (não mostrar para o estilo atual) */}
                      {!isFirst && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(entry.id, entry.presetName)}
                          disabled={revertMutation.isPending}
                        >
                          <Undo2 className="h-4 w-4 mr-2" />
                          Reverter
                        </Button>
                      )}
                    </div>

                    {/* Detalhes do DNA */}
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      {entry.dnaStyle && (
                        <div>
                          <span className="text-muted-foreground">Estilo:</span>{" "}
                          <span className="font-medium">{entry.dnaStyle}</span>
                        </div>
                      )}
                      {entry.dnaPrimaryColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Cor Principal:</span>
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: entry.dnaPrimaryColor }}
                          />
                          <span className="font-mono text-xs">{entry.dnaPrimaryColor}</span>
                        </div>
                      )}
                    </div>

                    {/* Notas */}
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground italic mt-2 p-2 bg-muted rounded">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
