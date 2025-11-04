import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin } from "lucide-react";
import LocationPickerWithDrawing from "@/components/LocationPickerWithDrawing";
import ScenarioManager from "@/components/ScenarioManager";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

export default function NewProject() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    area: "",
    width: "",
    length: "",
    taxaOcupacao: "",
    coeficienteAproveitamento: "",
    recuoFrontal: "",
    recuoLateral: "",
    recuoFundos: "",
    latitude: "",
    longitude: "",
    polygonCoordinates: "",
    pricePerSqm: "",
  });

  const [tempPolygon, setTempPolygon] = useState("");
  const [tempArea, setTempArea] = useState(0);

  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      setLocation("/projetos");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar projeto");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.area) {
      toast.error("Nome e área são obrigatórios");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      address: formData.address || undefined,
      area: parseInt(formData.area),
      width: formData.width ? parseInt(formData.width) : undefined,
      length: formData.length ? parseInt(formData.length) : undefined,
      taxaOcupacao: formData.taxaOcupacao ? parseInt(formData.taxaOcupacao) : undefined,
      coeficienteAproveitamento: formData.coeficienteAproveitamento
        ? parseInt(formData.coeficienteAproveitamento)
        : undefined,
      recuoFrontal: formData.recuoFrontal ? parseInt(formData.recuoFrontal) : undefined,
      recuoLateral: formData.recuoLateral ? parseInt(formData.recuoLateral) : undefined,
      recuoFundos: formData.recuoFundos ? parseInt(formData.recuoFundos) : undefined,
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
      polygonCoordinates: formData.polygonCoordinates || undefined,
      pricePerSqm: formData.pricePerSqm ? Math.round(parseFloat(formData.pricePerSqm) * 100) : undefined, // Converter para centavos
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Você precisa fazer login para criar projetos</p>
        <Button asChild>
          <a href={getLoginUrl()}>Fazer Login</a>
        </Button>
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
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Novo Projeto</h1>
          <p className="text-muted-foreground">Preencha os dados do terreno para iniciar a análise</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados gerais do projeto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Strip Mall Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o projeto..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensões do Terreno */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensões do Terreno</CardTitle>
                <CardDescription>Medidas em metros e metros quadrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Total (m²) *</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Ex: 5000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerSqm">Preço por m² (R$)</Label>
                    <Input
                      id="pricePerSqm"
                      name="pricePerSqm"
                      type="number"
                      step="0.01"
                      value={formData.pricePerSqm}
                      onChange={handleChange}
                      placeholder="Ex: 1500.00"
                    />
                    <p className="text-xs text-muted-foreground">Valor de mercado do terreno por metro quadrado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Largura (m)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      value={formData.width}
                      onChange={handleChange}
                      placeholder="Ex: 50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Comprimento (m)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      value={formData.length}
                      onChange={handleChange}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização do Terreno */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Localização do Terreno</CardTitle>
                </div>
                <CardDescription>
                  Selecione a localização do terreno no mapa ou busque por endereço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LocationPickerWithDrawing
                  onLocationSelect={(lat, lng) => {
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                  }}
                  onAreaCalculated={(area, coordinates) => {
                    const polygonStr = JSON.stringify(coordinates);
                    setTempPolygon(polygonStr);
                    setTempArea(area);
                    setFormData({ 
                      ...formData, 
                      area: area.toString(),
                      polygonCoordinates: polygonStr
                    });
                  }}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  initialPolygon={formData.polygonCoordinates}
                />
              </CardContent>
            </Card>

            {/* Gerenciador de Cenários */}
            <ScenarioManager
              projectId={0}
              currentPolygon={tempPolygon}
              currentArea={tempArea}
              onScenarioLoad={(polygon, area) => {
                setTempPolygon(polygon);
                setTempArea(area);
                setFormData({
                  ...formData,
                  area: area.toString(),
                  polygonCoordinates: polygon
                });
              }}
            />

            {/* Parâmetros Urbanísticos */}
            <Card>
              <CardHeader>
                <CardTitle>Parâmetros Urbanísticos</CardTitle>
                <CardDescription>
                  Deixe em branco para usar valores padrão (Taxa de Ocupação: 70%, Coeficiente: 2.0)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxaOcupacao">Taxa de Ocupação (%)</Label>
                    <Input
                      id="taxaOcupacao"
                      name="taxaOcupacao"
                      type="number"
                      value={formData.taxaOcupacao}
                      onChange={handleChange}
                      placeholder="Ex: 70"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coeficienteAproveitamento">Coeficiente de Aproveitamento</Label>
                    <Input
                      id="coeficienteAproveitamento"
                      name="coeficienteAproveitamento"
                      type="number"
                      value={formData.coeficienteAproveitamento}
                      onChange={handleChange}
                      placeholder="Ex: 200 (para 2.0)"
                    />
                    <p className="text-xs text-muted-foreground">Insira o valor multiplicado por 100 (ex: 200 = 2.0)</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="recuoFrontal">Recuo Frontal (m)</Label>
                    <Input
                      id="recuoFrontal"
                      name="recuoFrontal"
                      type="number"
                      value={formData.recuoFrontal}
                      onChange={handleChange}
                      placeholder="Ex: 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recuoLateral">Recuo Lateral (m)</Label>
                    <Input
                      id="recuoLateral"
                      name="recuoLateral"
                      type="number"
                      value={formData.recuoLateral}
                      onChange={handleChange}
                      placeholder="Ex: 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recuoFundos">Recuo de Fundos (m)</Label>
                    <Input
                      id="recuoFundos"
                      name="recuoFundos"
                      type="number"
                      value={formData.recuoFundos}
                      onChange={handleChange}
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Link href="/projetos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Projeto"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
