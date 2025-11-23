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
import FinancialAnalysis from "@/components/FinancialAnalysis";
import { PDFPreviewDialog } from "@/components/PDFPreviewDialog";
import FileUploadZone from "@/components/FileUploadZone";
import AttachmentManager from "@/components/AttachmentManager";
import UrbanLegislationChecker from "@/components/UrbanLegislationChecker";
import CostAnalysisPanel from "@/components/CostAnalysisPanel";
import ComplianceChecklistPanel from "@/components/ComplianceChecklistPanel";
import SolarAnalysisPanel from "@/components/SolarAnalysisPanel";
import ProjectVariationsPanel from "@/components/ProjectVariationsPanel";
import MarketAnalysisPanel from "@/components/MarketAnalysisPanel";
import FlowSimulatorPanel from "@/components/FlowSimulatorPanel";
import AdvancedFinancialDashboard from "@/components/AdvancedFinancialDashboard";
import SavedScenariosPanel from "@/components/SavedScenariosPanel";
import LogoUploader from "@/components/LogoUploader";
import Terrain3DViewer from "@/components/Terrain3DViewer";
import { BuildingLayoutAdjuster, BuildingLayout } from "@/components/BuildingLayoutAdjuster";
import { SavedLayoutsManager } from "@/components/SavedLayoutsManager";
import { LayoutComparison } from "@/components/LayoutComparison";
import { ShadowVisualization } from "@/components/ShadowVisualization";
import { LayoutTemplatesGallery } from "@/components/LayoutTemplatesGallery";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Calculator, Download, Eye, FileText, Loader2, MapPin, Paperclip, Sparkles, Scale, ThermometerSun, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";
import { Streamdown } from "streamdown";
import { useState } from "react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ pdfBase64: string; fileName: string } | null>(null);

  const { data: project, isLoading: projectLoading } = trpc.project.get.useQuery(
    { id: projectId },
    { enabled: isAuthenticated && !isNaN(projectId) }
  );

  const { data: latestAnalysis, isLoading: analysisLoading } = trpc.project.getLatestAnalysis.useQuery(
    { projectId },
    { enabled: isAuthenticated && !isNaN(projectId) }
  );

  const updateProjectMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("Projeto atualizado com sucesso!");
      utils.project.get.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar projeto");
    },
  });

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

  const exportIFCMutation = trpc.bim.exportIFC.useMutation({
    onSuccess: (data) => {
      toast.success("Arquivo IFC gerado com sucesso!");
      // Download do IFC
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar arquivo IFC");
    },
  });

  const exportProfessionalPDFMutation = trpc.project.generateProfessionalPDF.useMutation({
    onSuccess: (data) => {
      toast.success("PDF profissional gerado com sucesso!");
      // Download do PDF
      window.open(data.url, "_blank");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar PDF profissional");
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

  const previewPDFQuery = trpc.project.previewPDF.useQuery(
    { projectId },
    { enabled: false } // Não executar automaticamente
  );

  const handlePreviewPDF = async () => {
    const result = await previewPDFQuery.refetch();
    if (result.data) {
      setPreviewData({
        pdfBase64: result.data.pdfBase64,
        fileName: result.data.fileName,
      });
      setShowPreview(true);
    } else if (result.error) {
      toast.error(result.error.message || "Erro ao gerar prévia do relatório");
    }
  };

  const handleExportPDF = () => {
    exportPDFMutation.mutate({ projectId });
  };

  const handleExportIFC = () => {
    if (confirm("Exportar projeto como arquivo IFC para Revit/ArchiCAD?")) {
      exportIFCMutation.mutate({ projectId });
    }
  };

  const handleExportProfessionalPDF = () => {
    if (confirm("Gerar PDF profissional no estilo Piazza Nicomedes?")) {
      exportProfessionalPDFMutation.mutate({ projectId });
    }
  };

  // Componente para carregar análise financeira
  const FinancialAnalysisTab = ({ projectId }: { projectId: number }) => {
    const { data: financialData, isLoading } = trpc.project.calculateFinancialAnalysis.useQuery(
      { projectId },
      { enabled: !isNaN(projectId) }
    );

    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Calculando viabilidade financeira...</p>
          </CardContent>
        </Card>
      );
    }

    if (!financialData) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Erro ao calcular viabilidade financeira</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Análise de Custos CUB/SINAPI */}
        <CostAnalysisPanel
          projectId={projectId}
          totalArea={project?.area}
          state={project?.address ? project.address.split(",").slice(-1)[0]?.trim().split(" ")[0] : "SP"}
          commercialArea={latestAnalysis?.areaMaximaConstruida ? latestAnalysis.areaMaximaConstruida * 0.78 : undefined}
        />
        
        {/* Análise Financeira Existente */}
        <FinancialAnalysis {...financialData} />

        {/* Dashboard Financeiro Avançado */}
        <AdvancedFinancialDashboard
          projectId={projectId}
          custoTotal={financialData.constructionCost}
          receitaMensal={Math.round(financialData.annualGrossRevenue / 12)}
        />

        {/* Cenários Salvos */}
        <SavedScenariosPanel projectId={projectId} />
      </div>
    );
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
              onClick={handlePreviewPDF}
              disabled={previewPDFQuery.isFetching}
              variant="outline"
              size="lg"
            >
              {previewPDFQuery.isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Prévia...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar Relatório
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
                  Baixar PDF
                </>
              )}
            </Button>
            <Button
              onClick={handleExportIFC}
              disabled={exportIFCMutation.isPending || !latestAnalysis}
              variant="outline"
              size="lg"
              title="Exportar para Revit/ArchiCAD"
            >
              {exportIFCMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando IFC...
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 mr-2" />
                  Exportar IFC
                </>
              )}
            </Button>
            <Button
              onClick={handleExportProfessionalPDF}
              disabled={exportProfessionalPDFMutation.isPending || !latestAnalysis}
              variant="default"
              size="lg"
              title="Gerar PDF profissional estilo Piazza Nicomedes"
            >
              {exportProfessionalPDFMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  PDF Profissional
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
            <TabsTrigger value="financeiro" disabled={!latestAnalysis}>
              <Calculator className="h-4 w-4 mr-2" />
              Viabilidade Financeira
            </TabsTrigger>
            <TabsTrigger value="imagens">
              <Sparkles className="h-4 w-4 mr-2" />
              Estudos Visuais
            </TabsTrigger>
            <TabsTrigger value="anexos">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexos
            </TabsTrigger>
            <TabsTrigger value="conformidade">
              <Scale className="h-4 w-4 mr-2" />
              Conformidade Legal
            </TabsTrigger>
            <TabsTrigger value="conforto">
              <ThermometerSun className="h-4 w-4 mr-2" />
              Conforto Ambiental
            </TabsTrigger>
            <TabsTrigger value="variacoes" disabled={!latestAnalysis}>
              <Sparkles className="h-4 w-4 mr-2" />
              Variações de Projeto
            </TabsTrigger>
            <TabsTrigger value="mercado" disabled={!project.latitude || !project.longitude}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Análise de Mercado
            </TabsTrigger>
            <TabsTrigger value="fluxo" disabled={!latestAnalysis}>
              <Users className="h-4 w-4 mr-2" />
              Simulação de Fluxo
            </TabsTrigger>
            <TabsTrigger value="3d">
              <Eye className="h-4 w-4 mr-2" />
              Visualização 3D
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

            {/* Branding Personalizado */}
            <Card>
              <CardHeader>
                <CardTitle>Branding Personalizado</CardTitle>
                <CardDescription>
                  Adicione um logo e escolha uma cor para personalizar os PDFs profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogoUploader
                  projectId={project.id}
                  currentLogoUrl={project.logoUrl}
                  onLogoUploaded={() => {
                    // Recarregar projeto após upload
                    utils.project.get.invalidate({ id: projectId });
                  }}
                />
              </CardContent>
            </Card>

            {/* Ajuste Manual de Layout do Edifício */}
            {project.polygonCoordinates && (
              <>
                <BuildingLayoutAdjuster
                  polygonCoordinates={project.polygonCoordinates}
                  terrainDimensions={{
                    width: project.width || 50,
                    length: project.length || 100,
                    area: project.area,
                  }}
                  setbacks={{
                    frontal: project.recuoFrontal || 5,
                    lateral: project.recuoLateral || 3,
                    fundos: project.recuoFundos || 3,
                  }}
                  onSave={(layout: BuildingLayout) => {
                    updateProjectMutation.mutate({
                      id: projectId,
                      buildingOffsetX: layout.offsetX,
                      buildingOffsetY: layout.offsetY,
                      buildingRotation: layout.rotation,
                      buildingScale: layout.scale,
                    });
                  }}
                />
                
                <SavedLayoutsManager
                  projectId={project.id}
                  currentLayout={{
                    offsetX: project.buildingOffsetX || 0,
                    offsetY: project.buildingOffsetY || 0,
                    rotation: project.buildingRotation || 0,
                    scale: project.buildingScale || 80,
                  }}
                  onLoadLayout={(layout: BuildingLayout) => {
                    updateProjectMutation.mutate({
                      id: projectId,
                      buildingOffsetX: layout.offsetX,
                      buildingOffsetY: layout.offsetY,
                      buildingRotation: layout.rotation,
                      buildingScale: layout.scale,
                    });
                  }}
                />
                
                <LayoutComparison
                  projectId={project.id}
                  polygonCoordinates={project.polygonCoordinates}
                  terrainDimensions={{
                    width: project.width || 50,
                    length: project.length || 100,
                    area: project.area,
                  }}
                  setbacks={{
                    frontal: project.recuoFrontal || 5,
                    lateral: project.recuoLateral || 3,
                    fundos: project.recuoFundos || 3,
                  }}
                />
                
                <ShadowVisualization
                  projectId={project.id}
                  buildingLayout={{
                    offsetX: project.buildingOffsetX || 0,
                    offsetY: project.buildingOffsetY || 0,
                    rotation: project.buildingRotation || 0,
                    scale: project.buildingScale || 80,
                  }}
                  buildingHeight={project.buildingHeight || 8}
                  terrain={{
                    width: project.width || 50,
                    length: project.length || 100,
                    area: project.area,
                  }}
                  location={{
                    latitude: parseFloat(project.latitude || '-23.55'),
                    longitude: parseFloat(project.longitude || '-46.63'),
                  }}
                />
                
                <LayoutTemplatesGallery
                  terrain={{
                    width: project.width || 50,
                    length: project.length || 100,
                    area: project.area,
                  }}
                  setbacks={{
                    frontal: project.recuoFrontal || 5,
                    lateral: project.recuoLateral || 3,
                    fundos: project.recuoFundos || 3,
                  }}
                  onApplyTemplate={(layout) => {
                    updateProjectMutation.mutate({
                      id: project.id,
                      buildingOffsetX: layout.offsetX,
                      buildingOffsetY: layout.offsetY,
                      buildingRotation: layout.rotation,
                      buildingScale: layout.scale,
                    });
                  }}
                />
              </>
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

          {/* Viabilidade Financeira */}
          <TabsContent value="financeiro" className="space-y-6">
            <FinancialAnalysisTab projectId={projectId} />
          </TabsContent>

          {/* Estudos Visuais */}
          <TabsContent value="imagens" className="space-y-6">
            <ImageGallery projectId={projectId} />
          </TabsContent>

          {/* Anexos */}
          <TabsContent value="anexos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload de Arquivos</CardTitle>
                <CardDescription>
                  Envie plantas, documentos, imagens de referência e arquivos KMZ/KML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  projectId={projectId}
                  onUploadComplete={() => {
                    // Recarregar lista de anexos após upload
                    utils.attachment.listAttachments.invalidate({ projectId });
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Arquivos Anexados</CardTitle>
                <CardDescription>
                  Visualize, baixe ou exclua arquivos anexados a este projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttachmentManager projectId={projectId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conformidade Legal */}
          <TabsContent value="conformidade" className="space-y-6">
            <UrbanLegislationChecker
              projectId={projectId}
              address={project.address || undefined}
              city={project.address ? project.address.split(",").slice(-2)[0]?.trim() : undefined}
              state={project.address ? project.address.split(",").slice(-1)[0]?.trim() : undefined}
              taxaOcupacao={project.taxaOcupacao || undefined}
              coeficienteAproveitamento={project.coeficienteAproveitamento ? project.coeficienteAproveitamento / 100 : undefined}
              recuoFrontal={project.recuoFrontal || undefined}
              recuoLateral={project.recuoLateral || undefined}
              recuoFundos={project.recuoFundos || undefined}
            />
            
            {/* Checklist de Conformidade */}
            {latestAnalysis && (
              <ComplianceChecklistPanel
                projectId={projectId}
                area={project.area}
                totalBuiltArea={latestAnalysis.areaMaximaConstruida || 0}
                commercialArea={(latestAnalysis.areaMaximaConstruida || 0) * 0.78}
                parkingSpaces={latestAnalysis.vagasEstacionamento || 0}
                parkingArea={(latestAnalysis.vagasEstacionamento || 0) * 25}
                permeableArea={project.area * 0.15}
                setbackFront={project.recuoFrontal || 0}
                setbackSide={project.recuoLateral || 0}
                setbackRear={project.recuoFundos || 0}
                occupancyRate={((latestAnalysis.areaOcupada || 0) / project.area) * 100}
                buildingCoefficient={(latestAnalysis.areaMaximaConstruida || 0) / project.area}
                numberOfStores={latestAnalysis.numeroLojas || 0}
                state={project.address ? project.address.split(",").slice(-1)[0]?.trim().split(" ")[0] : "SP"}
              />
            )}
          </TabsContent>

          {/* Conforto Ambiental */}
          <TabsContent value="conforto" className="space-y-6">
            {project.latitude && project.longitude ? (
              <SolarAnalysisPanel
                projectId={projectId}
                latitude={parseFloat(project.latitude)}
                longitude={parseFloat(project.longitude)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Localização Não Definida</CardTitle>
                  <CardDescription>
                    Para realizar a análise de conforto ambiental, é necessário definir a localização do terreno (latitude e longitude).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Adicione um arquivo KMZ na aba "Dados do Terreno" ou preencha as coordenadas manualmente.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Variações de Projeto */}
          <TabsContent value="variacoes" className="space-y-6">
            {latestAnalysis ? (
              <ProjectVariationsPanel
                projectId={projectId}
                totalArea={project.area}
                buildableArea={latestAnalysis.areaMaximaConstruida || 0}
                occupancyRate={project.taxaOcupacao || 0}
                buildingCoefficient={(project.coeficienteAproveitamento || 0) / 100}
                setbackFront={project.recuoFrontal || 0}
                setbackSide={project.recuoLateral || 0}
                setbackRear={project.recuoFundos || 0}
                minParkingSpaces={latestAnalysis.vagasEstacionamento || 0}
                permeableAreaRequired={project.area * 0.15}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Análise Volumétrica Não Realizada</CardTitle>
                  <CardDescription>
                    Para gerar variações de projeto, é necessário primeiro realizar a análise volumétrica.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Acesse a aba "Análise Volumétrica" para gerar a análise inicial do projeto.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Análise de Mercado */}
          <TabsContent value="mercado" className="space-y-6">
            {project.latitude && project.longitude ? (
              <MarketAnalysisPanel
                projectId={projectId}
                latitude={parseFloat(project.latitude)}
                longitude={parseFloat(project.longitude)}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Localização Não Definida</CardTitle>
                  <CardDescription>
                    Para realizar a análise de mercado, é necessário definir a localização do terreno (latitude e longitude).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Adicione um arquivo KMZ na aba "Dados do Terreno" ou preencha as coordenadas manualmente.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Simulação de Fluxo */}
          <TabsContent value="fluxo" className="space-y-6">
            <FlowSimulatorPanel projectId={projectId} />
          </TabsContent>
          
          {/* Visualização 3D */}
          <TabsContent value="3d" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visualização 3D do Terreno e Volumetria</CardTitle>
                <CardDescription>
                  Visualização interativa em 3D do terreno, estacionamento e volumetria do projeto.
                  Use o mouse para rotacionar, zoom e navegar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Terrain3DViewer 
                  polygonCoordinates={project.polygonCoordinates || undefined}
                  buildingFootprint={latestAnalysis?.areaMaximaConstruida || project.area}
                  buildingHeight={latestAnalysis?.volumetriaHeight || 5}
                  parkingSpaces={latestAnalysis?.vagasEstacionamento || 40}
                />
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Controles:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Rotacionar:</strong> Botão esquerdo do mouse + arrastar</li>
                    <li>• <strong>Zoom:</strong> Roda do mouse</li>
                    <li>• <strong>Pan:</strong> Botão direito do mouse + arrastar</li>
                  </ul>
                  
                  {latestAnalysis && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Altura:</div>
                        <div className="font-semibold">{latestAnalysis.volumetriaHeight || 5}m</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Área Construída:</div>
                        <div className="font-semibold">{latestAnalysis.areaMaximaConstruida?.toLocaleString()}m²</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lojas:</div>
                        <div className="font-semibold">{latestAnalysis.numeroLojas}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Vagas:</div>
                        <div className="font-semibold">{latestAnalysis.vagasEstacionamento}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de Prévia do PDF */}
      {previewData && (
        <PDFPreviewDialog
          open={showPreview}
          onOpenChange={setShowPreview}
          pdfBase64={previewData.pdfBase64}
          fileName={previewData.fileName}
        />
      )}
    </div>
  );
}
