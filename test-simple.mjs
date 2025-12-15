import { invokeLLM } from "./server/_core/llm.js";

async function test() {
  console.log("🧪 Testando com json_object...\n");
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Responda sempre com JSON válido." },
        { role: "user", content: "Retorne um JSON com: area (número 5000), lojas (número 20)" },
      ],
      response_format: { type: "json_object" },
    });

    console.log("✅ Sucesso!");
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

test();
