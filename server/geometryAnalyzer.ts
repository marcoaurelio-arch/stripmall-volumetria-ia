/**
 * Utilitário para analisar a geometria de polígonos de terreno
 * e extrair características para geração de imagens realistas
 */

interface Coordinate {
  lat: number;
  lng: number;
}

interface GeometryAnalysis {
  shape: string; // "rectangular", "irregular", "L-shaped", "trapezoidal", "triangular"
  aspectRatio: number; // largura / comprimento
  orientation: string; // "north-south", "east-west", "diagonal"
  corners: number;
  isRegular: boolean;
  dimensions: {
    width: number; // em metros
    length: number; // em metros
    perimeter: number; // em metros
  };
  description: string; // descrição textual da forma
}

/**
 * Calcula a distância entre dois pontos geográficos usando fórmula de Haversine
 */
function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula o ângulo entre dois pontos (em graus, 0-360)
 */
function calculateAngle(coord1: Coordinate, coord2: Coordinate): number {
  const dLng = coord2.lng - coord1.lng;
  const dLat = coord2.lat - coord1.lat;
  const angle = Math.atan2(dLat, dLng) * 180 / Math.PI;
  return (angle + 360) % 360;
}

/**
 * Analisa a geometria de um polígono e retorna características descritivas
 */
export function analyzePolygonGeometry(polygonCoordinates: string): GeometryAnalysis {
  try {
    const coords: Coordinate[] = JSON.parse(polygonCoordinates);
    
    if (!coords || coords.length < 3) {
      throw new Error("Polígono inválido");
    }

    const corners = coords.length;
    
    // Calcular perímetro e lados
    const sides: number[] = [];
    for (let i = 0; i < coords.length; i++) {
      const next = (i + 1) % coords.length;
      const distance = haversineDistance(coords[i], coords[next]);
      sides.push(distance);
    }
    
    const perimeter = sides.reduce((sum, side) => sum + side, 0);
    
    // Encontrar maior e menor lado
    const maxSide = Math.max(...sides);
    const minSide = Math.min(...sides);
    
    // Calcular dimensões aproximadas
    const sortedSides = [...sides].sort((a, b) => b - a);
    const width = sortedSides[0]; // Maior lado
    const length = sortedSides[1]; // Segundo maior lado
    const aspectRatio = width / length;
    
    // Determinar orientação baseada no ângulo do maior lado
    const maxSideIndex = sides.indexOf(maxSide);
    const angle = calculateAngle(coords[maxSideIndex], coords[(maxSideIndex + 1) % coords.length]);
    
    let orientation: string;
    if ((angle >= 45 && angle < 135) || (angle >= 225 && angle < 315)) {
      orientation = "north-south";
    } else {
      orientation = "east-west";
    }
    
    // Determinar forma do polígono
    let shape: string;
    let description: string;
    let isRegular = false;
    
    // Calcular variação dos lados para determinar regularidade
    const avgSide = sides.reduce((sum, side) => sum + side, 0) / sides.length;
    const variance = sides.reduce((sum, side) => sum + Math.pow(side - avgSide, 2), 0) / sides.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avgSide;
    
    isRegular = coefficientOfVariation < 0.15; // Menos de 15% de variação
    
    if (corners === 3) {
      shape = "triangular";
      description = `terreno triangular com ${width.toFixed(1)}m de base`;
    } else if (corners === 4) {
      if (isRegular && aspectRatio > 0.8 && aspectRatio < 1.2) {
        shape = "square";
        description = `terreno quadrado com aproximadamente ${width.toFixed(1)}m de lado`;
      } else if (isRegular) {
        shape = "rectangular";
        description = `terreno retangular com ${width.toFixed(1)}m x ${length.toFixed(1)}m`;
      } else {
        // Verificar se é formato L
        const angles: number[] = [];
        for (let i = 0; i < coords.length; i++) {
          const prev = (i - 1 + coords.length) % coords.length;
          const next = (i + 1) % coords.length;
          const angle1 = calculateAngle(coords[prev], coords[i]);
          const angle2 = calculateAngle(coords[i], coords[next]);
          const interiorAngle = Math.abs(angle2 - angle1);
          angles.push(interiorAngle);
        }
        
        const hasRightAngles = angles.filter(a => Math.abs(a - 90) < 15 || Math.abs(a - 270) < 15).length >= 3;
        
        if (hasRightAngles) {
          shape = "L-shaped";
          description = `terreno em formato de L com dimensões variadas (maior lado: ${width.toFixed(1)}m)`;
        } else {
          shape = "trapezoidal";
          description = `terreno trapezoidal irregular com ${width.toFixed(1)}m de frente`;
        }
      }
    } else if (corners >= 5) {
      if (isRegular) {
        shape = "polygonal";
        description = `terreno poligonal regular com ${corners} lados`;
      } else {
        shape = "irregular";
        description = `terreno irregular com ${corners} lados (perímetro: ${perimeter.toFixed(1)}m)`;
      }
    } else {
      shape = "irregular";
      description = `terreno de formato irregular`;
    }
    
    return {
      shape,
      aspectRatio,
      orientation,
      corners,
      isRegular,
      dimensions: {
        width: Math.round(width * 10) / 10,
        length: Math.round(length * 10) / 10,
        perimeter: Math.round(perimeter * 10) / 10,
      },
      description,
    };
  } catch (error) {
    console.error("Error analyzing polygon geometry:", error);
    // Retornar análise padrão em caso de erro
    return {
      shape: "irregular",
      aspectRatio: 1.5,
      orientation: "north-south",
      corners: 4,
      isRegular: false,
      dimensions: {
        width: 50,
        length: 30,
        perimeter: 160,
      },
      description: "terreno de formato irregular",
    };
  }
}
