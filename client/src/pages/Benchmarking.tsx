import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Building2, Square, Store, Car, Users, Award, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Benchmarking() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const { data: projects, isLoading: projectsLoading } = trpc.project.list.useQuery();
  // Buscar projeto selecionado da lista
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  // Buscar análises do projeto selecionado
  const { data: analyses } = trpc.project.getAnalyses.useQuery(
    { projectId: selectedProjectId! },
    { enabled: selectedProjectId !== null }
  );
  
  // Usar a análise mais recente
  const analysis = analyses && analyses.length > 0 ? analyses[0] : null;

  // Buscar projetos similares quando um projeto é selecionado
  const { data: similarProjects, isLoading: similarLoading } = trpc.inspiration.findSimilar.useQuery(
    {
      area: selectedProject?.area || 0,
      category: "strip_mall", // Assumir strip_mall como padrão
    },
    { enabled: selectedProject !== null }
  );

  // Calcular médias dos projetos similares
  const benchmarkData = similarProjects && similarProjects.length > 0 ? {
    avgArea: Math.round(similarProjects.reduce((sum, p) => sum + (p.area || 0), 0) / similarProjects.length),
    avgStores: Math.round(similarProjects.reduce((sum, p) => sum + (p.storeCount || 0), 0) / similarProjects.length),
    avgParking: Math.round(similarProjects.reduce((sum, p) => sum + (p.parkingSpaces || 0), 0) / similarProjects.length),
    avgAblPerStore: Math.round(
      similarProjects
        .filter(p => p.area && p.storeCount)
        .reduce((sum, p) => sum + (p.area! / p.storeCount!), 0) / 
      similarProjects.filter(p => p.area && p.storeCount).length
    ),
    avgParkingPer100m2: (
      similarProjects
        .filter(p => p.area && p.parkingSpaces)
        .reduce((sum, p) => sum + ((p.parkingSpaces! / p.area!) * 100), 0) / 
      similarProjects.filter(p => p.area && p.parkingSpaces).length
    ).toFixed(2),
    commonAnchors: getCommonAnchors(similarProjects),
    sampleSize: similarProjects.length,
  } : null;

  // Dados para gráfico de comparação
  const comparisonData = selectedProject && benchmarkData && analysis ? [
    {
      metric: "ABL (m²)",
      "Seu Projeto": selectedProject.area || 0,
      "Média do Mercado": benchmarkData.avgArea,
    },
    {
      metric: "Lojas",
      "Seu Projeto": analysis.numeroLojas || 0,
      "Média do Mercado": benchmarkData.avgStores,
    },
    {
      metric: "Vagas",
      "Seu Projeto": analysis.vagasEstacionamento || 0,
      "Média do Mercado": benchmarkData.avgParking,
    },
  ] : [];

  // Dados para radar chart (índices normalizados)
  const radarData = selectedProject && benchmarkData && analysis ? [
    {
      metric: "ABL",
      "Seu Projeto": Math.min(((selectedProject.area || 0) / benchmarkData.avgArea) * 100, 150),
      "Média": 100,
    },
    {
      metric: "Lojas",
      "Seu Projeto": Math.min(((analysis.numeroLojas || 0) / benchmarkData.avgStores) * 100, 150),
      "Média": 100,
    },
    {
      metric: "Vagas",
      "Seu Projeto": Math.min(((analysis.vagasEstacionamento || 0) / benchmarkData.avgParking) * 100, 150),
      "Média": 100,
    },
    {
      metric: "ABL/Loja",
      "Seu Projeto": Math.min((((selectedProject.area || 0) / (analysis.numeroLojas || 1)) / benchmarkData.avgAblPerStore) * 100, 150),
      "Média": 100,
    },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Dashboard de Benchmarking</h1>
          </div>
          <p className="text-muted-foreground">
            Compare seu projeto com a média de strip malls similares do mercado brasileiro
          </p>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Seleção de Projeto */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione um Projeto para Análise</CardTitle>
            <CardDescription>
              Escolha um dos seus projetos para comparar com benchmarks do mercado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : projects && projects.length > 0 ? (
              <Select 
                value={selectedProjectId?.toString() || ""} 
                onValueChange={(v) => setSelectedProjectId(v ? parseInt(v) : null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um projeto..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} - {project.address || "Endereço não informado"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Você ainda não possui projetos cadastrados
                </p>
                <Button onClick={() => window.location.href = "/novo-projeto"}>
                  Criar Primeiro Projeto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Análise de Benchmarking */}
        {selectedProject && (
          <>
            {/* Resumo do Projeto */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedProject.name}</CardTitle>
                    <CardDescription>{selectedProject.address || "Endereço não informado"}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    Strip Mall
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Square className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{selectedProject.area?.toLocaleString("pt-BR")}</div>
                      <div className="text-sm text-muted-foreground">m² ABL</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Store className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{analysis?.numeroLojas || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Lojas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Car className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{analysis?.vagasEstacionamento || "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Vagas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">
                        {selectedProject.area && analysis?.numeroLojas 
                          ? Math.round(selectedProject.area / analysis.numeroLojas)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">m²/Loja</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparação com Mercado */}
            {similarLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Analisando projetos similares...</p>
                  </div>
                </CardContent>
              </Card>
            ) : benchmarkData ? (
              <>
                {/* Métricas de Comparação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Comparação com Média do Mercado
                      </CardTitle>
                      <CardDescription>
                        Baseado em {benchmarkData.sampleSize} projetos similares
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span className="font-medium">ABL Média:</span>
                          <span className="text-lg font-bold">{benchmarkData.avgArea.toLocaleString("pt-BR")} m²</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span className="font-medium">Lojas Média:</span>
                          <span className="text-lg font-bold">{benchmarkData.avgStores}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span className="font-medium">Vagas Média:</span>
                          <span className="text-lg font-bold">{benchmarkData.avgParking}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span className="font-medium">ABL/Loja Média:</span>
                          <span className="text-lg font-bold">{benchmarkData.avgAblPerStore} m²</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <span className="font-medium">Vagas/100m² Média:</span>
                          <span className="text-lg font-bold">{benchmarkData.avgParkingPer100m2}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Âncoras Mais Comuns</CardTitle>
                      <CardDescription>
                        Mix de lojas âncora típico do mercado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {benchmarkData.commonAnchors.length > 0 ? (
                        <div className="space-y-3">
                          {benchmarkData.commonAnchors.map((anchor, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                              <span className="font-medium">{anchor.name}</span>
                              <Badge variant="secondary">
                                {Math.round((anchor.count / benchmarkData.sampleSize) * 100)}% dos projetos
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Dados de âncoras não disponíveis</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparação de Métricas Absolutas</CardTitle>
                      <CardDescription>Seu projeto vs. média do mercado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="metric" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Seu Projeto" fill="#3b82f6" />
                          <Bar dataKey="Média do Mercado" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Índice de Performance Relativa</CardTitle>
                      <CardDescription>100 = média do mercado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis angle={90} domain={[0, 150]} />
                          <Radar name="Seu Projeto" dataKey="Seu Projeto" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          <Radar name="Média" dataKey="Média" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sem Dados de Benchmarking</h3>
                  <p className="text-muted-foreground">
                    Não foram encontrados projetos similares para comparação
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Função auxiliar para encontrar âncoras mais comuns
function getCommonAnchors(projects: any[]): { name: string; count: number }[] {
  const anchorCounts: Record<string, number> = {};

  projects.forEach(project => {
    if (project.anchors) {
      try {
        const anchors = JSON.parse(project.anchors);
        anchors.forEach((anchor: string) => {
          anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
        });
      } catch (e) {
        // Ignorar erros de parsing
      }
    }
  });

  return Object.entries(anchorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 âncoras
}
