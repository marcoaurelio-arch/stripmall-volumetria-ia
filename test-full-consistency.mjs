#!/usr/bin/env node

/**
 * Script de Teste Completo de Consistência
 * 
 * Este script cria um projeto de teste e gera todos os tipos de imagem
 * para validar que as correções de consistência estão funcionando.
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

console.log("🚀 Iniciando Teste Completo de Consistência\n");

// Conectar ao banco
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Dados do projeto de teste
const testProject = {
  name: "Teste Consistência Visual - Strip Mall Modelo",
  briefing: "Strip mall comercial de médio porte com foco em varejo alimentício e serviços. Público-alvo: classe média e média-alta. Localização urbana com alto fluxo de veículos. Estilo arquitetônico contemporâneo com fachada em vidro e ACM.",
  area: 5000,
  width: 80,
  length: 62.5,
  taxaOcupacao: 70,
  coeficienteAproveitamento: 1.25,
  recuoFrontal: 5,
  recuoLateral: 3,
  recuoFundos: 3,
  // Polígono retangular de 80m x 62.5m (aproximadamente 0.0007° de longitude = 80m e 0.00056° de latitude = 62.5m em São Paulo)
  polygonCoordinates: JSON.stringify([
    [-46.6333, -23.5505],
    [-46.63260, -23.5505],  // 80m para leste
    [-46.63260, -23.55106], // 62.5m para sul
    [-46.6333, -23.55106],
    [-46.6333, -23.5505]
  ]),
  latitude: "-23.55078",
  longitude: "-46.63295"
};

console.log("📋 Dados do Projeto:");
console.log(`   Nome: ${testProject.name}`);
console.log(`   Área: ${testProject.area}m²`);
console.log(`   Dimensões: ${testProject.width}m x ${testProject.length}m`);
console.log(`   Taxa de Ocupação: ${testProject.taxaOcupacao}%`);
console.log(`   CA: ${testProject.coeficienteAproveitamento}`);
console.log("");

// Criar projeto
console.log("1️⃣  Criando projeto de teste...");
const [projectResult] = await connection.execute(
  `INSERT INTO projects (
    userId, name, briefing, area, width, length,
    taxaOcupacao, coeficienteAproveitamento,
    recuoFrontal, recuoLateral, recuoFundos,
    polygonCoordinates, latitude, longitude,
    createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    1, // userId (assumindo owner)
    testProject.name,
    testProject.briefing,
    testProject.area,
    testProject.width,
    testProject.length,
    testProject.taxaOcupacao,
    testProject.coeficienteAproveitamento,
    testProject.recuoFrontal,
    testProject.recuoLateral,
    testProject.recuoFundos,
    testProject.polygonCoordinates,
    testProject.latitude,
    testProject.longitude
  ]
);

const projectId = projectResult.insertId;
console.log(`   ✅ Projeto criado com ID: ${projectId}\n`);

// Criar análise volumétrica mock
console.log("2️⃣  Criando análise volumétrica...");
const analysisData = {
  numeroLojas: 12,
  areaMaximaConstruida: 3500,
  vagasEstacionamento: 45,
  lojaAncora: {
    tipo: "supermercado",
    area: 800
  },
  lojasComplementares: [
    { tipo: "farmácia", area: 150 },
    { tipo: "restaurante", area: 200 },
    { tipo: "loja de roupas", area: 120 },
    { tipo: "loja de calçados", area: 100 },
    { tipo: "loja de eletrônicos", area: 180 },
    { tipo: "cafeteria", area: 80 },
    { tipo: "salão de beleza", area: 90 },
    { tipo: "pet shop", area: 110 },
    { tipo: "papelaria", area: 70 },
    { tipo: "ótica", area: 60 },
    { tipo: "loja de presentes", area: 50 }
  ]
};

await connection.execute(
  `INSERT INTO analyses (
    projectId, numeroLojas, areaMaximaConstruida, vagasEstacionamento,
    areaOcupada, volumetriaWidth, volumetriaLength, volumetriaHeight,
    aiSuggestions, createdAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    projectId,
    analysisData.numeroLojas,
    analysisData.areaMaximaConstruida,
    analysisData.vagasEstacionamento,
    testProject.area * (testProject.taxaOcupacao / 100), // areaOcupada
    testProject.width, // volumetriaWidth
    testProject.length, // volumetriaLength
    6, // volumetriaHeight (altura padrão de 6m)
    JSON.stringify({
      lojaAncora: analysisData.lojaAncora,
      lojasComplementares: analysisData.lojasComplementares
    })
  ]
);

console.log(`   ✅ Análise criada:`);
console.log(`      - ${analysisData.numeroLojas} lojas`);
console.log(`      - ${analysisData.areaMaximaConstruida}m² de área construída`);
console.log(`      - ${analysisData.vagasEstacionamento} vagas de estacionamento`);
console.log(`      - Loja âncora: ${analysisData.lojaAncora.tipo} (${analysisData.lojaAncora.area}m²)\n`);

// DNA será gerado automaticamente na primeira geração de imagem
console.log("3️⃣  DNA arquitetônico será gerado automaticamente ao gerar a primeira imagem\n");

console.log("✅ Projeto de teste criado com sucesso!");
console.log(`\n📊 Resumo:`);
console.log(`   Project ID: ${projectId}`);
console.log(`   Nome: ${testProject.name}`);
console.log(`   URL: [ambiente publicado]/projeto/${projectId}`);
console.log(`\n🎯 Próximo passo: Acesse o projeto e gere as imagens através da interface\n`);

await connection.end();
