import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Building2, Square, Store, Car, X, TrendingUp } from "lucide-react";

interface InspirationProject {
  id: number;
  name: string;
  location: string;
  area: number | null;
  storeCount: number | null;
  parkingSpaces: number | null;
  category: string;
  developer: string | null;
  year: number | null;
}

interface ProjectComparisonProps {
  projects: InspirationProject[];
  onClose: () => void;
}

export default function ProjectComparison({ projects, onClose }: ProjectComparisonProps) {
  // Calcular métricas derivadas
  const projectsWithMetrics = projects.map(p => ({
    ...p,
    ablPerStore: p.area && p.storeCount ? Math.round(p.area / p.storeCount) : null,
    parkingPer100m2: p.area && p.parkingSpaces ? Math.round((p.parkingSpaces / p.area) * 100) : null,
  }));

  // Dados para gráfico de barras comparativo
  const barChartData = [
    {
      metric: "Área (m²)",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [`projeto${i + 1}`, p.area || 0])),
    },
    {
      metric: "Lojas",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [`projeto${i + 1}`, p.storeCount || 0])),
    },
    {
      metric: "Vagas",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [`projeto${i + 1}`, p.parkingSpaces || 0])),
    },
  ];

  // Dados para gráfico radar (métricas normalizadas)
  const maxAbl = Math.max(...projectsWithMetrics.map(p => p.area || 0));
  const maxStores = Math.max(...projectsWithMetrics.map(p => p.storeCount || 0));
  const maxParking = Math.max(...projectsWithMetrics.map(p => p.parkingSpaces || 0));
  const maxAblPerStore = Math.max(...projectsWithMetrics.map(p => p.ablPerStore || 0));

  const radarData = [
    {
      metric: "ABL",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [
        `projeto${i + 1}`,
        maxAbl > 0 ? Math.round(((p.area || 0) / maxAbl) * 100) : 0
      ])),
    },
    {
      metric: "Lojas",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [
        `projeto${i + 1}`,
        maxStores > 0 ? Math.round(((p.storeCount || 0) / maxStores) * 100) : 0
      ])),
    },
    {
      metric: "Vagas",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [
        `projeto${i + 1}`,
        maxParking > 0 ? Math.round(((p.parkingSpaces || 0) / maxParking) * 100) : 0
      ])),
    },
    {
      metric: "m²/loja",
      ...Object.fromEntries(projectsWithMetrics.map((p, i) => [
        `projeto${i + 1}`,
        maxAblPerStore > 0 ? Math.round(((p.ablPerStore || 0) / maxAblPerStore) * 100) : 0
      ])),
    },
  ];

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Comparação de Projetos
              </DialogTitle>
              <DialogDescription>
                Análise comparativa de {projects.length} projetos de strip mall
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabela Comparativa */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Técnicos</CardTitle>
              <CardDescription>Comparação lado a lado das principais métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Métrica</th>
                      {projectsWithMetrics.map((project, idx) => (
                        <th key={project.id} className="text-center p-3 font-semibold" style={{ color: colors[idx] }}>
                          {project.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Localização</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 text-sm">{p.location}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Categoria</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3">
                          <Badge variant="outline" className="text-xs">
                            {p.category === "strip_mall" && "Strip Mall"}
                            {p.category === "open_mall" && "Open Mall"}
                            {p.category === "shopping_center" && "Shopping"}
                            {p.category === "neighborhood_center" && "Convenience"}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        ABL (m²)
                      </td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 font-semibold text-lg">
                          {p.area?.toLocaleString("pt-BR") || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Store className="h-4 w-4" />
                        Número de Lojas
                      </td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 font-semibold text-lg">
                          {p.storeCount || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Vagas de Estacionamento
                      </td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 font-semibold text-lg">
                          {p.parkingSpaces || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">ABL por Loja (m²)</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 text-primary font-medium">
                          {p.ablPerStore ? `${p.ablPerStore} m²` : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Vagas por 100m²</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 text-primary font-medium">
                          {p.parkingPer100m2 ? `${p.parkingPer100m2} vagas` : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Desenvolvedor</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 text-sm text-muted-foreground">
                          {p.developer || "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-3 font-medium">Ano</td>
                      {projectsWithMetrics.map(p => (
                        <td key={p.id} className="text-center p-3 text-sm text-muted-foreground">
                          {p.year || "N/A"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos Comparativos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação de Métricas Absolutas</CardTitle>
                <CardDescription>Valores reais de área, lojas e vagas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {projectsWithMetrics.map((p, idx) => (
                      <Bar
                        key={p.id}
                        dataKey={`projeto${idx + 1}`}
                        name={p.name}
                        fill={colors[idx]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Comparativa Normalizada</CardTitle>
                <CardDescription>Comparação percentual entre projetos (0-100%)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {projectsWithMetrics.map((p, idx) => (
                      <Radar
                        key={p.id}
                        name={p.name}
                        dataKey={`projeto${idx + 1}`}
                        stroke={colors[idx]}
                        fill={colors[idx]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insights da Comparação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Maior ABL</div>
                  <div className="text-sm">
                    {projectsWithMetrics.reduce((max, p) => (p.area || 0) > (max.area || 0) ? p : max).name}
                    <span className="text-muted-foreground ml-2">
                      ({Math.max(...projectsWithMetrics.map(p => p.area || 0)).toLocaleString("pt-BR")} m²)
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="font-semibold text-green-700 dark:text-green-400 mb-2">Mais Lojas</div>
                  <div className="text-sm">
                    {projectsWithMetrics.reduce((max, p) => (p.storeCount || 0) > (max.storeCount || 0) ? p : max).name}
                    <span className="text-muted-foreground ml-2">
                      ({Math.max(...projectsWithMetrics.map(p => p.storeCount || 0))} lojas)
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="font-semibold text-orange-700 dark:text-orange-400 mb-2">Maior ABL/Loja</div>
                  <div className="text-sm">
                    {projectsWithMetrics.reduce((max, p) => (p.ablPerStore || 0) > (max.ablPerStore || 0) ? p : max).name}
                    <span className="text-muted-foreground ml-2">
                      ({Math.max(...projectsWithMetrics.map(p => p.ablPerStore || 0))} m²/loja)
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Mais Vagas</div>
                  <div className="text-sm">
                    {projectsWithMetrics.reduce((max, p) => (p.parkingSpaces || 0) > (max.parkingSpaces || 0) ? p : max).name}
                    <span className="text-muted-foreground ml-2">
                      ({Math.max(...projectsWithMetrics.map(p => p.parkingSpaces || 0))} vagas)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
