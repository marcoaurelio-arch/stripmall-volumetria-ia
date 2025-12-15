import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { getDb } from "./db";
import { savedLayouts } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateLayoutComparisonMarkdown } from "./services/layoutPdfExportService";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";

const execAsync = promisify(exec);

export const layoutPdfExportRouter = router({
  /**
   * Exporta comparação de layouts para PDF
   */
  exportPdf: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        layoutIds: z.array(z.number()).optional(), // Se não fornecido, exporta todos
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);

      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      // Buscar layouts
      let layouts;
      if (input.layoutIds && input.layoutIds.length > 0) {
        layouts = await dbInstance
          .select()
          .from(savedLayouts)
          .where(
            and(
              eq(savedLayouts.projectId, input.projectId),
              eq(savedLayouts.isActive, 1)
            )
          )
          .orderBy(desc(savedLayouts.createdAt));
        
        // Filtrar apenas os IDs solicitados
        layouts = layouts.filter(l => input.layoutIds!.includes(l.id));
      } else {
        layouts = await dbInstance
          .select()
          .from(savedLayouts)
          .where(
            and(
              eq(savedLayouts.projectId, input.projectId),
              eq(savedLayouts.isActive, 1)
            )
          )
          .orderBy(desc(savedLayouts.createdAt));
      }

      if (layouts.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nenhum layout encontrado" });
      }

      // Gerar markdown
      const markdown = generateLayoutComparisonMarkdown({
        projectName: project.name,
        layouts,
        terrain: {
          width: project.width || 50,
          length: project.length || 100,
          area: project.area,
        },
        setbacks: {
          frontal: project.recuoFrontal || 5,
          lateral: project.recuoLateral || 3,
          fundos: project.recuoFundos || 3,
        },
      });

      // Salvar markdown temporário
      const tmpDir = "/tmp";
      const timestamp = Date.now();
      const mdPath = path.join(tmpDir, `layout-comparison-${timestamp}.md`);
      const pdfPath = path.join(tmpDir, `layout-comparison-${timestamp}.pdf`);

      await fs.writeFile(mdPath, markdown, "utf-8");

      try {
        // Converter para PDF usando manus-md-to-pdf
        await execAsync(`manus-md-to-pdf ${mdPath} ${pdfPath}`);

        // Ler PDF
        const pdfBuffer = await fs.readFile(pdfPath);
        const pdfBase64 = pdfBuffer.toString("base64");

        // Limpar arquivos temporários
        await fs.unlink(mdPath).catch(() => {});
        await fs.unlink(pdfPath).catch(() => {});

        return {
          success: true,
          pdfBase64,
          filename: `comparacao-layouts-${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
        };
      } catch (error) {
        // Limpar arquivos temporários em caso de erro
        await fs.unlink(mdPath).catch(() => {});
        await fs.unlink(pdfPath).catch(() => {});

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao gerar PDF: ${error}`,
        });
      }
    }),
});
