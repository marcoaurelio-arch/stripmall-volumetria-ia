import { drizzle } from "drizzle-orm/mysql2";
import { projects } from "./drizzle/schema.js";
import { invokeLLM } from "./server/_core/llm.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

console.log("\n🧪 Testando criação de projeto e análise com IA...\n");

// 1. Criar projeto de teste
const projectData = {
  name: "Teste Análise IA - Debug",
  briefing: "Projeto de teste para debug do botão Analisar com IA",
  areaTerreno: 5000,
  pricePerSqm: 1500,
  taxaOcupacao: 70,
  coeficienteAproveitamento: 125, // 1.25 * 100
  tipologia: "L",
};

console.log("1️⃣ Criando projeto de teste...");
const [newProject] = await db.insert(projects).values(projectData).$returningId();
console.log(`✅ Projeto criado: ID ${newProject.id}\n`);

// 2. Buscar projeto criado
console.log("2️⃣ Buscando projeto...");
const project = await db.select().from(projects).where(eq(projects.id, newProject.id)).limit(1);
if (!project || project.length === 0) {
  console.error("❌ Projeto não encontrado!");
  process.exit(1);
}
console.log(`✅ Projeto encontrado: ${project[0].name}\n`);

// 3. Testar análise com IA (simulando o que o botão faz)
console.log("3️⃣ Testando análise com IA...");
try {
  const prompt = `Analise este terreno para strip mall:
- Área: ${project[0].areaTerreno}m²
- Taxa de Ocupação: ${project[0].taxaOcupacao}%
- Coeficiente: ${project[0].coeficienteAproveitamento / 100}
- Tipologia: ${project[0].tipologia || "Não especificada"}

Retorne uma análise volumétrica completa em JSON.`;

  console.log("📤 Enviando prompt para IA...");
  
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Você é um especialista em análise volumétrica de strip malls." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "volumetric_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            areaMaxConstruida: { type: "number" },
            areaOcupadaTerr: { type: "number" },
            numLojas: { type: "number" },
            vagasEstacionamento: { type: "number" },
          },
          required: ["areaMaxConstruida", "areaOcupadaTerr", "numLojas", "vagasEstacionamento"],
          additionalProperties: false,
        },
      },
    },
  });

  console.log("✅ Resposta recebida da IA!");
  console.log("📊 Análise:", JSON.parse(response.choices[0].message.content));
  
  console.log("\n🎉 Teste concluído com sucesso! O sistema de análise está funcionando.\n");
  process.exit(0);
  
} catch (error) {
  console.error("\n❌ ERRO ao chamar IA:");
  console.error("Mensagem:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
