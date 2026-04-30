/**
 * Painel de Análise de Mercado Imobiliário
 * 
 * Exibe dados de concorrência e demografia para análise de viabilidade comercial
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, TrendingUp, Users, DollarSign, Building2, Star, Navigation, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import SafeMapWrapper from './SafeMapWrapper';

interface MarketAnalysisPanelProps {
  projectId: number;
  latitude: number;
  longitude: number;
}

export default function MarketAnalysisPanel({ projectId, latitude, longitude }: MarketAnalysisPanelProps) {
  const [radius, setRadius] = useState(5000);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeMutation = trpc.market.analyzeProjectMarket.useMutation({
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('Análise de mercado concluída!');
    },
    onError: (error) => {
      toast.error('Erro ao analisar mercado: ' + error.message);
    }
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate({ projectId, radius });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Excelente';
    if (score >= 40) return 'Moderado';
    return 'Baixo';
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <div className="space-y-6">
      {/* Header com botão de análise */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Análise de Mercado</h2>
          <p className="text-gray-400 mt-1">
            Concorrência e dados demográficos da região
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Raio:</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2"
            >
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
            </select>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analisar Mercado
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resultados da análise */}
      {analysis && (
        <div className="space-y-6">
          {/* Scores principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Score Geral</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{getScoreLabel(analysis.overallScore)}</p>
                </div>
                <TrendingUp className={`h-12 w-12 ${getScoreColor(analysis.overallScore)}`} />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Concorrência</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysis.competitionScore)}`}>
                    {analysis.competitionScore}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analysis.competitors.length} concorrentes
                  </p>
                </div>
                <Building2 className={`h-12 w-12 ${getScoreColor(analysis.competitionScore)}`} />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Demografia</p>
                  <p className={`text-3xl font-bold ${getScoreColor(analysis.demographicScore)}`}>
                    {analysis.demographicScore}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{getScoreLabel(analysis.demographicScore)}</p>
                </div>
                <Users className={`h-12 w-12 ${getScoreColor(analysis.demographicScore)}`} />
              </div>
            </Card>
          </div>

          {/* Mapa de concorrência */}
          {googleMapsApiKey && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa de Concorrência
              </h3>
              <SafeMapWrapper height="400px" fallbackMessage="Mapa de concorrência indisponível">
              <div className="h-[400px] rounded-lg overflow-hidden">
                <APIProvider apiKey={googleMapsApiKey}>
                  <Map
                    defaultCenter={{ lat: latitude, lng: longitude }}
                    defaultZoom={13}
                    mapId="market-analysis-map"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Marcador do projeto */}
                    <AdvancedMarker
                      position={{ lat: latitude, lng: longitude }}
                      title="Seu Projeto"
                    >
                      <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                        <MapPin className="h-6 w-6" />
                      </div>
                    </AdvancedMarker>

                    {/* Marcadores dos concorrentes */}
                    {analysis.competitors.map((competitor: any, index: number) => (
                      <AdvancedMarker
                        key={index}
                        position={{ lat: competitor.location.lat, lng: competitor.location.lng }}
                        title={competitor.name}
                      >
                        <div className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                          <Building2 className="h-4 w-4" />
                        </div>
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
              </div>
              </SafeMapWrapper>
            </Card>
          )}

          {/* Dados demográficos */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dados Demográficos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                <MapPin className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Localização</p>
                  <p className="text-lg font-semibold text-white">
                    {analysis.demographics.municipio}, {analysis.demographics.estado}
                  </p>
                </div>
              </div>

              {analysis.demographics.populacao && (
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">População</p>
                    <p className="text-lg font-semibold text-white">
                      {(analysis.demographics.populacao / 1000).toFixed(0)}k habitantes
                    </p>
                  </div>
                </div>
              )}

              {analysis.demographics.rendaMediaMensal && (
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Renda Média Mensal</p>
                    <p className="text-lg font-semibold text-white">
                      R$ {analysis.demographics.rendaMediaMensal.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {analysis.demographics.idh && (
                <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-400">IDH</p>
                    <p className="text-lg font-semibold text-white">
                      {analysis.demographics.idh.toFixed(3)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Lista de concorrentes */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Concorrentes Identificados ({analysis.competitors.length})
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {analysis.competitors.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhum concorrente direto identificado no raio de {radius / 1000}km
                </p>
              ) : (
                analysis.competitors.map((competitor: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg hover:bg-gray-850 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{competitor.name}</p>
                      <p className="text-sm text-gray-400 mt-1">{competitor.address}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Navigation className="h-4 w-4" />
                          {formatDistance(competitor.distance)}
                        </span>
                        {competitor.rating && (
                          <span className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            {competitor.rating.toFixed(1)}
                            {competitor.userRatingsTotal && (
                              <span className="text-gray-500">
                                ({competitor.userRatingsTotal})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {competitor.businessStatus === 'OPERATIONAL' ? (
                        <span className="flex items-center gap-1 text-sm text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <AlertCircle className="h-4 w-4" />
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Insights */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Insights
            </h3>
            <div className="space-y-2">
              {analysis.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{insight}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recomendações */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recomendações
            </h3>
            <div className="space-y-2">
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Estado vazio */}
      {!analysis && !analyzeMutation.isPending && (
        <Card className="bg-gray-800 border-gray-700 p-12">
          <div className="text-center">
            <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Análise de Mercado
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Clique em "Analisar Mercado" para buscar concorrentes na região e obter dados demográficos para análise de viabilidade comercial.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
