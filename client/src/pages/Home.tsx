import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Building2, Calculator, FileText, Layers, MapPin, Ruler } from "lucide-react";
import { Link } from "wouter";
import ConceptualCarousel from "@/components/ConceptualCarousel";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <span className="text-xl font-bold">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
            ) : isAuthenticated ? (
              <>
                <Link href="/galeria-inspiracao">
                  <Button variant="ghost">Galeria de Inspiração</Button>
                </Link>
                <Link href="/projetos">
                  <Button variant="ghost">Meus Projetos</Button>
                </Link>
                <Link href="/novo-projeto">
                  <Button>Novo Projeto</Button>
                </Link>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Estudos de Massa e Volumetria com Inteligência Artificial
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Otimize seus projetos de strip malls com análises volumétricas precisas, cálculos automáticos de área construída, distribuição de lojas e vagas de estacionamento.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/novo-projeto">
                <Button size="lg" className="text-lg">
                  Criar Novo Projeto
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="text-lg" asChild>
                <a href={getLoginUrl()}>Começar Agora</a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Carrossel de Estudos Conceituais */}
      <section className="container py-16">
        <h2 className="text-center text-3xl font-bold mb-8">Projetos Recentes</h2>
        <ConceptualCarousel />
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold mb-12">Funcionalidades Principais</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Análise de Terreno</CardTitle>
                <CardDescription>
                  Insira as dimensões e características do terreno para análise completa
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <Calculator className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Cálculos Automáticos</CardTitle>
                <CardDescription>
                  Taxa de ocupação, coeficiente de aproveitamento e área construída máxima
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Distribuição de Lojas</CardTitle>
                <CardDescription>
                  Sugestões inteligentes de quantidade e distribuição de unidades comerciais
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <Ruler className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Vagas de Estacionamento</CardTitle>
                <CardDescription>
                  Cálculo automático conforme normas e otimização de espaço
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <Layers className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Visualização 3D</CardTitle>
                <CardDescription>
                  Visualize a volumetria do projeto em três dimensões
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>
                  Gere relatórios completos com análises e recomendações
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold mb-12">Como Funciona</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Insira os Dados do Terreno</h3>
                <p className="text-muted-foreground">
                  Forneça informações básicas como área, dimensões e parâmetros urbanísticos do terreno.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Análise com IA</h3>
                <p className="text-muted-foreground">
                  Nossa inteligência artificial processa os dados e gera estudos de massa e volumetria otimizados.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Visualize e Exporte</h3>
                <p className="text-muted-foreground">
                  Visualize os resultados em 3D, analise as recomendações e exporte relatórios detalhados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Crie seu primeiro projeto e descubra como a IA pode otimizar seus estudos de viabilidade.
          </p>
          {isAuthenticated ? (
            <Link href="/novo-projeto">
              <Button size="lg" className="text-lg">
                Criar Primeiro Projeto
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="text-lg" asChild>
              <a href={getLoginUrl()}>Começar Gratuitamente</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 {APP_TITLE}. Powered by Manus AI.</p>
        </div>
      </footer>
    </div>
  );
}
