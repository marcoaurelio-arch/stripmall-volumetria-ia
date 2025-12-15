import { drizzle } from "drizzle-orm/mysql2";
import { inspirationProjects } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const projects: Array<typeof inspirationProjects.$inferInsert> = [
  // PROJETOS REAIS
  {
    name: "Pátio Belvedere I",
    location: "Belo Horizonte, MG",
    area: 14000,
    storeCount: 80,
    parkingSpaces: 300,
    anchors: "Supermercado, Farmácia, Fast Food",
    category: "open_mall",
    developer: "GSA",
    year: 2018,
    description: "Maior empreendimento do portfólio GSA com mix completo de lojas e serviços. Referência em Open Mall na região metropolitana de BH.",
  },
  {
    name: "Pátio Belvedere II",
    location: "Belo Horizonte, MG",
    area: 9200,
    storeCount: 16,
    parkingSpaces: 300,
    anchors: "Academia, Restaurantes",
    category: "open_mall",
    developer: "GSA",
    year: 2019,
    description: "Foco em serviços e alimentação, complementando o Pátio Belvedere I com proposta diferenciada.",
  },
  {
    name: "Pátio Belvedere III",
    location: "Belo Horizonte, MG",
    area: 8700,
    storeCount: 22,
    parkingSpaces: 180,
    anchors: "Supermercado, Drogaria",
    category: "open_mall",
    developer: "GSA",
    year: 2020,
    description: "Projeto com foco em conveniência de bairro, mix equilibrado entre varejo e serviços.",
  },
  {
    name: "Pátio Belvedere IV",
    location: "Belo Horizonte, MG",
    area: 6000,
    storeCount: 19,
    parkingSpaces: 300,
    anchors: "Farmácia, Pet Shop, Clínica",
    category: "open_mall",
    developer: "GSA",
    year: 2021,
    description: "Menor porte com foco em serviços especializados e conveniência local.",
  },
  {
    name: "Al. Oscar Niemeyer",
    location: "São Paulo, SP",
    area: 1700,
    storeCount: 30,
    parkingSpaces: 50,
    anchors: "Café, Restaurante",
    category: "neighborhood_center",
    developer: "GSA",
    year: 2022,
    description: "Convenience center compacto em localização nobre, foco em alimentação e serviços rápidos.",
  },
  {
    name: "Strip Mall Morumbi",
    location: "Morumbi, São Paulo, SP",
    area: 3500,
    storeCount: 12,
    parkingSpaces: 80,
    anchors: "AllpFit, Dia Supermercado",
    category: "strip_mall",
    developer: "New LMF",
    year: 2025,
    description: "Desenvolvimento recente em região nobre da Zona Sul de SP, foco em conveniência de vizinhança.",
  },
  {
    name: "Open Mall The Square",
    location: "Cotia, SP",
    area: 5200,
    storeCount: 24,
    parkingSpaces: 150,
    anchors: "Supermercado, Academia, Farmácia",
    category: "open_mall",
    developer: "Não especificado",
    year: 2020,
    description: "Open mall em região metropolitana de SP com mix focado em conveniência e serviços.",
  },

  // PROJETOS FICTÍCIOS REALISTAS - SÃO PAULO
  {
    name: "Strip Mall Tatuapé",
    location: "Tatuapé, São Paulo, SP",
    area: 3500,
    storeCount: 18,
    parkingSpaces: 100,
    anchors: "Pão de Açúcar Express, Drogasil",
    category: "strip_mall",
    developer: "BestCenter",
    year: 2023,
    description: "Centro de conveniência na Zona Leste com foco em moradores locais, mix de serviços essenciais.",
  },
  {
    name: "Open Mall Moema",
    location: "Moema, São Paulo, SP",
    area: 5200,
    storeCount: 26,
    parkingSpaces: 150,
    anchors: "Smart Fit, Burger King, Farmácia São Paulo",
    category: "open_mall",
    developer: "GSA",
    year: 2022,
    description: "Empreendimento em bairro nobre da Zona Sul, mix premium com serviços e alimentação.",
  },
  {
    name: "Convenience Center Santana",
    location: "Santana, São Paulo, SP",
    area: 2800,
    storeCount: 15,
    parkingSpaces: 80,
    anchors: "Supermercado Dia, Clínica Lavoisier",
    category: "neighborhood_center",
    developer: "BestCenter",
    year: 2024,
    description: "Centro de conveniência compacto na Zona Norte, foco em saúde e alimentação.",
  },
  {
    name: "Strip Mall Butantã",
    location: "Butantã, São Paulo, SP",
    area: 4100,
    storeCount: 22,
    parkingSpaces: 120,
    anchors: "Carrefour Express, McDonald's",
    category: "strip_mall",
    developer: "New LMF",
    year: 2023,
    description: "Projeto na Zona Oeste próximo à USP, mix voltado para público universitário e residencial.",
  },
  {
    name: "Open Mall Alphaville",
    location: "Alphaville, Barueri, SP",
    area: 6500,
    storeCount: 32,
    parkingSpaces: 200,
    anchors: "Supermercado Extra, Cinemark, Smart Fit",
    category: "open_mall",
    developer: "GSA",
    year: 2021,
    description: "Grande empreendimento em condomínio empresarial, mix completo para atender demanda local.",
  },

  // INTERIOR DE SÃO PAULO
  {
    name: "Strip Mall Cambuí",
    location: "Cambuí, Campinas, SP",
    area: 4800,
    storeCount: 24,
    parkingSpaces: 140,
    anchors: "Pão de Açúcar, Drogaria São Paulo, Outback",
    category: "strip_mall",
    developer: "BestCenter",
    year: 2022,
    description: "Localização premium em Campinas, bairro nobre com alto poder aquisitivo.",
  },
  {
    name: "Open Mall Ribeirão Preto",
    location: "Ribeirão Preto, SP",
    area: 5500,
    storeCount: 28,
    parkingSpaces: 160,
    anchors: "Supermercado Bergamini, Academia Bio Ritmo",
    category: "open_mall",
    developer: "GSA",
    year: 2023,
    description: "Primeiro open mall de grande porte na cidade, mix diversificado de varejo e serviços.",
  },
  {
    name: "Convenience Center Santos",
    location: "Gonzaga, Santos, SP",
    area: 3200,
    storeCount: 17,
    parkingSpaces: 90,
    anchors: "Supermercado Zona Sul, Farmácia Pacheco",
    category: "neighborhood_center",
    developer: "BestCenter",
    year: 2024,
    description: "Centro de conveniência no coração de Santos, atendendo moradores e turistas.",
  },

  // RIO DE JANEIRO
  {
    name: "Open Mall Barra da Tijuca",
    location: "Barra da Tijuca, Rio de Janeiro, RJ",
    area: 7200,
    storeCount: 36,
    parkingSpaces: 220,
    anchors: "Zona Sul Supermercados, Spoleto, Centauro",
    category: "open_mall",
    developer: "GSA",
    year: 2022,
    description: "Grande empreendimento na Barra, mix completo com foco em lazer e conveniência.",
  },
  {
    name: "Strip Mall Leblon",
    location: "Leblon, Rio de Janeiro, RJ",
    area: 2900,
    storeCount: 14,
    parkingSpaces: 70,
    anchors: "Zona Sul, Starbucks",
    category: "strip_mall",
    developer: "BestCenter",
    year: 2023,
    description: "Empreendimento compacto em bairro nobre, mix premium e sofisticado.",
  },
  {
    name: "Convenience Center Niterói",
    location: "Icaraí, Niterói, RJ",
    area: 3600,
    storeCount: 19,
    parkingSpaces: 100,
    anchors: "Supermercado Guanabara, Drogaria Pacheco",
    category: "neighborhood_center",
    developer: "BestCenter",
    year: 2024,
    description: "Centro de conveniência estratégico em Niterói, atendendo demanda local crescente.",
  },

  // MINAS GERAIS
  {
    name: "Strip Mall Savassi",
    location: "Savassi, Belo Horizonte, MG",
    area: 4500,
    storeCount: 23,
    parkingSpaces: 130,
    anchors: "Verdemar, Havanna, Farmácia Araújo",
    category: "strip_mall",
    developer: "GSA",
    year: 2023,
    description: "Localização nobre em BH, mix sofisticado voltado para público de alto padrão.",
  },
  {
    name: "Open Mall Uberlândia",
    location: "Uberlândia, MG",
    area: 5800,
    storeCount: 29,
    parkingSpaces: 170,
    anchors: "Supermercado Bretas, Havan, Outback",
    category: "open_mall",
    developer: "BestCenter",
    year: 2022,
    description: "Primeiro grande open mall de Uberlândia, referência regional em conveniência.",
  },

  // SUL
  {
    name: "Open Mall Curitiba",
    location: "Batel, Curitiba, PR",
    area: 5100,
    storeCount: 26,
    parkingSpaces: 150,
    anchors: "Condor Supermercados, Mundo Verde, Spoleto",
    category: "open_mall",
    developer: "GSA",
    year: 2023,
    description: "Empreendimento em bairro nobre de Curitiba, mix focado em qualidade de vida.",
  },
  {
    name: "Strip Mall Porto Alegre",
    location: "Moinhos de Vento, Porto Alegre, RS",
    area: 3900,
    storeCount: 20,
    parkingSpaces: 110,
    anchors: "Zaffari, Starbucks, Farmácia Panvel",
    category: "strip_mall",
    developer: "BestCenter",
    year: 2024,
    description: "Strip mall premium em POA, atendendo público de alto poder aquisitivo.",
  },

  // NORDESTE
  {
    name: "Open Mall Salvador",
    location: "Pituba, Salvador, BA",
    area: 6200,
    storeCount: 31,
    parkingSpaces: 180,
    anchors: "GBarbosa, Cinépolis, Smart Fit",
    category: "open_mall",
    developer: "GSA",
    year: 2022,
    description: "Grande open mall em Salvador, mix completo com lazer e conveniência.",
  },
  {
    name: "Strip Mall Recife",
    location: "Boa Viagem, Recife, PE",
    area: 4700,
    storeCount: 24,
    parkingSpaces: 140,
    anchors: "Bompreço, McDonald's, Drogaria São Paulo",
    category: "strip_mall",
    developer: "BestCenter",
    year: 2023,
    description: "Empreendimento na orla de Boa Viagem, mix voltado para moradores e turistas.",
  },

  // CENTRO-OESTE
  {
    name: "Open Mall Brasília",
    location: "Asa Sul, Brasília, DF",
    area: 5600,
    storeCount: 28,
    parkingSpaces: 165,
    anchors: "Carrefour Express, Outback, Farmácia Rosário",
    category: "open_mall",
    developer: "GSA",
    year: 2023,
    description: "Open mall estratégico em Brasília, atendendo demanda de moradores e funcionários públicos.",
  },
];

async function seed() {
  console.log("🌱 Iniciando seed de projetos de inspiração...");
  
  try {
    for (const project of projects) {
      await db.insert(inspirationProjects).values(project);
      console.log(`✅ ${project.name} - ${project.location}`);
    }
    
    console.log(`\n🎉 Seed concluído! ${projects.length} projetos adicionados.`);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
