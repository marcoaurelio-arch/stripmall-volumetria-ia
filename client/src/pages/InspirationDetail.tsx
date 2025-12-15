import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Building2,
  Users,
  Calendar,
  User,
  Briefcase,
  ArrowLeft,
  Store,
  Car,
  Layers,
  Lightbulb,
} from "lucide-react";

/**
 * Página de detalhes de um projeto de inspiração
 */
export default function InspirationDetail() {
  const params = useParams();
  const projectId = Number(params.id);

  const { data: project, isLoading } = trpc.inspiration.getById.useQuery({ id: projectId });

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Projeto não encontrado</h3>
          <p className="text-slate-500 mb-4">O projeto de inspiração que você procura não existe.</p>
          <Link href="/inspirations">
            <Button>Voltar para Galeria</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const images = project.images ? JSON.parse(project.images) : [];
  const anchors = project.anchors ? JSON.parse(project.anchors) : [];
  const features = project.features ? JSON.parse(project.features) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container py-6">
          <Link href="/inspirations">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Galeria
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-slate-900">{project.name}</h1>
                <Badge variant="secondary" className="text-sm">
                  {segmentLabels[project.segment]}
                </Badge>
              </div>
              <p className="text-lg text-slate-600 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {project.location}
              </p>
              <Badge className="mt-2">{categoryLabels[project.category]}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de Imagens */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galeria de Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((imageUrl: string, idx: number) => (
                      <div key={idx} className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`${project.name} - Imagem ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Descrição */}
            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{project.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Conceito */}
            {project.concept && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Conceito Arquitetônico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{project.concept}</p>
                </CardContent>
              </Card>
            )}

            {/* Lojas Âncora */}
            {anchors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    Lojas Âncora
                  </CardTitle>
                  <CardDescription>Principais marcas e estabelecimentos do empreendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {anchors.map((anchor: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {anchor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Características */}
            {features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Características Principais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full mt-2" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Dados Técnicos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.area && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Área Total</div>
                      <div className="font-semibold">{project.area.toLocaleString("pt-BR")} m²</div>
                    </div>
                  </div>
                )}

                {project.storeCount && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Número de Lojas</div>
                      <div className="font-semibold">{project.storeCount}</div>
                    </div>
                  </div>
                )}

                {project.parkingSpaces && (
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Vagas de Estacionamento</div>
                      <div className="font-semibold">{project.parkingSpaces}</div>
                    </div>
                  </div>
                )}

                {project.floors && (
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Pavimentos</div>
                      <div className="font-semibold">{project.floors}</div>
                    </div>
                  </div>
                )}

                {project.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <div>
                      <div className="text-sm text-slate-500">Ano de Inauguração</div>
                      <div className="font-semibold">{project.year}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            {(project.architect || project.developer) && (
              <Card>
                <CardHeader>
                  <CardTitle>Equipe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.architect && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-500">Arquiteto</div>
                        <div className="font-semibold">{project.architect}</div>
                      </div>
                    </div>
                  )}

                  {project.developer && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="text-sm text-slate-500">Incorporadora</div>
                        <div className="font-semibold">{project.developer}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mapa */}
            {project.latitude && project.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`}
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
