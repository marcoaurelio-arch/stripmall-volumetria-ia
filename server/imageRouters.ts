import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { generateImage } from "./_core/imageGeneration";
import { analyzeTerrainGeometry } from "./services/terrainGeometryService";
import { generateStaticMapUrl, calculateAppropriateZoom } from "./mapsImageGenerator";

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
      
      const prompt = `Ultra-realistic architectural rendering of a contemporary Brazilian strip mall commercial center.${similarProjectsContext}
Professional real estate marketing visualization with the following specifications:

BUILDING ARCHITECTURE:
- ${analysis ? `${analysis.numeroLojas} retail units` : '8-12 retail units'} in linear strip configuration
- Contemporary Brazilian commercial architecture style
- Large glass storefronts (floor-to-ceiling glazing) with slim aluminum frames
- Modern ACM (Aluminum Composite Material) facade panels in neutral tones (white, gray, beige)
- Individual storefront signage areas with LED backlighting
- Covered pedestrian walkway with steel structure and polycarbonate/glass canopy
- Flat or slightly sloped roof with concealed drainage system
- Total built area: ${analysis?.areaMaximaConstruida || project.area}m²
- Building height: single-story (4-5 meters)

MATERIALS & FINISHES:
- Facade: ACM panels, glass curtain walls, exposed concrete accents
- Walkway: Polished concrete floor with expansion joints
- Canopy: Powder-coated steel structure with transparent polycarbonate or tempered glass
- Parking: Interlocking concrete pavers or asphalt with painted markings
- Landscaping: Native Brazilian species (palm trees, ipe trees, ornamental grasses)

SITE LAYOUT & CONTEXT:
- ${analysis?.vagasEstacionamento || '40-60'} parking spaces in organized rows (90° or 45° angle)
- Clear circulation lanes (3.5m wide) with directional arrows
- Accessible parking spots near entrance (blue markings)
- Pedestrian crosswalks with tactile paving
- Perimeter landscaping with trees and shrubs
- Modern LED street lighting poles (6-8m height)
- Sidewalks with concrete pavers
- Urban context: visible street, neighboring buildings in background, cars, people

LIGHTING & ATMOSPHERE:
- Time: Late afternoon (golden hour, 5-6 PM)
- Sun angle: 30-40 degrees, casting long soft shadows
- Sky: Clear blue with wispy cirrus clouds
- Ambient occlusion and contact shadows for depth
- Realistic reflections on glass and car surfaces
- Warm sunlight on facade, cool shadows

COMPOSITION & CAMERA:
- Aerial 3/4 perspective view (bird's eye at 45° angle)
- Camera height: 15-20 meters above ground
- Focal length: 24mm wide-angle lens
- Aperture: f/4 for balanced depth of field
- Frame: Entire complex visible, including parking and surroundings
- Rule of thirds composition

REALISM DETAILS:
- Parked cars (Brazilian models: Fiat, Chevrolet, Volkswagen, Toyota)
- People walking, shopping (Brazilian demographics)
- Shopping carts, store displays visible through glass
- Realistic wear and weathering on materials
- Proper scale and proportions
- Accurate shadows and reflections
- Natural color grading (not oversaturated)

TECHNICAL QUALITY:
- 8K resolution rendering
- Physically-based rendering (PBR) materials
- Ray-traced global illumination
- Ambient occlusion
- Depth of field with focal point on building
- Professional color grading${geometryInfo}${briefingContext}`;

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
      
      const prompt = `Professional architectural floor plan (planta baixa) of a Brazilian strip mall commercial center following ABNT NBR 6492 standards.${similarProjectsContext}
Technical drawing with the following specifications:

BUILDING LAYOUT:
- ${analysis?.numeroLojas || '8-12'} retail units in linear strip configuration
- Each unit typical composition:
  * Glass storefront entrance (3-4m wide)
  * Sales floor area (60-120m² per unit)
  * Storage/stock room (15-25% of sales area)
  * Employee restroom (ADA compliant)
  * Service entrance/loading area (rear access)
- Covered pedestrian walkway (3-4m wide) along storefront
- Common areas: central plaza, seating areas
- Total built area: ${analysis?.areaMaximaConstruida || project.area}m²
- Site area: ${project.area}m²
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

      const analysis = await db.getLatestAnalysis(input.projectId);
      
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

      const geometryInfo = project.polygonCoordinates
        ? `\n- Terrain shape: ${analyzeTerrainGeometry(JSON.parse(project.polygonCoordinates)).promptDescription}`
        : "";

      const briefingSection = project.briefing
        ? `\n\nPROJECT BRIEFING:\n${project.briefing}`
        : "";

      const sitePlanPrompt = `Create a professional architectural SITE PLAN (Planta de Implantação) for a strip mall project following Brazilian ABNT NBR 6492 standards.

STYLE AND FORMAT:
- Top view (plan view) technical drawing
- Clean black and white with selective color for areas (green for landscaping, gray for pavement)
- Thick continuous lines (0.7mm) for building perimeter
- Medium lines (0.5mm) for paving edges, curbs, walkways
- Thin lines (0.3mm) for parking stripes, landscaping
- Dashed lines for property boundaries and setbacks
- North arrow prominently displayed
- Graphic scale (1:200 or 1:500)
- Title block with: project name, "PLANTA DE IMPLANTAÇÃO", scale, date

PROJECT DATA:
- Site area: ${project.area}m²
- Building footprint: ${project.width}m x ${project.length}m${geometryInfo}${briefingSection}

SITE PLAN ELEMENTS:

1. BUILDING:
   - Strip mall building footprint with store divisions
   - Label main anchor stores and smaller retail units
   - Show entrances with door swing symbols
   - Indicate covered walkway/arcade in front of stores
   - Show loading/service area at rear

2. PARKING LAYOUT:
   - 90° angle parking stalls (2.5m x 5.0m each)
   - Some 45° angle parking for better circulation
   - Accessible parking spaces (3.5m x 5.5m) near entrances - marked with wheelchair symbol
   - Clear circulation aisles (minimum 5.0m width)
   - Parking count label: "TOTAL: XX VAGAS"
   - Show parking stripes and directional arrows

3. VEHICULAR ACCESS:
   - Main entrance from street with curb cut
   - Secondary exit for circulation
   - Clear traffic flow arrows
   - Speed bumps at strategic points
   - Delivery truck access to service area
   - Label: "ACESSO PRINCIPAL", "SAÍDA"

4. PEDESTRIAN WALKWAYS:
   - Perimeter sidewalks (minimum 1.5m width)
   - Pedestrian crossings with zebra stripes
   - Accessible ramps at curb transitions
   - Covered walkway in front of stores
   - Tactile paving for visually impaired

5. LANDSCAPING AND GREEN AREAS:
   - Tree symbols (circles with cross) along perimeter
   - Green buffer zones between parking and property line
   - Planter islands in parking area
   - Grass areas shaded in light green
   - Label tree species if specified in briefing

6. SITE BOUNDARIES AND SETBACKS:
   - Property line (dashed line)
   - Front setback dimension
   - Side setbacks dimensions
   - Rear setback dimension
   - Adjacent street names

7. UTILITIES AND INFRASTRUCTURE:
   - Water meter location
   - Electrical transformer pad
   - Drainage direction arrows
   - Trash/recycling enclosure
   - Bike rack area

8. DIMENSIONS AND ANNOTATIONS:
   - Overall site dimensions
   - Building setbacks from property lines
   - Parking aisle widths
   - Sidewalk widths
   - Distance from building to parking
   - All dimensions in meters with 2 decimal places

9. LEGEND (LEGENDA):
   - Building footprint (solid black)
   - Paved areas (light gray)
   - Green areas (light green)
   - Accessible parking (wheelchair symbol)
   - Trees (circle with cross)

10. AREA SUMMARY TABLE:
    - Terreno: ${project.area}m²
    - Área Construída: [calculated]m²
    - Estacionamento: [calculated]m²
    - Áreas Verdes: [calculated]m²
    - Calçadas: [calculated]m²

Render as a professional technical site plan following ABNT NBR 6492 standards with clear hierarchy, proper line weights, and comprehensive labeling.`;

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
