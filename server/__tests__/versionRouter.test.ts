import { describe, it, expect, beforeAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { analysisVersions } from '../../drizzle/schema';
import { desc, eq } from 'drizzle-orm';

describe('Version Router', () => {
  let db: ReturnType<typeof drizzle>;

  beforeAll(() => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set');
    }
    db = drizzle(process.env.DATABASE_URL);
  });

  it('should have analysisVersions table accessible', async () => {
    // Just verify the table is accessible
    const result = await db
      .select()
      .from(analysisVersions)
      .limit(1);
    
    expect(Array.isArray(result)).toBe(true);
  });

  it('should be able to query versions by projectId', async () => {
    // Query versions for a non-existent project (should return empty array)
    const result = await db
      .select()
      .from(analysisVersions)
      .where(eq(analysisVersions.projectId, 999999))
      .orderBy(desc(analysisVersions.versionNumber))
      .limit(10);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should have correct schema structure for analysisVersions', async () => {
    // Verify the schema has expected columns by checking a sample query
    const result = await db
      .select({
        id: analysisVersions.id,
        projectId: analysisVersions.projectId,
        versionNumber: analysisVersions.versionNumber,
        versionLabel: analysisVersions.versionLabel,
        areaMaximaConstruida: analysisVersions.areaMaximaConstruida,
        numeroLojas: analysisVersions.numeroLojas,
        vagasEstacionamento: analysisVersions.vagasEstacionamento,
        custoEstimado: analysisVersions.custoEstimado,
        roiEstimado: analysisVersions.roiEstimado,
        createdAt: analysisVersions.createdAt,
      })
      .from(analysisVersions)
      .limit(1);
    
    expect(Array.isArray(result)).toBe(true);
  });
});
