import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, XCircle, Clock, MinusCircle, Download, AlertTriangle, Shield, Leaf, Accessibility, ParkingCircle } from "lucide-react";
import { toast } from "sonner";

interface ComplianceChecklistPanelProps {
  projectId: number;
  area: number;
  totalBuiltArea?: number;
  commercialArea?: number;
  parkingSpaces?: number;
  parkingArea?: number;
  permeableArea?: number;
  setbackFront?: number;
  setbackSide?: number;
  setbackRear?: number;
  occupancyRate?: number;
  buildingCoefficient?: number;
  numberOfStores?: number;
  state?: string;
}

export default function ComplianceChecklistPanel({
  projectId,
  area,
  totalBuiltArea = 0,
  commercialArea = 0,
  parkingSpaces = 0,
  parkingArea = 0,
  permeableArea = 0,
  setbackFront = 0,
  setbackSide = 0,
  setbackRear = 0,
  occupancyRate = 0,
  buildingCoefficient = 0,
  numberOfStores = 0,
  state = "SP",
}: ComplianceChecklistPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Buscar checklist de conformidade
  const { data: checklistData, isLoading } = trpc.compliance.generateChecklist.useQuery(
    {
      projectId,
      area,
      totalBuiltArea,
      commercialArea,
      parkingSpaces,
      parkingArea,
      permeableArea,
      setbackFront,
      setbackSide,
      setbackRear,
      occupancyRate,
      buildingCoefficient,
      numberOfStores,
      state,
    },
    {
      enabled: area > 0,
    }
  );

  // Exportar checklist em Markdown
  const exportMutation = trpc.compliance.exportChecklistMarkdown.useQuery(
    {
      projectId,
      area,
      totalBuiltArea,
      commercialArea,
      parkingSpaces,
      parkingArea,
      permeableArea,
      setbackFront,
      setbackSide,
      setbackRear,
      occupancyRate,
      buildingCoefficient,
      numberOfStores,
      state,
    },
    {
      enabled: false, // Não executar automaticamente
    }
  );

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportMutation.refetch();
      if (result.data?.success && result.data.markdown) {
        // Criar blob e fazer download
        const blob = new Blob([result.data.markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Checklist exportado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao exportar checklist");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "non_compliant":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "not_applicable":
        return <MinusCircle className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "outline" | "secondary"; label: string }> = {
      critical: { variant: "destructive", label: "Crítico" },
      high: { variant: "default", label: "Alto" },
      medium: { variant: "secondary", label: "Médio" },
      low: { variant: "outline", label: "Baixo" },
    };
    const config = variants[severity] || variants.low;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "building_code":
        return <Shield className="h-5 w-5" />;
      case "fire_safety":
        return <AlertTriangle className="h-5 w-5" />;
      case "environmental":
        return <Leaf className="h-5 w-5" />;
      case "accessibility":
        return <Accessibility className="h-5 w-5" />;
      case "parking":
        return <ParkingCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      building_code: "Código de Obras",
      fire_safety: "Segurança Contra Incêndio",
      environmental: "Normas Ambientais",
      accessibility: "Acessibilidade",
      parking: "Estacionamento",
    };
    return titles[category] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!checklistData?.success || !checklistData.report) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Erro ao gerar checklist de conformidade</p>
        </CardContent>
      </Card>
    );
  }

  const report = checklistData.report;

  // Agrupar checks por categoria
  const checksByCategory: Record<string, typeof report.checks> = {};
  report.checks.forEach((check) => {
    if (!checksByCategory[check.category]) {
      checksByCategory[check.category] = [];
    }
    checksByCategory[check.category].push(check);
  });

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Checklist de Conformidade
              </CardTitle>
              <CardDescription>
                Validações automáticas de código de obras, bombeiros e normas
              </CardDescription>
            </div>
            <Button onClick={handleExport} disabled={isExporting} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Checklist"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Status Geral</p>
              <p className={`text-xl font-bold ${
                report.overallStatus === "approved" ? "text-green-600" :
                report.overallStatus === "conditional" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {report.overallStatus === "approved" ? "✅ Aprovado" :
                 report.overallStatus === "conditional" ? "⚠️ Condicional" :
                 "❌ Reprovado"}
              </p>
            </div>
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Conformes</p>
              <p className="text-2xl font-bold text-green-600">{report.compliant}</p>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Não Conformes</p>
              <p className="text-2xl font-bold text-red-600">{report.nonCompliant}</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{report.pending}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Validações por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(checksByCategory).map(([category, checks]) => {
              const categoryCompliant = checks.filter(c => c.status === "compliant").length;
              const categoryNonCompliant = checks.filter(c => c.status === "non_compliant").length;
              const categoryPending = checks.filter(c => c.status === "pending").length;
              
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 w-full">
                      {getCategoryIcon(category)}
                      <span className="font-semibold">{getCategoryTitle(category)}</span>
                      <div className="flex gap-2 ml-auto mr-4">
                        {categoryCompliant > 0 && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                            {categoryCompliant} ✓
                          </Badge>
                        )}
                        {categoryNonCompliant > 0 && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                            {categoryNonCompliant} ✗
                          </Badge>
                        )}
                        {categoryPending > 0 && (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            {categoryPending} ⏳
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {checks.map((check) => (
                        <div
                          key={check.id}
                          className={`p-4 rounded-lg border ${
                            check.status === "compliant" ? "bg-green-500/5 border-green-500/20" :
                            check.status === "non_compliant" ? "bg-red-500/5 border-red-500/20" :
                            check.status === "pending" ? "bg-yellow-500/5 border-yellow-500/20" :
                            "bg-gray-500/5 border-gray-500/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{check.requirement}</h4>
                                {getSeverityBadge(check.severity)}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                              {check.reference && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Referência:</strong> {check.reference}
                                </p>
                              )}
                              {check.recommendation && (
                                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                                  <p className="text-sm font-medium text-blue-600 mb-1">💡 Recomendação</p>
                                  <p className="text-sm text-muted-foreground">{check.recommendation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
