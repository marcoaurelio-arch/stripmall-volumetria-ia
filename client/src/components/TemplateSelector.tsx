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
import { Loader2, Sparkles, Check } from "lucide-react";
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

  const { data: templates, isLoading } = trpc.template.list.useQuery();

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {templates?.map((template) => (
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
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Área típica:</span>
                      <span className="font-medium text-foreground">
                        {template.typicalArea?.toLocaleString()} m²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lojas típicas:</span>
                      <span className="font-medium text-foreground">
                        {template.typicalStoreCount} unidades
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de ocupação:</span>
                      <span className="font-medium text-foreground">
                        {template.defaultTaxaOcupacao}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
