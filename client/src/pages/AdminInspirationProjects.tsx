import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ProjectFormData {
  name: string;
  location: string;
  description: string;
  concept: string;
  area: string;
  storeCount: string;
  parkingSpaces: string;
  floors: string;
  year: string;
  architect: string;
  developer: string;
  anchors: string;
  features: string;
  category: "strip_mall" | "open_mall" | "shopping_center" | "neighborhood_center";
  segment: "popular" | "medio" | "alto_padrao";
  latitude: string;
  longitude: string;
  mainImageUrl: string;
}

const emptyForm: ProjectFormData = {
  name: "",
  location: "",
  description: "",
  concept: "",
  area: "",
  storeCount: "",
  parkingSpaces: "",
  floors: "",
  year: "",
  architect: "",
  developer: "",
  anchors: "",
  features: "",
  category: "strip_mall",
  segment: "medio",
  latitude: "",
  longitude: "",
  mainImageUrl: "",
};

export default function AdminInspirationProjects() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(emptyForm);

  const { data: projects, isLoading, refetch } = trpc.inspiration.list.useQuery();
  const createMutation = trpc.inspiration.create.useMutation();
  const updateMutation = trpc.inspiration.update.useMutation();
  const deleteMutation = trpc.inspiration.delete.useMutation();

  // Verificar se é admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Apenas administradores podem acessar esta página</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Voltar para Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        name: formData.name,
        location: formData.location,
        description: formData.description || undefined,
        concept: formData.concept || undefined,
        area: formData.area ? parseInt(formData.area) : undefined,
        storeCount: formData.storeCount ? parseInt(formData.storeCount) : undefined,
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : undefined,
        floors: formData.floors ? parseInt(formData.floors) : undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        architect: formData.architect || undefined,
        developer: formData.developer || undefined,
        anchors: formData.anchors ? formData.anchors.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        features: formData.features ? formData.features.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        category: formData.category,
        segment: formData.segment,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        mainImageUrl: formData.mainImageUrl || undefined,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Projeto criado com sucesso!");
      }

      setIsDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar projeto");
    }
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      location: project.location,
      description: project.description || "",
      concept: project.concept || "",
      area: project.area?.toString() || "",
      storeCount: project.storeCount?.toString() || "",
      parkingSpaces: project.parkingSpaces?.toString() || "",
      floors: project.floors?.toString() || "",
      year: project.year?.toString() || "",
      architect: project.architect || "",
      developer: project.developer || "",
      anchors: project.anchors ? JSON.parse(project.anchors).join(", ") : "",
      features: project.features ? JSON.parse(project.features).join(", ") : "",
      category: project.category,
      segment: project.segment,
      latitude: project.latitude || "",
      longitude: project.longitude || "",
      mainImageUrl: project.mainImageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este projeto?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Projeto deletado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar projeto");
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Gerenciar Projetos de Inspiração</h1>
              </div>
              <p className="text-muted-foreground">
                Adicione, edite ou remova projetos do catálogo de inspiração
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" onClick={handleNew}>
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "Editar Projeto" : "Novo Projeto de Inspiração"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do projeto de strip mall ou open mall
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informações Básicas</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="name">Nome do Projeto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Ex: Boulevard Gourmet"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="location">Localização *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                          placeholder="Ex: Belo Horizonte, MG"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strip_mall">Strip Mall</SelectItem>
                            <SelectItem value="open_mall">Open Mall</SelectItem>
                            <SelectItem value="shopping_center">Shopping Center</SelectItem>
                            <SelectItem value="neighborhood_center">Neighborhood Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="segment">Segmento *</Label>
                        <Select value={formData.segment} onValueChange={(v: any) => setFormData({ ...formData, segment: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="medio">Médio</SelectItem>
                            <SelectItem value="alto_padrao">Alto Padrão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Descrição geral do projeto"
                      />
                    </div>

                    <div>
                      <Label htmlFor="concept">Conceito Arquitetônico</Label>
                      <Textarea
                        id="concept"
                        value={formData.concept}
                        onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                        rows={2}
                        placeholder="Conceito e partido arquitetônico"
                      />
                    </div>
                  </div>

                  {/* Dados Técnicos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Dados Técnicos</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="area">Área (m²)</Label>
                        <Input
                          id="area"
                          type="number"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          placeholder="Ex: 5000"
                        />
                      </div>

                      <div>
                        <Label htmlFor="storeCount">Número de Lojas</Label>
                        <Input
                          id="storeCount"
                          type="number"
                          value={formData.storeCount}
                          onChange={(e) => setFormData({ ...formData, storeCount: e.target.value })}
                          placeholder="Ex: 12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="parkingSpaces">Vagas de Estacionamento</Label>
                        <Input
                          id="parkingSpaces"
                          type="number"
                          value={formData.parkingSpaces}
                          onChange={(e) => setFormData({ ...formData, parkingSpaces: e.target.value })}
                          placeholder="Ex: 80"
                        />
                      </div>

                      <div>
                        <Label htmlFor="floors">Número de Pavimentos</Label>
                        <Input
                          id="floors"
                          type="number"
                          value={formData.floors}
                          onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                          placeholder="Ex: 1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="year">Ano de Inauguração</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          placeholder="Ex: 2020"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações Profissionais */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informações Profissionais</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="developer">Desenvolvedor/Incorporadora</Label>
                        <Input
                          id="developer"
                          value={formData.developer}
                          onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                          placeholder="Ex: Multiplan"
                        />
                      </div>

                      <div>
                        <Label htmlFor="architect">Arquiteto/Escritório</Label>
                        <Input
                          id="architect"
                          value={formData.architect}
                          onChange={(e) => setFormData({ ...formData, architect: e.target.value })}
                          placeholder="Ex: Aflalo & Gasperini"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Características */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Características</h3>
                    
                    <div>
                      <Label htmlFor="anchors">Lojas Âncora (separadas por vírgula)</Label>
                      <Input
                        id="anchors"
                        value={formData.anchors}
                        onChange={(e) => setFormData({ ...formData, anchors: e.target.value })}
                        placeholder="Ex: Supermercado BH, Drogaria Araújo, Óticas Carol"
                      />
                    </div>

                    <div>
                      <Label htmlFor="features">Características Principais (separadas por vírgula)</Label>
                      <Input
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder="Ex: Praça de alimentação, Playground, Área verde"
                      />
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Coordenadas Geográficas</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                          placeholder="Ex: -19.9191"
                        />
                      </div>

                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                          placeholder="Ex: -43.9386"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Imagem */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Imagem Principal</h3>
                    
                    <div>
                      <Label htmlFor="mainImageUrl">URL da Imagem Principal</Label>
                      <Input
                        id="mainImageUrl"
                        value={formData.mainImageUrl}
                        onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                      {formData.mainImageUrl && (
                        <div className="mt-2">
                          <img 
                            src={formData.mainImageUrl} 
                            alt="Preview" 
                            className="h-32 w-auto object-cover rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {editingId ? "Atualizar" : "Criar"} Projeto
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false);
                        setFormData(emptyForm);
                        setEditingId(null);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="container py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando projetos...</p>
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                {/* Imagem */}
                <div className="h-48 rounded-t-lg overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                  {project.mainImageUrl ? (
                    <img 
                      src={project.mainImageUrl} 
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-16 w-16 text-muted-foreground/30" />
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{project.location}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {project.category === "strip_mall" && "Strip Mall"}
                      {project.category === "open_mall" && "Open Mall"}
                      {project.category === "shopping_center" && "Shopping"}
                      {project.category === "neighborhood_center" && "Convenience"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 mb-4">
                    {project.area && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Área:</span> {project.area.toLocaleString("pt-BR")} m²
                      </div>
                    )}
                    {project.storeCount && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Lojas:</span> {project.storeCount}
                      </div>
                    )}
                    {project.developer && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {project.developer}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro projeto de inspiração
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Projeto
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
