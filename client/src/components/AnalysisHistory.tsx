import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  History, 
  Save, 
  GitCompare, 
  Calendar, 
  Building2, 
  Car, 
  Ruler, 
  TrendingUp,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnalysisHistoryProps {
  projectId: number;
}

export default function AnalysisHistory({ projectId }: AnalysisHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionNotes, setNewVersionNotes] = useState("");
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  const utils = trpc.useUtils();

  // @ts-ignore - version router is dynamically added
  const { data: versions, isLoading } = trpc.version.listVersions.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // @ts-ignore - version router is dynamically added
  const saveVersionMutation = trpc.version.saveVersion.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      setShowSaveDialog(false);
      setNewVersionLabel("");
      setNewVersionNotes("");
      // @ts-ignore
      utils.version.listVersions.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar versão");
    },
  });

  // @ts-ignore - version router is dynamically added
  const updateVersionMutation = trpc.version.updateVersion.useMutation({
    onSuccess: () => {
      toast.success("Versão atualizada!");
      // @ts-ignore
      utils.version.listVersions.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar versão");
    },
  });

  // @ts-ignore - version router is dynamically added
  const deleteVersionMutation = trpc.version.deleteVersion.useMutation({
    onSuccess: () => {
      toast.success("Versão excluída!");
      // @ts-ignore
      utils.version.listVersions.invalidate({ projectId });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir versão");
    },
  });

  // @ts-ignore - version router is dynamically added
  const { data: comparisonData, isLoading: isComparing } = trpc.version.compareVersions.useQuery(
    { versionId1: selectedVersions[0], versionId2: selectedVersions[1] },
    { enabled: selectedVersions.length === 2 && showCompareDialog }
  );

  const handleVersionSelect = (versionId: number) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  };

  const handleSaveVersion = () => {
    saveVersionMutation.mutate({
      projectId,
      label: newVersionLabel || undefined,
      notes: newVersionNotes || undefined,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Versões
            </CardTitle>
            <CardDescription>
              Acompanhe a evolução das análises ao longo do tempo
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedVersions.length === 2 && (
              <Button
                variant="outline"
                onClick={() => setShowCompareDialog(true)}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar Selecionadas
              </Button>
            )}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Versão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Nova Versão</DialogTitle>
                  <DialogDescription>
                    Salve um snapshot da análise atual para referência futura
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Versão (opcional)</label>
                    <Input
                      placeholder="Ex: Versão Final, Aprovada pelo Cliente"
                      value={newVersionLabel}
                      onChange={(e) => setNewVersionLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notas (opcional)</label>
                    <Textarea
                      placeholder="Descreva as principais mudanças ou observações..."
                      value={newVersionNotes}
                      onChange={(e) => setNewVersionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveVersion}
                    disabled={saveVersionMutation.isPending}
                  >
                    {saveVersionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!versions || versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma versão salva ainda.</p>
            <p className="text-sm mt-1">
              Execute uma análise ou clique em "Salvar Versão" para criar o primeiro registro.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Selecione 2 versões para comparar. Clique em uma versão para expandir detalhes.
            </p>
            {versions.map((version: any) => (
              <div
                key={version.id}
                className={`border rounded-lg p-4 transition-all ${
                  selectedVersions.includes(version.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleVersionSelect(version.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {version.versionLabel || `Versão ${version.versionNumber}`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          v{version.versionNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(version.createdAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedVersion(
                        expandedVersion === version.id ? null : version.id
                      )}
                    >
                      {expandedVersion === version.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newLabel = prompt("Novo nome:", version.versionLabel || "");
                        if (newLabel !== null) {
                          updateVersionMutation.mutate({
                            versionId: version.id,
                            label: newLabel,
                          });
                        }
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Excluir esta versão?")) {
                          deleteVersionMutation.mutate({ versionId: version.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Resumo rápido */}
                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3 w-3 text-muted-foreground" />
                    <span>{version.areaMaximaConstruida?.toLocaleString() || 0} m²</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span>{version.numeroLojas || 0} lojas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Car className="h-3 w-3 text-muted-foreground" />
                    <span>{version.vagasEstacionamento || 0} vagas</span>
                  </div>
                  {version.roiEstimado && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span>{(version.roiEstimado / 100).toFixed(1)}% ROI</span>
                    </div>
                  )}
                </div>

                {/* Mudanças */}
                {version.changesFromPrevious && (
                  <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                    📝 {version.changesFromPrevious}
                  </div>
                )}

                {/* Detalhes expandidos */}
                {expandedVersion === version.id && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Área Construída</span>
                      <p className="font-medium">{version.areaMaximaConstruida?.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Área Ocupada</span>
                      <p className="font-medium">{version.areaOcupada?.toLocaleString()} m²</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Custo Estimado</span>
                      <p className="font-medium">{formatCurrency(version.custoEstimado || 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payback</span>
                      <p className="font-medium">{version.paybackMeses || 0} meses</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Taxa Ocupação</span>
                      <p className="font-medium">{version.taxaOcupacao || 0}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Coef. Aproveitamento</span>
                      <p className="font-medium">{((version.coeficienteAproveitamento || 0) / 100).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensões</span>
                      <p className="font-medium">
                        {version.volumetriaWidth}x{version.volumetriaLength}x{version.volumetriaHeight}m
                      </p>
                    </div>
                    {version.notes && (
                      <div className="col-span-2 md:col-span-4">
                        <span className="text-muted-foreground">Notas</span>
                        <p className="font-medium">{version.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dialog de Comparação */}
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Comparação de Versões
              </DialogTitle>
              <DialogDescription>
                Veja as diferenças entre as duas versões selecionadas
              </DialogDescription>
            </DialogHeader>
            
            {isComparing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : comparisonData ? (
              <div className="space-y-6">
                {/* Cabeçalho das versões */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="font-medium text-primary">
                    {comparisonData.version1.versionLabel || `Versão ${comparisonData.version1.versionNumber}`}
                  </div>
                  <div className="text-muted-foreground">vs</div>
                  <div className="font-medium text-primary">
                    {comparisonData.version2.versionLabel || `Versão ${comparisonData.version2.versionNumber}`}
                  </div>
                </div>

                {/* Tabela de comparação */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Métrica</th>
                        <th className="px-4 py-2 text-right">Versão {comparisonData.version1.versionNumber}</th>
                        <th className="px-4 py-2 text-right">Versão {comparisonData.version2.versionNumber}</th>
                        <th className="px-4 py-2 text-right">Diferença</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-3">Área Construída</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.areaMaximaConstruida.v1.toLocaleString()} m²</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.areaMaximaConstruida.v2.toLocaleString()} m²</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.areaMaximaConstruida.diff > 0 ? 'text-green-500' :
                          comparisonData.differences.areaMaximaConstruida.diff < 0 ? 'text-red-500' : ''
                        }`}>
                          {comparisonData.differences.areaMaximaConstruida.diff > 0 ? '+' : ''}
                          {comparisonData.differences.areaMaximaConstruida.diff.toLocaleString()} m²
                          {comparisonData.differences.areaMaximaConstruida.percentChange !== 0 && (
                            <span className="text-xs ml-1">
                              ({comparisonData.differences.areaMaximaConstruida.percentChange > 0 ? '+' : ''}
                              {comparisonData.differences.areaMaximaConstruida.percentChange.toFixed(1)}%)
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3">Número de Lojas</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.numeroLojas.v1}</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.numeroLojas.v2}</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.numeroLojas.diff > 0 ? 'text-green-500' :
                          comparisonData.differences.numeroLojas.diff < 0 ? 'text-red-500' : ''
                        }`}>
                          {comparisonData.differences.numeroLojas.diff > 0 ? '+' : ''}
                          {comparisonData.differences.numeroLojas.diff}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3">Vagas Estacionamento</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.vagasEstacionamento.v1}</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.vagasEstacionamento.v2}</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.vagasEstacionamento.diff > 0 ? 'text-green-500' :
                          comparisonData.differences.vagasEstacionamento.diff < 0 ? 'text-red-500' : ''
                        }`}>
                          {comparisonData.differences.vagasEstacionamento.diff > 0 ? '+' : ''}
                          {comparisonData.differences.vagasEstacionamento.diff}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3">Custo Estimado</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(comparisonData.differences.custoEstimado.v1)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(comparisonData.differences.custoEstimado.v2)}</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.custoEstimado.diff < 0 ? 'text-green-500' :
                          comparisonData.differences.custoEstimado.diff > 0 ? 'text-red-500' : ''
                        }`}>
                          {comparisonData.differences.custoEstimado.diff > 0 ? '+' : ''}
                          {formatCurrency(comparisonData.differences.custoEstimado.diff)}
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3">ROI Estimado</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.roiEstimado.v1.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.roiEstimado.v2.toFixed(1)}%</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.roiEstimado.diff > 0 ? 'text-green-500' :
                          comparisonData.differences.roiEstimado.diff < 0 ? 'text-red-500' : ''
                        }`}>
                          {comparisonData.differences.roiEstimado.diff > 0 ? '+' : ''}
                          {comparisonData.differences.roiEstimado.diff.toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="px-4 py-3">Taxa de Ocupação</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.taxaOcupacao.v1}%</td>
                        <td className="px-4 py-3 text-right">{comparisonData.differences.taxaOcupacao.v2}%</td>
                        <td className={`px-4 py-3 text-right font-medium ${
                          comparisonData.differences.taxaOcupacao.diff !== 0 ? 'text-blue-500' : ''
                        }`}>
                          {comparisonData.differences.taxaOcupacao.diff > 0 ? '+' : ''}
                          {comparisonData.differences.taxaOcupacao.diff}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
