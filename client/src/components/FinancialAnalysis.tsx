import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";

interface CashFlowYear {
  year: number;
  grossRevenue: number;
  operationalCosts: number;
  propertyTax: number;
  maintenance: number;
  netRevenue: number;
  cumulativeCashFlow: number;
}

interface FinancialAnalysisProps {
  totalInvestment: number;
  landCost: number;
  constructionCost: number;
  annualGrossRevenue: number;
  annualNetRevenue: number;
  npv: number;
  irr: number;
  paybackYears: number;
  annualYield: number;
  capRate: number;
  cashFlow: CashFlowYear[];
  scenarios: {
    optimistic: { npv: number; irr: number; paybackYears: number };
    base: { npv: number; irr: number; paybackYears: number };
    pessimistic: { npv: number; irr: number; paybackYears: number };
  };
  inputs: {
    averageRentPerSqm: number;
    vacancyRate: number;
    annualRentIncrease: number;
    discountRate: number;
    projectionYears: number;
  };
}

export default function FinancialAnalysis(props: FinancialAnalysisProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (value: number) => {
    return (value * 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  };

  const formatYears = (value: number) => {
    const years = Math.floor(value);
    const months = Math.round((value - years) * 12);
    
    if (months === 0) {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    }
    
    return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
  };

  const getViabilityColor = (npv: number) => {
    if (npv > 0) return "text-green-600";
    if (npv < 0) return "text-red-600";
    return "text-yellow-600";
  };

  const getViabilityText = (npv: number) => {
    if (npv > 0) return "Viável";
    if (npv < 0) return "Inviável";
    return "Neutro";
  };

  return (
    <div className="space-y-6">
      {/* Cards de Indicadores Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VPL</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getViabilityColor(props.npv)}`}>
              {formatCurrency(props.npv)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getViabilityText(props.npv)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TIR</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPercent(props.irr)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa Interna de Retorno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payback</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatYears(props.paybackYears)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Período de Retorno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rentabilidade</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPercent(props.annualYield / 100)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rentabilidade Anual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="investment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="investment">Investimento</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
        </TabsList>

        {/* Aba: Investimento */}
        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>Investimento Inicial</CardTitle>
              <CardDescription>Composição do investimento necessário</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Custo do Terreno</TableCell>
                    <TableCell className="text-right">{formatCurrency(props.landCost)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Custo de Construção</TableCell>
                    <TableCell className="text-right">{formatCurrency(props.constructionCost)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2">
                    <TableCell className="font-bold">Investimento Total</TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(props.totalInvestment)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Receitas */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Receitas Projetadas (Ano 1)</CardTitle>
              <CardDescription>Estimativa de receitas e parâmetros utilizados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Receita Bruta Anual</TableCell>
                    <TableCell className="text-right">{formatCurrency(props.annualGrossRevenue)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Receita Líquida Anual</TableCell>
                    <TableCell className="text-right text-primary font-semibold">
                      {formatCurrency(props.annualNetRevenue)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Aluguel Médio</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(props.inputs.averageRentPerSqm)}/m²/mês
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Taxa de Vacância</TableCell>
                    <TableCell className="text-right">{formatPercent(props.inputs.vacancyRate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Reajuste Anual</TableCell>
                    <TableCell className="text-right">{formatPercent(props.inputs.annualRentIncrease)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cap Rate</TableCell>
                    <TableCell className="text-right text-primary font-semibold">
                      {formatPercent(props.capRate / 100)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Fluxo de Caixa */}
        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Projetado</CardTitle>
              <CardDescription>Projeção de {props.inputs.projectionYears} anos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ano</TableHead>
                      <TableHead className="text-right">Receita Bruta</TableHead>
                      <TableHead className="text-right">Custos Oper.</TableHead>
                      <TableHead className="text-right">IPTU</TableHead>
                      <TableHead className="text-right">Manutenção</TableHead>
                      <TableHead className="text-right">Receita Líq.</TableHead>
                      <TableHead className="text-right">Acumulado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {props.cashFlow.map((year) => (
                      <TableRow key={year.year}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(year.grossRevenue)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-red-600">
                          {formatCurrency(year.operationalCosts)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-red-600">
                          {formatCurrency(year.propertyTax)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-red-600">
                          {formatCurrency(year.maintenance)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-green-600">
                          {formatCurrency(year.netRevenue)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatCurrency(year.cumulativeCashFlow)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Cenários */}
        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sensibilidade</CardTitle>
              <CardDescription>
                Comparação de cenários com variação de ±20% nas receitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cenário</TableHead>
                    <TableHead className="text-right">VPL</TableHead>
                    <TableHead className="text-right">TIR</TableHead>
                    <TableHead className="text-right">Payback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium text-green-600">Otimista (+20%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(props.scenarios.optimistic.npv)}</TableCell>
                    <TableCell className="text-right">{formatPercent(props.scenarios.optimistic.irr)}</TableCell>
                    <TableCell className="text-right">{formatYears(props.scenarios.optimistic.paybackYears)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Base</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(props.scenarios.base.npv)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatPercent(props.scenarios.base.irr)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatYears(props.scenarios.base.paybackYears)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-red-600">Pessimista (-20%)</TableCell>
                    <TableCell className="text-right">{formatCurrency(props.scenarios.pessimistic.npv)}</TableCell>
                    <TableCell className="text-right">{formatPercent(props.scenarios.pessimistic.irr)}</TableCell>
                    <TableCell className="text-right">{formatYears(props.scenarios.pessimistic.paybackYears)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-semibold mb-1">Parâmetros da Análise:</p>
                <p>
                  • Aluguel: {formatCurrency(props.inputs.averageRentPerSqm)}/m²/mês
                  {" • "}Vacância: {formatPercent(props.inputs.vacancyRate)}
                  {" • "}Reajuste: {formatPercent(props.inputs.annualRentIncrease)}/ano
                  {" • "}Taxa de Desconto: {formatPercent(props.inputs.discountRate)}/ano
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
