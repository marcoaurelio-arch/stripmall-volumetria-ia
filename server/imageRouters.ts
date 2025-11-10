import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateImage } from "./_core/imageGeneration";
import { analyzePolygonGeometry } from "./geometryAnalyzer";
import { generateStaticMapUrl, calculateAppropriateZoom } from "./mapsImageGenerator";

export const imageRouter = router({
  // Gerar estudo conceitual 3D
  generateConceptual: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.projectId);
      
      if (!project || project.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      // Obter última análise para usar nos prompts
      const analysis = await db.getLatestAnalysis(input.projectId);
      
      // Analisar geometria do terreno e gerar imagem de referência
      let geometryInfo = "";
      let siteImageUrl = "";
      
      if (project.polygonCoordinates && project.latitude && project.longitude) {
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Orientation: ${geometry.orientation}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m\n- The building MUST fit within this ${geometry.shape} lot shape, respecting the exact site boundaries`;
        
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
      
      const prompt = `Photorealistic architectural rendering of a modern strip mall commercial center in Brazil. 
Hyper-realistic 3D visualization with the following specifications:

BUILDING DETAILS:
- ${analysis ? `${analysis.numeroLojas} retail units` : '8-12 retail units'} arranged in linear configuration
- Contemporary facade with large glass storefronts and aluminum frames
- Modern signage areas with LED lighting
- Covered walkways with steel and glass canopies
- Total built area: ${analysis?.areaMaximaConstruida || project.area}m²

SITE LAYOUT:
- Landscaped parking lot with ${analysis?.vagasEstacionamento || 'multiple'} marked parking spaces
- Concrete paving with marked circulation paths
- Green areas with native Brazilian trees and plants
- Modern street lighting fixtures

VISUAL STYLE:
- Aerial 3/4 perspective view showing entire complex
- Golden hour lighting (late afternoon sun)
- Clear blue sky with subtle clouds
- Photorealistic materials: glass, concrete, steel, vegetation
- Professional real estate marketing quality
- 8K resolution, ray-traced lighting, depth of field
- Camera: 24mm lens, f/2.8 aperture${geometryInfo}${briefingContext}`;

      try {
        // Incluir imagem de referência do terreno se disponível
        const generateParams: any = { prompt };
        if (siteImageUrl) {
          generateParams.originalImages = [{
            url: siteImageUrl,
            mimeType: "image/jpeg"
          }];
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

      // Obter última análise para usar nos prompts
      const analysis = await db.getLatestAnalysis(input.projectId);
      
      // Analisar geometria do terreno se houver polígono
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n- Lot shape: ${geometry.description}\n- Site dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m\n- Building footprint MUST match the ${geometry.shape} lot boundaries`;
      }
      
      // Criar prompt técnico para planta baixa
      const briefingContext = project.briefing 
        ? `\nProject requirements: ${project.briefing}` 
        : '';
      
      const prompt = `Professional architectural floor plan (planta baixa) of a Brazilian strip mall commercial center. 
Technical drawing with the following specifications:

LAYOUT DETAILS:
- ${analysis?.numeroLojas || '8-12'} retail units in linear configuration
- Each unit: glass storefront, sales area, storage, restroom
- Total site area: ${project.area}m²
- Built area: ${analysis?.areaMaximaConstruida || project.area * 0.6}m²
- Parking: ${analysis?.vagasEstacionamento || 'multiple'} spaces with marked dimensions${geometryInfo}

TECHNICAL ELEMENTS:
- Dimension lines and measurements in meters
- North arrow indicator
- Scale notation (1:200 or 1:500)
- Room labels in Portuguese (Loja, Depósito, Banheiro, Circulação)
- Architectural symbols: doors (swing direction), windows, columns
- Parking space dimensions and circulation aisles
- Loading zone and service access
- Landscaping areas with tree symbols

DRAWING STYLE:
- Clean black line drawing on white background
- Professional architectural blueprint quality
- Technical precision with accurate proportions
- ABNT (Brazilian standards) compliant notation
- Top-down orthographic view${briefingContext}`;

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
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Orientation: ${geometry.orientation}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
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

      const analysis = await db.getLatestAnalysis(input.projectId);
      
      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      const viewDescriptions = {
        front: "Main street facade view",
        back: "Rear facade with loading areas",
        left: "Left side elevation",
        right: "Right side elevation"
      };

      const prompt = `Create an ELECTRONIC MODEL FACADE VIEW (${viewDescriptions[input.viewAngle]}) of a strip mall in clean architectural style.

STYLE REQUIREMENTS:
- Simple geometric volumes with flat, vibrant colors
- NO photorealistic materials
- Color-code by function: Pharmacy (yellow/gold), Retail (blue/cyan), Supermarket (red/pink)
- Add text labels identifying each store/area
- Clean white background
- Soft shadows for depth
- Straight-on elevation view with slight perspective

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m x ${project.length}m${geometryInfo}${briefingSection}

CONTEXT:
- Show parking lot in foreground (gray with white markings)
- Include simple trees and landscaping
- Add simple cars and people for scale
- Show signage areas

COMPOSITION:
- Clear view of facade composition
- Show height variations between different store types
- Emphasize horizontal rhythm of the strip mall
- Professional architectural presentation

Render as a clean architectural elevation study, similar to professional feasibility presentations.`;

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

      const views: Array<"front" | "back" | "left" | "right"> = ["front", "back", "left", "right"];
      const results = [];

      for (const viewAngle of views) {
        let geometryInfo = "";
        if (project.polygonCoordinates) {
          const geometry = analyzePolygonGeometry(project.polygonCoordinates);
          geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
        }

        const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

        const viewDescriptions = {
          front: "Main street facade view",
          back: "Rear facade with loading areas",
          left: "Left side elevation",
          right: "Right side elevation"
        };

        const prompt = `Create an ELECTRONIC MODEL FACADE VIEW (${viewDescriptions[viewAngle]}) of a strip mall in clean architectural style.

STYLE REQUIREMENTS:
- Simple geometric volumes with flat, vibrant colors
- NO photorealistic materials
- Color-code by function: Pharmacy (yellow/gold), Retail (blue/cyan), Supermarket (red/pink)
- Add text labels identifying each store/area
- Clean white background
- Soft shadows for depth
- Straight-on elevation view with slight perspective

PROJECT DATA:
- Site area: ${project.area}m²
- Building dimensions: ${project.width}m x ${project.length}m${geometryInfo}${briefingSection}

CONTEXT:
- Show parking lot in foreground (gray with white markings)
- Include simple trees and landscaping
- Add simple cars and people for scale
- Show signage areas

COMPOSITION:
- Clear view of facade composition
- Show height variations between different store types
- Emphasize horizontal rhythm of the strip mall
- Professional architectural presentation

Render as a clean architectural elevation study, similar to professional feasibility presentations.`;

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

      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      const prompt = `Create a LONGITUDINAL ARCHITECTURAL SECTION (Corte Longitudinal AA) of a strip mall following ABNT Brazilian technical drawing standards.

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

      let geometryInfo = "";
      if (project.polygonCoordinates) {
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
      }

      const briefingSection = project.briefing ? `\n\nPROJECT BRIEFING:\n${project.briefing}` : "";

      const prompt = `Create a TRANSVERSAL ARCHITECTURAL SECTION (Corte Transversal BB) of a strip mall following ABNT Brazilian technical drawing standards.

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
        const geometry = analyzePolygonGeometry(project.polygonCoordinates);
        geometryInfo = `\n\nSITE GEOMETRY:\n- Lot shape: ${geometry.description}\n- Dimensions: ${geometry.dimensions.width}m x ${geometry.dimensions.length}m`;
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
});
