import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import LocationViewer from "@/components/LocationViewer";
import ScenarioManager from "@/components/ScenarioManager";
import ImageGallery from "@/components/ImageGallery";
import AreaBreakdownTable from "@/components/AreaBreakdownTable";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Calculator, Download, FileText, Loader2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && !isNaN(projectId) }
  );

  const { data: latestAnalysis, isLoading: analysisLoading } = trpc.project.getLatestAnalysis.useQuery(
    { projectId },
    { enabled: isAuthenticated && !isNaN(projectId) }
  );

  const analyzeMutation = trpc.project.analyze.useMutation({
    onSuccess: () => {
      toast.success("Análise concluída com sucesso!");
      utils.project.get.invalidate({ id: projectId });
      utils.project.getLatestAnalysis.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao analisar projeto");
    },
  });

  const exportPDFMutation = trpc.project.exportPDF.useMutation({
    onSuccess: (data) => {
      toast.success("Relatório PDF gerado com sucesso!");
      // Download do PDF
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar relatório PDF");
    },
  });

  const handleAnalyze = () => {
    if (confirm("Deseja iniciar uma nova análise deste terreno?")) {
      analyzeMutation.mutate({ projectId });
    }
  };

  const handleExportPDF = () => {
    exportPDFMutation.mutate({ projectId });
  };

  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Você precisa fazer login para acessar este projeto</p>
        <Button asChild>
          <a href={getLoginUrl()}>Fazer Login</a>
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Projeto não encontrado</p>
        <Link href="/projetos">
          <Button>Voltar para Projetos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
          </Link>
          <Link href="/projetos">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <p className="text-muted-foreground">{project.description || "Sem descrição"}</p>
              {project.briefing && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs font-semibold text-blue-400 mb-1">BRIEFING DO PROJETO</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.briefing}</p>
                </div>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === "completed"
                  ? "bg-green-500/10 text-green-500"
                  : project.status === "analyzing"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-gray-500/10 text-gray-500"
              }`}
            >
              {project.status === "completed"
                ? "Concluído"
                : project.status === "analyzing"
                ? "Analisando"
                : "Rascunho"}
            </span>
          </div>

          {project.address && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="h-4 w-4" />
              <span>{project.address}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || project.status === "analyzing"}
              size="lg"
            >
              {analyzeMutation.isPending || project.status === "analyzing" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {latestAnalysis ? "Nova Análise com IA" : "Analisar com IA"}
                </>
              )}
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={exportPDFMutation.isPending}
              variant="outline"
              size="lg"
            >
              {exportPDFMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Relatório PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dados">
              <Building2 className="h-4 w-4 mr-2" />
              Dados do Terreno
            </TabsTrigger>
            <TabsTrigger value="analise" disabled={!latestAnalysis}>
              <Calculator className="h-4 w-4 mr-2" />
              Análise Volumétrica
            </TabsTrigger>
            <TabsTrigger value="relatorio" disabled={!latestAnalysis}>
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </TabsTrigger>
            <TabsTrigger value="imagens">
              <Sparkles className="h-4 w-4 mr-2" />
              Estudos Visuais
            </TabsTrigger>
          </TabsList>

          {/* Dados do Terreno */}
          <TabsContent value="dados" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dimensões do Terreno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Área Total</p>
                    <p className="text-2xl font-bold">{project.area.toLocaleString()} m²</p>
                  </div>
                  {project.width && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Largura</p>
                      <p className="text-2xl font-bold">{project.width} m</p>
                    </div>
                  )}
                  {project.length && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Comprimento</p>
                      <p className="text-2xl font-bold">{project.length} m</p>
                    </div>
                  )}
                </div>
                {project.pricePerSqm && (
                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Preço por m²</p>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.pricePerSqm / 100)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Custo Total Estimado do Terreno</p>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((project.area * project.pricePerSqm) / 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parâmetros Urbanísticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Taxa de Ocupação</p>
                    <p className="text-xl font-semibold">
                      {project.taxaOcupacao ? `${project.taxaOcupacao}%` : "Não especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coeficiente de Aproveitamento</p>
                    <p className="text-xl font-semibold">
                      {project.coeficienteAproveitamento
                        ? (project.coeficienteAproveitamento / 100).toFixed(2)
                        : "Não especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recuo Frontal</p>
                    <p className="text-xl font-semibold">
                      {project.recuoFrontal ? `${project.recuoFrontal} m` : "Não especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recuo Lateral</p>
                    <p className="text-xl font-semibold">
                      {project.recuoLateral ? `${project.recuoLateral} m` : "Não especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recuo de Fundos</p>
                    <p className="text-xl font-semibold">
                      {project.recuoFundos ? `${project.recuoFundos} m` : "Não especificado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização do Terreno */}
            {project.latitude && project.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Localização do Terreno</CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationViewer
                    latitude={project.latitude}
                    longitude={project.longitude}
                    address={project.address || undefined}
                  />
                </CardContent>
              </Card>
            )}

            {/* Gerenciador de Cenários */}
            <ScenarioManager
              projectId={project.id}
              currentPolygon={project.polygonCoordinates || ""}
              currentArea={project.area}
              onScenarioLoad={() => {
                // Recarregar projeto após carregar cenário
                utils.project.get.invalidate({ id: projectId });
              }}
            />
          </TabsContent>

          {/* Análise Volumétrica */}
          <TabsContent value="analise" className="space-y-6">
            {analysisLoading ? (
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : latestAnalysis ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Resultados da Análise</CardTitle>
                    <CardDescription>
                      Análise gerada em {new Date(latestAnalysis.createdAt).toLocaleString("pt-BR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Área Máxima Construída</p>
                        <p className="text-3xl font-bold text-primary">
                          {latestAnalysis.areaMaximaConstruida?.toLocaleString()} m²
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Área Ocupada</p>
                        <p className="text-3xl font-bold text-primary">
                          {latestAnalysis.areaOcupada?.toLocaleString()} m²
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Número de Lojas</p>
                        <p className="text-3xl font-bold text-primary">{latestAnalysis.numeroLojas}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-1">Vagas de Estacionamento</p>
                        <p className="text-3xl font-bold text-primary">{latestAnalysis.vagasEstacionamento}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões da Volumetria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Largura</p>
                        <p className="text-2xl font-bold">{latestAnalysis.volumetriaWidth} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Comprimento</p>
                        <p className="text-2xl font-bold">{latestAnalysis.volumetriaLength} m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Altura</p>
                        <p className="text-2xl font-bold">{latestAnalysis.volumetriaHeight} m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Descrição do Layout</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <Streamdown>{latestAnalysis.layoutDescription || ""}</Streamdown>
                    </div>
                  </CardContent>
                </Card>

                {/* Quadro de Áreas ABNT */}
                <AreaBreakdownTable
                  areaTerreno={project.area}
                  areaTotalConstruida={latestAnalysis.areaMaximaConstruida || 0}
                  areaPrivativaTotal={(latestAnalysis.areaMaximaConstruida || 0) * 0.78}
                  areaPrivativaPorLoja={(latestAnalysis.numeroLojas || 0) > 0 ? ((latestAnalysis.areaMaximaConstruida || 0) * 0.78) / (latestAnalysis.numeroLojas || 1) : 0}
                  areaComumTotal={(latestAnalysis.areaMaximaConstruida || 0) * 0.22}
                  areaCirculacao={(latestAnalysis.areaMaximaConstruida || 0) * 0.22 * 0.60}
                  areaSanitarios={(latestAnalysis.areaMaximaConstruida || 0) * 0.22 * 0.25}
                  areaAdministrativa={(latestAnalysis.areaMaximaConstruida || 0) * 0.22 * 0.15}
                  areaEstacionamento={(latestAnalysis.vagasEstacionamento || 0) * 25}
                  areaPorVaga={25}
                  taxaOcupacao={((latestAnalysis.areaOcupada || 0) / project.area) * 100}
                  coeficienteAproveitamento={(latestAnalysis.areaMaximaConstruida || 0) / project.area}
                  numeroPavimentos={1}
                  areaLivre={Math.max(0, project.area - (latestAnalysis.areaOcupada || 0) - ((latestAnalysis.vagasEstacionamento || 0) * 25))}
                  areaPermeavel={project.area * 0.15}
                  percentualPrivativo={78}
                  percentualComum={22}
                  percentualEstacionamento={(((latestAnalysis.vagasEstacionamento || 0) * 25) / project.area) * 100}
                  numberOfStores={latestAnalysis.numeroLojas || 0}
                  parkingSpaces={latestAnalysis.vagasEstacionamento || 0}
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma análise disponível ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Relatório */}
          <TabsContent value="relatorio" className="space-y-6">
            {latestAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sugestões e Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Streamdown>{latestAnalysis.aiSuggestions || ""}</Streamdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum relatório disponível ainda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Estudos Visuais */}
          <TabsContent value="imagens" className="space-y-6">
            <ImageGallery projectId={projectId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
