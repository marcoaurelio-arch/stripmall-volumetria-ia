import { describe, it, expect, beforeAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { projects } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getOrGenerateProjectDNA } from '../services/projectDNAHelper';

describe('DNA Router', () => {
  let db: ReturnType<typeof drizzle>;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set');
    }
    db = drizzle(process.env.DATABASE_URL);
  });

  it('should generate DNA for a project', async () => {
    // Buscar um projeto existente
    const [project] = await db
      .select()
      .from(projects)
      .limit(1);
    
    if (!project) {
      console.warn('No projects found in database, skipping test');
      return;
    }

    // Gerar DNA
    const dna = await getOrGenerateProjectDNA(project.id);
    
    // Validar estrutura do DNA
    expect(dna).toBeDefined();
    expect(dna.buildingShape).toBeDefined();
    expect(dna.floors).toBeGreaterThan(0);
    expect(dna.roofType).toBeDefined();
    expect(dna.style).toBeDefined();
    expect(Array.isArray(dna.features)).toBe(true);
    expect(dna.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(dna.accentColor).toMatch(/^#[0-9A-F]{6}$/i);
    expect(Array.isArray(dna.materials)).toBe(true);
    expect(dna.landscaping).toBeDefined();
    expect(dna.layout).toBeDefined();
    expect(dna.context).toBeDefined();
  });

  it('should return same DNA on second call (cached)', async () => {
    const [project] = await db
      .select()
      .from(projects)
      .limit(1);
    
    if (!project) {
      console.warn('No projects found in database, skipping test');
      return;
    }

    // Primeira chamada
    const dna1 = await getOrGenerateProjectDNA(project.id);
    
    // Segunda chamada (deve retornar do cache)
    const dna2 = await getOrGenerateProjectDNA(project.id);
    
    // Devem ser idênticos
    expect(dna1.buildingShape).toBe(dna2.buildingShape);
    expect(dna1.style).toBe(dna2.style);
    expect(dna1.primaryColor).toBe(dna2.primaryColor);
  });

  it('should regenerate DNA when forced', async () => {
    const [project] = await db
      .select()
      .from(projects)
      .limit(1);
    
    if (!project) {
      console.warn('No projects found in database, skipping test');
      return;
    }

    // DNA original
    const originalDna = await getOrGenerateProjectDNA(project.id);
    
    // Forçar regeneração
    const regeneratedDna = await getOrGenerateProjectDNA(project.id, true);
    
    // Estrutura deve ser a mesma, mas pode ter valores diferentes
    expect(regeneratedDna).toBeDefined();
    expect(regeneratedDna.buildingShape).toBeDefined();
    expect(regeneratedDna.style).toBeDefined();
  });
});
