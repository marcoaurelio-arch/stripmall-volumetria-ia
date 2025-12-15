/**
 * Serviço de Análise de Geometria do Terreno
 * 
 * Analisa o polígono do terreno e extrai informações geométricas
 * para enriquecer os prompts de geração de imagens IA
 */

export interface TerrainDimensions {
  width: number; // Largura em metros
  length: number; // Comprimento em metros
  perimeter: number; // Perímetro em metros
  aspectRatio: number; // Proporção largura/comprimento
}

export interface TerrainShape {
  type: 'rectangular' | 'irregular' | 'l_shaped' | 'trapezoidal' | 'triangular';
  description: string; // Descrição textual do formato
  complexity: 'simple' | 'moderate' | 'complex'; // Complexidade do formato
}

export interface TerrainOrientation {
  mainAxis: number; // Ângulo do eixo principal em graus (0-360)
  cardinalDirection: string; // Direção cardinal (Norte, Sul, Leste, Oeste, etc)
  solarOrientation: string; // Descrição da orientação solar
}

export interface TerrainGeometry {
  dimensions: TerrainDimensions;
  shape: TerrainShape;
  orientation: TerrainOrientation;
  vertices: number; // Número de vértices
  promptDescription: string; // Descrição completa para usar em prompts
}

/**
 * Calcula a distância entre dois pontos geográficos em metros
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcula o perímetro do polígono
 */
function calculatePerimeter(coords: Array<{ lat: number; lng: number }>): number {
  let perimeter = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    perimeter += calculateDistance(
      coords[i].lat,
      coords[i].lng,
      coords[j].lat,
      coords[j].lng
    );
  }
  return Math.round(perimeter);
}

/**
 * Calcula as dimensões do terreno (largura, comprimento)
 * Usa bounding box para aproximação
 */
function calculateDimensions(coords: Array<{ lat: number; lng: number }>): TerrainDimensions {
  // Encontrar limites (bounding box)
  const lats = coords.map(c => c.lat);
  const lngs = coords.map(c => c.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Calcular largura e comprimento
  const width = calculateDistance(minLat, minLng, minLat, maxLng);
  const length = calculateDistance(minLat, minLng, maxLat, minLng);
  const perimeter = calculatePerimeter(coords);

  return {
    width: Math.round(width),
    length: Math.round(length),
    perimeter,
    aspectRatio: width / length,
  };
}

/**
 * Detecta o formato do terreno baseado na geometria
 */
function detectShape(
  coords: Array<{ lat: number; lng: number }>,
  dimensions: TerrainDimensions
): TerrainShape {
  const vertices = coords.length - 1; // Último ponto é repetição do primeiro

  // Retangular: 4 vértices e proporção próxima de 1.5-3.0
  if (vertices === 4) {
    if (dimensions.aspectRatio >= 0.7 && dimensions.aspectRatio <= 1.3) {
      return {
        type: 'rectangular',
        description: `terreno retangular quase quadrado (${Math.round(dimensions.width)}m x ${Math.round(dimensions.length)}m)`,
        complexity: 'simple',
      };
    } else if (dimensions.aspectRatio >= 1.3 && dimensions.aspectRatio <= 4.0) {
      return {
        type: 'rectangular',
        description: `terreno retangular alongado (${Math.round(dimensions.width)}m x ${Math.round(dimensions.length)}m)`,
        complexity: 'simple',
      };
    } else {
      return {
        type: 'trapezoidal',
        description: `terreno trapezoidal (${Math.round(dimensions.width)}m x ${Math.round(dimensions.length)}m aproximadamente)`,
        complexity: 'moderate',
      };
    }
  }

  // Triangular: 3 vértices
  if (vertices === 3) {
    return {
      type: 'triangular',
      description: `terreno triangular (base ${Math.round(dimensions.width)}m)`,
      complexity: 'moderate',
    };
  }

  // Em L: 6-8 vértices com formato característico
  if (vertices >= 6 && vertices <= 8) {
    return {
      type: 'l_shaped',
      description: `terreno em formato de L ou irregular (${vertices} lados)`,
      complexity: 'moderate',
    };
  }

  // Irregular: mais de 8 vértices ou formato complexo
  if (vertices > 8) {
    return {
      type: 'irregular',
      description: `terreno irregular com ${vertices} lados`,
      complexity: 'complex',
    };
  }

  // Padrão: irregular
  return {
    type: 'irregular',
    description: `terreno irregular (${Math.round(dimensions.width)}m x ${Math.round(dimensions.length)}m)`,
    complexity: 'moderate',
  };
}

/**
 * Calcula a orientação do terreno
 */
function calculateOrientation(coords: Array<{ lat: number; lng: number }>): TerrainOrientation {
  // Calcular vetor do lado mais longo
  let maxDistance = 0;
  let mainAngle = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const j = (i + 1) % (coords.length - 1);
    const distance = calculateDistance(
      coords[i].lat,
      coords[i].lng,
      coords[j].lat,
      coords[j].lng
    );

    if (distance > maxDistance) {
      maxDistance = distance;
      // Calcular ângulo do vetor
      const dLat = coords[j].lat - coords[i].lat;
      const dLng = coords[j].lng - coords[i].lng;
      mainAngle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
      if (mainAngle < 0) mainAngle += 360;
    }
  }

  // Determinar direção cardinal
  let cardinalDirection = '';
  let solarOrientation = '';

  if (mainAngle >= 337.5 || mainAngle < 22.5) {
    cardinalDirection = 'Norte';
    solarOrientation = 'fachada principal voltada para Norte (iluminação natural equilibrada)';
  } else if (mainAngle >= 22.5 && mainAngle < 67.5) {
    cardinalDirection = 'Nordeste';
    solarOrientation = 'fachada principal voltada para Nordeste (sol da manhã)';
  } else if (mainAngle >= 67.5 && mainAngle < 112.5) {
    cardinalDirection = 'Leste';
    solarOrientation = 'fachada principal voltada para Leste (sol da manhã forte)';
  } else if (mainAngle >= 112.5 && mainAngle < 157.5) {
    cardinalDirection = 'Sudeste';
    solarOrientation = 'fachada principal voltada para Sudeste (sol da manhã e início da tarde)';
  } else if (mainAngle >= 157.5 && mainAngle < 202.5) {
    cardinalDirection = 'Sul';
    solarOrientation = 'fachada principal voltada para Sul (menos insolação direta)';
  } else if (mainAngle >= 202.5 && mainAngle < 247.5) {
    cardinalDirection = 'Sudoeste';
    solarOrientation = 'fachada principal voltada para Sudoeste (sol da tarde)';
  } else if (mainAngle >= 247.5 && mainAngle < 292.5) {
    cardinalDirection = 'Oeste';
    solarOrientation = 'fachada principal voltada para Oeste (sol da tarde forte)';
  } else {
    cardinalDirection = 'Noroeste';
    solarOrientation = 'fachada principal voltada para Noroeste (sol do final da tarde)';
  }

  return {
    mainAxis: Math.round(mainAngle),
    cardinalDirection,
    solarOrientation,
  };
}

/**
 * Gera descrição completa para usar em prompts de IA
 */
function generatePromptDescription(geometry: Omit<TerrainGeometry, 'promptDescription'>): string {
  const { dimensions, shape, orientation } = geometry;

  let description = '';

  // Formato e dimensões
  description += `${shape.description}. `;

  // Proporções
  if (dimensions.aspectRatio < 0.8) {
    description += `Formato muito alongado (proporção 1:${(1 / dimensions.aspectRatio).toFixed(1)}). `;
  } else if (dimensions.aspectRatio > 1.2) {
    description += `Formato alongado (proporção ${dimensions.aspectRatio.toFixed(1)}:1). `;
  } else {
    description += `Formato equilibrado (proporção próxima de 1:1). `;
  }

  // Orientação solar
  description += `${orientation.solarOrientation}. `;

  // Perímetro
  description += `Perímetro total de ${dimensions.perimeter}m. `;

  // Recomendações de design baseadas no formato
  if (shape.type === 'rectangular' && dimensions.aspectRatio >= 1.5) {
    description += `Layout linear recomendado com lojas em fila ao longo do comprimento. `;
  } else if (shape.type === 'l_shaped') {
    description += `Layout em L recomendado aproveitando os dois braços do terreno. `;
  } else if (shape.type === 'irregular' || shape.complexity === 'complex') {
    description += `Layout adaptado ao formato irregular do terreno, aproveitando os recortes. `;
  } else if (dimensions.aspectRatio < 1.2) {
    description += `Layout em U ou pátio central recomendado para terreno quadrado. `;
  }

  return description.trim();
}

/**
 * Analisa a geometria completa do terreno
 */
export function analyzeTerrainGeometry(
  coordinates: Array<{ lat: number; lng: number }>
): TerrainGeometry {
  const dimensions = calculateDimensions(coordinates);
  const shape = detectShape(coordinates, dimensions);
  const orientation = calculateOrientation(coordinates);
  const vertices = coordinates.length - 1;

  const geometry = {
    dimensions,
    shape,
    orientation,
    vertices,
    promptDescription: '',
  };

  geometry.promptDescription = generatePromptDescription(geometry);

  return geometry;
}
