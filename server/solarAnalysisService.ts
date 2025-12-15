import SunCalc from 'suncalc';

/**
 * Serviço de Análise Solar e Conforto Térmico
 * Calcula insolação, trajetória solar e recomendações de orientação
 */

export interface SolarAnalysisInput {
  latitude: number;
  longitude: number;
  date?: Date;
  buildingHeight?: number;
  buildingWidth?: number;
  buildingLength?: number;
}

export interface SolarPosition {
  azimuth: number; // Ângulo horizontal (0° = Norte, 90° = Leste, 180° = Sul, 270° = Oeste)
  altitude: number; // Ângulo vertical (0° = horizonte, 90° = zênite)
  time: Date;
}

export interface SunlightHours {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  totalHours: number;
  goldenHourMorning: { start: Date; end: Date };
  goldenHourEvening: { start: Date; end: Date };
}

export interface ThermalComfort {
  season: 'verão' | 'outono' | 'inverno' | 'primavera';
  avgSunExposure: number; // Horas de sol por dia
  heatGainRisk: 'baixo' | 'médio' | 'alto' | 'muito alto';
  coolingNeed: 'baixa' | 'média' | 'alta' | 'muito alta';
  heatingNeed: 'baixa' | 'média' | 'alta' | 'muito alta';
  recommendations: string[];
}

export interface FacadeOrientation {
  direction: 'norte' | 'sul' | 'leste' | 'oeste' | 'nordeste' | 'noroeste' | 'sudeste' | 'sudoeste';
  azimuth: number;
  sunExposure: 'baixa' | 'média' | 'alta' | 'muito alta';
  suitability: 'ótima' | 'boa' | 'regular' | 'ruim';
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
}

export interface SolarAnalysisResult {
  location: {
    latitude: number;
    longitude: number;
    hemisphere: 'norte' | 'sul';
  };
  sunlightHours: {
    summer: SunlightHours;
    winter: SunlightHours;
    spring: SunlightHours;
    fall: SunlightHours;
  };
  solarPath: {
    summer: SolarPosition[];
    winter: SolarPosition[];
  };
  thermalComfort: {
    summer: ThermalComfort;
    winter: ThermalComfort;
    spring: ThermalComfort;
    fall: ThermalComfort;
  };
  facadeOrientations: FacadeOrientation[];
  bestOrientation: FacadeOrientation;
  worstOrientation: FacadeOrientation;
  ventilationAnalysis: {
    predominantWinds: string;
    naturalVentilationPotential: 'baixo' | 'médio' | 'alto' | 'muito alto';
    recommendations: string[];
  };
}

/**
 * Determina a estação do ano para uma data
 */
function getSeason(date: Date, isNorthernHemisphere: boolean): 'verão' | 'outono' | 'inverno' | 'primavera' {
  const month = date.getMonth() + 1; // 1-12
  
  if (isNorthernHemisphere) {
    if (month >= 12 || month <= 2) return 'inverno';
    if (month >= 3 && month <= 5) return 'primavera';
    if (month >= 6 && month <= 8) return 'verão';
    return 'outono';
  } else {
    // Hemisfério Sul (estações invertidas)
    if (month >= 12 || month <= 2) return 'verão';
    if (month >= 3 && month <= 5) return 'outono';
    if (month >= 6 && month <= 8) return 'inverno';
    return 'primavera';
  }
}

/**
 * Calcula horas de luz solar para uma data específica
 */
function calculateSunlightHours(latitude: number, longitude: number, date: Date): SunlightHours {
  const times = SunCalc.getTimes(date, latitude, longitude);
  
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const solarNoon = times.solarNoon;
  
  const totalHours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
  
  return {
    sunrise,
    sunset,
    solarNoon,
    totalHours,
    goldenHourMorning: {
      start: times.goldenHourEnd,
      end: times.goldenHour,
    },
    goldenHourEvening: {
      start: times.goldenHour,
      end: times.goldenHourEnd,
    },
  };
}

/**
 * Calcula trajetória solar ao longo do dia
 */
function calculateSolarPath(latitude: number, longitude: number, date: Date): SolarPosition[] {
  const path: SolarPosition[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(6, 0, 0, 0);
  
  // Calcula posição solar a cada hora das 6h às 18h
  for (let hour = 6; hour <= 18; hour++) {
    const time = new Date(startOfDay);
    time.setHours(hour);
    
    const position = SunCalc.getPosition(time, latitude, longitude);
    
    // Converte radianos para graus
    const azimuthDeg = (position.azimuth * 180 / Math.PI + 180) % 360;
    const altitudeDeg = position.altitude * 180 / Math.PI;
    
    path.push({
      azimuth: azimuthDeg,
      altitude: altitudeDeg,
      time,
    });
  }
  
  return path;
}

/**
 * Analisa conforto térmico por estação
 */
function analyzeThermalComfort(
  season: 'verão' | 'outono' | 'inverno' | 'primavera',
  sunlightHours: SunlightHours,
  isNorthernHemisphere: boolean
): ThermalComfort {
  const avgSunExposure = sunlightHours.totalHours;
  
  let heatGainRisk: 'baixo' | 'médio' | 'alto' | 'muito alto';
  let coolingNeed: 'baixa' | 'média' | 'alta' | 'muito alta';
  let heatingNeed: 'baixa' | 'média' | 'alta' | 'muito alta';
  const recommendations: string[] = [];
  
  if (season === 'verão') {
    heatGainRisk = avgSunExposure > 13 ? 'muito alto' : avgSunExposure > 12 ? 'alto' : 'médio';
    coolingNeed = avgSunExposure > 13 ? 'muito alta' : avgSunExposure > 12 ? 'alta' : 'média';
    heatingNeed = 'baixa';
    
    recommendations.push('Priorizar proteção solar nas fachadas oeste e norte');
    recommendations.push('Instalar brises ou pergolados para sombreamento');
    recommendations.push('Utilizar vidros com controle solar (baixo fator solar)');
    recommendations.push('Garantir ventilação cruzada para resfriamento natural');
    recommendations.push('Considerar vegetação para sombreamento de estacionamento');
  } else if (season === 'inverno') {
    heatGainRisk = 'baixo';
    coolingNeed = 'baixa';
    heatingNeed = avgSunExposure < 10 ? 'alta' : avgSunExposure < 11 ? 'média' : 'baixa';
    
    recommendations.push('Maximizar captação solar nas fachadas norte e leste');
    recommendations.push('Utilizar vidros com alta transmissão luminosa');
    recommendations.push('Considerar isolamento térmico adequado');
    recommendations.push('Avaliar necessidade de aquecimento artificial');
  } else {
    heatGainRisk = 'médio';
    coolingNeed = 'média';
    heatingNeed = 'média';
    
    recommendations.push('Equilibrar proteção solar e captação de luz natural');
    recommendations.push('Utilizar elementos de sombreamento ajustáveis');
    recommendations.push('Garantir boa ventilação natural');
  }
  
  return {
    season,
    avgSunExposure,
    heatGainRisk,
    coolingNeed,
    heatingNeed,
    recommendations,
  };
}

/**
 * Analisa orientação de fachadas
 */
function analyzeFacadeOrientations(latitude: number, isNorthernHemisphere: boolean): FacadeOrientation[] {
  const orientations: FacadeOrientation[] = [
    {
      direction: 'norte',
      azimuth: 0,
      sunExposure: isNorthernHemisphere ? 'alta' : 'baixa',
      suitability: isNorthernHemisphere ? 'boa' : 'ótima',
      advantages: isNorthernHemisphere
        ? ['Iluminação constante ao longo do dia', 'Menor ganho térmico no verão']
        : ['Proteção contra insolação excessiva', 'Menor necessidade de refrigeração'],
      disadvantages: isNorthernHemisphere
        ? ['Pode requerer aquecimento no inverno']
        : ['Menor iluminação natural'],
      recommendations: isNorthernHemisphere
        ? ['Ideal para áreas de circulação e serviços', 'Utilizar vidros com boa transmissão luminosa']
        : ['Ideal para fachada principal', 'Ótima para vitrines e entrada'],
    },
    {
      direction: 'sul',
      azimuth: 180,
      sunExposure: isNorthernHemisphere ? 'baixa' : 'alta',
      suitability: isNorthernHemisphere ? 'ótima' : 'regular',
      advantages: isNorthernHemisphere
        ? ['Proteção contra insolação excessiva', 'Menor necessidade de refrigeração']
        : ['Máxima iluminação natural', 'Aquecimento passivo no inverno'],
      disadvantages: isNorthernHemisphere
        ? ['Menor iluminação natural']
        : ['Alto ganho térmico no verão', 'Necessidade de proteção solar'],
      recommendations: isNorthernHemisphere
        ? ['Ideal para fachada principal', 'Ótima para vitrines e entrada']
        : ['Requer brises ou proteção solar', 'Utilizar vidros com controle solar'],
    },
    {
      direction: 'leste',
      azimuth: 90,
      sunExposure: 'média',
      suitability: 'boa',
      advantages: [
        'Sol da manhã (menos intenso)',
        'Iluminação natural no período matutino',
        'Menor ganho térmico que oeste',
      ],
      disadvantages: [
        'Insolação direta pela manhã',
        'Pode requerer proteção solar',
      ],
      recommendations: [
        'Boa para áreas de trabalho e escritórios',
        'Considerar proteção solar leve',
        'Aproveitar iluminação natural matinal',
      ],
    },
    {
      direction: 'oeste',
      azimuth: 270,
      sunExposure: 'muito alta',
      suitability: 'ruim',
      advantages: [
        'Iluminação natural no período vespertino',
      ],
      disadvantages: [
        'Sol da tarde (muito intenso)',
        'Alto ganho térmico',
        'Desconforto térmico significativo',
        'Alta demanda de refrigeração',
      ],
      recommendations: [
        'Evitar para fachada principal',
        'Requer proteção solar robusta (brises, pergolados)',
        'Utilizar vidros com alto controle solar',
        'Considerar vegetação para sombreamento',
        'Ideal para áreas de serviço ou depósito',
      ],
    },
  ];
  
  return orientations;
}

/**
 * Analisa ventilação natural
 */
function analyzeVentilation(latitude: number): {
  predominantWinds: string;
  naturalVentilationPotential: 'baixo' | 'médio' | 'alto' | 'muito alto';
  recommendations: string[];
} {
  // No Brasil, ventos predominantes são geralmente de leste/nordeste
  const isNorthernHemisphere = latitude > 0;
  
  return {
    predominantWinds: 'Leste/Nordeste (ventos alísios)',
    naturalVentilationPotential: 'alto',
    recommendations: [
      'Orientar aberturas para captar ventos predominantes (leste/nordeste)',
      'Criar aberturas opostas para ventilação cruzada',
      'Posicionar aberturas de entrada mais baixas e saída mais altas',
      'Evitar obstruções que bloqueiem o fluxo de ar',
      'Considerar ventilação mecânica para áreas internas sem acesso a ventos',
      'Utilizar elementos vazados ou cobogós para ventilação permanente',
    ],
  };
}

/**
 * Realiza análise solar completa
 */
export function performSolarAnalysis(input: SolarAnalysisInput): SolarAnalysisResult {
  const { latitude, longitude } = input;
  const isNorthernHemisphere = latitude > 0;
  
  // Datas representativas de cada estação (hemisfério sul)
  const currentYear = new Date().getFullYear();
  const summerDate = new Date(currentYear, 0, 15); // 15 de janeiro
  const fallDate = new Date(currentYear, 3, 15);   // 15 de abril
  const winterDate = new Date(currentYear, 6, 15); // 15 de julho
  const springDate = new Date(currentYear, 9, 15); // 15 de outubro
  
  // Ajustar para hemisfério norte se necessário
  const dates = isNorthernHemisphere
    ? {
        summer: new Date(currentYear, 6, 15),  // 15 de julho
        fall: new Date(currentYear, 9, 15),    // 15 de outubro
        winter: new Date(currentYear, 0, 15),  // 15 de janeiro
        spring: new Date(currentYear, 3, 15),  // 15 de abril
      }
    : {
        summer: summerDate,
        fall: fallDate,
        winter: winterDate,
        spring: springDate,
      };
  
  // Calcular horas de luz solar
  const sunlightHours = {
    summer: calculateSunlightHours(latitude, longitude, dates.summer),
    winter: calculateSunlightHours(latitude, longitude, dates.winter),
    spring: calculateSunlightHours(latitude, longitude, dates.spring),
    fall: calculateSunlightHours(latitude, longitude, dates.fall),
  };
  
  // Calcular trajetória solar
  const solarPath = {
    summer: calculateSolarPath(latitude, longitude, dates.summer),
    winter: calculateSolarPath(latitude, longitude, dates.winter),
  };
  
  // Analisar conforto térmico
  const thermalComfort = {
    summer: analyzeThermalComfort('verão', sunlightHours.summer, isNorthernHemisphere),
    winter: analyzeThermalComfort('inverno', sunlightHours.winter, isNorthernHemisphere),
    spring: analyzeThermalComfort('primavera', sunlightHours.spring, isNorthernHemisphere),
    fall: analyzeThermalComfort('outono', sunlightHours.fall, isNorthernHemisphere),
  };
  
  // Analisar orientações de fachadas
  const facadeOrientations = analyzeFacadeOrientations(latitude, isNorthernHemisphere);
  
  // Determinar melhor e pior orientação
  const bestOrientation = facadeOrientations.find(o => o.suitability === 'ótima') || facadeOrientations[0];
  const worstOrientation = facadeOrientations.find(o => o.suitability === 'ruim') || facadeOrientations[facadeOrientations.length - 1];
  
  // Analisar ventilação
  const ventilationAnalysis = analyzeVentilation(latitude);
  
  return {
    location: {
      latitude,
      longitude,
      hemisphere: isNorthernHemisphere ? 'norte' : 'sul',
    },
    sunlightHours,
    solarPath,
    thermalComfort,
    facadeOrientations,
    bestOrientation,
    worstOrientation,
    ventilationAnalysis,
  };
}
