/**
 * Project DNA Service
 * 
 * Gera e gerencia o "DNA" arquitetônico do projeto para garantir
 * consistência visual entre todos os tipos de visualização
 * (conceitual, planta, maquete, fachada, cortes).
 */

export interface ProjectDNA {
  // Volumetria
  buildingShape: string; // Ex: "Retangular horizontal com pátio central"
  floors: number; // Número de pavimentos
  roofType: string; // Tipo de cobertura
  
  // Linguagem Arquitetônica
  style: string; // Estilo arquitetônico
  features: string[]; // Características marcantes
  
  // Cores e Materiais
  primaryColor: string; // Cor principal (hex)
  accentColor: string; // Cor de destaque (hex)
  materials: string[]; // Materiais predominantes
  
  // Paisagismo
  landscaping: string; // Descrição do paisagismo
  
  // Layout
  layout: string; // Organização espacial
  
  // Contexto
  context: string; // Contexto urbano/entorno
}

export interface ProjectData {
  terrainArea: number;
  buildingArea: number;
  floors: number;
  parkingSpaces: number;
  buildingType: string; // "strip_mall", "office", "residential", etc.
  terrainShape: string; // "rectangular", "L", "irregular", etc.
}

/**
 * Gera o DNA arquitetônico baseado nos dados do projeto
 */
export function generateProjectDNA(projectData: ProjectData): ProjectDNA {
  const { buildingType, terrainShape, floors } = projectData;
  
  // Determinar forma do edifício baseado no tipo e terreno
  let buildingShape = "";
  if (terrainShape === "L") {
    buildingShape = "Edifício em formato L acompanhando o terreno";
  } else if (terrainShape === "irregular") {
    buildingShape = "Edifício adaptado ao formato irregular do terreno";
  } else {
    buildingShape = "Edifício retangular horizontal com pátio central";
  }
  
  // Determinar tipo de cobertura
  const roofType = floors > 2 ? "Laje plana impermeabilizada" : "Lajes planas escalonadas";
  
  // Determinar estilo arquitetônico baseado no tipo
  let style = "";
  let features: string[] = [];
  
  if (buildingType === "strip_mall") {
    style = "Strip Mall Comercial Brasileiro Contemporâneo";
    features = [
      "OBRIGATÓRIO: Calçada coberta contínua de 3-4m ao longo de TODAS as lojas",
      "OBRIGATÓRIO: Vitrines em vidro temperado incolor ocupando 70-80% da fachada frontal",
      "OBRIGATÓRIO: Faixa horizontal para letreiros/sinalização acima das vitrines (h=0.8-1.2m)",
      "OBRIGATÓRIO: Pilares/colunas estruturais visíveis a cada 6-8m definindo ritmo",
      "OBRIGATÓRIO: Laje plana com platibanda (parapeito) de 0.8-1.2m ocultando telhado",
      "Linhas horizontais predominantes enfatizando comprimento do edifício",
      "Volumes retangulares puros sem ornamentos desnecessários",
      "Iluminação embutida na marquise/calçada coberta"
    ];
  } else if (buildingType === "office") {
    style = "Corporativo moderno";
    features = [
      "Fachada em vidro e alumínio",
      "Brises horizontais",
      "Volumes verticais",
      "Entrada monumental"
    ];
  } else {
    style = "Contemporâneo funcional";
    features = [
      "Volumes simples",
      "Aberturas generosas",
      "Integração com paisagismo"
    ];
  }
  
  // Paleta de cores ESPECÍFICA para strip mall (cores hex EXATAS)
  const primaryColor = "#F5F5F5"; // Cinza muito claro (quase branco) - COR PRINCIPAL DO EDIFÍCIO
  const accentColor = "#2C3E50"; // Cinza azulado escuro - COR DOS DETALHES/PILARES
  const materials = [
    "ESTRUTURA: Concreto armado aparente pintado em #F5F5F5 (cinza muito claro)",
    "FACHADA FRONTAL: Vidro temperado incolor 8mm (70-80% da área) + caixilhos de alumínio #2C3E50",
    "PILARES/COLUNAS: Concreto aparente pintado em #2C3E50 (cinza azulado escuro) a cada 6-8m",
    "CALÇADA COBERTA: Piso em porcelanato cinza antiderrapante + forro em gesso branco",
    "PLATIBANDA/PARAPEITO: Concreto pintado em #F5F5F5 com altura de 0.8-1.2m"
  ];
  
  // Paisagismo ESPECÍFICO para strip mall
  const landscaping = "OBRIGATÓRIO: Árvores nativas brasileiras de médio porte (Ipê, Resedá, Jacarandá) com altura 6-8m plantadas no estacionamento a cada 3-4 vagas para sombreamento. Canteiros lineares com forragem baixa (grama-amendoim, lambari) ao longo da calçada coberta. Iluminação de piso LED embutida nos canteiros. SEM palmeiras ou plantas tropicais exóticas.";
  
  // Layout OBRIGATÓRIO para strip mall
  const layout = "CONFIGURAÇÃO OBRIGATÓRIA: Edifício em formato linear ou L com TODAS as lojas voltadas para o estacionamento frontal. Calçada coberta contínua de 3-4m de largura ao longo de 100% das fachadas das lojas. Estacionamento com vagas perpendiculares (90°) em grid organizado. Loja âncora (supermercado/farmácia) posicionada em UMA das extremidades. Lojas menores (50-150m²) distribuídas ao longo do edifício. Circulação de veículos em mão única ou dupla com largura mínima de 5-6m.";
  
  // Contexto urbano ESPECÍFICO brasileiro
  const context = "CONTEXTO: Bairro urbano brasileiro consolidado com edifícios comerciais e residenciais de 2-4 pavimentos no entorno. Via de acesso principal asfaltada com 2-3 faixas. Calçada pública de 2-3m com piso tátil e arborização urbana existente (Sibipiruna, Oiti). Iluminação pública com postes a cada 30-40m. Clima tropical/subtropical brasileiro com sol intenso - EXIGE sombreamento no estacionamento e proteção solar na fachada (calçada coberta).";
  
  return {
    buildingShape,
    floors,
    roofType,
    style,
    features,
    primaryColor,
    accentColor,
    materials,
    landscaping,
    layout,
    context
  };
}

/**
 * Converte o DNA do projeto em descrição textual para uso em prompts
 */
export function dnaToPromptDescription(dna: ProjectDNA): string {
  const parts = [
    // Volumetria
    `VOLUMETRIA: ${dna.buildingShape}, ${dna.floors} pavimentos, ${dna.roofType}.`,
    
    // Estilo
    `ESTILO ARQUITETÔNICO: ${dna.style}. Características: ${dna.features.join(", ")}.`,
    
    // Cores e Materiais
    `CORES: Cor principal ${dna.primaryColor} (branco), detalhes em ${dna.accentColor} (cinza escuro). MATERIAIS: ${dna.materials.join(", ")}.`,
    
    // Paisagismo
    `PAISAGISMO: ${dna.landscaping}.`,
    
    // Layout
    `LAYOUT: ${dna.layout}.`,
    
    // Contexto
    `CONTEXTO: ${dna.context}.`
  ];
  
  return parts.join(" ");
}

/**
 * Gera prompt específico para cada tipo de visualização
 * mantendo o DNA consistente
 */
export function generateConsistentPrompt(
  dna: ProjectDNA,
  visualizationType: "conceptual" | "floorplan" | "siteplan" | "facade" | "section",
  additionalContext?: string
): string {
  const baseDNA = dnaToPromptDescription(dna);
  
  let specificInstructions = "";
  
  switch (visualizationType) {
    case "conceptual":
      specificInstructions = "VISUALIZAÇÃO: Perspectiva isométrica 3D, vista superior a 45°, mostrando volumetria completa do edifício, pátio central, estacionamento frontal com carros, paisagismo integrado, contexto urbano com edifícios vizinhos. Renderização realista com iluminação natural diurna, céu azul com nuvens, sombras suaves.";
      break;
      
    case "floorplan":
      specificInstructions = "VISUALIZAÇÃO: Planta baixa técnica em vista superior ortogonal, com cotas principais, distribuição de ambientes, circulação, mobiliário esquemático. Cores técnicas: azul claro para áreas comerciais, cinza para circulação, branco para pátio. Escala gráfica, norte, legenda.";
      break;
      
    case "siteplan":
      specificInstructions = "VISUALIZAÇÃO: Planta de implantação técnica em vista superior ortogonal, mostrando edifício, estacionamento com demarcação de vagas, paisagismo (árvores em planta), calçadas, acessos. Cores: azul para edifício, cinza para asfalto, verde para vegetação. Cotas de recuos, escala gráfica, norte.";
      break;
      
    case "facade":
      specificInstructions = "VISUALIZAÇÃO: Vista frontal em perspectiva cônica, nível do olho (1,60m de altura), mostrando fachada principal com detalhes arquitetônicos, vitrines, marquise, paisagismo frontal com árvores, estacionamento em primeiro plano com carros, céu realista azul com nuvens, iluminação natural diurna.";
      break;
      
    case "section":
      specificInstructions = "VISUALIZAÇÃO: Corte longitudinal técnico, mostrando pé-direito de todos os pavimentos, estrutura, mezanino (se houver), escada, cobertura, fundação esquemática. Escala humana para referência, cotas de altura, materiais indicados, legenda.";
      break;
  }
  
  const fullPrompt = `${baseDNA} ${specificInstructions}`;
  
  if (additionalContext) {
    return `${fullPrompt} ${additionalContext}`;
  }
  
  return fullPrompt;
}

/**
 * Valida se uma imagem gerada está consistente com o DNA do projeto
 * (Esta função seria expandida com análise de imagem via IA)
 */
export function validateImageConsistency(
  dna: ProjectDNA,
  imageType: string,
  imageUrl: string
): {
  isConsistent: boolean;
  issues: string[];
  suggestions: string[];
} {
  // Por enquanto, retorna estrutura básica
  // TODO: Implementar análise de imagem com IA para detectar divergências
  
  return {
    isConsistent: true,
    issues: [],
    suggestions: []
  };
}

/**
 * Gera checklist de elementos que devem estar presentes
 * em cada tipo de visualização
 */
export function getVisualizationChecklist(
  visualizationType: "conceptual" | "floorplan" | "siteplan" | "facade" | "section"
): string[] {
  const commonElements = [
    "Volumetria consistente com DNA",
    "Cores consistentes (branco + cinza)",
    "Estilo arquitetônico consistente"
  ];
  
  const specificElements: Record<string, string[]> = {
    conceptual: [
      ...commonElements,
      "Perspectiva isométrica 3D",
      "Pátio central visível",
      "Estacionamento com carros",
      "Paisagismo (árvores)",
      "Contexto urbano",
      "Iluminação natural diurna"
    ],
    floorplan: [
      ...commonElements,
      "Vista superior ortogonal",
      "Distribuição de ambientes",
      "Cotas principais",
      "Cores técnicas (azul/cinza/branco)",
      "Escala gráfica",
      "Norte indicado"
    ],
    siteplan: [
      ...commonElements,
      "Vista superior ortogonal",
      "Edifício + estacionamento",
      "Demarcação de vagas",
      "Paisagismo em planta",
      "Recuos cotados",
      "Escala gráfica"
    ],
    facade: [
      ...commonElements,
      "Perspectiva nível do olho",
      "Detalhes arquitetônicos",
      "Paisagismo frontal",
      "Estacionamento em primeiro plano",
      "Céu realista",
      "Iluminação natural"
    ],
    section: [
      ...commonElements,
      "Corte técnico",
      "Pé-direito de todos os pavimentos",
      "Estrutura visível",
      "Escala humana",
      "Cotas de altura",
      "Materiais indicados"
    ]
  };
  
  return specificElements[visualizationType] || commonElements;
}
