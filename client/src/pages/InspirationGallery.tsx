import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, MapPin, Store, Square, Search, Filter, X, Calendar, Users, Car, Anchor, Briefcase, User, TrendingUp, Check } from "lucide-react";
import ProjectComparison from "@/components/ProjectComparison";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

export default function InspirationGallery() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [, navigate] = useLocation();

  const { data: projects, isLoading } = trpc.inspiration.list.useQuery({
    search: search || undefined,
    category: category as any || undefined,
    minArea: minArea ? parseInt(minArea) : undefined,
    maxArea: maxArea ? parseInt(maxArea) : undefined,
    location: location || undefined,
    region: region as any || undefined,
  });

  const { data: selectedProject } = trpc.inspiration.getById.useQuery(
    { id: selectedProjectId! },
    { enabled: selectedProjectId !== null }
  );

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinArea("");
    setMaxArea("");
    setLocation("");
    setRegion("");
  };

  const hasFilters = search || category || minArea || maxArea || location || region;

  const toggleProjectSelection = (projectId: number) => {
    setSelectedForComparison(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectedProjects = projects?.filter(p => selectedForComparison.includes(p.id)) || [];

  const handleUseAsReference = () => {
    if (selectedProject) {
      // Navegar para novo projeto com parâmetros pré-preenchidos
      const params = new URLSearchParams({
        referenceId: selectedProject.id.toString(),
        area: selectedProject.area?.toString() || "",
        storeCount: selectedProject.storeCount?.toString() || "",
      });
      navigate(`/novo-projeto?${params.toString()}`);
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

              {/* Região */}
              <div>
                <label className="text-sm font-medium mb-2 block">Região</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="norte">Norte</SelectItem>
                    <SelectItem value="nordeste">Nordeste</SelectItem>
                    <SelectItem value="centro_oeste">Centro-Oeste</SelectItem>
                    <SelectItem value="sudeste">Sudeste</SelectItem>
                    <SelectItem value="sul">Sul</SelectItem>
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
                <Card 
                  key={project.id} 
                  className={`hover:shadow-lg transition-all cursor-pointer group relative ${
                    selectedForComparison.includes(project.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {/* Checkbox de seleção */}
                  <div 
                    className="absolute top-3 left-3 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProjectSelection(project.id);
                    }}
                  >
                    <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
                      <Checkbox 
                        checked={selectedForComparison.includes(project.id)}
                        onCheckedChange={() => toggleProjectSelection(project.id)}
                      />
                      <label className="text-xs font-medium cursor-pointer">
                        Comparar
                      </label>
                    </div>
                  </div>

                  {/* Imagem do projeto */}
                  <div 
                    className="h-48 rounded-t-lg flex items-center justify-center relative overflow-hidden"
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    {project.mainImageUrl ? (
                      <img 
                        src={project.mainImageUrl} 
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground/30 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
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

                  <CardContent onClick={() => setSelectedProjectId(project.id)}>
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

      {/* Modal de Detalhes */}
      <Dialog open={selectedProjectId !== null} onOpenChange={(open) => !open && setSelectedProjectId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  {selectedProject.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  {selectedProject.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Categoria e Ano */}
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {selectedProject.category === "strip_mall" && "Strip Mall"}
                    {selectedProject.category === "open_mall" && "Open Mall"}
                    {selectedProject.category === "shopping_center" && "Shopping Center"}
                    {selectedProject.category === "neighborhood_center" && "Convenience Center"}
                  </Badge>
                  {selectedProject.year && (
                    <Badge variant="outline" className="text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {selectedProject.year}
                    </Badge>
                  )}
                </div>

                {/* Descrição */}
                {selectedProject.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Sobre o Projeto</h3>
                    <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
                  </div>
                )}

                {/* Dados Técnicos Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Square className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{selectedProject.area?.toLocaleString("pt-BR")}</div>
                        <div className="text-xs text-muted-foreground">m² ABL</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Store className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{selectedProject.storeCount || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">Lojas</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Car className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">{selectedProject.parkingSpaces || "N/A"}</div>
                        <div className="text-xs text-muted-foreground">Vagas</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Users className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">
                          {selectedProject.area && selectedProject.storeCount 
                            ? Math.round(selectedProject.area / selectedProject.storeCount)
                            : "N/A"}
                        </div>
                        <div className="text-xs text-muted-foreground">m²/loja</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lojas Âncora */}
                {selectedProject.anchors && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Anchor className="h-5 w-5 text-primary" />
                      Lojas Âncora
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedProject.anchors).map((store: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {store}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mix de Lojas */}
                {selectedProject.features && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      Características
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedProject.features).map((feature: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProject.developer && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Desenvolvedor</div>
                        <div className="text-sm text-muted-foreground">{selectedProject.developer}</div>
                      </div>
                    </div>
                  )}

                  {selectedProject.architect && (
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <User className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Arquiteto</div>
                        <div className="text-sm text-muted-foreground">{selectedProject.architect}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão de Ação */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleUseAsReference} className="flex-1">
                    Usar como Referência
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedProjectId(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Botão Flutuante de Comparação */}
      {selectedForComparison.length >= 2 && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button 
            size="lg" 
            className="shadow-2xl hover:shadow-3xl transition-all"
            onClick={() => setShowComparison(true)}
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Comparar {selectedForComparison.length} Projetos
          </Button>
        </div>
      )}

      {/* Modal de Comparação */}
      {showComparison && selectedProjects.length >= 2 && (
        <ProjectComparison 
          projects={selectedProjects}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}
