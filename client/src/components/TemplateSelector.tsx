import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, Check, Building2, Users, MapPin } from "lucide-react";
import { toast } from "sonner";

interface TemplateSelectorProps {
  onSelectTemplate: (template: any) => void;
}

const categoryLabels: Record<string, string> = {
  gastronomia: "Gastronomia",
  saude: "Saúde",
  conveniencia: "Conveniência",
  varejo: "Varejo",
  servicos: "Serviços",
};

const categoryColors: Record<string, string> = {
  gastronomia: "bg-orange-500",
  saude: "bg-blue-500",
  conveniencia: "bg-green-500",
  varejo: "bg-purple-500",
  servicos: "bg-cyan-500",
};

export default function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: templates, isLoading } = trpc.template.list.useQuery();
  
  const filteredTemplates = templates?.filter(t => 
    categoryFilter === "all" || t.category === categoryFilter
  );

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    onSelectTemplate(template);
    setOpen(false);
    toast.success("Template aplicado com sucesso!", {
      description: `O formulário foi preenchido com os dados do template "${template.name}".`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Usar Template Pré-configurado
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha um Template</DialogTitle>
          <DialogDescription>
            Selecione um template pré-configurado para acelerar a criação do seu projeto.
            O formulário será preenchido automaticamente com configurações típicas.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="conveniencia">Conveniência</TabsTrigger>
                <TabsTrigger value="varejo">Varejo</TabsTrigger>
                <TabsTrigger value="gastronomia">Gastronomia</TabsTrigger>
                <TabsTrigger value="saude">Saúde</TabsTrigger>
                <TabsTrigger value="servicos">Serviços</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {filteredTemplates?.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {template.description}
                      </CardDescription>
                    </div>
                    {selectedTemplateId === template.id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <Badge className={`${categoryColors[template.category]} text-white mt-2 w-fit`}>
                    {categoryLabels[template.category]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Área:</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {template.minArea?.toLocaleString()}-{template.maxArea?.toLocaleString()} m²
                      </span>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Lojas:</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {template.numeroLojasMin}-{template.numeroLojasMax} unidades
                      </span>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Público:</span>
                      </div>
                      <span className="font-medium text-foreground text-xs">
                        {template.targetAudience?.substring(0, 30)}...
                      </span>
                    </div>
                    
                    {template.anchorStores && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">Âncoras sugeridas:</div>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(template.anchorStores).slice(0, 3).map((anchor: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {anchor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
