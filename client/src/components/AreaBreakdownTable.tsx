import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

interface AreaBreakdownProps {
  areaTerreno: number;
  areaTotalConstruida: number;
  areaPrivativaTotal: number;
  areaPrivativaPorLoja: number;
  areaComumTotal: number;
  areaCirculacao: number;
  areaSanitarios: number;
  areaAdministrativa: number;
  areaEstacionamento: number;
  areaPorVaga: number;
  taxaOcupacao: number;
  coeficienteAproveitamento: number;
  numeroPavimentos: number;
  areaLivre: number;
  areaPermeavel: number;
  percentualPrivativo: number;
  percentualComum: number;
  percentualEstacionamento: number;
  numberOfStores: number;
  parkingSpaces: number;
}

export default function AreaBreakdownTable(props: AreaBreakdownProps) {
  const formatArea = (area: number) => {
    return area.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " m²";
  };

  const formatPercentage = (value: number) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  };

  const formatCoefficient = (value: number) => {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Quadro de Áreas - ABNT NBR 12.721</CardTitle>
            <CardDescription>
              Discriminação detalhada de áreas conforme norma técnica brasileira
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Áreas Principais */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">1. ÁREAS PRINCIPAIS</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Área do Terreno</TableCell>
                <TableCell className="text-right">{formatArea(props.areaTerreno)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Área Total Construída</TableCell>
                <TableCell className="text-right">{formatArea(props.areaTotalConstruida)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Número de Pavimentos</TableCell>
                <TableCell className="text-right">{props.numeroPavimentos}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Áreas Privativas */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">2. ÁREAS PRIVATIVAS (LOJAS)</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Área Privativa Total</TableCell>
                <TableCell className="text-right">{formatArea(props.areaPrivativaTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Número de Lojas</TableCell>
                <TableCell className="text-right">{props.numberOfStores}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Área Média por Loja</TableCell>
                <TableCell className="text-right">{formatArea(props.areaPrivativaPorLoja)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Percentual sobre Total</TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  {formatPercentage(props.percentualPrivativo)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Áreas Comuns */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">3. ÁREAS COMUNS</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Área Comum Total</TableCell>
                <TableCell className="text-right">{formatArea(props.areaComumTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Circulação e Corredores</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatArea(props.areaCirculacao)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Sanitários e Vestiários</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatArea(props.areaSanitarios)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8 text-muted-foreground">Administrativa e Depósitos</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatArea(props.areaAdministrativa)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Percentual sobre Total</TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  {formatPercentage(props.percentualComum)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Estacionamento */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">4. ESTACIONAMENTO</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Área de Estacionamento</TableCell>
                <TableCell className="text-right">{formatArea(props.areaEstacionamento)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Número de Vagas</TableCell>
                <TableCell className="text-right">{props.parkingSpaces}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Área Média por Vaga</TableCell>
                <TableCell className="text-right">{formatArea(props.areaPorVaga)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Percentual sobre Terreno</TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  {formatPercentage(props.percentualEstacionamento)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Índices Urbanísticos */}
        <div>
          <h3 className="text-sm font-semibold text-primary mb-3">5. ÍNDICES URBANÍSTICOS</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Taxa de Ocupação</TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  {formatPercentage(props.taxaOcupacao)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Coeficiente de Aproveitamento</TableCell>
                <TableCell className="text-right text-primary font-semibold">
                  {formatCoefficient(props.coeficienteAproveitamento)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Área Livre</TableCell>
                <TableCell className="text-right">{formatArea(props.areaLivre)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Área Permeável (estimada)</TableCell>
                <TableCell className="text-right">{formatArea(props.areaPermeavel)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Nota Técnica */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-semibold mb-1">Nota Técnica:</p>
          <p>
            Este quadro de áreas foi elaborado conforme ABNT NBR 12.721, que estabelece critérios para 
            avaliação de custos unitários e preparo de orçamento de construção. As áreas comuns foram 
            estimadas em 22% do total construído, valor típico para empreendimentos comerciais tipo strip mall.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
