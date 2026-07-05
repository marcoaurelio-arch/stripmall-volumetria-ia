/**
 * Serviço de Exportação BIM/IFC
 * 
 * Gera arquivos IFC (Industry Foundation Classes) para interoperabilidade com softwares BIM
 * Usa geração baseada em template para compatibilidade máxima
 */

export interface BIMExportOptions {
  projectName: string;
  projectDescription?: string;
  terrainArea: number;
  buildableArea: number;
  occupiedArea: number;
  numberOfStores: number;
  parkingSpaces: number;
  numberOfFloors: number;
  
  // Dimensões do terreno
  terrainWidth: number;
  terrainLength: number;
  
  // Parâmetros urbanísticos
  occupancyRate: number; // %
  buildingCoefficient: number;
  setbackFront: number; // metros
  setbackSide: number; // metros
  setbackRear: number; // metros
  
  // Geometria (opcional)
  polygonCoordinates?: Array<{lat: number, lng: number}>;
  
  // Dados adicionais
  address?: string;
  briefing?: string;
}

/**
 * Gera GUID no formato IFC
 */
function generateIFCGUID(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
  let guid = '';
  for (let i = 0; i < 22; i++) {
    guid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return guid;
}

/**
 * Gera timestamp ISO para IFC
 */
function getIFCTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Gera arquivo IFC a partir dos dados do projeto
 */
export function generateIFC(options: BIMExportOptions): string {
  const timestamp = getIFCTimestamp();
  const projectGUID = generateIFCGUID();
  const siteGUID = generateIFCGUID();
  const buildingGUID = generateIFCGUID();
  
  // Calcular áreas
  const retailArea = options.buildableArea * 0.78;
  const commonArea = options.buildableArea * 0.22;
  const parkingArea = options.parkingSpaces * 25;
  const areaPerStore = retailArea / options.numberOfStores;
  
  // Calcular dimensões
  const floorHeight = 4.5; // 4.5m de pé-direito
  const buildingHeight = options.numberOfFloors * floorHeight;
  
  // Gerar conteúdo IFC
  const ifcContent = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('${options.projectName}.ifc','${timestamp}',(''),(''),'','Nexa Strip Mall Volumetria IA','');
FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;

/* ========== PROJECT STRUCTURE ========== */

/* Project */
#1=IFCPROJECT('${projectGUID}',$,'${options.projectName}','${options.projectDescription || 'Strip Mall Commercial Development'}',$,$,$,(#10),#11);

/* Units */
#10=IFCUNITASSIGNMENT((#12,#13,#14));
#12=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#13=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);
#14=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);

/* Geometric Representation Context */
#11=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-5,#15,$);
#15=IFCAXIS2PLACEMENT3D(#16,$,$);
#16=IFCCARTESIANPOINT((0.,0.,0.));

/* ========== SITE ========== */

#20=IFCSITE('${siteGUID}',$,'Site','Terrain area: ${options.terrainArea}m²',$,#21,$,'${options.address || 'Project Site'}',.ELEMENT.,$,$,$,$,$);
#21=IFCLOCALPLACEMENT($,#22);
#22=IFCAXIS2PLACEMENT3D(#16,$,$);

/* ========== BUILDING ========== */

#30=IFCBUILDING('${buildingGUID}',$,'Strip Mall Building','${options.numberOfStores} stores, ${options.parkingSpaces} parking spaces',$,#31,$,'${options.projectName}',.ELEMENT.,$,$,$);
#31=IFCLOCALPLACEMENT(#21,#32);
#32=IFCAXIS2PLACEMENT3D(#16,$,$);

/* ========== BUILDING STOREYS ========== */

${generateStoreys(options.numberOfFloors, floorHeight)}

/* ========== SPACES ========== */

${generateStoreSpaces(options.numberOfStores, areaPerStore)}

/* Parking Space */
#200=IFCSPACE('${generateIFCGUID()}',$,'Parking Area','${options.parkingSpaces} spaces, ${parkingArea}m²',$,#201,$,'Parking Lot',.ELEMENT.,.EXTERNAL.,$);
#201=IFCLOCALPLACEMENT(#31,#202);
#202=IFCAXIS2PLACEMENT3D(#16,$,$);

/* Common Areas */
#210=IFCSPACE('${generateIFCGUID()}',$,'Common Areas','Circulation, restrooms, storage: ${commonArea.toFixed(2)}m²',$,#211,$,'Common Areas',.ELEMENT.,.INTERNAL.,$);
#211=IFCLOCALPLACEMENT(#31,#212);
#212=IFCAXIS2PLACEMENT3D(#16,$,$);

/* ========== BUILDING ELEMENTS ========== */

${generateSlabs(options.numberOfFloors, options.occupiedArea)}

/* Perimeter Walls */
#400=IFCWALLSTANDARDCASE('${generateIFCGUID()}',$,'Perimeter Walls','External walls, height: ${buildingHeight}m',$,#401,$,$,.STANDARD.);
#401=IFCLOCALPLACEMENT(#31,#402);
#402=IFCAXIS2PLACEMENT3D(#16,$,$);

/* ========== PROPERTY SETS ========== */

/* Urban Parameters Property Set */
#500=IFCPROPERTYSET('${generateIFCGUID()}',$,'Urban Parameters','Urbanistic parameters and zoning regulations',(#501,#502,#503,#504,#505,#506,#507,#508,#509,#510));
#501=IFCPROPERTYSINGLEVALUE('Terrain Area',$,IFCAREAMEASURE(${options.terrainArea}),$);
#502=IFCPROPERTYSINGLEVALUE('Buildable Area',$,IFCAREAMEASURE(${options.buildableArea}),$);
#503=IFCPROPERTYSINGLEVALUE('Occupied Area',$,IFCAREAMEASURE(${options.occupiedArea}),$);
#504=IFCPROPERTYSINGLEVALUE('Occupancy Rate',$,IFCREAL(${options.occupancyRate}),$);
#505=IFCPROPERTYSINGLEVALUE('Building Coefficient',$,IFCREAL(${options.buildingCoefficient}),$);
#506=IFCPROPERTYSINGLEVALUE('Front Setback',$,IFCLENGTHMEASURE(${options.setbackFront}),$);
#507=IFCPROPERTYSINGLEVALUE('Side Setback',$,IFCLENGTHMEASURE(${options.setbackSide}),$);
#508=IFCPROPERTYSINGLEVALUE('Rear Setback',$,IFCLENGTHMEASURE(${options.setbackRear}),$);
#509=IFCPROPERTYSINGLEVALUE('Number of Stores',$,IFCINTEGER(${options.numberOfStores}),$);
#510=IFCPROPERTYSINGLEVALUE('Parking Spaces',$,IFCINTEGER(${options.parkingSpaces}),$);

/* Dimensions Property Set */
#520=IFCPROPERTYSET('${generateIFCGUID()}',$,'Dimensions','Building dimensions',(#521,#522,#523,#524));
#521=IFCPROPERTYSINGLEVALUE('Terrain Width',$,IFCLENGTHMEASURE(${options.terrainWidth}),$);
#522=IFCPROPERTYSINGLEVALUE('Terrain Length',$,IFCLENGTHMEASURE(${options.terrainLength}),$);
#523=IFCPROPERTYSINGLEVALUE('Building Height',$,IFCLENGTHMEASURE(${buildingHeight}),$);
#524=IFCPROPERTYSINGLEVALUE('Floor Height',$,IFCLENGTHMEASURE(${floorHeight}),$);

/* Areas Property Set */
#530=IFCPROPERTYSET('${generateIFCGUID()}',$,'Areas','Area breakdown',(#531,#532,#533,#534));
#531=IFCPROPERTYSINGLEVALUE('Retail Area',$,IFCAREAMEASURE(${retailArea}),$);
#532=IFCPROPERTYSINGLEVALUE('Common Area',$,IFCAREAMEASURE(${commonArea}),$);
#533=IFCPROPERTYSINGLEVALUE('Parking Area',$,IFCAREAMEASURE(${parkingArea}),$);
#534=IFCPROPERTYSINGLEVALUE('Area Per Store',$,IFCAREAMEASURE(${areaPerStore}),$);

/* ========== RELATIONSHIPS ========== */

/* Project contains Site */
#600=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#1,(#20));

/* Site contains Building */
#601=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#20,(#30));

/* Building contains Storeys */
#602=IFCRELAGGREGATES('${generateIFCGUID()}',$,$,$,#30,(${generateStoreyReferences(options.numberOfFloors)}));

/* Building has Property Sets */
#610=IFCRELDEFINESBYPROPERTIES('${generateIFCGUID()}',$,$,$,(#30),#500);
#611=IFCRELDEFINESBYPROPERTIES('${generateIFCGUID()}',$,$,$,(#30),#520);
#612=IFCRELDEFINESBYPROPERTIES('${generateIFCGUID()}',$,$,$,(#30),#530);

ENDSEC;

END-ISO-10303-21;`;

  return ifcContent;
}

/**
 * Gera definições de pavimentos
 */
function generateStoreys(numberOfFloors: number, floorHeight: number): string {
  let storeys = '';
  let baseID = 100;
  
  for (let i = 0; i < numberOfFloors; i++) {
    const elevation = i * floorHeight;
    const id = baseID + (i * 3);
    const name = i === 0 ? 'Ground Floor' : `Floor ${i}`;
    
    storeys += `
/* ${name} */
#${id}=IFCBUILDINGSTOREY('${generateIFCGUID()}',$,'${name}','Elevation: ${elevation.toFixed(2)}m',$,#${id+1},$,'Level ${i}',.ELEMENT.,${elevation});
#${id+1}=IFCLOCALPLACEMENT(#31,#${id+2});
#${id+2}=IFCAXIS2PLACEMENT3D(#${id+3},$,$);
#${id+3}=IFCCARTESIANPOINT((0.,0.,${elevation}));
`;
  }
  
  return storeys;
}

/**
 * Gera referências aos pavimentos para relacionamento
 */
function generateStoreyReferences(numberOfFloors: number): string {
  const refs = [];
  let baseID = 100;
  
  for (let i = 0; i < numberOfFloors; i++) {
    refs.push(`#${baseID + (i * 3)}`);
  }
  
  return refs.join(',');
}

/**
 * Gera espaços das lojas
 */
function generateStoreSpaces(numberOfStores: number, areaPerStore: number): string {
  let spaces = '';
  let baseID = 150;
  
  for (let i = 0; i < numberOfStores; i++) {
    const id = baseID + (i * 3);
    
    spaces += `
/* Store ${i + 1} */
#${id}=IFCSPACE('${generateIFCGUID()}',$,'Store ${i + 1}','Retail space ${areaPerStore.toFixed(2)}m²',$,#${id+1},$,'Commercial Unit ${i + 1}',.ELEMENT.,.INTERNAL.,$);
#${id+1}=IFCLOCALPLACEMENT(#31,#${id+2});
#${id+2}=IFCAXIS2PLACEMENT3D(#16,$,$);
`;
  }
  
  return spaces;
}

/**
 * Gera lajes de piso
 */
function generateSlabs(numberOfFloors: number, area: number): string {
  let slabs = '';
  let baseID = 300;
  
  for (let i = 0; i < numberOfFloors; i++) {
    const id = baseID + (i * 3);
    const elevation = i * 4.5;
    
    slabs += `
/* Floor Slab ${i} */
#${id}=IFCSLAB('${generateIFCGUID()}',$,'Floor Slab ${i}','Concrete slab ${area.toFixed(2)}m²',$,#${id+1},$,$,.FLOOR.);
#${id+1}=IFCLOCALPLACEMENT(#31,#${id+2});
#${id+2}=IFCAXIS2PLACEMENT3D(#${id+3},$,$);
#${id+3}=IFCCARTESIANPOINT((0.,0.,${elevation}));
`;
  }
  
  return slabs;
}

/**
 * Converte string IFC para Buffer
 */
export function ifcStringToBuffer(ifcContent: string): Buffer {
  return Buffer.from(ifcContent, 'utf-8');
}

/**
 * Gera nome de arquivo IFC
 */
export function generateIFCFileName(projectName: string): string {
  const sanitized = projectName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const timestamp = new Date().toISOString().split('T')[0];
  return `${sanitized}_${timestamp}.ifc`;
}
