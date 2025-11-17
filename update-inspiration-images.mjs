import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { inspirationProjects } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Mapeamento de projetos para imagens
const imageMapping = [
  { name: "Boulevard Gourmet", mainImageUrl: "/inspiracao/boulevard-gourmet.jpg" },
  { name: "GSA Pampulha", mainImageUrl: "/inspiracao/gsa-ativos.jpg" },
  { name: "BestCenter Contagem", mainImageUrl: "/inspiracao/shopping-brasil-1.jpg" },
  { name: "New LMF Betim", mainImageUrl: "/inspiracao/strip-mall-lmf.jpg" },
  { name: "Shopping Cidade", mainImageUrl: "/inspiracao/shopping-brasil-2.jpg" },
  { name: "Open Mall Savassi", mainImageUrl: "/inspiracao/boulevard-gourmet-interior.jpg" },
  { name: "Strip Mall Eldorado", mainImageUrl: "/inspiracao/shopping-sao-paulo.jpg" },
];

async function updateImages() {
  console.log("Atualizando URLs de imagens dos projetos de inspiração...\n");

  for (const mapping of imageMapping) {
    try {
      // Buscar projeto por nome (aproximado)
      const projects = await db
        .select()
        .from(inspirationProjects)
        .where(eq(inspirationProjects.name, mapping.name))
        .limit(1);

      if (projects.length === 0) {
        console.log(`⚠️  Projeto "${mapping.name}" não encontrado no banco`);
        continue;
      }

      const project = projects[0];

      // Atualizar URL da imagem
      await db
        .update(inspirationProjects)
        .set({ mainImageUrl: mapping.mainImageUrl })
        .where(eq(inspirationProjects.id, project.id));

      console.log(`✅ Atualizado: ${mapping.name} → ${mapping.mainImageUrl}`);
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${mapping.name}:`, error.message);
    }
  }

  console.log("\n✨ Atualização concluída!");
  process.exit(0);
}

updateImages().catch((error) => {
  console.error("Erro fatal:", error);
  process.exit(1);
});
