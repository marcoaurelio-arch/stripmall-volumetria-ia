import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: {
    taxaOcupacao: number;
    coeficienteAproveitamento: number;
    numeroLojas: number;
    vagasEstacionamento: number;
    recuoFrontal: number;
    recuoLateral: number;
    recuoFundos: number;
  }) => void;
}

export default function ScenarioSelector({ onSelectScenario }: ScenarioSelectorProps) {
  const [areaTerreno, setAreaTerreno] = useState<number>(5000);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const { data: suggestions, isLoading, refetch } = trpc.project.getScenarioSuggestions.useQuery(
    { areaTerreno },
    { enabled: areaTerreno >= 1000 && areaTerreno <= 15000 }
  );

  useEffect(() => {
    if (areaTerreno >= 1000 && areaTerreno <= 15000) {
      refetch();
    }
  }, [areaTerreno, refetch]);

  const handleSelectScenario = (scenarioType: 'conservador' | 'balanceado' | 'otimista') => {
    if (!suggestions) return;
    
    const scenario = suggestions[scenarioType];
    setSelectedScenario(scenarioType);
    
    onSelectScenario({
      taxaOcupacao: scenario.taxaOcupacao,
      coeficienteAproveitamento: scenario.coeficienteAproveitamento,
      numeroLojas: scenario.numeroLojas,
      vagasEstacionamento: scenario.vagasEstacionamento,
      recuoFrontal: scenario.recuoFrontal,
      recuoLateral: scenario.recuoLateral,
      recuoFundos: scenario.recuoFundos,
    });
  };

  return (
    <div className="space-y-6">
      {/* Input de área do terreno */}
      <div className="space-y-2">
        <Label htmlFor="areaTerreno">Área do Terreno (m²)</Label>
        <Input
          id="areaTerreno"
          type="number"
          min={1000}
          max={15000}
          value={areaTerreno}
          onChange={(e) => setAreaTerreno(Number(e.target.value))}
          placeholder="Ex: 5000"
        />
        {areaTerreno < 1000 && (
          <p className="text-sm text-destructive">Área mínima: 1.000 m²</p>
        )}
        {areaTerreno > 15000 && (
          <p className="text-sm text-destructive">Área máxima: 15.000 m²</p>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Sugestões de cenários */}
      {suggestions && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{suggestions.templateName}</h3>
              <p className="text-sm text-muted-foreground">Faixa: {suggestions.faixaArea}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cenário Conservador */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedScenario === 'conservador' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleSelectScenario('conservador')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-blue-500" />
                    Conservador
                  </CardTitle>
                  {selectedScenario === 'conservador' && (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <CardDescription>{suggestions.conservador.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxa Ocupação</p>
                    <p className="font-semibold">{suggestions.conservador.taxaOcupacao}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coeficiente</p>
                    <p className="font-semibold">{suggestions.conservador.coeficienteAproveitamento.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lojas</p>
                    <p className="font-semibold">{suggestions.conservador.numeroLojas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vagas</p>
                    <p className="font-semibold">{suggestions.conservador.vagasEstacionamento}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Área Construída</p>
                  <p className="text-sm font-semibold">{suggestions.conservador.areaConstruida.toLocaleString()} m²</p>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="outline" className="w-full justify-center">
                  Conforto Máximo
                </Badge>
              </CardFooter>
            </Card>

            {/* Cenário Balanceado */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedScenario === 'balanceado' ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => handleSelectScenario('balanceado')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Minus className="h-5 w-5 text-green-500" />
                    Balanceado
                  </CardTitle>
                  {selectedScenario === 'balanceado' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <CardDescription>{suggestions.balanceado.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxa Ocupação</p>
                    <p className="font-semibold">{suggestions.balanceado.taxaOcupacao}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coeficiente</p>
                    <p className="font-semibold">{suggestions.balanceado.coeficienteAproveitamento.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lojas</p>
                    <p className="font-semibold">{suggestions.balanceado.numeroLojas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vagas</p>
                    <p className="font-semibold">{suggestions.balanceado.vagasEstacionamento}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Área Construída</p>
                  <p className="text-sm font-semibold">{suggestions.balanceado.areaConstruida.toLocaleString()} m²</p>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="default" className="w-full justify-center bg-green-500">
                  Recomendado
                </Badge>
              </CardFooter>
            </Card>

            {/* Cenário Otimista */}
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedScenario === 'otimista' ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => handleSelectScenario('otimista')}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Otimista
                  </CardTitle>
                  {selectedScenario === 'otimista' && (
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  )}
                </div>
                <CardDescription>{suggestions.otimista.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Taxa Ocupação</p>
                    <p className="font-semibold">{suggestions.otimista.taxaOcupacao}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coeficiente</p>
                    <p className="font-semibold">{suggestions.otimista.coeficienteAproveitamento.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lojas</p>
                    <p className="font-semibold">{suggestions.otimista.numeroLojas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vagas</p>
                    <p className="font-semibold">{suggestions.otimista.vagasEstacionamento}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Área Construída</p>
                  <p className="text-sm font-semibold">{suggestions.otimista.areaConstruida.toLocaleString()} m²</p>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant="outline" className="w-full justify-center border-orange-500 text-orange-500">
                  Rentabilidade Máxima
                </Badge>
              </CardFooter>
            </Card>
          </div>

          {selectedScenario && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✓ Cenário <span className="font-semibold capitalize">{selectedScenario}</span> selecionado. 
                Os parâmetros foram aplicados automaticamente no formulário abaixo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
