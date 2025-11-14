import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Building2, Users, Calendar, Lightbulb, Filter, X, Search } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

/**
 * Página de galeria de projetos de inspiração
 * Catálogo de strip malls e centros comerciais relevantes do Brasil
 */
export default function Inspirations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: undefined as "strip_mall" | "open_mall" | "shopping_center" | "neighborhood_center" | undefined,
    segment: undefined as "popular" | "medio" | "alto_padrao" | undefined,
    location: "",
    minArea: undefined as number | undefined,
    maxArea: undefined as number | undefined,
    minStores: undefined as number | undefined,
    maxStores: undefined as number | undefined,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data: projects, isLoading } = trpc.inspiration.list.useQuery(filters);

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

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      search: "",
      category: undefined,
      segment: undefined,
      location: "",
      minArea: undefined,
      maxArea: undefined,
      minStores: undefined,
      maxStores: undefined,
    });
  };

  const hasActiveFilters = 
    searchTerm ||
    filters.category || 
    filters.segment || 
    filters.location || 
    filters.minArea !== undefined || 
    filters.maxArea !== undefined ||
    filters.minStores !== undefined ||
    filters.maxStores !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Lightbulb className="h-10 w-10 text-yellow-500" />
                Projetos de Inspiração
              </h1>
              <p className="text-lg text-slate-600 mt-2 mb-4">
                Catálogo de strip malls e centros comerciais relevantes do Brasil
              </p>
              
              {/* Campo de Busca */}
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, localização, arquiteto, incorporadora..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 mt-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Ocultar Filtros" : "Filtrar"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filtros */}
        {showFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Filtros de Busca</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Limpar Filtros
                  </Button>
                )}
              </CardTitle>
              <CardDescription>Refine sua busca por projetos de inspiração</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, category: value === "all" ? undefined : value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="strip_mall">Strip Mall</SelectItem>
                    <SelectItem value="open_mall">Open Mall</SelectItem>
                    <SelectItem value="shopping_center">Shopping Center</SelectItem>
                    <SelectItem value="neighborhood_center">Centro de Bairro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Segmento</Label>
                <Select
                  value={filters.segment || "all"}
                  onValueChange={(value) =>
                    setFilters({ ...filters, segment: value === "all" ? undefined : value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto_padrao">Alto Padrão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Localização</Label>
                <Input
                  placeholder="Cidade ou estado"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              <div>
                <Label>Área Mínima (m²)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 1000"
                  value={filters.minArea || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, minArea: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>

              <div>
                <Label>Área Máxima (m²)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 10000"
                  value={filters.maxArea || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, maxArea: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>

              <div>
                <Label>Mínimo de Lojas</Label>
                <Input
                  type="number"
                  placeholder="Ex: 5"
                  value={filters.minStores || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, minStores: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>

              <div>
                <Label>Máximo de Lojas</Label>
                <Input
                  type="number"
                  placeholder="Ex: 50"
                  value={filters.maxStores || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, maxStores: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Resultados */}
        {!isLoading && projects && (
          <>
            <div className="mb-6 text-sm text-slate-600">
              {projects.length} {projects.length === 1 ? "projeto encontrado" : "projetos encontrados"}
            </div>

            {projects.length === 0 ? (
              <Card className="p-12 text-center">
                <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum projeto encontrado</h3>
                <p className="text-slate-500 mb-4">
                  Tente ajustar os filtros ou limpar a busca para ver mais resultados.
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpar Filtros
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => {
                  const images = project.images ? JSON.parse(project.images) : [];
                  const mainImage = project.mainImageUrl || images[0];
                  const features = project.features ? JSON.parse(project.features) : [];

                  return (
                    <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Imagem */}
                      {mainImage && (
                        <div className="h-48 bg-slate-200 overflow-hidden">
                          <img
                            src={mainImage}
                            alt={project.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <Badge variant="secondary">{segmentLabels[project.segment]}</Badge>
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {project.area && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{project.area.toLocaleString("pt-BR")} m²</span>
                            </div>
                          )}
                          {project.storeCount && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{project.storeCount} lojas</span>
                            </div>
                          )}
                          {project.year && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{project.year}</span>
                            </div>
                          )}
                        </div>

                        <Badge className="mb-2">{categoryLabels[project.category]}</Badge>

                        {project.description && (
                          <p className="text-sm text-slate-600 line-clamp-3 mt-3">{project.description}</p>
                        )}

                        {features.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {features.slice(0, 3).map((feature: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{features.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter>
                        <Link href={`/inspirations/${project.id}`} className="w-full">
                          <Button className="w-full">Ver Detalhes</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
