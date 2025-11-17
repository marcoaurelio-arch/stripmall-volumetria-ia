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
  pricePerSqm: int("pricePerSqm"), // Preço por metro quadrado em centavos
  
  // Branding personalizado
  logoUrl: text("logoUrl"), // URL do logo customizado do projeto
  brandColor: varchar("brandColor", { length: 7 }), // Cor da marca em hex (#RRGGBB)
  
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

/**
 * Tabela de templates pré-configurados de strip malls
 * Templates prontos para acelerar criação de projetos com configurações típicas
 */
export const projectTemplates = mysqlTable("projectTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Informações básicas
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["gastronomia", "saude", "conveniencia", "varejo", "servicos"]).notNull(),
  
  // Configurações padrão do template
  briefingTemplate: text("briefingTemplate").notNull(), // Briefing pré-escrito
  typicalArea: int("typicalArea"), // Área típica em m²
  typicalStoreCount: int("typicalStoreCount"), // Número típico de lojas
  
  // Parâmetros urbanísticos típicos
  defaultTaxaOcupacao: int("defaultTaxaOcupacao"), // %
  defaultCoeficiente: int("defaultCoeficiente"), // * 100
  defaultRecuoFrontal: int("defaultRecuoFrontal"), // metros
  defaultRecuoLateral: int("defaultRecuoLateral"), // metros
  defaultRecuoFundos: int("defaultRecuoFundos"), // metros
  
  // Mix de lojas sugerido
  anchorStores: text("anchorStores"), // JSON array com lojas âncora sugeridas
  complementaryStores: text("complementaryStores"), // JSON array com lojas complementares
  
  // Características típicas
  features: text("features"), // JSON array com características (ex: playground, praça alimentação)
  targetAudience: text("targetAudience"), // Público-alvo típico
  
  // Imagem de referência
  imageUrl: text("imageUrl"),
  
  // Faixa de área (para templates de porte)
  minArea: int("minArea"), // Área mínima em m²
  maxArea: int("maxArea"), // Área máxima em m²
  
  // Parâmetros para cenários (Conservador/Balanceado/Otimista)
  taxaOcupacaoMin: int("taxaOcupacaoMin"), // Taxa de ocupação mínima em %
  taxaOcupacaoMax: int("taxaOcupacaoMax"), // Taxa de ocupação máxima em %
  coeficienteMin: int("coeficienteMin"), // Coeficiente mínimo * 100 (ex: 80 = 0.8)
  coeficienteMax: int("coeficienteMax"), // Coeficiente máximo * 100 (ex: 120 = 1.2)
  numeroLojasMin: int("numeroLojasMin"), // Número mínimo de lojas
  numeroLojasMax: int("numeroLojasMax"), // Número máximo de lojas
  m2PorVagaMin: int("m2PorVagaMin"), // m² de ABL por vaga (mínimo)
  m2PorVagaMax: int("m2PorVagaMax"), // m² de ABL por vaga (máximo)
  alturaMaxima: int("alturaMaxima"), // Altura máxima em metros
  
  // Metadados
  isActive: int("isActive").default(1).notNull(), // 0 = inativo, 1 = ativo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTemplate = typeof projectTemplates.$inferSelect;
export type InsertProjectTemplate = typeof projectTemplates.$inferInsert;

/**
 * Tabela de arquivos anexados aos projetos (plantas, documentos, imagens de referência)
 */
export const projectAttachments = mysqlTable("projectAttachments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Informações do arquivo
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["plant", "document", "reference_image", "kmz"]).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // em bytes
  
  // Armazenamento
  fileUrl: text("fileUrl").notNull(), // URL no S3
  fileKey: text("fileKey").notNull(), // Chave no S3
  
  // Metadados
  description: text("description"),
  uploadedBy: int("uploadedBy").notNull(), // userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectAttachment = typeof projectAttachments.$inferSelect;
export type InsertProjectAttachment = typeof projectAttachments.$inferInsert;

/**
 * Tabela de legislação urbanística por município
 * Armazena parâmetros urbanísticos de diferentes municípios brasileiros
 */
export const urbanLegislation = mysqlTable("urbanLegislation", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identificação do município
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(), // UF
  zipCodeRange: varchar("zipCodeRange", { length: 50 }), // Faixa de CEPs (ex: "01000-000 a 05999-999")
  
  // Zona urbanística
  zone: varchar("zone", { length: 100 }), // Ex: "ZM-1", "ZC", "ZI"
  zoneDescription: text("zoneDescription"), // Descrição da zona
  
  // Parâmetros urbanísticos
  taxaOcupacaoMax: int("taxaOcupacaoMax"), // Taxa de ocupação máxima em %
  coeficienteAproveitamentoMax: int("coeficienteAproveitamentoMax"), // CA máximo * 100
  gabaritoMax: int("gabaritoMax"), // Gabarito máximo em metros ou pavimentos
  recuoFrontalMin: int("recuoFrontalMin"), // Recuo frontal mínimo em metros
  recuoLateralMin: int("recuoLateralMin"), // Recuo lateral mínimo em metros
  recuoFundosMin: int("recuoFundosMin"), // Recuo de fundos mínimo em metros
  
  // Requisitos específicos
  areaPermeavelMin: int("areaPermeavelMin"), // Área permeável mínima em %
  vagasPorM2: int("vagasPorM2"), // Vagas por m² * 1000 (ex: 1 vaga/40m² = 25)
  
  // Usos permitidos
  usosPermitidos: text("usosPermitidos"), // JSON array com usos permitidos
  restricoes: text("restricoes"), // JSON array com restrições específicas
  
  // Referências legais
  leiReferencia: text("leiReferencia"), // Lei ou decreto de referência
  linkLegislacao: text("linkLegislacao"), // URL para legislação completa
  
  // Metadados
  source: mysqlEnum("source", ["official", "user_contributed", "ai_suggested"]).default("user_contributed").notNull(),
  verifiedBy: int("verifiedBy"), // userId de quem verificou
  verifiedAt: timestamp("verifiedAt"),
  createdBy: int("createdBy").notNull(), // userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UrbanLegislation = typeof urbanLegislation.$inferSelect;
export type InsertUrbanLegislation = typeof urbanLegislation.$inferInsert;

/**
 * Tabela de custos de construção baseados em CUB/SINAPI
 * Armazena valores de referência por estado e tipo de construção
 */
export const constructionCosts = mysqlTable("constructionCosts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Localização
  state: varchar("state", { length: 2 }).notNull(), // UF
  city: varchar("city", { length: 255 }), // Opcional, para custos específicos de cidade
  
  // Tipo de construção
  buildingType: mysqlEnum("buildingType", ["strip_mall", "shopping_center", "commercial", "mixed_use"]).notNull(),
  standard: mysqlEnum("standard", ["low", "medium", "high", "luxury"]).default("medium").notNull(),
  
  // Custos por m² (em centavos para precisão)
  totalCostPerSqm: int("totalCostPerSqm").notNull(), // Custo total por m²
  structureCost: int("structureCost").notNull(), // Estrutura (fundação, pilares, lajes)
  finishingCost: int("finishingCost").notNull(), // Acabamento (revestimentos, pintura, esquadrias)
  installationsCost: int("installationsCost").notNull(), // Instalações (elétrica, hidráulica, climatização)
  parkingCost: int("parkingCost").notNull(), // Estacionamento (pavimentação, sinalização)
  commonAreasCost: int("commonAreasCost").notNull(), // Áreas comuns (paisagismo, mobiliário urbano)
  
  // Custos adicionais
  projectCost: int("projectCost"), // Projeto arquitetônico e complementares (% do total)
  managementCost: int("managementCost"), // Gerenciamento de obra (% do total)
  contingencyCost: int("contingencyCost"), // Contingência (% do total)
  
  // Referência e validade
  referenceMonth: int("referenceMonth").notNull(), // Mês de referência (1-12)
  referenceYear: int("referenceYear").notNull(), // Ano de referência
  source: varchar("source", { length: 255 }), // Fonte dos dados (CUB-SP, SINAPI, etc)
  notes: text("notes"), // Observações adicionais
  
  // Metadados
  isActive: int("isActive").default(1).notNull(), // 0 = inativo, 1 = ativo
  createdBy: int("createdBy").notNull(), // userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionCost = typeof constructionCosts.$inferSelect;
export type InsertConstructionCost = typeof constructionCosts.$inferInsert;

/**
 * Tabela de análises de custo por projeto
 * Armazena estimativas de custo calculadas para cada projeto
 */
export const costAnalyses = mysqlTable("costAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Áreas
  totalArea: int("totalArea").notNull(), // Área total construída em m²
  commercialArea: int("commercialArea"), // Área comercial (lojas)
  parkingArea: int("parkingArea"), // Área de estacionamento
  commonArea: int("commonArea"), // Áreas comuns
  
  // Custos totais (em centavos)
  totalCost: int("totalCost").notNull(), // Custo total estimado
  structureCost: int("structureCost").notNull(),
  finishingCost: int("finishingCost").notNull(),
  installationsCost: int("installationsCost").notNull(),
  parkingCost: int("parkingCost").notNull(),
  commonAreasCost: int("commonAreasCost").notNull(),
  projectCost: int("projectCost"),
  managementCost: int("managementCost"),
  contingencyCost: int("contingencyCost"),
  
  // Custos por m²
  costPerSqm: int("costPerSqm").notNull(), // Custo médio por m²
  
  // Análise de viabilidade
  estimatedRevenue: int("estimatedRevenue"), // Receita estimada (VGV)
  profitMargin: int("profitMargin"), // Margem de lucro em %
  roi: int("roi"), // ROI em % * 100
  paybackMonths: int("paybackMonths"), // Payback em meses
  
  // Referência de custo utilizada
  costReferenceId: int("costReferenceId"), // ID da tabela constructionCosts
  adjustmentFactor: int("adjustmentFactor"), // Fator de ajuste aplicado (* 100)
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CostAnalysis = typeof costAnalyses.$inferSelect;
export type InsertCostAnalysis = typeof costAnalyses.$inferInsert;

/**
 * Tabela de tours virtuais 360°
 * Armazena panoramas equirectangulares para visualização imersiva
 */
export const virtualTours = mysqlTable("virtualTours", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Dados do tour
  scenes: text("scenes").notNull(), // JSON array com viewpoints e hotspots
  defaultScene: varchar("defaultScene", { length: 100 }).notNull(), // ID da cena inicial
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VirtualTour = typeof virtualTours.$inferSelect;
export type InsertVirtualTour = typeof virtualTours.$inferInsert;


/**
 * Projeções financeiras avançadas com fluxo de caixa detalhado
 */
export const financialProjections = mysqlTable("financialProjections", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Identificação do cenário
  nome: varchar("nome", { length: 255 }), // Nome do cenário para identificação
  notas: text("notas"), // Notas e observações sobre o cenário
  
  // Parâmetros de entrada
  investimentoInicial: int("investimentoInicial").notNull(), // Custo total de construção
  receitaMensalAluguel: int("receitaMensalAluguel").notNull(), // Receita mensal de aluguel
  taxaVacancia: int("taxaVacancia").notNull(), // Taxa de vacância em % (0-100)
  custoOperacionalMensal: int("custoOperacionalMensal").notNull(), // Custos operacionais mensais
  taxaDesconto: int("taxaDesconto").notNull(), // Taxa de desconto anual em % * 100 (ex: 1000 = 10%)
  
  // Cenário de financiamento
  tipoFinanciamento: varchar("tipoFinanciamento", { length: 50 }).notNull(), // 'proprio', 'bancario', 'misto'
  percentualFinanciado: int("percentualFinanciado"), // % financiado (0-100)
  taxaJurosAnual: int("taxaJurosAnual"), // Taxa de juros anual em % * 100
  prazoFinanciamento: int("prazoFinanciamento"), // Prazo em meses
  
  // Resultados calculados
  tir: int("tir"), // Taxa Interna de Retorno em % * 100
  vpl: int("vpl"), // Valor Presente Líquido em reais
  paybackSimples: int("paybackSimples"), // Payback simples em meses
  paybackDescontado: int("paybackDescontado"), // Payback descontado em meses
  
  // Projeções (JSON com array de 10 anos)
  fluxoCaixaAnual: text("fluxoCaixaAnual").notNull(), // JSON: [{ano, receita, despesa, saldo, saldoAcumulado}]
  
  // Análise de sensibilidade (JSON com cenários)
  analiseSensibilidade: text("analiseSensibilidade"), // JSON: {aluguel: [...], vacancia: [...], custos: [...]}
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFinancialProjection = typeof financialProjections.$inferInsert;

