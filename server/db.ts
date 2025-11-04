import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, InsertProject, analyses, InsertAnalysis, scenarios, InsertScenario, generatedImages, InsertGeneratedImage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project queries
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values(project);
  return result;
}

export async function getProjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(projects.createdAt);
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProject(projectId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete analyses first
  await db.delete(analyses).where(eq(analyses.projectId, projectId));
  // Then delete project
  await db.delete(projects).where(eq(projects.id, projectId));
}

// Analysis queries
export async function createAnalysis(analysis: InsertAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(analyses).values(analysis);
  return result;
}

export async function getAnalysesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(analyses).where(eq(analyses.projectId, projectId)).orderBy(analyses.createdAt);
}

export async function getLatestAnalysis(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(analyses)
    .where(eq(analyses.projectId, projectId))
    .orderBy(analyses.createdAt)
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// Funções para gerenciar cenários de polígonos
export async function createScenario(scenario: Omit<InsertScenario, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scenarios).values(scenario);
  return result;
}

export async function getScenariosByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(scenarios).where(eq(scenarios.projectId, projectId)).orderBy(desc(scenarios.createdAt));
}

export async function getScenarioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateScenario(id: number, data: Partial<Omit<InsertScenario, "id" | "projectId" | "createdAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(scenarios).set(data).where(eq(scenarios.id, id));
}

export async function deleteScenario(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(scenarios).where(eq(scenarios.id, id));
}

export async function setActiveScenario(projectId: number, scenarioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Desativar todos os cenários do projeto
  await db.update(scenarios).set({ isActive: 0 }).where(eq(scenarios.projectId, projectId));
  
  // Ativar o cenário selecionado
  await db.update(scenarios).set({ isActive: 1 }).where(eq(scenarios.id, scenarioId));
}

// Funções para imagens geradas
export async function createGeneratedImage(image: InsertGeneratedImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(generatedImages).values(image);
}

export async function getGeneratedImagesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(generatedImages).where(eq(generatedImages.projectId, projectId)).orderBy(desc(generatedImages.createdAt));
}

export async function deleteGeneratedImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(generatedImages).where(eq(generatedImages.id, id));
}
