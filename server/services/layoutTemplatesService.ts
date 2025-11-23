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
  category: 'retangular' | 'L' | 'esquina' | 'irregular';
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
 * Biblioteca completa de templates
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
      rotation: 0, // Será ajustado baseado na orientação do terreno
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

  // Determinar categoria baseado em características
  let category: LayoutTemplate['category'];
  if (hasLShape) {
    category = 'L';
  } else if (isCorner) {
    category = 'esquina';
  } else if (isIrregular) {
    category = 'irregular';
  } else {
    category = 'retangular';
  }

  // Buscar templates da categoria
  const templates = getTemplatesByCategory(category);

  // Se terreno é muito retangular (proporção > 2:1), priorizar layouts lineares
  const aspectRatio = Math.max(width, length) / Math.min(width, length);
  if (aspectRatio > 2 && category === 'retangular') {
    return templates.filter((t) => t.id.includes('frontal') || t.id.includes('linear'));
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
