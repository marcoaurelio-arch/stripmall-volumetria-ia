/**
 * Script para popular o banco de dados com projetos de inspiração
 * Executar com: tsx server/seedInspirations.ts
 */

import { getDb } from "./db";
import { inspirationProjects, InsertInspirationProject } from "../drizzle/schema";

const inspirationData: Omit<InsertInspirationProject, "createdAt" | "updatedAt">[] = [
  {
    name: "Millenia Mall Arujá",
    location: "Arujá, São Paulo, SP",
    description: "Strip mall de sucesso com mix focado em conveniência e serviços do dia a dia. Localização estratégica com fácil acesso.",
    concept: "Centro comercial de vizinhança com âncoras fortes e mix complementar de serviços",
    area: 8500,
    storeCount: 25,
    parkingSpaces: 180,
    floors: 1,
    year: 2018,
    architect: null,
    developer: "Construtora Costa Feitosa",
    anchors: JSON.stringify(["Pão de Açúcar", "Swift", "Petz"]),
    features: JSON.stringify([
      "Estacionamento amplo e bem iluminado",
      "Escritórios médicos",
      "Fácil acesso",
      "Segurança 24h",
      "Área de conveniência"
    ]),
    category: "strip_mall",
    segment: "medio",
    latitude: "-23.3964",
    longitude: "-46.3208",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Open Mall Panamby",
    location: "Rua José Ramon Urtiza, 975 - Vila Andrade, São Paulo, SP",
    description: "Centro comercial de bairro com foco em conveniência. Ambiente acolhedor e fácil acesso para moradores da região.",
    concept: "Open mall com praticidade e conforto, atendendo necessidades cotidianas do bairro",
    area: 6200,
    storeCount: 25,
    parkingSpaces: 120,
    floors: 1,
    year: 2015,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Drogaria São Paulo", "Supermercado St. Marche", "Bradesco Prime", "Smart Fit"]),
    features: JSON.stringify([
      "Acesso direto às lojas",
      "Estacionamento gratuito",
      "Localização residencial",
      "Mix de conveniência",
      "Academia moderna"
    ]),
    category: "open_mall",
    segment: "medio",
    latitude: "-23.6234",
    longitude: "-46.7289",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Boulevard Shopping Brasília",
    location: "Setor Terminal Norte, Asa Norte, Brasília, DF",
    description: "Shopping moderno que captura a essência da cultura brasileira. Localizado em área de fácil acesso próximo ao Setor Hospitalar Norte.",
    concept: "Shopping center com mix diversificado de lojas, restaurantes e entretenimento",
    area: 45000,
    storeCount: 140,
    parkingSpaces: 1200,
    floors: 3,
    year: 2009,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Le Liz", "Coco Bambu", "Cinemark"]),
    features: JSON.stringify([
      "Localização central",
      "Praça de alimentação ampla",
      "Cinema multiplex",
      "Eventos culturais",
      "Fácil acesso"
    ]),
    category: "shopping_center",
    segment: "medio",
    latitude: "-15.7217",
    longitude: "-47.8919",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Flow Open Mall Curitiba",
    location: "Bairro Uberaba, Curitiba, PR",
    description: "Lançamento recente com conceito moderno de shopping a céu aberto. Mais de 60 lojas com foco em descomplicar a experiência de compra.",
    concept: "Open mall moderno com academia, atacadista e mix variado de lojas",
    area: 12000,
    storeCount: 60,
    parkingSpaces: 700,
    floors: 1,
    year: 2025,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Max Atacadista", "Academia moderna"]),
    features: JSON.stringify([
      "Conceito a céu aberto",
      "Estacionamento amplo",
      "Mix diversificado",
      "Área de alimentação",
      "Lançamento 2025"
    ]),
    category: "open_mall",
    segment: "medio",
    latitude: "-25.4808",
    longitude: "-49.2699",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Shopping Cidade Jardim",
    location: "Av. Magalhães de Castro, 12000 - Morumbi, São Paulo, SP",
    description: "Um dos shoppings mais luxuosos do Brasil. Referência em moda, gastronomia e sofisticação em São Paulo.",
    concept: "Shopping de alto padrão com marcas de luxo e gastronomia sofisticada",
    area: 80000,
    storeCount: 200,
    parkingSpaces: 2500,
    floors: 4,
    year: 2008,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Daslu", "Tiffany & Co", "Louis Vuitton", "Empório Armani"]),
    features: JSON.stringify([
      "Marcas de luxo",
      "Gastronomia premium",
      "Arquitetura sofisticada",
      "Localização nobre",
      "Eventos exclusivos"
    ]),
    category: "shopping_center",
    segment: "alto_padrao",
    latitude: "-23.5992",
    longitude: "-46.6989",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Iguatemi Alphaville",
    location: "Alphaville, Barueri, SP",
    description: "Shopping completo com mais de 160 lojas, food court e cinema. Atende a região de Alphaville com mix diversificado.",
    concept: "Shopping center completo com entretenimento e serviços",
    area: 55000,
    storeCount: 160,
    parkingSpaces: 1800,
    floors: 3,
    year: 2016,
    architect: null,
    developer: "Iguatemi",
    anchors: JSON.stringify(["Zara", "Renner", "Cinemark", "Outback"]),
    features: JSON.stringify([
      "9 salas de cinema",
      "Food court amplo",
      "Mix completo",
      "Localização estratégica",
      "Eventos e entretenimento"
    ]),
    category: "shopping_center",
    segment: "medio",
    latitude: "-23.4958",
    longitude: "-46.8528",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Península Open Mall Rio de Janeiro",
    location: "Barra da Tijuca, Rio de Janeiro, RJ",
    description: "Open mall na Barra da Tijuca com acesso direto às lojas. Formato compacto e prático para o dia a dia.",
    concept: "Centro comercial aberto com foco em conveniência",
    area: 7500,
    storeCount: 30,
    parkingSpaces: 200,
    floors: 1,
    year: 2017,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Supermercado", "Farmácia", "Academia"]),
    features: JSON.stringify([
      "Acesso direto",
      "Estacionamento gratuito",
      "Localização Barra",
      "Mix de conveniência",
      "Formato compacto"
    ]),
    category: "open_mall",
    segment: "medio",
    latitude: "-23.0045",
    longitude: "-43.3646",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Via Parque Shopping",
    location: "Barra da Tijuca, Rio de Janeiro, RJ",
    description: "Centro comercial moderno na Barra da Tijuca com mix variado de lojas e serviços.",
    concept: "Shopping de vizinhança com foco em conveniência e lazer",
    area: 32000,
    storeCount: 80,
    parkingSpaces: 800,
    floors: 2,
    year: 2012,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Carrefour", "C&A", "Riachuelo"]),
    features: JSON.stringify([
      "Supermercado âncora",
      "Praça de alimentação",
      "Cinema",
      "Lojas de departamento",
      "Fácil acesso"
    ]),
    category: "neighborhood_center",
    segment: "medio",
    latitude: "-22.9964",
    longitude: "-43.3589",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Rio Design Barra",
    location: "Barra da Tijuca, Rio de Janeiro, RJ",
    description: "Centro comercial especializado em design, decoração e arquitetura. Conceito único focado em home design.",
    concept: "Shopping especializado em design, decoração e lifestyle",
    area: 28000,
    storeCount: 65,
    parkingSpaces: 600,
    floors: 2,
    year: 2007,
    architect: null,
    developer: null,
    anchors: JSON.stringify(["Tok&Stok", "Etna", "Leroy Merlin"]),
    features: JSON.stringify([
      "Foco em design",
      "Lojas especializadas",
      "Showrooms",
      "Gastronomia diferenciada",
      "Conceito único"
    ]),
    category: "shopping_center",
    segment: "medio",
    latitude: "-23.0089",
    longitude: "-43.3178",
    images: null,
    mainImageUrl: null,
  },
  {
    name: "Barra Shopping",
    location: "Avenida das Américas, 4666 - Barra da Tijuca, Rio de Janeiro, RJ",
    description: "Um dos maiores e mais luxuosos shoppings da América Latina. Referência em varejo e entretenimento no Rio de Janeiro.",
    concept: "Mega shopping com mix completo de lojas, entretenimento e gastronomia",
    area: 175000,
    storeCount: 700,
    parkingSpaces: 5500,
    floors: 5,
    year: 1981,
    architect: null,
    developer: "Multiplan",
    anchors: JSON.stringify(["Lojas Americanas", "Renner", "C&A", "Zara", "Cinemark"]),
    features: JSON.stringify([
      "Maior shopping do RJ",
      "Mix completo",
      "Múltiplas âncoras",
      "Cinema e teatro",
      "Gastronomia variada",
      "Eventos e exposições"
    ]),
    category: "shopping_center",
    segment: "medio",
    latitude: "-23.0045",
    longitude: "-43.3646",
    images: null,
    mainImageUrl: null,
  },
];

async function seed() {
  console.log("🌱 Iniciando seed de projetos de inspiração...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Banco de dados não disponível");
    process.exit(1);
  }

  try {
    // Inserir todos os projetos
    for (const project of inspirationData) {
      await db.insert(inspirationProjects).values(project);
      console.log(`✅ Inserido: ${project.name}`);
    }

    console.log(`\n🎉 Seed concluído! ${inspirationData.length} projetos de inspiração adicionados.`);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
