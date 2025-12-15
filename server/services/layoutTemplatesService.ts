/**
 * Biblioteca de Templates de Layout Pré-Configurados
 * 
 * Fornece layouts otimizados para diferentes tipos de terreno,
 * permitindo aplicação rápida e personalização posterior.
 */

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: 'retangular' | 'L' | 'esquina' | 'irregular' | 'estreito' | 'triangular' | 'patio';
  preview: string; // SVG ou descrição visual
  layout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  };
  recommendedFor: string[]; // Características do terreno recomendadas
  pros: string[]; // Vantagens deste layout
  cons: string[]; // Desvantagens ou limitações
}

/**
 * Biblioteca completa de templates (expandida para 20+ opções)
 */
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // Templates para Terreno Retangular
  {
    id: 'retangular-centralizado',
    name: 'Centralizado Padrão',
    description: 'Edifício centralizado com recuos uniformes em todos os lados',
    category: 'retangular',
    preview: 'M 20,20 L 80,20 L 80,80 L 20,80 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 75,
    },
    recommendedFor: [
      'Terrenos retangulares regulares',
      'Quando há necessidade de estacionamento lateral',
      'Projetos com recuos uniformes',
    ],
    pros: [
      'Máxima simetria e equilíbrio visual',
      'Facilita circulação em todos os lados',
      'Ideal para múltiplos acessos',
    ],
    cons: [
      'Pode desperdiçar área em terrenos muito largos',
      'Não aproveita orientação solar específica',
    ],
  },
  {
    id: 'retangular-frontal',
    name: 'Alinhado à Frente',
    description: 'Edifício posicionado próximo à frente do terreno, maximizando área de fundos',
    category: 'retangular',
    preview: 'M 20,10 L 80,10 L 80,40 L 20,40 Z',
    layout: {
      offsetX: 0,
      offsetY: -20,
      rotation: 0,
      scale: 85,
    },
    recommendedFor: [
      'Terrenos com boa visibilidade frontal',
      'Quando se deseja estacionamento nos fundos',
      'Projetos com área de carga/descarga traseira',
    ],
    pros: [
      'Maximiza visibilidade da fachada',
      'Grande área de manobra nos fundos',
      'Facilita acesso de caminhões',
    ],
    cons: [
      'Menor recuo frontal (verificar legislação)',
      'Menos privacidade na fachada',
    ],
  },
  {
    id: 'retangular-aproveitamento-maximo',
    name: 'Aproveitamento Máximo',
    description: 'Escala máxima respeitando recuos mínimos obrigatórios',
    category: 'retangular',
    preview: 'M 15,15 L 85,15 L 85,85 L 15,85 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 90,
    },
    recommendedFor: [
      'Terrenos com recuos mínimos pequenos',
      'Quando se busca máxima área construída',
      'Projetos comerciais de alto aproveitamento',
    ],
    pros: [
      'Máxima taxa de ocupação',
      'Melhor custo-benefício por m²',
      'Ideal para terrenos caros',
    ],
    cons: [
      'Pouco espaço para circulação externa',
      'Pode gerar sensação de confinamento',
      'Dificulta futuras expansões',
    ],
  },
  {
    id: 'densidade-compacta',
    name: 'Compacto Urbano',
    description: 'Máxima densidade, ideal para terrenos caros em áreas urbanas',
    category: 'retangular',
    preview: 'M 10,10 L 90,10 L 90,90 L 10,90 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 95,
    },
    recommendedFor: [
      'Terrenos caros em áreas urbanas',
      'Quando se busca máximo ROI',
      'Regiões com recuos mínimos pequenos',
    ],
    pros: [
      'Máximo aproveitamento',
      'Melhor retorno sobre investimento',
      'Ideal para áreas valorizadas',
    ],
    cons: [
      'Pouco espaço externo',
      'Estacionamento limitado',
      'Pode parecer confinado',
    ],
  },
  {
    id: 'densidade-espacosa',
    name: 'Espaçoso Suburbano',
    description: 'Baixa densidade com amplas áreas externas e paisagismo',
    category: 'retangular',
    preview: 'M 30,30 L 70,30 L 70,70 L 30,70 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 60,
    },
    recommendedFor: [
      'Terrenos grandes em áreas suburbanas',
      'Quando se deseja ambiente aberto',
      'Projetos com foco em paisagismo',
    ],
    pros: [
      'Ambiente aberto e arejado',
      'Amplo estacionamento',
      'Áreas verdes generosas',
    ],
    cons: [
      'Baixo aproveitamento do terreno',
      'Maior custo de manutenção',
      'Não ideal para terrenos caros',
    ],
  },

  // Templates para Terreno em L
  {
    id: 'L-canto-interno',
    name: 'Canto Interno do L',
    description: 'Edifício posicionado no canto interno do L, aproveitando a forma',
    category: 'L',
    preview: 'M 40,40 L 80,40 L 80,80 L 40,80 Z',
    layout: {
      offsetX: 15,
      offsetY: 15,
      rotation: 0,
      scale: 70,
    },
    recommendedFor: [
      'Terrenos em formato L',
      'Quando se deseja criar pátio interno',
      'Projetos com necessidade de área externa protegida',
    ],
    pros: [
      'Cria área de pátio protegida',
      'Aproveita forma irregular do terreno',
      'Boa privacidade',
    ],
    cons: [
      'Pode desperdiçar área nas pontas do L',
      'Fachada menos visível',
    ],
  },
  {
    id: 'L-linear',
    name: 'Linear Alongado',
    description: 'Edifício alongado acompanhando a maior dimensão do L',
    category: 'L',
    preview: 'M 20,40 L 80,40 L 80,60 L 20,60 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 80,
    },
    recommendedFor: [
      'Terrenos em L com uma perna muito longa',
      'Strip malls lineares',
      'Quando se busca máxima frente de lojas',
    ],
    pros: [
      'Máxima frente comercial',
      'Facilita subdivisão em lojas',
      'Boa visibilidade',
    ],
    cons: [
      'Não aproveita todo o L',
      'Pode deixar áreas mortas',
    ],
  },
  {
    id: 'L-duplo',
    name: 'L Duplo Espelhado',
    description: 'Dois blocos em L espelhados criando pátio central',
    category: 'L',
    preview: 'M 20,20 L 45,20 L 45,45 L 20,45 Z M 55,55 L 80,55 L 80,80 L 55,80 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 70,
    },
    recommendedFor: [
      'Terrenos em L muito grandes',
      'Quando se deseja criar dois pátios',
      'Projetos com múltiplos acessos',
    ],
    pros: [
      'Cria dinâmica interessante',
      'Múltiplas áreas de convivência',
      'Flexibilidade de uso',
    ],
    cons: [
      'Mais complexo',
      'Requer terreno grande',
    ],
  },

  // Templates para Terreno de Esquina
  {
    id: 'esquina-diagonal',
    name: 'Diagonal de Esquina',
    description: 'Edifício rotacionado 45° para destacar a esquina',
    category: 'esquina',
    preview: 'M 50,20 L 80,50 L 50,80 L 20,50 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 45,
      scale: 70,
    },
    recommendedFor: [
      'Terrenos de esquina',
      'Quando se deseja destaque visual',
      'Projetos âncora ou landmark',
    ],
    pros: [
      'Máximo destaque visual',
      'Duas fachadas principais',
      'Identidade arquitetônica forte',
    ],
    cons: [
      'Pode violar recuos se não ajustado',
      'Área desperdiçada nos cantos',
      'Mais complexo estruturalmente',
    ],
  },
  {
    id: 'esquina-frente-dupla',
    name: 'Frente Dupla',
    description: 'Edifício alinhado às duas ruas, aproveitando ambas as frentes',
    category: 'esquina',
    preview: 'M 20,20 L 80,20 L 80,80 L 20,80 Z',
    layout: {
      offsetX: -10,
      offsetY: -10,
      rotation: 0,
      scale: 80,
    },
    recommendedFor: [
      'Esquinas com fluxo intenso em ambas as ruas',
      'Quando se deseja dois acessos principais',
      'Projetos com estacionamento interno',
    ],
    pros: [
      'Duas fachadas comerciais',
      'Múltiplos acessos',
      'Boa visibilidade de ambas as ruas',
    ],
    cons: [
      'Recuos menores nas frentes',
      'Pode exigir tratamento especial de esquina',
    ],
  },
  {
    id: 'esquina-chanfrada',
    name: 'Esquina Chanfrada',
    description: 'Canto chanfrado criando entrada monumental',
    category: 'esquina',
    preview: 'M 20,20 L 70,20 L 80,30 L 80,80 L 20,80 Z',
    layout: {
      offsetX: -5,
      offsetY: -5,
      rotation: 0,
      scale: 75,
    },
    recommendedFor: [
      'Esquinas com grande fluxo',
      'Quando se deseja entrada destacada',
      'Projetos com identidade forte',
    ],
    pros: [
      'Entrada monumental',
      'Destaque visual',
      'Facilita acesso de pedestres',
    ],
    cons: [
      'Perde área no chanfro',
      'Mais complexo estruturalmente',
    ],
  },

  // Templates para Terreno Irregular
  {
    id: 'irregular-centralizado-adaptativo',
    name: 'Centralizado Adaptativo',
    description: 'Edifício centralizado com escala ajustada à forma irregular',
    category: 'irregular',
    preview: 'M 30,30 L 70,30 L 70,70 L 30,70 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 65,
    },
    recommendedFor: [
      'Terrenos irregulares',
      'Quando se deseja flexibilidade',
      'Projetos que precisam de ajuste manual posterior',
    ],
    pros: [
      'Seguro para qualquer forma',
      'Facilita ajustes posteriores',
      'Mantém distância de todos os limites',
    ],
    cons: [
      'Pode desperdiçar área',
      'Não aproveita características específicas',
    ],
  },
  {
    id: 'irregular-orientacao-solar',
    name: 'Orientação Solar',
    description: 'Edifício rotacionado para fachada principal voltada ao norte',
    category: 'irregular',
    preview: 'M 30,40 L 70,30 L 80,70 L 40,80 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 70,
    },
    recommendedFor: [
      'Terrenos com orientação desfavorável',
      'Quando eficiência energética é prioridade',
      'Projetos sustentáveis',
    ],
    pros: [
      'Máxima eficiência energética',
      'Melhor iluminação natural',
      'Conforto térmico otimizado',
    ],
    cons: [
      'Pode não alinhar com limites do terreno',
      'Pode desperdiçar área em cantos',
    ],
  },

  // Templates para Terreno Estreito e Profundo
  {
    id: 'estreito-linear-frontal',
    name: 'Linear Frontal',
    description: 'Edifício alongado paralelo à rua, maximizando frente comercial',
    category: 'estreito',
    preview: 'M 10,30 L 90,30 L 90,50 L 10,50 Z',
    layout: {
      offsetX: 0,
      offsetY: -15,
      rotation: 0,
      scale: 85,
    },
    recommendedFor: [
      'Terrenos estreitos (proporção > 3:1)',
      'Quando se deseja maximizar frente de lojas',
      'Strip malls lineares',
    ],
    pros: [
      'Máxima frente comercial',
      'Facilita subdivisão em lojas',
      'Boa visibilidade da rua',
      'Estacionamento nos fundos',
    ],
    cons: [
      'Pouca profundidade das lojas',
      'Circulação traseira limitada',
    ],
  },
  {
    id: 'estreito-perpendicular',
    name: 'Perpendicular Profundo',
    description: 'Edifício perpendicular à rua, aproveitando profundidade',
    category: 'estreito',
    preview: 'M 40,10 L 60,10 L 60,90 L 40,90 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 90,
      scale: 80,
    },
    recommendedFor: [
      'Terrenos muito estreitos',
      'Quando profundidade é mais importante que frente',
      'Projetos com acesso lateral',
    ],
    pros: [
      'Aproveita profundidade do terreno',
      'Lojas mais amplas',
      'Facilita estacionamento lateral',
    ],
    cons: [
      'Pouca visibilidade da rua',
      'Requer sinalização forte',
    ],
  },
  {
    id: 'estreito-modular',
    name: 'Modular Escalonado',
    description: 'Módulos escalonados criando profundidades variadas',
    category: 'estreito',
    preview: 'M 10,25 L 90,25 L 90,45 L 70,45 L 70,55 L 10,55 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 75,
    },
    recommendedFor: [
      'Terrenos estreitos com necessidade de variação',
      'Mix de lojas pequenas e médias',
      'Quando se deseja dinâmica visual',
    ],
    pros: [
      'Variação de tamanhos de loja',
      'Dinâmica visual interessante',
      'Flexibilidade de layout interno',
    ],
    cons: [
      'Mais complexo estruturalmente',
      'Pode desperdiçar área em recuos',
    ],
  },

  // Templates para Terreno Triangular
  {
    id: 'triangular-canto-reto',
    name: 'Canto Reto',
    description: 'Edifício retangular no canto de 90° do triângulo',
    category: 'triangular',
    preview: 'M 20,20 L 60,20 L 60,60 L 20,60 Z',
    layout: {
      offsetX: -15,
      offsetY: -15,
      rotation: 0,
      scale: 65,
    },
    recommendedFor: [
      'Terrenos triangulares com um ângulo reto',
      'Quando se deseja forma regular',
      'Facilita construção',
    ],
    pros: [
      'Forma regular facilita construção',
      'Aproveita canto mais útil',
      'Deixa área triangular para estacionamento',
    ],
    cons: [
      'Desperdiça área triangular',
      'Pode não aproveitar toda frente',
    ],
  },
  {
    id: 'triangular-adaptado',
    name: 'Adaptado Trapezoidal',
    description: 'Edifício trapezoidal acompanhando forma do terreno',
    category: 'triangular',
    preview: 'M 30,20 L 70,20 L 80,70 L 20,70 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 70,
    },
    recommendedFor: [
      'Terrenos triangulares',
      'Quando se deseja máximo aproveitamento',
      'Projetos com identidade única',
    ],
    pros: [
      'Máximo aproveitamento de área',
      'Forma única e marcante',
      'Acompanha limites do terreno',
    ],
    cons: [
      'Mais complexo e caro',
      'Lojas com formatos irregulares',
    ],
  },

  // Templates com Pátio Central
  {
    id: 'patio-central-quadrado',
    name: 'Pátio Central',
    description: 'Edifício em U ou O com pátio central aberto',
    category: 'patio',
    preview: 'M 20,20 L 80,20 L 80,80 L 20,80 Z M 35,35 L 65,35 L 65,65 L 35,65 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 80,
    },
    recommendedFor: [
      'Terrenos quadrados ou regulares',
      'Quando se deseja área externa protegida',
      'Projetos com praça de alimentação',
    ],
    pros: [
      'Área externa protegida',
      'Ambiente agradável',
      'Todas lojas voltadas para pátio',
      'Segurança e controle',
    ],
    cons: [
      'Menor frente para rua',
      'Requer boa sinalização',
      'Área do pátio não é construída',
    ],
  },
  {
    id: 'patio-em-L',
    name: 'Pátio em L',
    description: 'Edifício em L criando pátio semi-aberto',
    category: 'patio',
    preview: 'M 20,20 L 80,20 L 80,50 L 50,50 L 50,80 L 20,80 Z',
    layout: {
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 75,
    },
    recommendedFor: [
      'Terrenos retangulares',
      'Quando se deseja pátio com abertura',
      'Mix de lojas voltadas para rua e pátio',
    ],
    pros: [
      'Pátio com abertura visual',
      'Flexibilidade de acessos',
      'Algumas lojas com frente para rua',
    ],
    cons: [
      'Menos proteção que pátio fechado',
      'Forma em L pode ser complexa',
    ],
  },
  {
    id: 'patio-em-U',
    name: 'Pátio em U',
    description: 'Edifício em U com pátio aberto para rua',
    category: 'patio',
    preview: 'M 20,20 L 40,20 L 40,80 L 20,80 Z M 60,20 L 80,20 L 80,80 L 60,80 Z M 40,70 L 60,70 L 60,80 L 40,80 Z',
    layout: {
      offsetX: 0,
      offsetY: 5,
      rotation: 0,
      scale: 75,
    },
    recommendedFor: [
      'Terrenos retangulares',
      'Quando se deseja pátio visível da rua',
      'Projetos com foco em convivência',
    ],
    pros: [
      'Pátio visível e convidativo',
      'Fácil acesso da rua',
      'Cria senso de comunidade',
    ],
    cons: [
      'Menos privacidade',
      'Requer paisagismo cuidadoso',
    ],
  },
];

/**
 * Busca templates por categoria
 */
export function getTemplatesByCategory(category: LayoutTemplate['category']): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Busca template por ID
 */
export function getTemplateById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.id === id);
}

/**
 * Recomenda templates baseado em características do terreno
 */
export function recommendTemplates(terrainCharacteristics: {
  width: number;
  length: number;
  area: number;
  isCorner?: boolean;
  isIrregular?: boolean;
  hasLShape?: boolean;
}): LayoutTemplate[] {
  const { width, length, isCorner, isIrregular, hasLShape } = terrainCharacteristics;

  // Calcular proporção do terreno
  const aspectRatio = Math.max(width, length) / Math.min(width, length);

  // Determinar categoria baseado em características
  let category: LayoutTemplate['category'];
  if (hasLShape) {
    category = 'L';
  } else if (isCorner) {
    category = 'esquina';
  } else if (isIrregular) {
    category = 'irregular';
  } else if (aspectRatio > 3) {
    category = 'estreito';
  } else {
    category = 'retangular';
  }

  // Buscar templates da categoria
  let templates = getTemplatesByCategory(category);

  // Se terreno é muito retangular (proporção > 2:1), incluir também templates estreitos
  if (aspectRatio > 2 && category === 'retangular') {
    templates = [
      ...templates.filter((t) => t.id.includes('frontal') || t.id.includes('linear')),
      ...getTemplatesByCategory('estreito'),
    ];
  }

  // Se terreno é grande (> 10.000m²), incluir templates com pátio
  if (terrainCharacteristics.area > 10000) {
    templates = [...templates, ...getTemplatesByCategory('patio')];
  }

  return templates;
}

/**
 * Aplica template ajustando para características específicas do terreno
 */
export function applyTemplate(
  templateId: string,
  terrainCharacteristics: {
    width: number;
    length: number;
    area: number;
    setbacks: {
      frontal: number;
      lateral: number;
      fundos: number;
    };
  }
): { offsetX: number; offsetY: number; rotation: number; scale: number } | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  let layout = { ...template.layout };

  // Ajustar escala baseado em recuos
  const { width, length, setbacks } = terrainCharacteristics;
  const availableWidth = width - setbacks.lateral * 2;
  const availableLength = length - setbacks.frontal - setbacks.fundos;
  const maxScale = Math.min(
    (availableWidth / width) * 100,
    (availableLength / length) * 100
  );

  // Limitar escala ao máximo permitido
  layout.scale = Math.min(layout.scale, maxScale * 0.95); // 95% do máximo para margem de segurança

  return layout;
}
