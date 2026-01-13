/**
 * Script para gerar imagens dos projetos exemplo da galeria
 * Gera: estudo conceitual, planta baixa, corte longitudinal e corte transversal
 */
import { drizzle } from 'drizzle-orm/mysql2';
import { exampleProjects } from '../drizzle/schema';
import { generateImage } from './_core/imageGeneration';
import { buildProjectContextFromData } from './services/projectContextHelper';

const db = drizzle(process.env.DATABASE_URL!);

interface ExampleProject {
  id: number;
  name: string;
  category: string;
  landArea: string;
  builtArea: string;
  numberOfStores: number;
  parkingSpaces: number;
  dnaBuildingShape: string;
  dnaStyle: string;
  dnaFeatures: string;
  dnaPrimaryColor: string;
  dnaAccentColor: string;
  dnaMaterials: string;
  dnaLandscaping: string;
  dnaLayout: string;
  dnaContext: string;
  occupancyRate: string;
  frontSetback: string;
  sideSetback: string;
  backSetback: string;
}

async function generateConceptualImage(project: ExampleProject) {
  console.log(`\n🎨 Gerando estudo conceitual para: ${project.name}`);
  
  const context = buildProjectContextFromData(
    {
      id: project.id,
      name: project.name,
      briefing: `${project.category} - ${project.dnaStyle}`,
      area: parseInt(project.landArea),
      taxaOcupacao: Math.round(parseFloat(project.occupancyRate) * 100),
      recuoFrontal: parseInt(project.frontSetback),
      recuoLateral: parseInt(project.sideSetback),
      recuoFundos: parseInt(project.backSetback),
    },
    {
      areaMaximaConstruida: parseInt(project.builtArea),
      numeroLojas: project.numberOfStores,
      numeroVagas: project.parkingSpaces,
    },
    {
      buildingShape: project.dnaBuildingShape,
      floors: 1,
      roofType: 'Laje plana impermeabilizada',
      style: project.dnaStyle,
      features: JSON.parse(project.dnaFeatures),
      primaryColor: project.dnaPrimaryColor,
      accentColor: project.dnaAccentColor,
      materials: JSON.parse(project.dnaMaterials),
      landscaping: project.dnaLandscaping,
      layout: project.dnaLayout,
      context: project.dnaContext,
    }
  );

  const prompt = `Professional architectural rendering of a ${project.dnaStyle} strip mall commercial development.

${context.dna}

${context.criticalRequirements}

VISUAL SPECIFICATIONS:
- Aerial 3/4 perspective view showing the entire complex
- Golden hour lighting (warm sunlight, long shadows)
- Photorealistic rendering with ray-tracing
- 8K resolution, depth of field effect
- Show parking lot with cars, pedestrians, landscaping
- Brazilian urban context with tropical vegetation
- Clear visibility of all architectural features

Style: Photorealistic architectural visualization, professional presentation quality`;

  try {
    const result = await generateImage({ prompt });
    console.log(`✅ Estudo conceitual gerado: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error(`❌ Erro ao gerar estudo conceitual:`, error);
    return null;
  }
}

async function generateFloorplanImage(project: ExampleProject) {
  console.log(`\n📐 Gerando planta baixa para: ${project.name}`);
  
  const context = buildProjectContextFromData(
    {
      id: project.id,
      name: project.name,
      briefing: `${project.category} - ${project.dnaStyle}`,
      area: parseInt(project.landArea),
      taxaOcupacao: Math.round(parseFloat(project.occupancyRate) * 100),
      recuoFrontal: parseInt(project.frontSetback),
      recuoLateral: parseInt(project.sideSetback),
      recuoFundos: parseInt(project.backSetback),
    },
    {
      areaMaximaConstruida: parseInt(project.builtArea),
      numeroLojas: project.numberOfStores,
      numeroVagas: project.parkingSpaces,
    },
    {
      buildingShape: project.dnaBuildingShape,
      floors: 1,
      roofType: 'Laje plana impermeabilizada',
      style: project.dnaStyle,
      features: JSON.parse(project.dnaFeatures),
      primaryColor: project.dnaPrimaryColor,
      accentColor: project.dnaAccentColor,
      materials: JSON.parse(project.dnaMaterials),
      landscaping: project.dnaLandscaping,
      layout: project.dnaLayout,
      context: project.dnaContext,
    }
  );

  const prompt = `Technical architectural floor plan of a ${project.dnaStyle} strip mall following ABNT NBR 6492 standards.

${context.dna}

${context.criticalRequirements}

TECHNICAL SPECIFICATIONS:
- Top view, orthogonal projection
- Show ${project.numberOfStores} commercial units with dimensions
- Include parking layout with ${project.parkingSpaces} spaces
- Dimension lines with measurements in meters
- Architectural symbols (doors, windows, columns)
- Legend with materials and finishes
- Scale 1:200 or 1:250
- Professional technical drawing style
- Black lines on white background
- Clear labels for all spaces

Style: Professional architectural technical drawing, ABNT standards`;

  try {
    const result = await generateImage({ prompt });
    console.log(`✅ Planta baixa gerada: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error(`❌ Erro ao gerar planta baixa:`, error);
    return null;
  }
}

async function generateLongitudinalSection(project: ExampleProject) {
  console.log(`\n📏 Gerando corte longitudinal para: ${project.name}`);
  
  const context = buildProjectContextFromData(
    {
      id: project.id,
      name: project.name,
      briefing: `${project.category} - ${project.dnaStyle}`,
      area: parseInt(project.landArea),
      taxaOcupacao: Math.round(parseFloat(project.occupancyRate) * 100),
      recuoFrontal: parseInt(project.frontSetback),
      recuoLateral: parseInt(project.sideSetback),
      recuoFundos: parseInt(project.backSetback),
    },
    {
      areaMaximaConstruida: parseInt(project.builtArea),
      numeroLojas: project.numberOfStores,
      numeroVagas: project.parkingSpaces,
    },
    {
      buildingShape: project.dnaBuildingShape,
      floors: 1,
      roofType: 'Laje plana impermeabilizada',
      style: project.dnaStyle,
      features: JSON.parse(project.dnaFeatures),
      primaryColor: project.dnaPrimaryColor,
      accentColor: project.dnaAccentColor,
      materials: JSON.parse(project.dnaMaterials),
      landscaping: project.dnaLandscaping,
      layout: project.dnaLayout,
      context: project.dnaContext,
    }
  );

  const prompt = `Longitudinal architectural section of a ${project.dnaStyle} strip mall following ABNT NBR 6492 standards.

${context.dna}

${context.criticalRequirements}

TECHNICAL SPECIFICATIONS:
- Longitudinal cut showing full length of building
- Ground level (±0.00), floor level (+0.15), ceiling height (+3.50m), roof (+5.00m)
- Show internal spaces: stores, circulation, service areas
- Dimension lines with heights in meters
- Material hatching (concrete, steel, glass)
- Foundation details
- Roof structure and drainage
- Scale 1:100 or 1:200
- Professional technical drawing style
- Black lines on white background

Style: Professional architectural section drawing, ABNT standards`;

  try {
    const result = await generateImage({ prompt });
    console.log(`✅ Corte longitudinal gerado: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error(`❌ Erro ao gerar corte longitudinal:`, error);
    return null;
  }
}

async function generateTransversalSection(project: ExampleProject) {
  console.log(`\n📏 Gerando corte transversal para: ${project.name}`);
  
  const context = buildProjectContextFromData(
    {
      id: project.id,
      name: project.name,
      briefing: `${project.category} - ${project.dnaStyle}`,
      area: parseInt(project.landArea),
      taxaOcupacao: Math.round(parseFloat(project.occupancyRate) * 100),
      recuoFrontal: parseInt(project.frontSetback),
      recuoLateral: parseInt(project.sideSetback),
      recuoFundos: parseInt(project.backSetback),
    },
    {
      areaMaximaConstruida: parseInt(project.builtArea),
      numeroLojas: project.numberOfStores,
      numeroVagas: project.parkingSpaces,
    },
    {
      buildingShape: project.dnaBuildingShape,
      floors: 1,
      roofType: 'Laje plana impermeabilizada',
      style: project.dnaStyle,
      features: JSON.parse(project.dnaFeatures),
      primaryColor: project.dnaPrimaryColor,
      accentColor: project.dnaAccentColor,
      materials: JSON.parse(project.dnaMaterials),
      landscaping: project.dnaLandscaping,
      layout: project.dnaLayout,
      context: project.dnaContext,
    }
  );

  const prompt = `Transversal architectural section of a ${project.dnaStyle} strip mall following ABNT NBR 6492 standards.

${context.dna}

${context.criticalRequirements}

TECHNICAL SPECIFICATIONS:
- Transversal cut showing building width
- Ground level (±0.00), floor level (+0.15), ceiling height (+3.50m), roof (+5.00m)
- Show facade details, structure, interior spaces
- Dimension lines with heights and widths in meters
- Material hatching (walls, roof, foundation)
- Structural elements (columns, beams)
- Scale 1:100 or 1:200
- Professional technical drawing style
- Black lines on white background

Style: Professional architectural section drawing, ABNT standards`;

  try {
    const result = await generateImage({ prompt });
    console.log(`✅ Corte transversal gerado: ${result.url}`);
    return result.url;
  } catch (error) {
    console.error(`❌ Erro ao gerar corte transversal:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando geração de imagens para projetos exemplo...\n');
  
  // Buscar os 6 projetos exemplo
  const projects = await db.select().from(exampleProjects).limit(6);
  
  console.log(`📋 Encontrados ${projects.length} projetos exemplo\n`);
  
  for (const project of projects) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Projeto: ${project.name}`);
    console.log(`📊 Categoria: ${project.category}`);
    console.log(`📐 Área: ${project.landArea}m² | Lojas: ${project.numberOfStores} | Vagas: ${project.parkingSpaces}`);
    console.log(`${'='.repeat(60)}`);
    
    // Gerar 4 imagens para cada projeto
    await generateConceptualImage(project);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s entre gerações
    
    await generateFloorplanImage(project);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await generateLongitudinalSection(project);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await generateTransversalSection(project);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`\n✅ Todas as imagens geradas para: ${project.name}`);
  }
  
  console.log('\n\n🎉 Geração de imagens concluída!');
  console.log(`📊 Total: ${projects.length} projetos × 4 imagens = ${projects.length * 4} imagens geradas`);
}

main().catch(console.error);
