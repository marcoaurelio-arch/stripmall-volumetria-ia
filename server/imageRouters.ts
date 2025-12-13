import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateImage } from "./_core/imageGeneration";
import { analyzeTerrainGeometry } from "./services/terrainGeometryService";
import { generateStaticMapUrl, calculateAppropriateZoom } from "./mapsImageGenerator";
import { generateLayoutDescription, generateFloorplanLayoutDescription, generateSiteplanLayoutDescription } from "./services/layoutDescriptionService";
import { generateProjectDNA, generateConsistentPrompt, type ProjectDNA } from "./services/projectDNAService";
import { getOrGenerateProjectDNA } from "./services/projectDNAHelper";
import { buildProjectContext } from "./services/projectContextHelper";
import { generateStripMallContext, generateSpecializedPrompt } from "./services/stripMallPromptService";

export const imageRouter = router({
  // Gerar estudo conceitual 3D
  generateConceptual: protectedProcedure
    .input(z.object({ 
      projectId: z.number(),
      referenceImageIds: z.array(z.number()).optional() // IDs dos anexos de referência
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);
      
      // Buscar projetos similares para enriquecer o prompt
      const dbInstance = await db.getDb();
      let similarProjectsContext = "";
      if (dbInstance && project.area) {
        const { inspirationProjects } = await import("../drizzle/schema");
        const { and, gte, lte } = await import("drizzle-orm");
        
        const similarProjects = await dbInstance
          .select()
          .from(inspirationProjects)
          .where(
            and(
              gte(inspirationProjects.area, Math.floor(project.area * 0.7)),
              lte(inspirationProjects.area, Math.ceil(project.area * 1.3))
            )
          )
          .limit(3);
        
        if (similarProjects.length > 0) {
          const projectDescriptions = similarProjects.map(p => 
            `${p.name} (${p.location}): ${p.area}m², ${p.storeCount} lojas`
          ).join('; ');
          similarProjectsContext = `\n\nREFERENCE PROJECTS (similar Brazilian strip malls for architectural inspiration):\n${projectDescriptions}\nUse these as reference for architectural style, scale, and layout typical of Brazilian commercial centers.`;
        }
      }
      
      // Gerar imagem de satélite do terreno para referência
      let siteImageUrl = "";
      if (project.polygonCoordinates && project.latitude && project.longitude) {
        const zoom = calculateAppropriateZoom(project.area);
        siteImageUrl = generateStaticMapUrl(
          { lat: parseFloat(project.latitude), lng: parseFloat(project.longitude) },
          project.polygonCoordinates,
          zoom
        );
      }
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });
      
      // Gerar contexto especializado de strip mall
      // Determinar forma do terreno a partir da geometria
      let terrainShape = 'rectangular';
      if (project.polygonCoordinates) {
        try {
          const rawCoords = JSON.parse(project.polygonCoordinates);
          const coords = rawCoords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
          const geom = analyzeTerrainGeometry(coords);
          terrainShape = geom.shape.type.toLowerCase();
        } catch (e) {
          console.warn('Failed to analyze terrain geometry:', e);
        }
      }
      
      const floors = context.project?.buildingHeight ? Math.ceil(context.project.buildingHeight / 4) : 1;
      const stripMallContext = generateStripMallContext(
        terrainShape,
        floors,
        context.analysis?.areaMaximaConstruida || context.project?.area || 0,
        context.analysis?.numeroLojas || 12,
        undefined // anchorStoreArea - não disponível no schema atual
      );
      
      // Gerar prompt especializado para estudos conceituais
      const specializedPrompt = generateSpecializedPrompt(
        'conceptual',
        projectDNA,
        stripMallContext
      );
      
      const prompt = `${specializedPrompt}
${similarProjectsContext}
${layoutDescription}

ADDITIONAL CONTEXT:
${context.briefingSection}`;

      try {
        // Buscar imagens de referência selecionadas
        const originalImages: Array<{ url: string; mimeType: string }> = [];
        
        // Adicionar imagem de satélite do terreno
        if (siteImageUrl) {
          originalImages.push({
            url: siteImageUrl,
            mimeType: "image/jpeg"
          });
        }
        
        // Adicionar imagens de referência selecionadas pelo usuário
        if (input.referenceImageIds && input.referenceImageIds.length > 0) {
          const referenceAttachments = await db.getAttachmentsByIds(input.referenceImageIds);
          for (const attachment of referenceAttachments) {
            // Verificar se pertence ao projeto correto e tem mimeType
            if (attachment.projectId === input.projectId && attachment.mimeType) {
              originalImages.push({
                url: attachment.fileUrl,
                mimeType: attachment.mimeType
              });
            }
          }
        }
        
        const generateParams: any = { prompt };
        if (originalImages.length > 0) {
          generateParams.originalImages = originalImages;
        }
        
        const { url: imageUrl } = await generateImage(generateParams);
        
        if (!imageUrl) {
          throw new Error("Failed to generate image URL");
        }
        
        // Salvar no banco
        await db.createGeneratedImage({
          projectId: input.projectId,
          type: "conceptual",
          imageUrl,
          prompt,
        });
        
        return { success: true, imageUrl };
      } catch (error) {
        console.error("Error generating conceptual image:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar imagem conceitual",
        });
      }
    }),

  // Gerar planta baixa
  generateFloorplan: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      // Obter última análise para usar nos prompts
      const analysis = await db.getLatestAnalysis(input.projectId);
      
      // Buscar projetos similares para enriquecer o prompt
      const dbInstance = await db.getDb();
      let similarProjectsContext = "";
      if (dbInstance && project.area) {
        const { inspirationProjects } = await import("../drizzle/schema");
        const { and, gte, lte } = await import("drizzle-orm");
        
        const similarProjects = await dbInstance
          .select()
          .from(inspirationProjects)
          .where(
            and(
              gte(inspirationProjects.area, Math.floor(project.area * 0.7)),
              lte(inspirationProjects.area, Math.ceil(project.area * 1.3))
            )
          )
          .limit(3);
        
        if (similarProjects.length > 0) {
          const projectDescriptions = similarProjects.map(p => 
            `${p.name}: ${p.area}m², ${p.storeCount} lojas`
          ).join('; ');
          similarProjectsContext = `\n\nREFERENCE PROJECTS (similar Brazilian strip malls for layout reference):\n${projectDescriptions}\nUse these as reference for typical store layouts and parking configurations.`;
        }
      }
      
      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateFloorplanLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });
      
      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "floorplan");
      
      // Construir prompt final com contexto completo
      const prompt = `${basePrompt}

${context.briefingSection}
${context.geometryInfo}
${context.criticalRequirements}
${similarProjectsContext}
${layoutDescription}

TECHNICAL DRAWING REQUIREMENTS:
- Architectural floor plan view (top-down orthogonal projection)
- Show exact layout of ${context.analysis?.numeroLojas || 'all'} retail units
- Include parking layout with ${context.analysis?.vagasEstacionamento || 'all'} spaces
- Add dimensions, room labels, and circulation paths
- Include legend with area breakdown
- Scale: 1:200 or 1:100`;

      try {
        const { url: imageUrl } = await generateImage({ prompt });
        
        if (!imageUrl) {
          throw new Error("Failed to generate image URL");
        }
        
        // Salvar no banco
        await db.createGeneratedImage({
          projectId: input.projectId,
          type: "floorplan",
          imageUrl,
          prompt,
        });
        
        return { success: true, imageUrl };
      } catch (error) {
        console.error("Error generating floorplan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar planta baixa",
        });
      }
    }),

  // Listar imagens de um projeto
  list: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }
      
      return db.getGeneratedImagesByProjectId(input.projectId);
    }),

  // Deletar imagem
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Verificar se a imagem pertence ao usuário antes de deletar
      await db.deleteGeneratedImage(input.id);
      return { success: true };
    }),

  // Buscar imagens conceituais recentes para carrossel (público)
  getRecentConceptual: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      return db.getRecentConceptualImages(input.limit);
    }),

  // Gerar maquete eletrônica (estilo volumes coloridos)
  generateElectronicModel: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);

      const prompt = `Create an ELECTRONIC ARCHITECTURAL MODEL (maquete eletrônica) of a strip mall development in clean, simplified 3D style.

STYLE REQUIREMENTS:
- Simple geometric volumes with flat, vibrant colors
- NO photorealistic materials or textures
- Clean matte finish on all surfaces
- Color-code by function: Pharmacy (yellow/gold), Retail stores (blue/cyan), Supermarket (red/pink), Administrative (magenta), Loading dock (orange)
- Add text labels on each volume identifying the use
- White or light gray background
- Soft ambient shadows for depth
- Isometric or aerial 3/4 view

${context.briefingSection}
${context.geometryInfo}
${context.criticalRequirements}

CONTEXT:
- Show simplified parking lot with ${context.analysis?.vagasEstacionamento || 'all'} marked spaces (gray asphalt, white lines)
- Include simple trees/vegetation (green spheres or simple shapes)
- Show access roads and circulation paths
- Add simple cars for scale (basic shapes)
- Show building footprints clearly
- Display ${context.analysis?.numeroLojas || 'all'} retail units as colored volumes

COMPOSITION:
- Clear view of the entire development
- Emphasize the volumetric organization
- Show spatial relationships between buildings
- Professional architectural presentation style

Render as a clean architectural study model, similar to professional feasibility studies. Focus on clarity and spatial understanding rather than realism.`;

      const result = await generateImage({ prompt });
      const imageUrl = result.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "electronic_model",
        imageUrl,
        prompt,
      });

      return { imageUrl, prompt };
    }),

  // Gerar vista de fachada
  generateFacadeView: protectedProcedure
    .input(z.object({ 
      projectId: z.number(),
      viewAngle: z.enum(["front", "back", "left", "right"]).optional().default("front")
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });

      const viewDescriptions = {
        front: "Main street facade view",
        back: "Rear facade with loading areas",
        left: "Left side elevation",
        right: "Right side elevation"
      };

      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "facade");

      const prompt = `${basePrompt}

VIEW: ${viewDescriptions[input.viewAngle]}

${context.briefingSection}
${context.geometryInfo}
${context.criticalRequirements}
${layoutDescription}

FACADE REQUIREMENTS:
- Architectural elevation drawing
- Show ${context.analysis?.numeroLojas || 'all'} retail units
- Include storefront details, signage, and materials
- Add human scale figures
- Professional architectural presentation`;

      const result = await generateImage({ prompt });
      const imageUrl = result.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "facade_view",
        imageUrl,
        prompt,
      });

      return { imageUrl, prompt, viewAngle: input.viewAngle };
    }),

  // Gerar todas as 4 vistas de fachada de uma vez
  generateAllFacadeViews: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      const views: Array<"front" | "back" | "left" | "right"> = ["front", "back", "left", "right"];
      const results = [];

      for (const viewAngle of views) {
        const viewDescriptions = {
          front: "Main street facade view",
          back: "Rear facade with loading areas",
          left: "Left side elevation",
          right: "Right side elevation"
        };

        // Gerar prompt consistente usando DNA do projeto
        const basePrompt = generateConsistentPrompt(projectDNA, "facade");

        const prompt = `${basePrompt}

VIEW: ${viewDescriptions[viewAngle]}

${context.briefingSection}
${context.geometryInfo}
${context.criticalRequirements}

FACADE REQUIREMENTS:
- Architectural elevation drawing
- Show ${context.analysis?.numeroLojas || 'all'} retail units
- Include storefront details, signage, and materials
- Add human scale figures
- Professional architectural presentation`;

        const result = await generateImage({ prompt });
        const imageUrl = result.url as string;

        await db.createGeneratedImage({
          projectId: input.projectId,
          type: "facade_view",
          imageUrl,
          prompt,
        });

        results.push({ imageUrl, viewAngle });
      }

      return { results, count: results.length };
    }),

  // Gerar corte longitudinal ABNT
  generateLongitudinalSection: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Obter contexto completo do projeto (DNA + dados reais)
      const { buildProjectContext } = await import("./services/projectContextHelper");
      const context = await buildProjectContext(input.projectId);

      // Buscar projetos similares para referência
      const dbInstance = await db.getDb();
      let similarProjectsContext = "";
      if (dbInstance && project.area) {
        const { inspirationProjects } = await import("../drizzle/schema");
        const { and, gte, lte } = await import("drizzle-orm");
        
        const similarProjects = await dbInstance
          .select()
          .from(inspirationProjects)
          .where(
            and(
              gte(inspirationProjects.area, Math.floor(project.area * 0.7)),
              lte(inspirationProjects.area, Math.ceil(project.area * 1.3))
            )
          )
          .limit(3);
        
        if (similarProjects.length > 0) {
          const projectDescriptions = similarProjects.map(p => 
            `${p.name}: ${p.floors || 1} pavimentos`
          ).join('; ');
          similarProjectsContext = `\n\nREFERENCE PROJECTS (similar Brazilian strip malls):\n${projectDescriptions}`;
        }
      }

      // Gerar prompt base usando DNA do projeto para consistência visual
      const { generateConsistentPrompt } = await import("./services/projectDNAService");
      const dnaPromptBase = generateConsistentPrompt(context.dna, "section");

      const prompt = `${dnaPromptBase}\n\nCreate a LONGITUDINAL ARCHITECTURAL SECTION (Corte Longitudinal AA) of a strip mall following ABNT Brazilian technical drawing standards.${similarProjectsContext}

ABNT TECHNICAL REQUIREMENTS:
- Clean black and white technical drawing
- Continuous thick lines (0.7mm) for cut elements
- Thin lines (0.3mm) for visible elements beyond cut
- Dashed lines for hidden elements
- Level indicators: ±0.00 (ground floor), +3.50 (slab), +5.00 (roof)
- Vertical dimensions with extension lines and arrows
- Horizontal dimensions showing total length
- Material hatching: concrete (45° diagonal lines), masonry (cross-hatch)
- North arrow and scale (1:100 or 1:200)
- Title block with: project name, drawing title "CORTE LONGITUDINAL AA", scale, date

${context.criticalRequirements}
${context.geometryInfo}
${context.briefingSection}

SECTION CONTENT:
- Cut through the longest dimension showing all stores in sequence
- Show foundation, floor slab, walls, roof structure
- Include ceiling height variations based on store types
- Show mezzanine if applicable
- Indicate drainage slopes on roof
- Show parking lot level and building floor level difference
- Add human figures for scale (1.75m)

LABELS AND ANNOTATIONS:
- Room names: "FARMÁCIA", "LOJA 1", "LOJA 2", "SUPERMERCADO"
- Level marks: "PISO ACABADO ±0.00", "LAJE +3.50", "COBERTURA +5.00"
- Structural elements: "VIGA", "PILAR", "FUNDAÇÃO"
- Dimensions in meters with 2 decimal places

Render as a professional technical drawing following NBR 6492 (Architectural Drawing) standards.`;

      const result = await generateImage({ prompt });
      const imageUrl = result.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "longitudinal_section",
        imageUrl,
        prompt,
      });

      return { imageUrl, prompt };
    }),

  // Gerar corte transversal ABNT
  generateTransversalSection: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Obter contexto completo do projeto (DNA + dados reais)
      const { buildProjectContext } = await import("./services/projectContextHelper");
      const context = await buildProjectContext(input.projectId);

      // Buscar projetos similares para referência
      const dbInstance = await db.getDb();
      let similarProjectsContext = "";
      if (dbInstance && project.area) {
        const { inspirationProjects } = await import("../drizzle/schema");
        const { and, gte, lte } = await import("drizzle-orm");
        
        const similarProjects = await dbInstance
          .select()
          .from(inspirationProjects)
          .where(
            and(
              gte(inspirationProjects.area, Math.floor(project.area * 0.7)),
              lte(inspirationProjects.area, Math.ceil(project.area * 1.3))
            )
          )
          .limit(3);
        
        if (similarProjects.length > 0) {
          const projectDescriptions = similarProjects.map(p => 
            `${p.name}: ${p.floors || 1} pavimentos`
          ).join('; ');
          similarProjectsContext = `\n\nREFERENCE PROJECTS (similar Brazilian strip malls):\n${projectDescriptions}`;
        }
      }

      // Gerar prompt base usando DNA do projeto para consistência visual
      const { generateConsistentPrompt } = await import("./services/projectDNAService");
      const dnaPromptBase = generateConsistentPrompt(context.dna, "section");

      const prompt = `${dnaPromptBase}

Create a TRANSVERSAL ARCHITECTURAL SECTION (Corte Transversal BB) of a strip mall following ABNT Brazilian technical drawing standards.${similarProjectsContext}

ABNT TECHNICAL REQUIREMENTS:
- Clean black and white technical drawing
- Continuous thick lines (0.7mm) for cut elements
- Thin lines (0.3mm) for visible elements beyond cut
- Dashed lines for hidden elements
- Level indicators: ±0.00 (ground floor), +3.50 (slab), +5.00 (roof)
- Vertical dimensions with extension lines and arrows
- Horizontal dimensions showing width
- Material hatching: concrete (45° diagonal lines), masonry (cross-hatch)
- North arrow and scale (1:100 or 1:200)
- Title block with: project name, drawing title "CORTE TRANSVERSAL BB", scale, date

${context.criticalRequirements}
${context.geometryInfo}
${context.briefingSection}

SECTION CONTENT:
- Cut through the width showing typical store depth
- Show foundation, floor slab, side walls, roof structure
- Include ceiling height (3.5m to 5.0m depending on store type)
- Show roof drainage slope
- Indicate parking area on one side, loading area on other
- Show lateral setbacks if applicable
- Add human figures for scale (1.75m)
- Show typical store depth (15m to 20m)

LABELS AND ANNOTATIONS:
- Space labels: "ÁREA DE VENDAS", "DEPÓSITO", "ESTACIONAMENTO"
- Level marks: "PISO ACABADO ±0.00", "LAJE +3.50", "COBERTURA +5.00"
- Structural elements: "VIGA", "PILAR", "FUNDAÇÃO"
- Dimensions in meters with 2 decimal places
- Ceiling height indication

Render as a professional technical drawing following NBR 6492 (Architectural Drawing) standards.`;

      const result = await generateImage({ prompt });
      const imageUrl = result.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "transversal_section",
        imageUrl,
        prompt,
      });

      return { imageUrl, prompt };
    }),

  // Gerar ambos os cortes de uma vez
  generateBothSections: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Obter contexto completo do projeto (DNA + dados reais)
      const { buildProjectContext } = await import("./services/projectContextHelper");
      const context = await buildProjectContext(input.projectId);

      // Gerar prompt base usando DNA do projeto
      const { generateConsistentPrompt } = await import("./services/projectDNAService");
      const dnaPromptBase = generateConsistentPrompt(context.dna, "section");

      const results = [];

      // Corte Longitudinal
      const longitudinalPrompt = `${dnaPromptBase}\n\nCreate a LONGITUDINAL ARCHITECTURAL SECTION (Corte Longitudinal AA) of a strip mall following ABNT Brazilian technical drawing standards.

ABNT TECHNICAL REQUIREMENTS:
- Clean black and white technical drawing
- Continuous thick lines (0.7mm) for cut elements
- Thin lines (0.3mm) for visible elements beyond cut
- Dashed lines for hidden elements
- Level indicators: ±0.00 (ground floor), +3.50 (slab), +5.00 (roof)
- Vertical dimensions with extension lines and arrows
- Horizontal dimensions showing total length
- Material hatching: concrete (45° diagonal lines), masonry (cross-hatch)
- North arrow and scale (1:100 or 1:200)
- Title block with: project name, drawing title "CORTE LONGITUDINAL AA", scale, date

${context.criticalRequirements}
${context.geometryInfo}
${context.briefingSection}

SECTION CONTENT:
- Cut through the longest dimension showing all stores in sequence
- Show foundation, floor slab, walls, roof structure
- Include ceiling height variations based on store types
- Show mezzanine if applicable
- Indicate drainage slopes on roof
- Show parking lot level and building floor level difference
- Add human figures for scale (1.75m)

LABELS AND ANNOTATIONS:
- Room names: "FARMÁCIA", "LOJA 1", "LOJA 2", "SUPERMERCADO"
- Level marks: "PISO ACABADO ±0.00", "LAJE +3.50", "COBERTURA +5.00"
- Structural elements: "VIGA", "PILAR", "FUNDAÇÃO"
- Dimensions in meters with 2 decimal places

Render as a professional technical drawing following NBR 6492 (Architectural Drawing) standards.`;

      const longitudinalResult = await generateImage({ prompt: longitudinalPrompt });
      const longitudinalUrl = longitudinalResult.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "longitudinal_section",
        imageUrl: longitudinalUrl,
        prompt: longitudinalPrompt,
      });

      results.push({ type: "longitudinal", imageUrl: longitudinalUrl });

      // Corte Transversal
      const transversalPrompt = `${dnaPromptBase}\n\nCreate a TRANSVERSAL ARCHITECTURAL SECTION (Corte Transversal BB) of a strip mall following ABNT Brazilian technical drawing standards.

ABNT TECHNICAL REQUIREMENTS:
- Clean black and white technical drawing
- Continuous thick lines (0.7mm) for cut elements
- Thin lines (0.3mm) for visible elements beyond cut
- Dashed lines for hidden elements
- Level indicators: ±0.00 (ground floor), +3.50 (slab), +5.00 (roof)
- Vertical dimensions with extension lines and arrows
- Horizontal dimensions showing width
- Material hatching: concrete (45° diagonal lines), masonry (cross-hatch)
- North arrow and scale (1:100 or 1:200)
- Title block with: project name, drawing title "CORTE TRANSVERSAL BB", scale, date

${context.criticalRequirements}
${context.geometryInfo}
${context.briefingSection}

SECTION CONTENT:
- Cut through the width showing typical store depth
- Show foundation, floor slab, side walls, roof structure
- Include ceiling height (3.5m to 5.0m depending on store type)
- Show roof drainage slope
- Indicate parking area on one side, loading area on other
- Show lateral setbacks if applicable
- Add human figures for scale (1.75m)
- Show typical store depth (15m to 20m)

LABELS AND ANNOTATIONS:
- Space labels: "ÁREA DE VENDAS", "DEPÓSITO", "ESTACIONAMENTO"
- Level marks: "PISO ACABADO ±0.00", "LAJE +3.50", "COBERTURA +5.00"
- Structural elements: "VIGA", "PILAR", "FUNDAÇÃO"
- Dimensions in meters with 2 decimal places
- Ceiling height indication

Render as a professional technical drawing following NBR 6492 (Architectural Drawing) standards.`;

      const transversalResult = await generateImage({ prompt: transversalPrompt });
      const transversalUrl = transversalResult.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "transversal_section",
        imageUrl: transversalUrl,
        prompt: transversalPrompt,
      });

      results.push({ type: "transversal", imageUrl: transversalUrl });

      return { results, count: results.length };
    }),

  // Gerar planta de implantação com estacionamento, acessos, calçadas e áreas verdes
  generateSitePlan: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateSiteplanLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });

      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "siteplan");

      const sitePlanPrompt = `${basePrompt}

${context.briefingSection}
${context.geometryInfo}
${context.criticalRequirements}
${layoutDescription}

SITE PLAN REQUIREMENTS:
- Top-down architectural site plan (implantação)
- Show building footprint with exact dimensions
- Include all ${context.analysis?.vagasEstacionamento || 'parking'} spaces with layout (90°, 45°, parallel)
- Add vehicular and pedestrian access points
- Include perimeter sidewalks and walkways
- Show green areas and landscaping
- Add dimension lines for setbacks and distances
- Include north arrow and graphic scale
- Add legend for paving materials
- Scale: 1:500 or 1:200`;

      const result = await generateImage({ prompt: sitePlanPrompt });
      const imageUrl = result.url as string;

      await db.createGeneratedImage({
        projectId: input.projectId,
        type: "site_plan",
        imageUrl,
        prompt: sitePlanPrompt,
      });

      return { imageUrl };
    }),

  // Gerar planta baixa de uma variação específica
  generateVariationFloorplan: protectedProcedure
    .input(z.object({ 
      projectId: z.number(),
      variationData: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        numberOfStores: z.number(),
        storeConfiguration: z.object({
          small: z.number(),
          medium: z.number(),
          large: z.number(),
        }),
        parkingSpaces: z.number(),
        parkingLayout: z.enum(["frontal", "lateral", "posterior", "misto"]),
        buildingOrientation: z.enum(["norte", "sul", "leste", "oeste"]),
        floors: z.number(),
        totalBuiltArea: z.number(),
        commercialArea: z.number(),
        circulationArea: z.number(),
        serviceArea: z.number(),
        greenArea: z.number(),
      })
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Construir contexto completo usando helper centralizado
      const context = await buildProjectContext(input.projectId);
      
      // Obter DNA do projeto para manter consistência visual
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      const { variationData } = input;

      // Gerar prompt base usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "floorplan");

      // Adicionar detalhes específicos da variação
      const variationContext = `

VARIATION DETAILS (${variationData.name}):
${variationData.description}

LAYOUT CONFIGURATION:
- Total stores: ${variationData.numberOfStores} (${variationData.storeConfiguration.small} small <50m², ${variationData.storeConfiguration.medium} medium 50-100m², ${variationData.storeConfiguration.large} large >100m²)
- Parking: ${variationData.parkingSpaces} spaces (${variationData.parkingLayout} layout)
- Building orientation: ${variationData.buildingOrientation}
- Floors: ${variationData.floors}

AREA BREAKDOWN:
- Total built area: ${variationData.totalBuiltArea.toFixed(2)}m²
- Commercial area: ${variationData.commercialArea.toFixed(2)}m² (${((variationData.commercialArea/variationData.totalBuiltArea)*100).toFixed(1)}%)
- Circulation area: ${variationData.circulationArea.toFixed(2)}m² (${((variationData.circulationArea/variationData.totalBuiltArea)*100).toFixed(1)}%)
- Service area: ${variationData.serviceArea.toFixed(2)}m² (${((variationData.serviceArea/variationData.totalBuiltArea)*100).toFixed(1)}%)
- Green area: ${variationData.greenArea.toFixed(2)}m²

IMPORTANT: The floorplan must accurately represent this specific variation's layout with the exact number and size distribution of stores.`;

      const prompt = `${basePrompt}

${context.briefingSection}
${context.geometryInfo}
${variationContext}

TECHNICAL DRAWING REQUIREMENTS:
- Architectural floor plan view (top-down orthogonal projection)
- Show exact layout of ${variationData.numberOfStores} retail units
- Include parking layout with ${variationData.parkingSpaces} spaces
- Add dimensions, room labels, and circulation paths
- Include legend with area breakdown
- Scale: 1:200 or 1:100`;

      try {
        const { url: imageUrl } = await generateImage({ prompt });
        
        if (!imageUrl) {
          throw new Error("Failed to generate image URL");
        }
        
        // Salvar no banco com dados da variação
        await db.createGeneratedImage({
          projectId: input.projectId,
          type: "variation_floorplan",
          imageUrl,
          prompt,
          variationData: JSON.stringify(variationData),
        });
        
        return { imageUrl, variationId: variationData.id };
      } catch (error) {
        console.error("[ImageRouter] Error generating variation floorplan:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar planta da variação",
        });
      }
    }),

  // Listar plantas de variações de um projeto
  listVariationFloorplans: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const images = await db.getGeneratedImagesByProjectId(input.projectId);
      return images.filter((img: any) => img.type === "variation_floorplan");
    }),
});
