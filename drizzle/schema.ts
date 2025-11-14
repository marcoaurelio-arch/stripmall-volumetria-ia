import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projetos de terrenos para análise volumétrica
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  briefing: text("briefing"), // Briefing detalhado do projeto com requisitos, conceito, público-alvo, etc.
  
  // Dados do terreno
  address: text("address"),
  area: int("area").notNull(), // área em m²
  width: int("width"), // largura em metros
  length: int("length"), // comprimento em metros
  
  // Parâmetros urbanísticos
  taxaOcupacao: int("taxaOcupacao"), // taxa de ocupação em %
  coeficienteAproveitamento: int("coeficienteAproveitamento"), // coeficiente * 100
  recuoFrontal: int("recuoFrontal"), // em metros
  recuoLateral: int("recuoLateral"), // em metros
  recuoFundos: int("recuoFundos"), // em metros
  
  // Coordenadas geográficas
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  polygonCoordinates: text("polygonCoordinates"),
  pricePerSqm: int("pricePerSqm"), // Preço por metro quadrado em centavos // JSON com array de coordenadas do polígono
  status: mysqlEnum("status", ["draft", "analyzing", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tabela de cenários de polígonos para permitir múltiplas configurações de terreno por projeto
 */
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  polygonCoordinates: text("polygonCoordinates").notNull(), // JSON com array de coordenadas
  area: int("area").notNull(), // área em m²
  isActive: int("isActive").default(0).notNull(), // 0 = inativo, 1 = ativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

// Tabela de imagens geradas
export const generatedImages = mysqlTable("generatedImages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["conceptual", "floorplan", "electronic_model", "facade_view", "longitudinal_section", "transversal_section", "site_plan"]).notNull(), // Tipo: estudo conceitual, planta baixa, maquete eletrônica, vista de fachada, corte longitudinal ou corte transversal
  imageUrl: text("imageUrl").notNull(), // URL da imagem no S3
  prompt: text("prompt"), // Prompt usado para gerar a imagem
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;

/**
 * Tabela de análises volumétricas geradas por IA
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Resultados dos cálculos
  areaMaximaConstruida: int("areaMaximaConstruida"), // em m²
  areaOcupada: int("areaOcupada"), // em m²
  numeroLojas: int("numeroLojas"),
  vagasEstacionamento: int("vagasEstacionamento"),
  
  // Dimensões da volumetria
  volumetriaWidth: int("volumetriaWidth"), // largura em metros
  volumetriaLength: int("volumetriaLength"), // comprimento em metros
  volumetriaHeight: int("volumetriaHeight"), // altura em metros
  
  // Sugestões e análises da IA
  aiSuggestions: text("aiSuggestions"),
  layoutDescription: text("layoutDescription"),
  
  // Visualizações geradas
  render3dUrl: text("render3dUrl"),
  render3dKey: text("render3dKey"),
  plantaUrl: text("plantaUrl"),
  plantaKey: text("plantaKey"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Tabela de projetos de inspiração - catálogo de centros comerciais e strip malls relevantes do Brasil
 */
export const inspirationProjects = mysqlTable("inspirationProjects", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações básicas
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location").notNull(), // Cidade, estado, endereço completo
  description: text("description"), // Descrição geral do projeto
  concept: text("concept"), // Conceito arquitetônico e comercial
  
  // Dados técnicos
  area: int("area"), // Área total construída em m²
  storeCount: int("storeCount"), // Número de lojas
  parkingSpaces: int("parkingSpaces"), // Número de vagas de estacionamento
  floors: int("floors"), // Número de pavimentos
  year: int("year"), // Ano de inauguração
  
  // Informações profissionais
  architect: text("architect"), // Arquiteto ou escritório responsável
  developer: text("developer"), // Incorporadora/construtora
  
  // Características e mix
  anchors: text("anchors"), // JSON array com lojas âncora
  features: text("features"), // JSON array com características principais
  
  // Categorização
  category: mysqlEnum("category", ["strip_mall", "open_mall", "shopping_center", "neighborhood_center"]).notNull(),
  segment: mysqlEnum("segment", ["popular", "medio", "alto_padrao"]).default("medio").notNull(),
  
  // Localização geográfica
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  // Imagens
  images: text("images"), // JSON array com URLs de imagens
  mainImageUrl: text("mainImageUrl"), // URL da imagem principal
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InspirationProject = typeof inspirationProjects.$inferSelect;
export type InsertInspirationProject = typeof inspirationProjects.$inferInsert;
