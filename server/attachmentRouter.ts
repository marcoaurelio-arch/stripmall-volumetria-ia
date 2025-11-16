import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { projectAttachments, projects } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "./storage";
import { parseKMZ } from "./kmzParser";
import { updateProject } from "./db";
import { extractDataFromPDF } from "./pdfExtractor";

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

  /**
   * Processar arquivo KMZ anexado e extrair dados do terreno
   * Atualiza automaticamente os campos do projeto com as coordenadas extraídas
   */
  processKMZAttachment: protectedProcedure
    .input(
      z.object({
        attachmentId: z.number(),
        autoUpdate: z.boolean().default(true), // Se true, atualiza o projeto automaticamente
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

      const attachmentData = attachment[0];

      // Verificar se é arquivo KMZ
      if (attachmentData.fileType !== "kmz") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File is not a KMZ file",
        });
      }

      // Verificar permissão
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, attachmentData.projectId))
        .limit(1);

      if (project.length === 0 || project[0].userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      try {
        // Baixar arquivo do S3
        const response = await fetch(attachmentData.fileUrl);
        if (!response.ok) {
          throw new Error("Failed to download file from S3");
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Processar KMZ
        const kmzData = await parseKMZ(buffer);

        // Se autoUpdate estiver ativado, atualizar o projeto
        if (input.autoUpdate) {
          await updateProject(attachmentData.projectId, {
            area: kmzData.area,
            latitude: kmzData.centerLat.toString(),
            longitude: kmzData.centerLng.toString(),
            polygonCoordinates: JSON.stringify(kmzData.coordinates),
          });
        }

        return {
          success: true,
          data: {
            area: kmzData.area,
            latitude: kmzData.centerLat.toString(),
            longitude: kmzData.centerLng.toString(),
            polygonCoordinates: JSON.stringify(kmzData.coordinates),
            name: kmzData.name,
            description: kmzData.description,
          },
          updated: input.autoUpdate,
        };
      } catch (error) {
        console.error("Error processing KMZ attachment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to process KMZ file",
        });
      }
    }),

  /**
   * Extrair dados de um PDF anexado usando OCR
   * Identifica dimensões, área, recuos e parâmetros urbanísticos
   */
  extractPDFData: protectedProcedure
    .input(
      z.object({
        attachmentId: z.number(),
        autoUpdate: z.boolean().default(false), // Se true, atualiza o projeto automaticamente
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

      const attachmentData = attachment[0];

      // Verificar se é arquivo PDF
      if (attachmentData.mimeType !== "application/pdf") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File is not a PDF",
        });
      }

      // Verificar permissão
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, attachmentData.projectId))
        .limit(1);

      if (project.length === 0 || project[0].userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied",
        });
      }

      try {
        // Baixar arquivo do S3
        const response = await fetch(attachmentData.fileUrl);
        if (!response.ok) {
          throw new Error("Failed to download file from S3");
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extrair dados do PDF
        const extractedData = await extractDataFromPDF(buffer);

        // Se autoUpdate estiver ativado, atualizar o projeto
        if (input.autoUpdate && extractedData.confidence !== "low") {
          const updateData: any = {};
          
          if (extractedData.area) updateData.area = extractedData.area;
          if (extractedData.width) updateData.width = extractedData.width;
          if (extractedData.length) updateData.length = extractedData.length;
          if (extractedData.recuoFrontal) updateData.recuoFrontal = extractedData.recuoFrontal;
          if (extractedData.recuoLateral) updateData.recuoLateral = extractedData.recuoLateral;
          if (extractedData.recuoFundos) updateData.recuoFundos = extractedData.recuoFundos;
          if (extractedData.taxaOcupacao) updateData.taxaOcupacao = extractedData.taxaOcupacao;
          if (extractedData.coeficienteAproveitamento) {
            updateData.coeficienteAproveitamento = extractedData.coeficienteAproveitamento;
          }

          if (Object.keys(updateData).length > 0) {
            await updateProject(attachmentData.projectId, updateData);
          }
        }

        return {
          success: true,
          data: {
            area: extractedData.area,
            width: extractedData.width,
            length: extractedData.length,
            recuoFrontal: extractedData.recuoFrontal,
            recuoLateral: extractedData.recuoLateral,
            recuoFundos: extractedData.recuoFundos,
            taxaOcupacao: extractedData.taxaOcupacao,
            coeficienteAproveitamento: extractedData.coeficienteAproveitamento,
            confidence: extractedData.confidence,
          },
          updated: input.autoUpdate && extractedData.confidence !== "low",
        };
      } catch (error) {
        console.error("Error extracting PDF data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to extract data from PDF",
        });
      }
    }),
});
