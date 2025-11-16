import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { projectAttachments, projects } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "./storage";

/**
 * Router para gerenciamento de anexos de projetos
 * Suporta upload, listagem e exclusão de arquivos (plantas, documentos, imagens de referência)
 */
export const attachmentRouter = router({
  /**
   * Upload de arquivo para um projeto
   * Recebe o arquivo em base64, faz upload para S3 e salva metadados no banco
   */
  uploadAttachment: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileType: z.enum(["plant", "document", "reference_image", "kmz"]),
        mimeType: z.string(),
        fileSize: z.number(),
        fileData: z.string(), // Base64 encoded file data
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se o projeto existe e pertence ao usuário
      const project = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, input.projectId),
            eq(projects.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or access denied",
        });
      }

      try {
        // Converter base64 para buffer
        const fileBuffer = Buffer.from(input.fileData, "base64");

        // Gerar chave única para o arquivo no S3
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileKey = `project-${input.projectId}/attachments/${timestamp}-${randomSuffix}-${sanitizedFileName}`;

        // Upload para S3
        const { url: fileUrl } = await storagePut(
          fileKey,
          fileBuffer,
          input.mimeType
        );

        // Salvar metadados no banco de dados
        const [attachment] = await db.insert(projectAttachments).values({
          projectId: input.projectId,
          fileName: input.fileName,
          fileType: input.fileType,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          fileUrl,
          fileKey,
          description: input.description || null,
          uploadedBy: ctx.user.id,
        });

        return {
          success: true,
          attachmentId: attachment.insertId,
          fileUrl,
        };
      } catch (error) {
        console.error("Error uploading attachment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload file",
        });
      }
    }),

  /**
   * Listar todos os anexos de um projeto
   */
  listAttachments: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se o projeto existe e pertence ao usuário
      const project = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, input.projectId),
            eq(projects.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (project.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or access denied",
        });
      }

      // Buscar todos os anexos do projeto
      const attachments = await db
        .select()
        .from(projectAttachments)
        .where(eq(projectAttachments.projectId, input.projectId))
        .orderBy(projectAttachments.createdAt);

      return attachments;
    }),

  /**
   * Excluir um anexo
   * Remove o arquivo do S3 e os metadados do banco
   */
  deleteAttachment: protectedProcedure
    .input(
      z.object({
        attachmentId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar o anexo e verificar permissão
      const attachment = await db
        .select({
          id: projectAttachments.id,
          projectId: projectAttachments.projectId,
          fileKey: projectAttachments.fileKey,
          uploadedBy: projectAttachments.uploadedBy,
        })
        .from(projectAttachments)
        .where(eq(projectAttachments.id, input.attachmentId))
        .limit(1);

      if (attachment.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attachment not found",
        });
      }

      // Verificar se o usuário tem permissão (dono do projeto ou quem fez upload)
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, attachment[0].projectId))
        .limit(1);

      if (
        project.length === 0 ||
        (project[0].userId !== ctx.user.id &&
          attachment[0].uploadedBy !== ctx.user.id)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      try {
        // Nota: O S3 storage helper não tem função de delete exposta
        // Em produção, seria necessário implementar storageDelete
        // Por enquanto, apenas removemos do banco de dados

        // Remover do banco de dados
        await db
          .delete(projectAttachments)
          .where(eq(projectAttachments.id, input.attachmentId));

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error deleting attachment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete attachment",
        });
      }
    }),

  /**
   * Obter detalhes de um anexo específico
   */
  getAttachment: protectedProcedure
    .input(
      z.object({
        attachmentId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar o anexo
      const attachment = await db
        .select()
        .from(projectAttachments)
        .where(eq(projectAttachments.id, input.attachmentId))
        .limit(1);

      if (attachment.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attachment not found",
        });
      }

      // Verificar permissão
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, attachment[0].projectId))
        .limit(1);

      if (project.length === 0 || project[0].userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      return attachment[0];
    }),
});
