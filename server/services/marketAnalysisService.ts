/**
 * Serviço de Análise de Mercado Imobiliário
 * 
 * Integra Google Places API para buscar concorrentes e IBGE API para dados demográficos
 */

import { ENV } from '../_core/env';

// Tipos de estabelecimentos concorrentes
const COMPETITOR_TYPES = [
  'shopping_mall',
  'supermarket',
  'convenience_store',
  'department_store',
  'clothing_store',
  'electronics_store',
  'furniture_store',
  'home_goods_store',
  'pharmacy',
  'restaurant'
];

export interface Competitor {
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number; // em metros
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  placeId: string;
  businessStatus?: string;
  priceLevel?: number;
}

export interface DemographicData {
  municipio: string;
  estado: string;
  populacao?: number;
  rendaMediaMensal?: number;
  pibPerCapita?: number;
  idh?: number;
  densidade?: number;
  area?: number;
}

export interface MarketAnalysis {
  competitors: Competitor[];
  demographics: DemographicData;
  competitionScore: number; // 0-100 (0 = muita concorrência, 100 = pouca concorrência)
  demographicScore: number; // 0-100 (baseado em população, renda, etc)
  overallScore: number; // 0-100 (média ponderada)
  insights: string[];
  recommendations: string[];
}

/**
 * Busca estabelecimentos concorrentes usando Google Places API
 */
export async function findCompetitors(
  latitude: number,
  longitude: number,
  radius: number = 5000 // 5km padrão
): Promise<Competitor[]> {
  const apiKey = ENV.googleMapsApiKey;
  
  if (!apiKey) {
    throw new Error('Google Maps API Key não configurada');
  }

  const competitors: Competitor[] = [];
  
  try {
    // Buscar shopping centers e centros comerciais
    const shoppingUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=shopping_mall&key=${apiKey}`;
    
    const shoppingResponse = await fetch(shoppingUrl);
    const shoppingData = await shoppingResponse.json();
    
    if (shoppingData.status === 'OK' && shoppingData.results) {
      for (const place of shoppingData.results) {
        const distance = calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        competitors.push({
          name: place.name,
          address: place.vicinity || place.formatted_address || 'Endereço não disponível',
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          distance,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types || [],
          placeId: place.place_id,
          businessStatus: place.business_status,
          priceLevel: place.price_level
        });
      }
    }
    
    // Buscar supermercados e lojas de varejo
    const retailUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=supermarket&key=${apiKey}`;
    
    const retailResponse = await fetch(retailUrl);
    const retailData = await retailResponse.json();
    
    if (retailData.status === 'OK' && retailData.results) {
      for (const place of retailData.results) {
        const distance = calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        
        competitors.push({
          name: place.name,
          address: place.vicinity || place.formatted_address || 'Endereço não disponível',
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          distance,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types || [],
          placeId: place.place_id,
          businessStatus: place.business_status,
          priceLevel: place.price_level
        });
      }
    }
    
    // Ordenar por distância
    competitors.sort((a, b) => a.distance - b.distance);
    
    // Limitar a 20 concorrentes mais próximos
    return competitors.slice(0, 20);
    
  } catch (error) {
    console.error('Erro ao buscar concorrentes:', error);
    throw new Error('Falha ao buscar dados de concorrência');
  }
}

/**
 * Busca dados demográficos usando IBGE API
 */
export async function getDemographicData(
  latitude: number,
  longitude: number
): Promise<DemographicData> {
  try {
    // Primeiro, buscar o município pela coordenada usando Google Geocoding
    const apiKey = ENV.googleMapsApiKey;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
      throw new Error('Não foi possível determinar o município');
    }
    
    // Extrair município e estado
    const addressComponents = geocodeData.results[0].address_components;
    let municipio = '';
    let estado = '';
    
    for (const component of addressComponents) {
      if (component.types.includes('administrative_area_level_2')) {
        municipio = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        estado = component.short_name;
      }
    }
    
    if (!municipio || !estado) {
      throw new Error('Município ou estado não identificado');
    }
    
    // Buscar código do município no IBGE
    const municipiosUrl = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`;
    const municipiosResponse = await fetch(municipiosUrl);
    const municipiosData = await municipiosResponse.json();
    
    const municipioData = municipiosData.find((m: any) => 
      m.nome.toLowerCase().includes(municipio.toLowerCase()) ||
      municipio.toLowerCase().includes(m.nome.toLowerCase())
    );
    
    if (!municipioData) {
      return {
        municipio,
        estado
      };
    }
    
    const codigoMunicipio = municipioData.id;
    
    // Buscar dados demográficos do IBGE
    // Nota: A API do IBGE tem limitações e nem todos os dados estão disponíveis em tempo real
    // Vamos usar dados estimados e agregados
    
    const demographicData: DemographicData = {
      municipio,
      estado
    };
    
    // Tentar buscar população estimada
    try {
      const popUrl = `https://servicodados.ibge.gov.br/api/v1/projecoes/populacao/${codigoMunicipio}`;
      const popResponse = await fetch(popUrl);
      const popData = await popResponse.json();
      
      if (popData && popData.projecao) {
        demographicData.populacao = Math.round(popData.projecao.populacao);
      }
    } catch (e) {
      console.warn('Dados de população não disponíveis');
    }
    
    // Dados estimados baseados em médias brasileiras por região
    // (Idealmente, estes dados viriam de uma base de dados atualizada)
    const rendaMediaPorEstado: Record<string, number> = {
      'SP': 3500,
      'RJ': 3200,
      'MG': 2800,
      'RS': 3000,
      'PR': 2900,
      'SC': 3100,
      'DF': 4500,
      'ES': 2700,
      'BA': 2200,
      'PE': 2100,
      'CE': 1900,
      'PA': 1800,
      'GO': 2600,
      'AM': 2300,
      'MA': 1700
    };
    
    demographicData.rendaMediaMensal = rendaMediaPorEstado[estado] || 2500;
    
    return demographicData;
    
  } catch (error) {
    console.error('Erro ao buscar dados demográficos:', error);
    throw new Error('Falha ao buscar dados demográficos');
  }
}

/**
 * Calcula score de competição (0-100)
 * Quanto maior o score, menor a concorrência
 */
function calculateCompetitionScore(competitors: Competitor[]): number {
  if (competitors.length === 0) return 100;
  
  // Fatores:
  // - Número de concorrentes (peso 40%)
  // - Distância média (peso 30%)
  // - Rating médio dos concorrentes (peso 30%)
  
  const numCompetitors = competitors.length;
  const avgDistance = competitors.reduce((sum, c) => sum + c.distance, 0) / numCompetitors;
  const avgRating = competitors
    .filter(c => c.rating)
    .reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.filter(c => c.rating).length || 3;
  
  // Score por número de concorrentes (menos é melhor)
  const numScore = Math.max(0, 100 - (numCompetitors * 5));
  
  // Score por distância (mais longe é melhor)
  const distanceScore = Math.min(100, (avgDistance / 5000) * 100);
  
  // Score por rating (rating baixo dos concorrentes é melhor para nós)
  const ratingScore = Math.max(0, 100 - ((avgRating / 5) * 100));
  
  const finalScore = (numScore * 0.4) + (distanceScore * 0.3) + (ratingScore * 0.3);
  
  return Math.round(finalScore);
}

/**
 * Calcula score demográfico (0-100)
 */
function calculateDemographicScore(demographics: DemographicData): number {
  let score = 50; // Base
  
  // População (peso 40%)
  if (demographics.populacao) {
    if (demographics.populacao > 1000000) score += 20;
    else if (demographics.populacao > 500000) score += 15;
    else if (demographics.populacao > 200000) score += 10;
    else if (demographics.populacao > 100000) score += 5;
  }
  
  // Renda média (peso 40%)
  if (demographics.rendaMediaMensal) {
    if (demographics.rendaMediaMensal > 4000) score += 20;
    else if (demographics.rendaMediaMensal > 3000) score += 15;
    else if (demographics.rendaMediaMensal > 2500) score += 10;
    else if (demographics.rendaMediaMensal > 2000) score += 5;
  }
  
  // IDH (peso 20%)
  if (demographics.idh) {
    if (demographics.idh > 0.8) score += 10;
    else if (demographics.idh > 0.7) score += 7;
    else if (demographics.idh > 0.6) score += 4;
  }
  
  return Math.min(100, Math.round(score));
}

/**
 * Gera insights baseados na análise
 */
function generateInsights(
  competitors: Competitor[],
  demographics: DemographicData,
  competitionScore: number,
  demographicScore: number
): string[] {
  const insights: string[] = [];
  
  // Insights sobre concorrência
  if (competitors.length === 0) {
    insights.push('Excelente oportunidade: não há concorrentes diretos identificados no raio de 5km');
  } else if (competitors.length <= 3) {
    insights.push(`Concorrência baixa: apenas ${competitors.length} concorrente(s) identificado(s) na região`);
  } else if (competitors.length <= 8) {
    insights.push(`Concorrência moderada: ${competitors.length} estabelecimentos comerciais na região`);
  } else {
    insights.push(`Concorrência alta: ${competitors.length} estabelecimentos comerciais identificados no raio de 5km`);
  }
  
  // Insights sobre concorrentes próximos
  const nearbyCompetitors = competitors.filter(c => c.distance < 1000);
  if (nearbyCompetitors.length > 0) {
    insights.push(`Atenção: ${nearbyCompetitors.length} concorrente(s) a menos de 1km de distância`);
  }
  
  // Insights sobre rating dos concorrentes
  const competitorsWithRating = competitors.filter(c => c.rating);
  if (competitorsWithRating.length > 0) {
    const avgRating = competitorsWithRating.reduce((sum, c) => sum + (c.rating || 0), 0) / competitorsWithRating.length;
    if (avgRating < 3.5) {
      insights.push('Oportunidade: concorrentes têm avaliações medianas, há espaço para diferenciação');
    } else if (avgRating > 4.2) {
      insights.push('Desafio: concorrentes têm avaliações altas, será necessário oferecer experiência superior');
    }
  }
  
  // Insights demográficos
  if (demographics.populacao) {
    if (demographics.populacao > 500000) {
      insights.push(`Mercado amplo: população de ${(demographics.populacao / 1000).toFixed(0)}mil habitantes`);
    } else if (demographics.populacao < 100000) {
      insights.push(`Mercado limitado: população de ${(demographics.populacao / 1000).toFixed(0)}mil habitantes`);
    }
  }
  
  if (demographics.rendaMediaMensal) {
    if (demographics.rendaMediaMensal > 3500) {
      insights.push(`Poder aquisitivo alto: renda média de R$ ${demographics.rendaMediaMensal.toFixed(0)}/mês`);
    } else if (demographics.rendaMediaMensal < 2000) {
      insights.push(`Poder aquisitivo moderado: renda média de R$ ${demographics.rendaMediaMensal.toFixed(0)}/mês`);
    }
  }
  
  return insights;
}

/**
 * Gera recomendações baseadas na análise
 */
function generateRecommendations(
  competitors: Competitor[],
  demographics: DemographicData,
  competitionScore: number,
  demographicScore: number
): string[] {
  const recommendations: string[] = [];
  
  if (competitionScore > 70) {
    recommendations.push('Localização favorável para strip mall devido à baixa concorrência direta');
  } else if (competitionScore < 40) {
    recommendations.push('Considere diferenciação forte no mix de lojas para competir efetivamente');
    recommendations.push('Avalie foco em nichos não atendidos pelos concorrentes existentes');
  }
  
  if (demographicScore > 70) {
    recommendations.push('Perfil demográfico favorável para investimento em varejo de médio-alto padrão');
  } else if (demographicScore < 40) {
    recommendations.push('Considere mix de lojas voltado para consumo popular e conveniência');
  }
  
  const shoppingMalls = competitors.filter(c => c.types.includes('shopping_mall'));
  if (shoppingMalls.length > 0) {
    recommendations.push('Posicione como alternativa mais conveniente e acessível aos shopping centers da região');
  }
  
  const supermarkets = competitors.filter(c => c.types.includes('supermarket'));
  if (supermarkets.length > 2) {
    recommendations.push('Considere incluir supermercado âncora para atrair fluxo constante');
  }
  
  if (demographics.rendaMediaMensal && demographics.rendaMediaMensal > 3000) {
    recommendations.push('Priorize lojas de serviços especializados (saúde, beleza, educação)');
  }
  
  return recommendations;
}

/**
 * Realiza análise completa de mercado
 */
export async function analyzeMarket(
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<MarketAnalysis> {
  // Buscar concorrentes e dados demográficos em paralelo
  const [competitors, demographics] = await Promise.all([
    findCompetitors(latitude, longitude, radius),
    getDemographicData(latitude, longitude)
  ]);
  
  // Calcular scores
  const competitionScore = calculateCompetitionScore(competitors);
  const demographicScore = calculateDemographicScore(demographics);
  
  // Score geral (média ponderada: 60% demográfico, 40% competição)
  const overallScore = Math.round((demographicScore * 0.6) + (competitionScore * 0.4));
  
  // Gerar insights e recomendações
  const insights = generateInsights(competitors, demographics, competitionScore, demographicScore);
  const recommendations = generateRecommendations(competitors, demographics, competitionScore, demographicScore);
  
  return {
    competitors,
    demographics,
    competitionScore,
    demographicScore,
    overallScore,
    insights,
    recommendations
  };
}

/**
 * Calcula distância entre dois pontos geográficos (fórmula de Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distância em metros
}
