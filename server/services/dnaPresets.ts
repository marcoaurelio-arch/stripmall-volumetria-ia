import { ProjectDNA } from "./projectDNAService";

/**
 * DNA Preset - Estilo arquitetônico pré-configurado
 */
export interface DNAPreset {
  id: string;
  name: string;
  description: string;
  category: "moderno" | "tropical" | "industrial" | "classico" | "sustentavel";
  thumbnail?: string; // URL da imagem de preview
  dna: Omit<ProjectDNA, "buildingShape" | "floors" | "roofType">; // Mantém volumetria do projeto original
}

/**
 * Galeria de DNAs pré-configurados
 */
export const DNA_PRESETS: DNAPreset[] = [
  {
    id: "moderno-minimalista",
    name: "Moderno Minimalista",
    description: "Linhas limpas, volumes puros, paleta neutra. Ideal para projetos contemporâneos sofisticados.",
    category: "moderno",
    dna: {
      style: "Minimalista contemporâneo comercial",
      features: [
        "Linhas horizontais marcadas",
        "Volumes puros e geométricos",
        "Fachada contínua com ritmo",
        "Transparência nas vitrines",
        "Marquise de proteção minimalista",
      ],
      primaryColor: "#FFFFFF",
      accentColor: "#2C2C2C",
      materials: [
        "Concreto aparente",
        "Vidro temperado",
        "Alumínio anodizado",
        "Revestimento branco",
      ],
      landscaping: "Jardins lineares com vegetação baixa, árvores isoladas, piso em concreto polido",
      layout: "Pátio central aberto com lojas ao redor, circulação ampla e fluida",
      context: "Contexto urbano moderno, edifícios baixos ao redor, céu limpo",
    },
  },
  {
    id: "tropical-brasileiro",
    name: "Tropical Brasileiro",
    description: "Cores vibrantes, vegetação exuberante, cobogós. Celebra a arquitetura brasileira.",
    category: "tropical",
    dna: {
      style: "Tropical brasileiro contemporâneo",
      features: [
        "Cobogós e elementos vazados",
        "Cores quentes e vibrantes",
        "Integração com vegetação",
        "Varandas e áreas sombreadas",
        "Brises verticais em madeira",
      ],
      primaryColor: "#F5E6D3",
      accentColor: "#D2691E",
      materials: [
        "Madeira de demolição",
        "Tijolo aparente",
        "Cobogó cerâmico",
        "Telha cerâmica",
      ],
      landscaping: "Vegetação tropical exuberante, palmeiras imperiais, jardins verticais, piso em pedra portuguesa",
      layout: "Pátio central com fonte d'água, lojas com varandas, circulação coberta",
      context: "Contexto tropical, vegetação densa, céu azul com nuvens, clima quente",
    },
  },
  {
    id: "industrial-urbano",
    name: "Industrial Urbano",
    description: "Estética industrial, materiais brutos, estrutura exposta. Urbano e autêntico.",
    category: "industrial",
    dna: {
      style: "Industrial urbano contemporâneo",
      features: [
        "Estrutura metálica exposta",
        "Tijolos aparentes",
        "Grandes vãos envidraçados",
        "Tubulações e conduítes expostos",
        "Iluminação industrial pendente",
      ],
      primaryColor: "#4A4A4A",
      accentColor: "#C84B31",
      materials: [
        "Aço corten",
        "Tijolo aparente",
        "Concreto bruto",
        "Vidro industrial",
      ],
      landscaping: "Vegetação urbana resistente, árvores nativas, piso em concreto com juntas de dilatação",
      layout: "Layout aberto tipo galpão, pé-direito alto, mezaninos, circulação livre",
      context: "Contexto urbano industrial, edifícios de tijolo ao redor, atmosfera urbana",
    },
  },
  {
    id: "contemporaneo-sofisticado",
    name: "Contemporâneo Sofisticado",
    description: "Elegância atemporal, materiais nobres, iluminação cênica. Alto padrão.",
    category: "moderno",
    dna: {
      style: "Contemporâneo sofisticado de alto padrão",
      features: [
        "Fachada em pedra natural",
        "Iluminação cênica integrada",
        "Detalhes em metal dourado",
        "Pé-direito duplo no acesso",
        "Paisagismo escultural",
      ],
      primaryColor: "#E8E8E8",
      accentColor: "#8B7355",
      materials: [
        "Mármore travertino",
        "Vidro laminado",
        "Metal dourado escovado",
        "Madeira nobre",
      ],
      landscaping: "Jardins esculturais com topiaria, espelhos d'água, iluminação cênica, piso em pedra natural",
      layout: "Pátio central com pé-direito duplo, lojas com vitrines elegantes, circulação ampla",
      context: "Contexto urbano sofisticado, edifícios de alto padrão ao redor, iluminação noturna",
    },
  },
  {
    id: "sustentavel-bioclimatico",
    name: "Sustentável Bioclimático",
    description: "Eficiência energética, ventilação natural, telhado verde. Arquitetura responsável.",
    category: "sustentavel",
    dna: {
      style: "Sustentável bioclimático",
      features: [
        "Telhado verde extensivo",
        "Ventilação cruzada natural",
        "Captação de água da chuva",
        "Painéis fotovoltaicos integrados",
        "Brises automatizados",
      ],
      primaryColor: "#E8F5E9",
      accentColor: "#558B2F",
      materials: [
        "Madeira certificada",
        "Bambu laminado",
        "Concreto com agregados reciclados",
        "Vidro duplo low-e",
      ],
      landscaping: "Telhado verde, jardins de chuva, horta comunitária, árvores nativas, piso permeável",
      layout: "Pátio central com ventilação natural, lojas com iluminação zenital, circulação sombreada",
      context: "Contexto verde, vegetação nativa, céu com nuvens, integração com natureza",
    },
  },
  {
    id: "comercial-classico",
    name: "Comercial Clássico",
    description: "Arquitetura tradicional, simetria, elementos decorativos. Elegância atemporal.",
    category: "classico",
    dna: {
      style: "Comercial clássico tradicional",
      features: [
        "Simetria na fachada",
        "Pilares e colunas decorativas",
        "Cornijas e molduras",
        "Arcos e arcadas",
        "Iluminação em luminárias clássicas",
      ],
      primaryColor: "#FAF0E6",
      accentColor: "#8B4513",
      materials: [
        "Pedra natural",
        "Tijolo cerâmico",
        "Madeira entalhada",
        "Ferro forjado",
      ],
      landscaping: "Jardins formais simétricos, topiaria clássica, fontes ornamentais, piso em pedra portuguesa",
      layout: "Pátio central com fonte, lojas com arcadas, circulação coberta por pérgolas",
      context: "Contexto urbano tradicional, edifícios históricos ao redor, atmosfera clássica",
    },
  },
  {
    id: "tech-futurista",
    name: "Tech Futurista",
    description: "Formas orgânicas, tecnologia integrada, iluminação LED. Visão do futuro.",
    category: "moderno",
    dna: {
      style: "Tech futurista de alta tecnologia",
      features: [
        "Formas curvas e orgânicas",
        "Fachada com LED integrado",
        "Painéis digitais interativos",
        "Estrutura paramétrica",
        "Iluminação RGB programável",
      ],
      primaryColor: "#F0F0F0",
      accentColor: "#00BCD4",
      materials: [
        "Painel compósito metálico",
        "Vidro inteligente",
        "Concreto de ultra-alto desempenho",
        "LED integrado",
      ],
      landscaping: "Jardins verticais automatizados, iluminação LED colorida, piso em resina epóxi",
      layout: "Pátio central com formas orgânicas, lojas com fachadas curvas, circulação fluida",
      context: "Contexto urbano futurista, edifícios de vidro ao redor, iluminação noturna colorida",
    },
  },
  {
    id: "rustico-acolhedor",
    name: "Rústico Acolhedor",
    description: "Madeira natural, pedra, atmosfera calorosa. Conforto e aconchego.",
    category: "classico",
    dna: {
      style: "Rústico acolhedor contemporâneo",
      features: [
        "Madeira natural aparente",
        "Pedra natural nas paredes",
        "Telhado em telha cerâmica",
        "Varandas com guarda-corpo em madeira",
        "Iluminação quente acolhedora",
      ],
      primaryColor: "#DEB887",
      accentColor: "#8B4513",
      materials: [
        "Madeira de reflorestamento",
        "Pedra natural regional",
        "Telha cerâmica",
        "Ferro rústico",
      ],
      landscaping: "Jardins campestres, árvores frutíferas, horta ornamental, piso em pedra irregular",
      layout: "Pátio central com pérgola, lojas com varandas, circulação coberta",
      context: "Contexto rural/suburbano, vegetação nativa, céu azul, atmosfera tranquila",
    },
  },
];

/**
 * Busca preset por ID
 */
export function getPresetById(id: string): DNAPreset | undefined {
  return DNA_PRESETS.find((preset) => preset.id === id);
}

/**
 * Busca presets por categoria
 */
export function getPresetsByCategory(
  category: DNAPreset["category"]
): DNAPreset[] {
  return DNA_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Aplica preset ao DNA do projeto, mantendo volumetria original
 */
export function applyPresetToDNA(
  currentDNA: ProjectDNA,
  preset: DNAPreset
): ProjectDNA {
  return {
    // Mantém volumetria original do projeto
    buildingShape: currentDNA.buildingShape,
    floors: currentDNA.floors,
    roofType: currentDNA.roofType,
    
    // Aplica estilo do preset
    ...preset.dna,
  };
}
