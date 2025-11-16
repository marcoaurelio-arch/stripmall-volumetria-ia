/**
 * Dashboard de Análise Financeira Avançada
 * 
 * Exibe projeções de fluxo de caixa, TIR, VPL e análise de sensibilidade
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface AdvancedFinancialDashboardProps {
  projectId: number;
  custoTotal: number;
  receitaMensal: number;
}

type TipoFinanciamento = 'proprio' | 'bancario' | 'misto';

export default function AdvancedFinancialDashboard({
  projectId,
  custoTotal,
  receitaMensal,
}: AdvancedFinancialDashboardProps) {
  // Parâmetros de entrada
  const [taxaVacancia, setTaxaVacancia] = useState([10]); // 10%
  const [custoOperacional, setCustoOperacional] = useState([20]); // 20% da receita
  const [tipoFinanciamento, setTipoFinanciamento] = useState<TipoFinanciamento>('proprio');
  const [percentualFinanciado, setPercentualFinanciado] = useState([0]);
  const [taxaJuros, setTaxaJuros] = useState([12]); // 12% ao ano
  const [prazoFinanciamento, setPrazoFinanciamento] = useState([180]); // 15 anos = 180 meses
  const [taxaDesconto, setTaxaDesconto] = useState([10]); // 10% ao ano

  // Calcular custos operacionais em reais
  const custoOperacionalMensal = Math.round(receitaMensal * custoOperacional[0] / 100);

  // Query para calcular análise avançada
  const { data: analise, isLoading, refetch } = trpc.project.calculateAdvancedFinancial.useQuery(
    {
      projectId,
      investimentoInicial: custoTotal,
      receitaMensalAluguel: receitaMensal,
      taxaVacancia: taxaVacancia[0],
      custoOperacionalMensal,
      tipoFinanciamento,
      percentualFinanciado: percentualFinanciado[0],
      taxaJurosAnual: taxaJuros[0] * 100, // Converter para % * 100
      prazoFinanciamentoMeses: prazoFinanciamento[0],
      taxaDesconto: taxaDesconto[0] * 100, // Converter para % * 100
    },
    {
      enabled: true,
    }
  );

  /**
   * Formata valor monetário
   */
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  /**
   * Formata percentual
   */
  const formatarPercentual = (valor: number) => {
    return `${(valor / 100).toFixed(2)}%`;
  };

  /**
   * Recalcular análise
   */
  const handleRecalcular = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Controles de Parâmetros */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros da Análise</CardTitle>
          <CardDescription>
            Ajuste os parâmetros para simular diferentes cenários financeiros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Taxa de Vacância */}
            <div className="space-y-2">
              <Label>Taxa de Vacância: {taxaVacancia[0]}%</Label>
              <Slider
                value={taxaVacancia}
                onValueChange={setTaxaVacancia}
                min={0}
                max={30}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Percentual de lojas desocupadas
              </p>
            </div>

            {/* Custo Operacional */}
            <div className="space-y-2">
              <Label>Custo Operacional: {custoOperacional[0]}% da receita</Label>
              <Slider
                value={custoOperacional}
                onValueChange={setCustoOperacional}
                min={10}
                max={40}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                {formatarMoeda(custoOperacionalMensal)}/mês
              </p>
            </div>

            {/* Tipo de Financiamento */}
            <div className="space-y-2">
              <Label>Tipo de Financiamento</Label>
              <Select value={tipoFinanciamento} onValueChange={(v) => setTipoFinanciamento(v as TipoFinanciamento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proprio">Capital Próprio</SelectItem>
                  <SelectItem value="bancario">Financiamento Bancário</SelectItem>
                  <SelectItem value="misto">Misto (Próprio + Bancário)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Percentual Financiado */}
            {tipoFinanciamento !== 'proprio' && (
              <>
                <div className="space-y-2">
                  <Label>Percentual Financiado: {percentualFinanciado[0]}%</Label>
                  <Slider
                    value={percentualFinanciado}
                    onValueChange={setPercentualFinanciado}
                    min={0}
                    max={80}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatarMoeda(custoTotal * percentualFinanciado[0] / 100)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Taxa de Juros: {taxaJuros[0]}% ao ano</Label>
                  <Slider
                    value={taxaJuros}
                    onValueChange={setTaxaJuros}
                    min={6}
                    max={18}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Prazo: {Math.round(prazoFinanciamento[0] / 12)} anos</Label>
                  <Slider
                    value={prazoFinanciamento}
                    onValueChange={setPrazoFinanciamento}
                    min={60}
                    max={300}
                    step={12}
                  />
                </div>
              </>
            )}

            {/* Taxa de Desconto */}
            <div className="space-y-2">
              <Label>Taxa de Desconto (TMA): {taxaDesconto[0]}% ao ano</Label>
              <Slider
                value={taxaDesconto}
                onValueChange={setTaxaDesconto}
                min={6}
                max={20}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">
                Taxa Mínima de Atratividade
              </p>
            </div>
          </div>

          <Button onClick={handleRecalcular} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalcular Análise
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Calculando análise financeira...</p>
          </CardContent>
        </Card>
      ) : analise ? (
        <>
          {/* Indicadores Principais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  TIR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatarPercentual(analise.tir)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Taxa Interna de Retorno
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  VPL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatarMoeda(analise.vpl)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor Presente Líquido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Payback Simples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(analise.paybackSimples / 12)} anos
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analise.paybackSimples} meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Payback Descontado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {Math.round(analise.paybackDescontado / 12)} anos
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analise.paybackDescontado} meses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Avaliação do Investimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Avaliação do Investimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${analise.vpl > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">
                      {analise.vpl > 0 ? 'VPL Positivo' : 'VPL Negativo'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analise.vpl > 0 
                        ? 'O projeto gera valor e é financeiramente viável'
                        : 'O projeto destrói valor e não é recomendado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${analise.tir / 100 > taxaDesconto[0] ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-medium">
                      TIR {analise.tir / 100 > taxaDesconto[0] ? 'Acima' : 'Abaixo'} da TMA
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analise.tir / 100 > taxaDesconto[0]
                        ? 'A rentabilidade supera a taxa mínima exigida'
                        : 'A rentabilidade não atinge a taxa mínima exigida'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${analise.paybackDescontado < 120 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium">
                      Payback de {Math.round(analise.paybackDescontado / 12)} anos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analise.paybackDescontado < 120
                        ? 'Recuperação rápida do investimento (menos de 10 anos)'
                        : 'Recuperação lenta do investimento (mais de 10 anos)'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs com Gráficos */}
          <Tabs defaultValue="fluxo" className="space-y-4">
            <TabsList>
              <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="acumulado">Saldo Acumulado</TabsTrigger>
              <TabsTrigger value="sensibilidade">Análise de Sensibilidade</TabsTrigger>
            </TabsList>

            {/* Fluxo de Caixa Anual */}
            <TabsContent value="fluxo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa Anual (10 anos)</CardTitle>
                  <CardDescription>
                    Receitas, despesas e saldo anual projetados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analise.fluxoCaixaAnual}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ano" label={{ value: 'Ano', position: 'insideBottom', offset: -5 }} />
                      <YAxis 
                        tickFormatter={(value) => formatarMoeda(value)}
                        label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatarMoeda(value)}
                        labelFormatter={(label) => `Ano ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="receitaLiquida" fill="#10b981" name="Receita Líquida" />
                      <Bar dataKey="despesaOperacional" fill="#ef4444" name="Despesa Operacional" />
                      <Bar dataKey="despesaFinanciamento" fill="#f59e0b" name="Financiamento" />
                      <Bar dataKey="saldo" fill="#3b82f6" name="Saldo" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saldo Acumulado */}
            <TabsContent value="acumulado" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saldo Acumulado (10 anos)</CardTitle>
                  <CardDescription>
                    Evolução do saldo acumulado e descontado ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={analise.fluxoCaixaAnual}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ano" label={{ value: 'Ano', position: 'insideBottom', offset: -5 }} />
                      <YAxis 
                        tickFormatter={(value) => formatarMoeda(value)}
                        label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatarMoeda(value)}
                        labelFormatter={(label) => `Ano ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="saldoAcumulado" 
                        fill="#3b82f6" 
                        stroke="#2563eb"
                        name="Saldo Acumulado"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="saldoDescontadoAcumulado" 
                        fill="#10b981" 
                        stroke="#059669"
                        name="Saldo Descontado"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Análise de Sensibilidade */}
            <TabsContent value="sensibilidade" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Sensibilidade - VPL</CardTitle>
                  <CardDescription>
                    Impacto da variação de parâmetros no Valor Presente Líquido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="variacao"
                        label={{ value: 'Variação (%)', position: 'insideBottom', offset: -5 }}
                        domain={[-30, 30]}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatarMoeda(value)}
                        label={{ value: 'VPL (R$)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatarMoeda(value)}
                        labelFormatter={(label) => `${label}%`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.aluguel}
                        dataKey="vpl" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Aluguel"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.vacancia}
                        dataKey="vpl" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Vacância"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.custos}
                        dataKey="vpl" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Custos"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análise de Sensibilidade - TIR</CardTitle>
                  <CardDescription>
                    Impacto da variação de parâmetros na Taxa Interna de Retorno
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="variacao"
                        label={{ value: 'Variação (%)', position: 'insideBottom', offset: -5 }}
                        domain={[-30, 30]}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatarPercentual(value)}
                        label={{ value: 'TIR (%)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatarPercentual(value)}
                        labelFormatter={(label) => `${label}%`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.aluguel}
                        dataKey="tir" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Aluguel"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.vacancia}
                        dataKey="tir" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Vacância"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        data={analise.analiseSensibilidade.custos}
                        dataKey="tir" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Custos"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Erro ao carregar análise financeira</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
