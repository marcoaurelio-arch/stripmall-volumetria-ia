/**
 * Strip Mall Specialized Prompt Service
 * 
 * Gera prompts profissionais de arquitetura especializada em strip malls comerciais,
 * considerando tipologias (L, U, retangular), pavimentos e melhores práticas.
 */

import { ProjectDNA } from './projectDNAService';

export interface StripMallContext {
  // Tipologia
  typology: 'linear' | 'L' | 'U'; // Formato do strip mall
  floors: 1 | 2; // Número de pavimentos
  
  // Dimensões
  totalArea: number; // Área total construída (m²)
  storeCount: number; // Número de lojas
  anchorStoreArea?: number; // Área da loja âncora (m²)
  
  // Características
  hasInternalCourtyard: boolean; // Possui pátio interno
  hasCoveredWalkway: boolean; // Possui calçada coberta
  parkingLayout: 'perpendicular' | 'angled' | 'parallel'; // Layout do estacionamento
  
  // Contexto
  terrainOrientation: string; // Orientação do terreno
  mainAccess: string; // Acesso principal
}

/**
 * Gera contexto especializado de strip mall baseado nos dados do projeto
 */
export function generateStripMallContext(
  terrainShape: string,
  floors: number,
  totalArea: number,
  storeCount: number,
  anchorStoreArea?: number
): StripMallContext {
  // Determinar tipologia baseado na forma do terreno
  let typology: 'linear' | 'L' | 'U' = 'linear';
  if (terrainShape.toLowerCase().includes('l')) {
    typology = 'L';
  } else if (terrainShape.toLowerCase().includes('u')) {
    typology = 'U';
  }
  
  // Determinar características baseadas na tipologia
  const hasInternalCourtyard = typology === 'U' || (typology === 'L' && totalArea > 3000);
  const hasCoveredWalkway = true; // Sempre presente em strip malls
  
  return {
    typology,
    floors: floors <= 1 ? 1 : 2,
    totalArea,
    storeCount,
    anchorStoreArea,
    hasInternalCourtyard,
    hasCoveredWalkway,
    parkingLayout: 'perpendicular',
    terrainOrientation: 'Norte',
    mainAccess: 'Via principal'
  };
}

/**
 * Gera prompt especializado para estudos conceituais de strip mall
 */
export function generateConceptualPrompt(
  dna: ProjectDNA,
  context: StripMallContext
): string {
  const typologyDescription = getTypologyDescription(context.typology);
  const floorDescription = context.floors === 1 ? 'térreo único' : 'dois pavimentos';
  const courtyardText = context.hasInternalCourtyard ? 
    'com pátio interno central criando senso de praça comercial' : 
    'com estacionamento frontal';
  
  return `Professional architectural concept study for a ${context.totalArea}m² strip mall commercial development.

TYPOLOGY: ${typologyDescription}
- Configuration: ${context.typology}-shaped layout ${courtyardText}
- Floors: ${floorDescription}
- Store count: ${context.storeCount} commercial units
${context.anchorStoreArea ? `- Anchor store: ${context.anchorStoreArea}m² (supermarket/pharmacy)` : ''}

ARCHITECTURAL LANGUAGE (${dna.style}):
- Building form: ${dna.buildingShape}
- Key features: ${dna.features.join(', ')}
- Roof system: ${dna.roofType}

COMMERCIAL BEST PRACTICES:
- Maximum storefront visibility from parking
- Covered walkway (3-4m width) along all stores
- Clear wayfinding and signage strategy
- Anchor store positioned at end to drive foot traffic
- Accessible design (ramps, tactile paving, universal restrooms)
- Strategic lighting for safety and ambiance

MATERIALS & FINISHES:
- Primary: ${dna.materials[0]}
- Secondary: ${dna.materials[1]}
- Accent: ${dna.materials[2]}
- Color palette: ${dna.primaryColor} (primary), ${dna.accentColor} (accent)

LANDSCAPING:
${dna.landscaping}
- Native species for low maintenance
- Strategic tree placement for shade in parking
- Green buffer along property edges

CONTEXT:
${dna.context}
- Orientation optimized for solar protection
- Main entrance clearly visible from street
- Service access separated from customer areas

CRITICAL REQUIREMENTS:
- Must show ${context.typology}-shaped building configuration
- Must display ${context.floors === 1 ? 'single-story' : 'two-story'} structure
- Must include covered walkway along storefronts
- Must show parking layout with clear circulation
- Must demonstrate commercial retail architecture, not residential or office
- Aerial/isometric view showing complete site layout

Style: Professional architectural rendering, realistic materials, daytime lighting, commercial photography quality.`;
}

/**
 * Gera prompt especializado para plantas baixas de strip mall
 */
export function generateFloorplanPrompt(
  dna: ProjectDNA,
  context: StripMallContext
): string {
  const typologyDescription = getTypologyDescription(context.typology);
  
  return `Professional architectural floor plan for ${context.totalArea}m² strip mall.

LAYOUT CONFIGURATION:
- Typology: ${typologyDescription}
- ${context.storeCount} commercial units in ${context.typology}-shaped arrangement
${context.anchorStoreArea ? `- Anchor store: ${context.anchorStoreArea}m² at strategic end position` : ''}
- Covered walkway: 3-4m width along all storefronts
${context.hasInternalCourtyard ? '- Central courtyard: minimum 20x30m for events and circulation' : ''}

STORE DIMENSIONS (TYPICAL):
- Small units: 6-12m width × 12-15m depth
- Medium units: 15-20m width × 12-15m depth  
- Anchor store: 20-30m width × 15-20m depth
- Ceiling height: ${context.floors === 1 ? '4.0-4.5m' : '4.0m (ground), 3.0m (upper)'}

CIRCULATION & ACCESSIBILITY:
- Covered walkway with weather protection
- Ramps: maximum 8.33% slope
- Accessible restrooms: 1 per floor
- Emergency exits: per fire code
- Service corridors: behind stores where applicable

PARKING LAYOUT:
- ${context.parkingLayout} parking (90° angles for maximum capacity)
- Standard spaces: 2.50 × 5.00m
- Accessible spaces: 3.50 × 5.50m (2% of total)
- Aisles: 5.00-6.00m width
- Maximum walking distance to stores: 50m

TECHNICAL ELEMENTS:
- Structural grid: 6-8m typical span
- Restrooms: centralized or distributed
- Utility rooms: electrical, water, HVAC
- Loading zones: rear access for anchor store
- Trash collection: dedicated area with screening

FLOOR DESIGNATION:
${context.floors === 1 ? 
  'Ground floor plan showing all commercial units, walkway, and parking layout' :
  'Ground floor: retail stores with covered walkway\nUpper floor: professional offices/services with independent access'}

CRITICAL REQUIREMENTS:
- Must show ${context.typology}-shaped building footprint
- Must display ${context.storeCount} clearly divided commercial units
- Must include covered walkway along storefronts (shown with dashed line or hatch)
- Must show parking spaces in organized grid
- Must indicate dimensions, areas, and circulation paths
- Technical drawing style: clean lines, proper architectural symbols, dimension annotations

Style: Professional architectural floor plan, black lines on white background, proper scale notation, north arrow, dimension lines, area labels.`;
}

/**
 * Gera prompt especializado para cortes arquitetônicos de strip mall
 */
export function generateSectionPrompt(
  dna: ProjectDNA,
  context: StripMallContext,
  sectionType: 'transversal' | 'longitudinal'
): string {
  const isTransversal = sectionType === 'transversal';
  const viewDescription = isTransversal ? 
    'perpendicular to storefronts (showing depth of stores and parking)' :
    'parallel to storefronts (showing multiple stores in sequence)';
  
  return `Professional architectural section cut ${viewDescription} for ${context.totalArea}m² strip mall.

SECTION ORIENTATION: ${sectionType.toUpperCase()}
${isTransversal ? 
  `- Cutting through: parking area → covered walkway → store interior → service area
- Shows: store depth (12-15m), ceiling height, roof structure, relationship with parking` :
  `- Cutting through: multiple stores along the ${context.typology}-shaped layout
- Shows: sequence of ${context.storeCount} stores, covered walkway continuity, roof line`}

VERTICAL DIMENSIONS:
${context.floors === 1 ? 
  `- Ground floor ceiling: 4.0-4.5m clear height
- Covered walkway: 2.8-3.0m clear height
- Roof structure: ${dna.roofType}
- Total building height: approximately 5.0-5.5m` :
  `- Ground floor ceiling: 4.0m clear height (retail)
- Upper floor ceiling: 3.0m clear height (offices/services)
- Covered walkway: 2.8m clear height
- Roof structure: ${dna.roofType}
- Total building height: approximately 7.5-8.0m`}

ARCHITECTURAL ELEMENTS:
- Structural system: concrete columns and beams (6-8m span)
- Covered walkway: cantilevered or supported by columns
- Storefront glazing: full-height glass (2.5-3.0m)
- Roof drainage: internal or external gutters
- Fascia and signage band: integrated into facade

MATERIALS (SECTION CUT):
- Structure: ${dna.materials[0]}
- Exterior cladding: ${dna.materials[1]}
- Glazing: ${dna.materials[2]}
- Walkway flooring: non-slip ceramic or concrete
- Roof finish: waterproof membrane with thermal insulation

${isTransversal ? 
  `PARKING RELATIONSHIP:
- Parking surface: asphalt or concrete paving
- Curb and walkway transition
- Landscaping buffer: trees providing shade
- Clear sight lines from parking to stores` :
  `STORE SEQUENCE:
- ${context.storeCount} stores visible in section
- Party walls between units (structural or drywall)
- Covered walkway running continuously
- Roof line following building configuration`}

TECHNICAL DETAILS:
- Foundation system indicated
- Structural elements dimensioned
- Material hatching and notation
- Human figures for scale (1.75m)
- Dimension lines and annotations

CRITICAL REQUIREMENTS:
- Must show ${context.floors === 1 ? 'single-story' : 'two-story'} structure clearly
- Must display covered walkway with proper height (2.8-3.0m)
- Must show relationship between stores, walkway, and ${isTransversal ? 'parking' : 'adjacent stores'}
- Must indicate ceiling heights and total building height
- Must use proper architectural section conventions (cut elements darker/hatched)
- Technical drawing style with dimensions and material annotations

Style: Professional architectural section drawing, clean technical line work, material hatching, dimension annotations, scale figures, black lines on white background.`;
}

/**
 * Gera prompt especializado para fachadas de strip mall
 */
export function generateFacadePrompt(
  dna: ProjectDNA,
  context: StripMallContext,
  facadeView: 'front' | 'back' | 'left' | 'right'
): string {
  const isFrontFacade = facadeView === 'front';
  const viewDescription = isFrontFacade ? 
    'main facade facing parking (primary commercial frontage)' :
    `${facadeView} elevation`;
  
  return `Professional architectural elevation drawing - ${viewDescription} for ${context.totalArea}m² strip mall.

FACADE VIEW: ${facadeView.toUpperCase()} ELEVATION
${isFrontFacade ? 
  `- Primary commercial facade with ${context.storeCount} storefronts
- Covered walkway running along entire length
- Individual store identities within unified architectural language
- Maximum visibility and transparency for retail display` :
  `- ${facadeView === 'back' ? 'Service/rear elevation with loading access' : 'Side elevation showing building depth'}
- Maintains architectural language consistency
- ${facadeView === 'back' ? 'Functional design for deliveries and utilities' : 'Transition between front and back facades'}`}

ARCHITECTURAL LANGUAGE (${dna.style}):
- Overall composition: ${dna.buildingShape}
- Key features: ${dna.features.join(', ')}
- Rhythm and modularity: ${context.storeCount} bays with consistent spacing
- ${context.floors === 1 ? 'Single-story horizontal emphasis' : 'Two-story vertical articulation'}

FACADE ELEMENTS:
${isFrontFacade ? 
  `- Storefronts: full-height glazing (2.5-3.0m) for maximum visibility
- Covered walkway: cantilevered or column-supported (3-4m depth)
- Signage band: integrated horizontal element above storefronts
- Entry doors: recessed or flush with glazing line
- Columns/pilasters: defining each store bay (6-8m spacing)` :
  `- ${facadeView === 'back' ? 'Loading doors: roll-up or swing doors for service access' : 'Windows and openings: balanced composition'}
- ${facadeView === 'back' ? 'Utility areas: screened or integrated into design' : 'Material transitions: coordinated with front facade'}
- ${facadeView === 'back' ? 'Dumpster enclosure: architecturally integrated' : 'Architectural detailing: consistent language'}`}

MATERIALS & FINISHES:
- Primary cladding: ${dna.materials[0]}
- Secondary material: ${dna.materials[1]}
- Glazing system: ${dna.materials[2]}
- Accent details: ${dna.materials[3] || dna.accentColor}
- Color palette: ${dna.primaryColor} (primary), ${dna.accentColor} (accent)

ROOF & TOP:
- Roof type: ${dna.roofType}
- Parapet height: 0.8-1.2m above roof
- Fascia treatment: integrated signage band
- Roof edge detail: clean modern profile

DIMENSIONS:
- Total facade length: ${context.typology === 'linear' ? '60-100m typical' : 'varies by wing'}
- Building height: ${context.floors === 1 ? '5.0-5.5m' : '7.5-8.0m'}
- Covered walkway depth: 3-4m
- Store bay width: 6-12m typical (anchor: 20-30m)

LANDSCAPING INTEGRATION:
${isFrontFacade ? 
  '- Trees in parking providing shade and visual softening\n- Planters along walkway edge\n- Green buffer at property edges' :
  '- Landscape screening for service areas\n- Native plantings for low maintenance'}

LIGHTING:
${isFrontFacade ?
  '- Walkway lighting: recessed or surface-mounted fixtures\n- Storefront illumination: internal + external accent\n- Signage lighting: integrated LED systems' :
  '- Security lighting for service areas\n- Functional illumination'}

CRITICAL REQUIREMENTS:
- Must show ${context.typology}-shaped building configuration (${facadeView} view)
- Must display ${context.floors === 1 ? 'single-story' : 'two-story'} structure
${isFrontFacade ? `- Must show ${context.storeCount} distinct storefronts with covered walkway` : ''}
- Must demonstrate commercial retail architecture character
- Must use consistent materials and architectural language from DNA
- Technical elevation drawing style with dimensions and annotations

Style: Professional architectural elevation drawing, clean technical line work, material indications, dimension annotations, human figures for scale (1.75m), black lines on white background.`;
}

/**
 * Gera prompt especializado para implantação (site plan) de strip mall
 */
export function generateSitePlanPrompt(
  dna: ProjectDNA,
  context: StripMallContext,
  terrainDimensions: { width: number; length: number }
): string {
  return `Professional site plan (implantation) for ${context.totalArea}m² strip mall on ${terrainDimensions.width}m × ${terrainDimensions.length}m terrain.

SITE LAYOUT:
- Building configuration: ${context.typology}-shaped strip mall
- Building footprint: optimized for ${context.storeCount} stores
- Parking layout: ${context.parkingLayout} spaces (90° angles)
- ${context.hasInternalCourtyard ? 'Internal courtyard: central gathering space' : 'Open parking area: maximum capacity'}

BUILDING PLACEMENT:
- Setbacks: front, side, and rear per zoning code
- Orientation: optimized for solar protection and visibility
- Main entrance: clearly visible from street access
- Service access: separated from customer circulation
- ${context.floors === 2 ? 'Upper floor access: independent stairway/elevator' : ''}

PARKING & CIRCULATION:
- Total spaces: calculated per 25-35m² of retail area
- Standard spaces: 2.50 × 5.00m in organized grid
- Accessible spaces: 3.50 × 5.50m near main entrance (2% minimum)
- Drive aisles: 5.00-6.00m width for two-way traffic
- Entry/exit points: clearly marked and separated
- Pedestrian walkways: protected crossings to building

LANDSCAPING & GREEN AREAS:
${dna.landscaping}
- Perimeter buffer: trees and shrubs along property edges
- Parking lot trees: shade coverage for 30-40% of parking
- Courtyard landscaping: ${context.hasInternalCourtyard ? 'central plaza with seating and plantings' : 'N/A'}
- Bioswales: stormwater management integrated into design
- Native species: drought-tolerant and low-maintenance

INFRASTRUCTURE:
- Paving: asphalt parking with concrete walkways
- Drainage: surface and subsurface systems
- Lighting: parking lot poles (10-20 lux) + walkway fixtures
- Signage: directional signs, store identification, wayfinding
- Utilities: underground services (water, sewer, electric, telecom)

ACCESSIBILITY:
- Accessible route: from parking to all store entrances
- Ramps: maximum 8.33% slope where grade changes occur
- Curb cuts: at all pedestrian crossings
- Tactile paving: at crosswalks and transitions
- Accessible parking: closest spaces to main entrance

SERVICE AREAS:
- Loading zone: rear access for anchor store deliveries
- Trash enclosure: screened area with vehicle access
- Utility equipment: transformers, generators (screened)
- Mechanical equipment: rooftop or ground-mounted (screened)

SITE BOUNDARIES & CONTEXT:
- Property lines: clearly delineated
- Adjacent streets: named and dimensioned
- Neighboring properties: indicated with context
- North arrow: orientation clearly marked
- Scale: graphic scale bar included

DIMENSIONS & ANNOTATIONS:
- Building dimensions and setbacks
- Parking space count and layout dimensions
- Driveway widths and turning radii
- Landscape area calculations
- Total site area and coverage ratios

CRITICAL REQUIREMENTS:
- Must show ${context.typology}-shaped building footprint clearly
- Must display complete parking layout with organized grid
- Must show covered walkway along building perimeter
- Must indicate landscaping with tree symbols and green areas
- Must show circulation patterns (vehicular and pedestrian)
- Must include dimensions, north arrow, and scale
- Plan view from directly above (orthogonal projection)

Style: Professional site plan drawing, black lines on white background, proper architectural symbols (trees, parking, paving patterns), dimension annotations, north arrow, scale notation, clear hierarchy of elements.`;
}

/**
 * Retorna descrição detalhada da tipologia
 */
function getTypologyDescription(typology: 'linear' | 'L' | 'U'): string {
  switch (typology) {
    case 'linear':
      return 'Linear/Rectangular strip mall with stores arranged in a straight line, single frontage facing parking';
    case 'L':
      return 'L-shaped strip mall with two perpendicular wings, corner anchor store, creates semi-enclosed courtyard';
    case 'U':
      return 'U-shaped strip mall with three wings forming central courtyard, anchors at ends, maximum store synergy';
  }
}

/**
 * Gera prompt especializado baseado no tipo de visualização
 */
export function generateSpecializedPrompt(
  visualizationType: 'conceptual' | 'floorplan' | 'section_transversal' | 'section_longitudinal' | 'facade' | 'siteplan',
  dna: ProjectDNA,
  context: StripMallContext,
  additionalParams?: {
    facadeView?: 'front' | 'back' | 'left' | 'right';
    terrainDimensions?: { width: number; length: number };
  }
): string {
  switch (visualizationType) {
    case 'conceptual':
      return generateConceptualPrompt(dna, context);
    case 'floorplan':
      return generateFloorplanPrompt(dna, context);
    case 'section_transversal':
      return generateSectionPrompt(dna, context, 'transversal');
    case 'section_longitudinal':
      return generateSectionPrompt(dna, context, 'longitudinal');
    case 'facade':
      return generateFacadePrompt(dna, context, additionalParams?.facadeView || 'front');
    case 'siteplan':
      return generateSitePlanPrompt(dna, context, additionalParams?.terrainDimensions || { width: 80, length: 60 });
    default:
      throw new Error(`Unknown visualization type: ${visualizationType}`);
  }
}
