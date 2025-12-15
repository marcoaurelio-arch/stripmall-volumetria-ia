/**
 * Serviço de Análise de Sombreamento Solar
 * 
 * Calcula a posição do sol e projeta sombras do edifício em diferentes horários e estações.
 * Baseado em algoritmos de posição solar e geometria 3D.
 */

export interface SolarPosition {
  azimuth: number; // Ângulo horizontal (0° = Norte, 90° = Leste, 180° = Sul, 270° = Oeste)
  elevation: number; // Ângulo de elevação acima do horizonte (0° = horizonte, 90° = zênite)
  timestamp: Date;
}

export interface ShadowProjection {
  polygonPoints: Array<{ x: number; y: number }>; // Pontos do polígono de sombra
  length: number; // Comprimento máximo da sombra (metros)
  direction: number; // Direção da sombra (graus)
  coverage: number; // Percentual do terreno coberto por sombra
}

export interface ShadowAnalysisInput {
  buildingLayout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  };
  buildingHeight: number; // Altura do edifício em metros
  terrain: {
    width: number;
    length: number;
    area: number;
  };
  location: {
    latitude: number; // Latitude em graus (-90 a 90)
    longitude: number; // Longitude em graus (-180 a 180)
  };
  datetime: Date;
}

export interface ShadowAnalysisResult {
  solarPosition: SolarPosition;
  shadow: ShadowProjection;
  sunlightHours: number; // Horas estimadas de sol direto no terreno
  recommendation: string;
}

/**
 * Calcula a posição do sol para uma data, hora e localização específicas
 * Baseado no algoritmo NOAA Solar Calculator
 */
export function calculateSolarPosition(
  latitude: number,
  longitude: number,
  datetime: Date
): SolarPosition {
  // Converter para radianos
  const lat = (latitude * Math.PI) / 180;

  // Calcular dia Juliano
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const day = datetime.getDate();
  const hour = datetime.getHours() + datetime.getMinutes() / 60;

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  const julianDay =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045 +
    (hour - 12) / 24;

  // Calcular século Juliano
  const julianCentury = (julianDay - 2451545) / 36525;

  // Longitude média do sol
  const sunMeanLongitude =
    (280.46646 + julianCentury * (36000.76983 + julianCentury * 0.0003032)) % 360;

  // Anomalia média do sol
  const sunMeanAnomaly =
    357.52911 + julianCentury * (35999.05029 - 0.0001537 * julianCentury);
  const sunMeanAnomalyRad = (sunMeanAnomaly * Math.PI) / 180;

  // Equação do centro do sol
  const sunCenter =
    Math.sin(sunMeanAnomalyRad) * (1.914602 - julianCentury * (0.004817 + 0.000014 * julianCentury)) +
    Math.sin(2 * sunMeanAnomalyRad) * (0.019993 - 0.000101 * julianCentury) +
    Math.sin(3 * sunMeanAnomalyRad) * 0.000289;

  // Longitude verdadeira do sol
  const sunTrueLongitude = sunMeanLongitude + sunCenter;
  const sunTrueLongitudeRad = (sunTrueLongitude * Math.PI) / 180;

  // Obliquidade da eclíptica
  const obliquity =
    23.439291 -
    julianCentury * (0.0130042 + julianCentury * (0.00000016 - julianCentury * 0.000000504));
  const obliquityRad = (obliquity * Math.PI) / 180;

  // Declinação solar
  const sunDeclination = Math.asin(Math.sin(obliquityRad) * Math.sin(sunTrueLongitudeRad));

  // Equação do tempo
  const yEq = Math.tan(obliquityRad / 2) ** 2;
  const equationOfTime =
    4 *
    (180 / Math.PI) *
    (yEq * Math.sin(2 * (sunMeanLongitude * Math.PI) / 180) -
      2 * (0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury)) *
        Math.sin(sunMeanAnomalyRad) +
      4 *
        (0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury)) *
        yEq *
        Math.sin(sunMeanAnomalyRad) *
        Math.cos(2 * (sunMeanLongitude * Math.PI) / 180) -
      0.5 * yEq * yEq * Math.sin(4 * (sunMeanLongitude * Math.PI) / 180) -
      1.25 *
        (0.016708634 - julianCentury * (0.000042037 + 0.0000001267 * julianCentury)) ** 2 *
        Math.sin(2 * sunMeanAnomalyRad));

  // Ângulo horário
  const trueSolarTime = (hour * 60 + equationOfTime + 4 * longitude) % 1440;
  const hourAngle = trueSolarTime / 4 < 0 ? trueSolarTime / 4 + 180 : trueSolarTime / 4 - 180;
  const hourAngleRad = (hourAngle * Math.PI) / 180;

  // Elevação solar
  const elevation =
    (180 / Math.PI) *
    Math.asin(
      Math.sin(lat) * Math.sin(sunDeclination) +
        Math.cos(lat) * Math.cos(sunDeclination) * Math.cos(hourAngleRad)
    );

  // Azimute solar
  let azimuth =
    (180 / Math.PI) *
    Math.atan2(
      Math.sin(hourAngleRad),
      Math.cos(hourAngleRad) * Math.sin(lat) - Math.tan(sunDeclination) * Math.cos(lat)
    );

  // Ajustar azimute para 0-360°
  azimuth = (azimuth + 180) % 360;

  return {
    azimuth,
    elevation: Math.max(0, elevation), // Não pode ser negativo (sol abaixo do horizonte)
    timestamp: datetime,
  };
}

/**
 * Projeta a sombra do edifício baseado na posição solar
 */
export function projectShadow(
  input: ShadowAnalysisInput,
  solarPosition: SolarPosition
): ShadowProjection {
  const { buildingLayout, buildingHeight, terrain } = input;

  // Se o sol está abaixo do horizonte, não há sombra
  if (solarPosition.elevation <= 0) {
    return {
      polygonPoints: [],
      length: 0,
      direction: 0,
      coverage: 0,
    };
  }

  // Calcular dimensões do edifício
  const buildingWidth = (terrain.width * buildingLayout.scale) / 100;
  const buildingLength = (terrain.length * buildingLayout.scale) / 100 * 0.4; // Proporção típica

  // Calcular comprimento da sombra
  const shadowLength = buildingHeight / Math.tan((solarPosition.elevation * Math.PI) / 180);

  // Direção da sombra (oposta ao azimute do sol)
  const shadowDirection = (solarPosition.azimuth + 180) % 360;

  // Calcular posição do edifício no terreno
  const buildingCenterX = terrain.width / 2 + (buildingLayout.offsetX / 100) * terrain.width;
  const buildingCenterY = terrain.length / 2 + (buildingLayout.offsetY / 100) * terrain.length;

  // Rotação do edifício
  const buildingRotationRad = (buildingLayout.rotation * Math.PI) / 180;

  // Calcular cantos do edifício
  const buildingCorners = [
    { x: -buildingWidth / 2, y: -buildingLength / 2 },
    { x: buildingWidth / 2, y: -buildingLength / 2 },
    { x: buildingWidth / 2, y: buildingLength / 2 },
    { x: -buildingWidth / 2, y: buildingLength / 2 },
  ];

  // Rotacionar e transladar cantos
  const rotatedCorners = buildingCorners.map((corner) => {
    const rotatedX =
      corner.x * Math.cos(buildingRotationRad) - corner.y * Math.sin(buildingRotationRad);
    const rotatedY =
      corner.x * Math.sin(buildingRotationRad) + corner.y * Math.cos(buildingRotationRad);
    return {
      x: buildingCenterX + rotatedX,
      y: buildingCenterY + rotatedY,
    };
  });

  // Projetar sombra de cada canto
  const shadowDirectionRad = (shadowDirection * Math.PI) / 180;
  const shadowCorners = rotatedCorners.map((corner) => ({
    x: corner.x + shadowLength * Math.sin(shadowDirectionRad),
    y: corner.y + shadowLength * Math.cos(shadowDirectionRad),
  }));

  // Polígono de sombra = edifício + projeção
  const shadowPolygon = [...rotatedCorners, ...shadowCorners.reverse()];

  // Calcular área da sombra (aproximação)
  const shadowArea = calculatePolygonArea(shadowPolygon);
  const coverage = Math.min(100, (shadowArea / terrain.area) * 100);

  return {
    polygonPoints: shadowPolygon,
    length: shadowLength,
    direction: shadowDirection,
    coverage,
  };
}

/**
 * Calcula área de um polígono usando fórmula de Shoelace
 */
function calculatePolygonArea(points: Array<{ x: number; y: number }>): number {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

/**
 * Analisa sombreamento completo para um layout
 */
export function analyzeShadow(input: ShadowAnalysisInput): ShadowAnalysisResult {
  const solarPosition = calculateSolarPosition(
    input.location.latitude,
    input.location.longitude,
    input.datetime
  );

  const shadow = projectShadow(input, solarPosition);

  // Estimar horas de sol (simplificado)
  // Assume que o terreno recebe sol quando a sombra cobre menos de 30%
  const sunlightHours = shadow.coverage < 30 ? 8 : shadow.coverage < 60 ? 4 : 2;

  // Gerar recomendação
  let recommendation = '';
  if (solarPosition.elevation <= 0) {
    recommendation = 'Sol abaixo do horizonte neste horário.';
  } else if (shadow.coverage < 20) {
    recommendation = 'Excelente exposição solar. Mínimo sombreamento do terreno.';
  } else if (shadow.coverage < 40) {
    recommendation = 'Boa exposição solar. Sombreamento moderado.';
  } else if (shadow.coverage < 60) {
    recommendation = 'Sombreamento significativo. Considere ajustar orientação ou altura.';
  } else {
    recommendation = 'Alto sombreamento. Recomenda-se revisar layout ou reduzir altura.';
  }

  return {
    solarPosition,
    shadow,
    sunlightHours,
    recommendation,
  };
}

/**
 * Analisa sombreamento em múltiplos horários
 */
export function analyzeShadowMultipleHours(
  input: Omit<ShadowAnalysisInput, 'datetime'>,
  date: Date,
  hours: number[]
): ShadowAnalysisResult[] {
  return hours.map((hour) => {
    const datetime = new Date(date);
    datetime.setHours(hour, 0, 0, 0);
    return analyzeShadow({ ...input, datetime });
  });
}

/**
 * Analisa sombreamento em múltiplas estações
 */
export function analyzeShadowSeasons(
  input: Omit<ShadowAnalysisInput, 'datetime'>,
  year: number
): {
  summer: ShadowAnalysisResult[];
  winter: ShadowAnalysisResult[];
  spring: ShadowAnalysisResult[];
  fall: ShadowAnalysisResult[];
} {
  const hours = [8, 12, 16]; // 8h, 12h, 16h

  // Datas representativas de cada estação (hemisfério sul)
  const summerDate = new Date(year, 11, 21); // 21 de dezembro
  const winterDate = new Date(year, 5, 21); // 21 de junho
  const springDate = new Date(year, 8, 22); // 22 de setembro
  const fallDate = new Date(year, 2, 20); // 20 de março

  return {
    summer: analyzeShadowMultipleHours(input, summerDate, hours),
    winter: analyzeShadowMultipleHours(input, winterDate, hours),
    spring: analyzeShadowMultipleHours(input, springDate, hours),
    fall: analyzeShadowMultipleHours(input, fallDate, hours),
  };
}
