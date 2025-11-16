/**
 * Serviço de Tour Virtual 360°
 * 
 * Gera imagens panorâmicas equirectangulares para visualização imersiva
 */

import { generateImage } from '../_core/imageGeneration';

export interface Viewpoint {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  position: {
    pitch: number; // ângulo vertical (-90 a 90)
    yaw: number; // ângulo horizontal (0 a 360)
  };
  hotspots?: Hotspot[];
}

export interface Hotspot {
  id: string;
  pitch: number;
  yaw: number;
  type: 'info' | 'scene'; // info = informação, scene = navegar para outro viewpoint
  text: string;
  targetSceneId?: string; // ID do viewpoint de destino (se type = 'scene')
}

export interface VirtualTour {
  projectId: number;
  scenes: Viewpoint[];
  defaultScene: string; // ID do viewpoint inicial
}

/**
 * Gera imagem panorâmica 360° equirectangular
 */
export async function generatePanorama360(
  projectName: string,
  projectDescription: string,
  terrainArea: number,
  viewpointName: string,
  viewpointDescription: string,
  geometryDescription: string,
  briefing?: string
): Promise<string> {
  // Prompt otimizado para gerar imagem equirectangular 360°
  const prompt = `Create a 360-degree equirectangular panoramic view of a strip mall commercial development project.

PROJECT DETAILS:
- Name: ${projectName}
- Description: ${projectDescription}
- Terrain area: ${terrainArea}m²
- Viewpoint: ${viewpointName}
- ${viewpointDescription}

TERRAIN GEOMETRY:
${geometryDescription}

${briefing ? `PROJECT BRIEFING:\n${briefing}\n` : ''}

TECHNICAL REQUIREMENTS FOR 360° EQUIRECTANGULAR PANORAMA:
- Image format: Equirectangular projection (2:1 aspect ratio)
- Field of view: Complete 360° horizontal × 180° vertical
- Seamless wrapping at edges (left edge connects to right edge)
- No visible seams or distortions at the poles
- Consistent lighting and shadows across the entire panorama
- Horizon line at the vertical center of the image

ARCHITECTURAL STYLE:
- Modern Brazilian strip mall architecture
- Clean lines and contemporary design
- Mixed-use commercial spaces with retail storefronts
- Visible parking areas with marked spaces
- Landscaping with tropical vegetation (palm trees, native plants)
- Pedestrian walkways and accessibility features
- Signage and wayfinding elements

VIEWPOINT CHARACTERISTICS:
- ${viewpointName}: ${viewpointDescription}
- Natural perspective appropriate for the viewpoint
- Realistic depth and scale
- Clear visibility of key architectural features

ENVIRONMENT:
- Brazilian urban/suburban context
- Clear blue sky with few clouds
- Warm natural lighting (golden hour preferred)
- Surrounding context: streets, neighboring buildings, vegetation
- Realistic shadows and reflections

QUALITY:
- Photorealistic rendering
- High detail and clarity
- Professional architectural visualization
- 8K resolution quality
- HDR lighting

The panorama should be immersive and allow viewers to feel present in the space, with accurate spatial relationships and realistic proportions.`;

  try {
    const { url } = await generateImage({ prompt });
    if (!url) {
      throw new Error('URL da imagem não retornada');
    }
    return url;
  } catch (error) {
    console.error('Erro ao gerar panorama 360°:', error);
    throw new Error('Falha ao gerar imagem panorâmica 360°');
  }
}

/**
 * Gera tour virtual completo com múltiplos viewpoints
 */
export async function generateVirtualTour(
  projectId: number,
  projectName: string,
  projectDescription: string,
  terrainArea: number,
  geometryDescription: string,
  briefing?: string
): Promise<VirtualTour> {
  // Definir viewpoints estratégicos para o tour
  const viewpointDefinitions = [
    {
      id: 'entrance',
      name: 'Entrada Principal',
      description: 'Vista panorâmica da entrada principal do strip mall, mostrando fachada frontal, estacionamento e acesso de pedestres',
      position: { pitch: 0, yaw: 0 }
    },
    {
      id: 'parking',
      name: 'Estacionamento',
      description: 'Vista do estacionamento mostrando layout de vagas, circulação de veículos e acessos ao edifício',
      position: { pitch: -10, yaw: 180 }
    },
    {
      id: 'facade',
      name: 'Fachada Lateral',
      description: 'Vista lateral do edifício mostrando extensão das lojas, vitrines e detalhes arquitetônicos',
      position: { pitch: 0, yaw: 90 }
    },
    {
      id: 'aerial',
      name: 'Vista Aérea',
      description: 'Vista aérea panorâmica mostrando implantação completa, cobertura, áreas verdes e contexto urbano',
      position: { pitch: 45, yaw: 45 }
    }
  ];

  const scenes: Viewpoint[] = [];

  // Gerar panoramas para cada viewpoint
  for (const viewDef of viewpointDefinitions) {
    try {
      console.log(`Gerando panorama 360° para viewpoint: ${viewDef.name}`);
      
      const imageUrl = await generatePanorama360(
        projectName,
        projectDescription,
        terrainArea,
        viewDef.name,
        viewDef.description,
        geometryDescription,
        briefing || undefined
      );

      // Criar hotspots para navegação entre viewpoints
      const hotspots: Hotspot[] = viewpointDefinitions
        .filter(v => v.id !== viewDef.id)
        .map((targetView, index) => ({
          id: `hotspot-${viewDef.id}-to-${targetView.id}`,
          pitch: 0,
          yaw: index * 90, // Distribuir hotspots em 90° de intervalo
          type: 'scene' as const,
          text: `Ir para ${targetView.name}`,
          targetSceneId: targetView.id
        }));

      // Adicionar hotspot informativo sobre o viewpoint atual
      hotspots.push({
        id: `info-${viewDef.id}`,
        pitch: 10,
        yaw: 0,
        type: 'info' as const,
        text: viewDef.description
      });

      scenes.push({
        id: viewDef.id,
        name: viewDef.name,
        description: viewDef.description,
        imageUrl,
        position: viewDef.position,
        hotspots
      });

      console.log(`✓ Panorama gerado: ${viewDef.name}`);
    } catch (error) {
      console.error(`Erro ao gerar panorama ${viewDef.name}:`, error);
      // Continuar gerando outros viewpoints mesmo se um falhar
    }
  }

  if (scenes.length === 0) {
    throw new Error('Falha ao gerar qualquer panorama 360°');
  }

  return {
    projectId,
    scenes,
    defaultScene: 'entrance' // Começar pela entrada
  };
}

/**
 * Gera um único panorama 360° personalizado
 */
export async function generateCustomPanorama(
  projectName: string,
  projectDescription: string,
  terrainArea: number,
  geometryDescription: string,
  viewpointName: string,
  viewpointDescription: string,
  briefing?: string
): Promise<string> {
  return generatePanorama360(
    projectName,
    projectDescription,
    terrainArea,
    viewpointName,
    viewpointDescription,
    geometryDescription,
    briefing
  );
}
