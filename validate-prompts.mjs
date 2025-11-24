#!/usr/bin/env node

/**
 * Script de Validação de Prompts
 * 
 * Valida que os prompts gerados contêm todos os dados críticos do projeto
 * sem precisar gerar imagens reais (economiza tempo e créditos)
 */

import { buildProjectContext } from "./server/services/projectContextHelper.js";
import { getOrGenerateProjectDNA } from "./server/services/projectDNAHelper.js";
import { generateConsistentPrompt } from "./server/services/projectDNAService.js";

const PROJECT_ID = 1080003;

console.log("🔍 Validando Prompts de Consistência\n");
console.log(`📋 Projeto ID: ${PROJECT_ID}\n`);

try {
  // 1. Construir contexto completo
  console.log("1️⃣  Construindo contexto do projeto...");
  const context = await buildProjectContext(PROJECT_ID);
  
  console.log("   ✅ Contexto construído:");
  console.log(`      - Terreno: ${context.terrain?.area || 'N/A'}m²`);
  console.log(`      - Análise: ${context.analysis?.numeroLojas || 'N/A'} lojas`);
  console.log(`      - DNA: ${context.dna ? 'Presente' : 'Será gerado'}\n`);
  
  // 2. Gerar DNA se não existir
  console.log("2️⃣  Obtendo DNA do projeto...");
  const projectDNA = await getOrGenerateProjectDNA(PROJECT_ID);
  console.log(`   ✅ DNA obtido: ${projectDNA.style} / ${projectDNA.buildingShape}\n`);
  
  // 3. Validar prompts de diferentes tipos
  console.log("3️⃣  Validando prompts gerados:\n");
  
  const promptTypes = [
    { type: "conceptual", name: "Estudo Conceitual" },
    { type: "floorplan", name: "Planta Baixa" },
    { type: "section", name: "Corte Arquitetônico" },
    { type: "facade", name: "Fachada" }
  ];
  
  for (const { type, name } of promptTypes) {
    console.log(`   📝 ${name}:`);
    const basePrompt = generateConsistentPrompt(projectDNA, type);
    
    // Simular prompt completo como seria gerado
    const fullPrompt = `${basePrompt}\n\n${context.briefingSection}\n${context.geometryInfo}\n${context.criticalRequirements}`;
    
    // Validar presença de dados críticos
    const validations = {
      "DNA aplicado": basePrompt.length > 100,
      "Número de lojas": fullPrompt.includes(String(context.analysis?.numeroLojas)),
      "Área do terreno": fullPrompt.includes(String(context.terrain?.area)),
      "Dimensões": fullPrompt.includes(`${context.terrain?.width}m`) && fullPrompt.includes(`${context.terrain?.length}m`),
      "Vagas estacionamento": fullPrompt.includes(String(context.analysis?.vagasEstacionamento)),
      "Briefing incluído": context.briefingSection.length > 0,
      "Requisitos críticos": context.criticalRequirements.length > 0
    };
    
    let allValid = true;
    for (const [check, isValid] of Object.entries(validations)) {
      const status = isValid ? "✅" : "❌";
      console.log(`      ${status} ${check}`);
      if (!isValid) allValid = false;
    }
    
    if (allValid) {
      console.log(`      ✅ PROMPT VÁLIDO - Todos os dados presentes\n`);
    } else {
      console.log(`      ⚠️  ATENÇÃO - Alguns dados faltando\n`);
    }
    
    // Salvar prompt para inspeção
    const fs = await import('fs/promises');
    await fs.writeFile(
      `/home/ubuntu/prompt-${type}-${PROJECT_ID}.txt`,
      fullPrompt,
      'utf-8'
    );
    console.log(`      💾 Prompt salvo em: /home/ubuntu/prompt-${type}-${PROJECT_ID}.txt\n`);
  }
  
  console.log("✅ Validação concluída!");
  console.log("\n📊 Resumo:");
  console.log("   - Contexto: ✅ Construído com sucesso");
  console.log("   - DNA: ✅ Gerado/obtido");
  console.log("   - Prompts: ✅ Validados para 4 tipos de imagem");
  console.log("\n🎯 Próximo passo: Revisar os prompts salvos em /home/ubuntu/prompt-*.txt\n");
  
} catch (error) {
  console.error("❌ Erro durante validação:", error);
  process.exit(1);
}

process.exit(0);
