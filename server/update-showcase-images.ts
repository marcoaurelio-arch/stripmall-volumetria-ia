/**
 * Script para atualizar URLs das imagens geradas nos projetos exemplo
 */
import { drizzle } from 'drizzle-orm/mysql2';
import { exampleProjects } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';

const db = drizzle(process.env.DATABASE_URL!);

// Ler log de geração para extrair URLs
const logContent = fs.readFileSync('/tmp/generate-images.log', 'utf-8');

// Extrair URLs por projeto
const imagesByProject: Record<string, {
  conceptual?: string;
  floorplan?: string;
  longitudinal?: string;
  transversal?: string;
}> = {};

const lines = logContent.split('\n');
let currentProject = '';

for (const line of lines) {
  // Detectar início de novo projeto
  if (line.includes('📦 Projeto:')) {
    currentProject = line.split('📦 Projeto:')[1].trim();
    imagesByProject[currentProject] = {};
  }
  
  // Extrair URLs das imagens
  if (line.includes('✅ Estudo conceitual gerado:')) {
    const url = line.split('✅ Estudo conceitual gerado:')[1].trim();
    imagesByProject[currentProject].conceptual = url;
  }
  if (line.includes('✅ Planta baixa gerada:')) {
    const url = line.split('✅ Planta baixa gerada:')[1].trim();
    imagesByProject[currentProject].floorplan = url;
  }
  if (line.includes('✅ Corte longitudinal gerado:')) {
    const url = line.split('✅ Corte longitudinal gerado:')[1].trim();
    imagesByProject[currentProject].longitudinal = url;
  }
  if (line.includes('✅ Corte transversal gerado:')) {
    const url = line.split('✅ Corte transversal gerado:')[1].trim();
    imagesByProject[currentProject].transversal = url;
  }
}

async function updateProjectImages() {
  console.log('🔄 Atualizando URLs das imagens nos projetos exemplo...\n');
  
  for (const [projectName, images] of Object.entries(imagesByProject)) {
    console.log(`📦 ${projectName}`);
    console.log(`   🎨 Conceitual: ${images.conceptual ? '✅' : '❌'}`);
    console.log(`   📐 Planta: ${images.floorplan ? '✅' : '❌'}`);
    console.log(`   📏 Corte Long: ${images.longitudinal ? '✅' : '❌'}`);
    console.log(`   📏 Corte Trans: ${images.transversal ? '✅' : '❌'}`);
    
    // Atualizar no banco de dados
    try {
      await db
        .update(exampleProjects)
        .set({
          conceptualImageUrl: images.conceptual || null,
          floorplanImageUrl: images.floorplan || null,
          sectionImageUrl: images.longitudinal || null, // Usando corte longitudinal como principal
          thumbnailUrl: images.conceptual || '', // Usar conceitual como thumbnail
        })
        .where(eq(exampleProjects.name, projectName));
      
      console.log(`   ✅ Atualizado no banco de dados\n`);
    } catch (error) {
      console.error(`   ❌ Erro ao atualizar: ${error}\n`);
    }
  }
  
  console.log('🎉 Atualização concluída!');
  console.log(`📊 Total: ${Object.keys(imagesByProject).length} projetos atualizados`);
}

updateProjectImages().catch(console.error);
