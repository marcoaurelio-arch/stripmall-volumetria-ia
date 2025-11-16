import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, Info, Search } from "lucide-react";
import { toast } from "sonner";

interface UrbanLegislationCheckerProps {
  projectId: number;
  address?: string;
  city?: string;
  state?: string;
  taxaOcupacao?: number;
  coeficienteAproveitamento?: number;
  recuoFrontal?: number;
  recuoLateral?: number;
  recuoFundos?: number;
}

export default function UrbanLegislationChecker({
  projectId,
  address,
  city,
  state,
  taxaOcupacao,
  coeficienteAproveitamento,
  recuoFrontal,
  recuoLateral,
  recuoFundos,
}: UrbanLegislationCheckerProps) {
  const [cep, setCep] = useState("");
  const [searchingCEP, setSearchingCEP] = useState(false);
  const [legislationData, setLegislationData] = useState<any>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const handleSearchByCEP = async () => {
    if (!cep || cep.length < 8) {
      toast.error("Digite um CEP válido");
      return;
    }

    setSearchingCEP(true);
    try {
      // Buscar endereço
      const addressResult = await fetch(`/api/trpc/urbanLegislation.getAddressByCEP?input=${encodeURIComponent(JSON.stringify({ cep }))}`).then(r => r.json()).then(d => d.result.data);
      
      if (!addressResult.success) {
        toast.error("CEP não encontrado");
        setSearchingCEP(false);
        return;
      }

      // Buscar parâmetros urbanísticos
      const paramsResult = await fetch(`/api/trpc/urbanLegislation.getParametersByCEP?input=${encodeURIComponent(JSON.stringify({ cep }))}`).then(r => r.json()).then(d => d.result.data);
      
      if (paramsResult.success) {
        setLegislationData(paramsResult);
        toast.success(`Parâmetros encontrados para ${paramsResult.city}/${paramsResult.state}`);
        
        // Se temos parâmetros do projeto, fazer comparação
        if (city && state && taxaOcupacao !== undefined && coeficienteAproveitamento !== undefined) {
          await compareWithLegislation(paramsResult.city, paramsResult.state);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar informações do CEP");
    } finally {
      setSearchingCEP(false);
    }
  };

  const compareWithLegislation = async (legislationCity?: string, legislationState?: string) => {
    const targetCity = legislationCity || city;
    const targetState = legislationState || state;

    if (!targetCity || !targetState) {
      toast.error("Cidade e estado são necessários para comparação");
      return;
    }

    if (taxaOcupacao === undefined || coeficienteAproveitamento === undefined) {
      toast.error("Parâmetros do projeto não informados");
      return;
    }

    try {
      const result = await fetch(`/api/trpc/urbanLegislation.compareWithLegislation?input=${encodeURIComponent(JSON.stringify({
        city: targetCity,
        state: targetState,
        projectParams: {
          taxaOcupacao,
          coeficienteAproveitamento,
          recuoFrontal,
          recuoLateral,
          recuoFundos,
        },
      }))}`).then(r => r.json()).then(d => d.result.data);

      setComparisonResult(result);
      
      if (result.compliant) {
        toast.success("Projeto está em conformidade com a legislação!");
      } else {
        toast.warning(`${result.issues.length} não conformidade(s) encontrada(s)`);
      }
    } catch (error) {
      console.error("Erro ao comparar com legislação:", error);
      toast.error("Erro ao comparar parâmetros");
    }
  };

  return (
    <div className="space-y-6">
      {/* Busca por CEP */}
      <Card>
        <CardHeader>
          <CardTitle>Verificar Legislação Urbanística</CardTitle>
          <CardDescription>
            Busque automaticamente os parâmetros urbanísticos do município por CEP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cep">CEP do Terreno</Label>
              <Input
                id="cep"
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                maxLength={9}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearchByCEP}
                disabled={searchingCEP}
              >
                {searchingCEP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>

          {city && state && (
            <Button
              variant="outline"
              onClick={() => compareWithLegislation()}
              className="w-full"
            >
              Verificar Conformidade
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Legislação */}
      {legislationData && (
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros Urbanísticos - {legislationData.city}/{legislationData.state}</CardTitle>
            <CardDescription>
              <Badge variant={legislationData.source === "official" ? "default" : legislationData.source === "database" ? "secondary" : "outline"}>
                {legislationData.source === "official" ? "Dados Oficiais" : legislationData.source === "database" ? "Base de Dados" : "Sugestão IA"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {legislationData.parameters && legislationData.parameters.length > 0 && (
              <div className="space-y-4">
                {legislationData.parameters.map((param: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    {param.zone && (
                      <div>
                        <h4 className="font-semibold">{param.zone}</h4>
                        {param.zoneDescription && (
                          <p className="text-sm text-muted-foreground">{param.zoneDescription}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Ocupação Máx.</p>
                        <p className="text-lg font-semibold">{param.taxaOcupacaoMax}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Coef. Aproveitamento Máx.</p>
                        <p className="text-lg font-semibold">{(param.coeficienteAproveitamentoMax / 100).toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gabarito Máximo</p>
                        <p className="text-lg font-semibold">{param.gabaritoMax}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recuo Frontal Mín.</p>
                        <p className="text-lg font-semibold">{param.recuoFrontalMin}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recuo Lateral Mín.</p>
                        <p className="text-lg font-semibold">{param.recuoLateralMin}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Recuo Fundos Mín.</p>
                        <p className="text-lg font-semibold">{param.recuoFundosMin}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Área Permeável Mín.</p>
                        <p className="text-lg font-semibold">{param.areaPermeavelMin}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vagas por m²</p>
                        <p className="text-lg font-semibold">1/{Math.round(1000 / param.vagasPorM2)}m²</p>
                      </div>
                    </div>

                    {param.leiReferencia && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Referência Legal</p>
                        <p className="text-sm">{param.leiReferencia}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultado da Comparação */}
      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {comparisonResult.compliant ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Projeto em Conformidade
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Não Conformidades Encontradas
                </>
              )}
            </CardTitle>
            <CardDescription>
              Comparação entre parâmetros do projeto e legislação municipal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comparisonResult.compliant ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Tudo certo!</AlertTitle>
                <AlertDescription>
                  Todos os parâmetros do projeto estão dentro dos limites estabelecidos pela legislação urbanística.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {comparisonResult.issues.map((issue: any, index: number) => (
                  <Alert key={index} variant={issue.severity === "error" ? "destructive" : "default"}>
                    {issue.severity === "error" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertTitle className="capitalize">{issue.parameter.replace(/([A-Z])/g, " $1").trim()}</AlertTitle>
                    <AlertDescription>{issue.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Comparação Visual */}
            <div className="border rounded-lg p-4 mt-4">
              <h4 className="font-semibold mb-4">Comparação de Parâmetros</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de Ocupação</span>
                  <div className="flex gap-4">
                    <span className="text-sm font-semibold">{taxaOcupacao}%</span>
                    <span className="text-sm text-muted-foreground">/ {comparisonResult.legislation.taxaOcupacaoMax}% máx</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Coef. Aproveitamento</span>
                  <div className="flex gap-4">
                    <span className="text-sm font-semibold">{coeficienteAproveitamento}</span>
                    <span className="text-sm text-muted-foreground">/ {(comparisonResult.legislation.coeficienteAproveitamentoMax / 100).toFixed(1)} máx</span>
                  </div>
                </div>
                {recuoFrontal !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recuo Frontal</span>
                    <div className="flex gap-4">
                      <span className="text-sm font-semibold">{recuoFrontal}m</span>
                      <span className="text-sm text-muted-foreground">/ {comparisonResult.legislation.recuoFrontalMin}m mín</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
