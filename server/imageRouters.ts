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
            `${p.name} (${p.location}): ${p.area}m², ${p.storeCount} lojas`
          ).join('; ');
          similarProjectsContext = `\n\nREFERENCE PROJECTS (similar Brazilian strip malls for architectural inspiration):\n${projectDescriptions}\nUse these as reference for architectural style, scale, and layout typical of Brazilian commercial centers.`;
        }
      }
      
      // Analisar geometria do terreno e gerar imagem de referência
      let geometryInfo = "";
      let siteImageUrl = "";
      
      if (project.polygonCoordinates && project.latitude && project.longitude) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY (CRITICAL - MUST MATCH EXACTLY):\n${geometry.promptDescription}\n- Exact lot dimensions: ${geometry.dimensions.width}m (width) x ${geometry.dimensions.length}m (length)\n- Lot shape type: ${geometry.shape.type} (${geometry.vertices} vertices)\n- Main orientation: ${geometry.orientation.cardinalDirection} (${geometry.orientation.mainAxis}°)\n- ${geometry.orientation.solarOrientation}\n- The building layout MUST respect this exact ${geometry.shape.type} lot geometry, not a generic rectangular shape\n- Parking and circulation must fit within the ${geometry.dimensions.perimeter}m perimeter`;
        
        // Gerar URL da imagem de satélite do terreno
        const zoom = calculateAppropriateZoom(project.area);
        siteImageUrl = generateStaticMapUrl(
          { lat: parseFloat(project.latitude), lng: parseFloat(project.longitude) },
          project.polygonCoordinates,
          zoom
        );
      }
      
      // Criar prompt fotorrealista para estudo conceitual
      const briefingContext = project.briefing 
        ? `\nProject briefing and requirements: ${project.briefing}` 
        : '';
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });
      
      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "conceptual");
      
      // Adicionar contexto específico do projeto
      const additionalContext = `
SITE SPECIFICATIONS:
- Total lot area: ${project.area}m²
- ${analysis ? `${analysis.numeroLojas} retail units` : '8-12 retail units'}
- ${analysis?.vagasEstacionamento || '40-60'} parking spaces
- Building area: ${analysis?.areaMaximaConstruida || project.area}m²

${similarProjectsContext}
${geometryInfo}
${layoutDescription}
${briefingContext}`;

      const prompt = `${basePrompt} ${additionalContext}`;

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
      
      // Analisar geometria do terreno se houver polígono
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nLOT GEOMETRY (CRITICAL FOR FLOOR PLAN):\n${geometry.promptDescription}\n- Exact lot: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m (${geometry.shape.type})\n- ${geometry.vertices} vertices defining the lot boundary\n- Building footprint MUST fit within this exact ${geometry.shape.type} shape\n- Parking layout must adapt to ${geometry.orientation.cardinalDirection} orientation\n- Total site perimeter: ${geometry.dimensions.perimeter}m`;
      }
      
      // Criar prompt técnico para planta baixa
      const briefingContext = project.briefing 
        ? `\nProject requirements: ${project.briefing}` 
        : '';
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateFloorplanLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });
      
      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "floorplan");
      
      // Adicionar contexto específico do projeto
      const additionalContext = `
SITE SPECIFICATIONS:
- Total lot area: ${project.area}m²
- ${analysis?.numeroLojas || '8-12'} retail units
- ${analysis?.vagasEstacionamento || 'multiple'} parking spaces
- Building area: ${analysis?.areaMaximaConstruida || project.area * 0.6}m²

${similarProjectsContext}
${geometryInfo}
${layoutDescription}
${briefingContext}`;

      const prompt = `${basePrompt} ${additionalContext}`;

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

      const analysis = await db.getLatestAnalysis(input.projectId);
      
      let geometryInfo = "";
      if (project.polygonCoordinates && project.latitude && project.longitude) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m\n- Orientation: ${geometry.orientation.cardinalDirection}`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

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

PROJECT DATA:
- Site area: ${project.area}m²
- Width: ${project.width}m, Length: ${project.length}m${geometryInfo}${briefingSection}

CONTEXT:
- Show simplified parking lot with marked spaces (gray asphalt, white lines)
- Include simple trees/vegetation (green spheres or simple shapes)
- Show access roads and circulation paths
- Add simple cars for scale (basic shapes)
- Show building footprints clearly

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

      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      const analysis = await db.getLatestAnalysis(input.projectId);
      
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";
      
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
      
      // Adicionar contexto específico do projeto
      const additionalContext = `
VIEW: ${viewDescriptions[input.viewAngle]}

SITE SPECIFICATIONS:
- Total lot area: ${project.area}m²
- Building dimensions: ${project.width}m x ${project.length}m
${geometryInfo}
${briefingSection}
${layoutDescription}`;

      const prompt = `${basePrompt} ${additionalContext}`;

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

      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      const views: Array<"front" | "back" | "left" | "right"> = ["front", "back", "left", "right"];
      const results = [];

      for (const viewAngle of views) {
        let geometryInfo = "";
        if (project.polygonCoordinates) {
          const coordinates = JSON.parse(project.polygonCoordinates);
          const geometry = analyzeTerrainGeometry(coordinates);
          geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
        }

        const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

        const viewDescriptions = {
          front: "Main street facade view",
          back: "Rear facade with loading areas",
          left: "Left side elevation",
          right: "Right side elevation"
        };

        // Gerar prompt consistente usando DNA do projeto
        const basePrompt = generateConsistentPrompt(projectDNA, "facade");
        
        // Adicionar contexto específico do projeto
        const additionalContext = `
VIEW: ${viewDescriptions[viewAngle]}

SITE SPECIFICATIONS:
- Total lot area: ${project.area}m²
- Building dimensions: ${project.width}m x ${project.length}m
${geometryInfo}
${briefingSection}`;

        const prompt = `${basePrompt} ${additionalContext}`;

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

      // Buscar projetos similares
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
      
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      const prompt = `Create a LONGITUDINAL ARCHITECTURAL SECTION (Corte Longitudinal AA) of a strip mall following ABNT Brazilian technical drawing standards.${similarProjectsContext}

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

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m (width) x ${project.length}m (length)${geometryInfo}${briefingSection}

SECTION CONTENT:
- Cut through the longest dimension showing all stores in sequence
- Show foundation, floor slab, walls, roof structure
- Include ceiling height variations (pharmacy 3.5m, retail 4.0m, supermarket 5.0m)
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

      // Buscar projetos similares
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
      
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      const prompt = `Create a TRANSVERSAL ARCHITECTURAL SECTION (Corte Transversal BB) of a strip mall following ABNT Brazilian technical drawing standards.${similarProjectsContext}

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

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m (width) x ${project.length}m (length)${geometryInfo}${briefingSection}

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

      const results = [];

      // Gerar corte longitudinal
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const coordinates = JSON.parse(project.polygonCoordinates);
        const geometry = analyzeTerrainGeometry(coordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n${geometry.promptDescription}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      // Corte Longitudinal
      const longitudinalPrompt = `Create a LONGITUDINAL ARCHITECTURAL SECTION (Corte Longitudinal AA) of a strip mall following ABNT Brazilian technical drawing standards.

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

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m (width) x ${project.length}m (length)${geometryInfo}${briefingSection}

SECTION CONTENT:
- Cut through the longest dimension showing all stores in sequence
- Show foundation, floor slab, walls, roof structure
- Include ceiling height variations (pharmacy 3.5m, retail 4.0m, supermarket 5.0m)
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
      const transversalPrompt = `Create a TRANSVERSAL ARCHITECTURAL SECTION (Corte Transversal BB) of a strip mall following ABNT Brazilian technical drawing standards.

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

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m (width) x ${project.length}m (length)${geometryInfo}${briefingSection}

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

      // Obter DNA do projeto (gera automaticamente se não existir)
      const projectDNA = await getOrGenerateProjectDNA(input.projectId);

      const geometryInfo = project.polygonCoordinates
        ? `\n- Terrain shape: ${analyzeTerrainGeometry(JSON.parse(project.polygonCoordinates)).promptDescription}`
        : "";

      const briefingSection = project.briefing
        ? `\n\nPROJECT BRIEFING:\n${project.briefing}`
        : "";
      
      // Adicionar descrição de layout personalizado
      const layoutDescription = generateSiteplanLayoutDescription({
        offsetX: project.buildingOffsetX || 0,
        offsetY: project.buildingOffsetY || 0,
        rotation: project.buildingRotation || 0,
        scale: project.buildingScale || 80,
      });

      // Gerar prompt consistente usando DNA do projeto
      const basePrompt = generateConsistentPrompt(projectDNA, "siteplan");
      
      // Adicionar contexto específico do projeto
      const additionalContext = `
SITE SPECIFICATIONS:
- Total lot area: ${project.area}m²
- Building footprint: ${project.width}m x ${project.length}m
${geometryInfo}
${briefingSection}
${layoutDescription}`;

      const sitePlanPrompt = `${basePrompt} ${additionalContext}`;

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
});
