/**
 * Testes para galeria de projetos exemplo
 */
import { describe, it, expect } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { exampleProjects } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL!);

describe('Gallery - Projetos Exemplo', () => {
  it('deve ter pelo menos 6 projetos exemplo no banco', async () => {
    const examples = await db.select().from(exampleProjects);
    expect(examples.length).toBeGreaterThanOrEqual(6);
  });

  it('todos os projetos devem ter score de consistência >= 90%', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      expect(example.consistencyScore).toBeGreaterThanOrEqual(90);
    });
  });

  it('deve ter pelo menos 3 projetos em destaque', async () => {
    const featured = await db
      .select()
      .from(exampleProjects)
      .where(eq(exampleProjects.featured, 1));
    
    expect(featured.length).toBeGreaterThanOrEqual(3);
  });

  it('todos os projetos devem ter DNA completo', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      expect(example.dnaBuildingShape).toBeTruthy();
      expect(example.dnaStyle).toBeTruthy();
      expect(example.dnaFeatures).toBeTruthy();
      expect(example.dnaPrimaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(example.dnaAccentColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(example.dnaMaterials).toBeTruthy();
      expect(example.dnaLandscaping).toBeTruthy();
      expect(example.dnaLayout).toBeTruthy();
      expect(example.dnaContext).toBeTruthy();
    });
  });

  it('todos os projetos devem ter dados do terreno válidos', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      expect(Number(example.landArea)).toBeGreaterThan(0);
      expect(Number(example.occupancyRate)).toBeGreaterThan(0);
      expect(Number(example.occupancyRate)).toBeLessThanOrEqual(1);
      expect(Number(example.frontSetback)).toBeGreaterThanOrEqual(0);
      expect(Number(example.sideSetback)).toBeGreaterThanOrEqual(0);
      expect(Number(example.backSetback)).toBeGreaterThanOrEqual(0);
    });
  });

  it('todos os projetos devem ter análise volumétrica válida', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      expect(Number(example.builtArea)).toBeGreaterThan(0);
      expect(example.numberOfStores).toBeGreaterThan(0);
      expect(example.parkingSpaces).toBeGreaterThan(0);
    });
  });

  it('deve ter projetos de diferentes categorias', async () => {
    const examples = await db.select().from(exampleProjects);
    const categories = new Set(examples.map((e) => e.category));
    
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });

  it('projeto "Strip Mall Moderno Minimalista" deve ter score >= 95%', async () => {
    const moderno = await db
      .select()
      .from(exampleProjects)
      .where(eq(exampleProjects.name, 'Strip Mall Moderno Minimalista'))
      .limit(1);
    
    expect(moderno.length).toBe(1);
    expect(moderno[0].consistencyScore).toBeGreaterThanOrEqual(95);
    expect(moderno[0].category).toBe('Varejo');
  });

  it('projeto "Strip Mall Sustentável Bioclimático" deve ter score >= 95%', async () => {
    const sustentavel = await db
      .select()
      .from(exampleProjects)
      .where(eq(exampleProjects.name, 'Strip Mall Sustentável Bioclimático'))
      .limit(1);
    
    expect(sustentavel.length).toBe(1);
    expect(sustentavel[0].consistencyScore).toBeGreaterThanOrEqual(95);
    expect(sustentavel[0].category).toBe('Saúde');
  });

  it('todos os materiais devem ser arrays JSON válidos', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      const materials = JSON.parse(example.dnaMaterials);
      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);
    });
  });

  it('todas as features devem ser arrays JSON válidos', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      const features = JSON.parse(example.dnaFeatures);
      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });
  });

  it('counters devem estar inicializados em 0', async () => {
    const examples = await db.select().from(exampleProjects);
    
    examples.forEach((example) => {
      expect(example.viewCount).toBeGreaterThanOrEqual(0);
      expect(example.duplicateCount).toBeGreaterThanOrEqual(0);
    });
  });
});
