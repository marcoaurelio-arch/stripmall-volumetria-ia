import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, Store, Square, Car, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function GalleryStats() {
  const [, navigate] = useLocation();
  const { data: projects, isLoading } = trpc.inspiration.list.useQuery({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sem Dados</CardTitle>
            <CardDescription>Nenhum projeto de inspiração encontrado</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/galeria-inspiracao")}>
              Voltar para Galeria
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estatísticas gerais
  const totalProjects = projects.length;
  const totalArea = projects.reduce((sum, p) => sum + (p.area || 0), 0);
  const totalStores = projects.reduce((sum, p) => sum + (p.storeCount || 0), 0);
  const totalParking = projects.reduce((sum, p) => sum + (p.parkingSpaces || 0), 0);
  const avgArea = Math.round(totalArea / totalProjects);
  const avgStores = Math.round(totalStores / totalProjects);
  const avgParking = Math.round(totalParking / totalProjects);

  // Distribuição por categoria
  const categoryDistribution = projects.reduce((acc, p) => {
    const category = p.category || "Outros";
    const label = category === "strip_mall" ? "Strip Mall" :
                  category === "open_mall" ? "Open Mall" :
                  category === "shopping_center" ? "Shopping Center" :
                  category === "neighborhood_center" ? "Neighborhood Center" : "Outros";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalProjects) * 100)
  }));

  // Área média por tipo
  const areaByCategory = projects.reduce((acc, p) => {
    const category = p.category || "Outros";
    const label = category === "strip_mall" ? "Strip Mall" :
                  category === "open_mall" ? "Open Mall" :
                  category === "shopping_center" ? "Shopping Center" :
                  category === "neighborhood_center" ? "Neighborhood Center" : "Outros";
    if (!acc[label]) acc[label] = { total: 0, count: 0 };
    acc[label].total += p.area || 0;
    acc[label].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const areaData = Object.entries(areaByCategory).map(([name, data]) => ({
    name,
    area: Math.round(data.total / data.count)
  }));

  // Lojas médias por tipo
  const storesByCategory = projects.reduce((acc, p) => {
    const category = p.category || "Outros";
    const label = category === "strip_mall" ? "Strip Mall" :
                  category === "open_mall" ? "Open Mall" :
                  category === "shopping_center" ? "Shopping Center" :
                  category === "neighborhood_center" ? "Neighborhood Center" : "Outros";
    if (!acc[label]) acc[label] = { total: 0, count: 0 };
    acc[label].total += p.storeCount || 0;
    acc[label].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const storesData = Object.entries(storesByCategory).map(([name, data]) => ({
    name,
    stores: Math.round(data.total / data.count)
  }));

  // Distribuição por região
  const regionDistribution = projects.reduce((acc, p) => {
    const region = p.region || "Não especificado";
    const label = region === "norte" ? "Norte" :
                  region === "nordeste" ? "Nordeste" :
                  region === "centro_oeste" ? "Centro-Oeste" :
                  region === "sudeste" ? "Sudeste" :
                  region === "sul" ? "Sul" : "Não especificado";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionData = Object.entries(regionDistribution).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container py-12">
          <Button variant="ghost" onClick={() => navigate("/galeria-inspiracao")} className="mb-4">
            ← Voltar para Galeria
          </Button>
          <h1 className="text-4xl font-bold mb-2">Estatísticas da Galeria</h1>
          <p className="text-muted-foreground text-lg">
            Análise completa dos {totalProjects} projetos de inspiração
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                Projetos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Área Média</CardTitle>
              <Square className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgArea.toLocaleString()} m²</div>
              <p className="text-xs text-muted-foreground">
                Total: {totalArea.toLocaleString()} m²
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojas Médias</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgStores}</div>
              <p className="text-xs text-muted-foreground">
                Total: {totalStores} lojas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Médias</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgParking}</div>
              <p className="text-xs text-muted-foreground">
                Total: {totalParking} vagas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Quantidade de projetos por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Área Média por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Área Média por Tipo</CardTitle>
              <CardDescription>Área média em m² por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="area" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lojas Médias por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Lojas Médias por Tipo</CardTitle>
              <CardDescription>Número médio de lojas por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stores" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Região */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Região</CardTitle>
              <CardDescription>Projetos por região do Brasil</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}