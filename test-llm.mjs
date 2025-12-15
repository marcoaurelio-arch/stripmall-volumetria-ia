import { invokeLLM } from "./server/_core/llm.js";

async function testLLM() {
  console.log("🧪 Testando chamada à API da IA...\n");
  
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em planejamento urbano. Sempre responda com JSON válido.",
        },
        {
          role: "user",
          content: "Analise um terreno de 4000m² e retorne um JSON com: areaMaximaConstruida (número), numeroLojas (número)",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              areaMaximaConstruida: { type: "integer" },
              numeroLojas: { type: "integer" },
            },
            required: ["areaMaximaConstruida", "numeroLojas"],
            additionalProperties: false,
          },
        },
      },
    });

    console.log("✅ Resposta recebida!");
    console.log("\n📦 Response completo:");
    console.log(JSON.stringify(response, null, 2));
    
    console.log("\n🔍 Verificando estrutura:");
    console.log("- response existe?", !!response);
    console.log("- response.choices existe?", !!response?.choices);
    console.log("- response.choices é array?", Array.isArray(response?.choices));
    console.log("- response.choices.length:", response?.choices?.length);
    
    if (response?.choices?.[0]) {
      console.log("\n✅ Primeira escolha:");
      console.log(JSON.stringify(response.choices[0], null, 2));
      
      const content = response.choices[0].message?.content;
      console.log("\n📄 Conteúdo:", content);
      
      if (content) {
        const parsed = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
        console.log("\n✅ Dados parseados:", parsed);
      }
    } else {
      console.error("\n❌ response.choices[0] não existe!");
    }
    
  } catch (error) {
    console.error("\n❌ Erro:", error);
    console.error("\nStack:", error.stack);
  }
}

testLLM();
