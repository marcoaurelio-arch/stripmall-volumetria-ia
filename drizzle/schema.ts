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
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  status: mysqlEnum("status", ["draft", "analyzing", "completed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Análises volumétricas geradas por IA
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