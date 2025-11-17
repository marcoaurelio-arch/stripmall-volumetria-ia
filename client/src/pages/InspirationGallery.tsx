import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Store, Square, Search, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function InspirationGallery() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [location, setLocation] = useState("");

  const { data: projects, isLoading } = trpc.inspiration.list.useQuery({
    search: search || undefined,
    category: category as any || undefined,
    minArea: minArea ? parseInt(minArea) : undefined,
    maxArea: maxArea ? parseInt(maxArea) : undefined,
    location: location || undefined,
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinArea("");
    setMaxArea("");
    setLocation("");
  };

  const hasFilters = search || category || minArea || maxArea || location;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Galeria de Inspiração</h1>
          </div>
          <p className="text-muted-foreground">
            Explore {projects?.length || 25} projetos de strip malls e open malls brasileiros para inspirar seu desenvolvimento
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filtros */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filtros</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            <CardDescription>Refine sua busca por categoria, localização ou porte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Busca por texto */}
              <div className="lg:col-span-2">
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, localização, desenvolvedor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="strip_mall">Strip Mall</SelectItem>
                    <SelectItem value="open_mall">Open Mall</SelectItem>
                    <SelectItem value="shopping_center">Shopping Center</SelectItem>
                    <SelectItem value="neighborhood_center">Convenience Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Localização */}
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Input
                  placeholder="SP, RJ, MG..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Área */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Área Mín (m²)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Área Máx (m²)</label>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Projetos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Exibindo {projects.length} projeto{projects.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  {/* Imagem placeholder */}
                  <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <Building2 className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary">
                        {project.category === "strip_mall" && "Strip Mall"}
                        {project.category === "open_mall" && "Open Mall"}
                        {project.category === "shopping_center" && "Shopping"}
                        {project.category === "neighborhood_center" && "Convenience"}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {project.location}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          Área:
                        </span>
                        <span className="font-medium">{project.area?.toLocaleString("pt-BR")} m²</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Store className="h-4 w-4" />
                          Lojas:
                        </span>
                        <span className="font-medium">{project.storeCount || "N/A"}</span>
                      </div>
                      {project.developer && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          <strong>Desenvolvedor:</strong> {project.developer}
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou limpar a busca
              </p>
              {hasFilters && (
                <Button onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
