import JSZip from "jszip";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";

export interface ParsedKMZData {
  coordinates: Array<{ lat: number; lng: number }>;
  area: number;
  centerLat: number;
  centerLng: number;
  name?: string;
  description?: string;
}

/**
 * Calcula a área de um polígono usando a fórmula de Shoelace (em metros quadrados)
 */
function calculatePolygonArea(coords: Array<{ lat: number; lng: number }>): number {
  if (coords.length < 3) return 0;

  // Raio da Terra em metros
  const R = 6371000;

  let area = 0;
  const n = coords.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const lat1 = (coords[i].lat * Math.PI) / 180;
    const lat2 = (coords[j].lat * Math.PI) / 180;
    const lng1 = (coords[i].lng * Math.PI) / 180;
    const lng2 = (coords[j].lng * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (Math.abs(area) * R * R) / 2;
  return Math.round(area);
}

/**
 * Calcula o centro geométrico de um polígono
 */
function calculateCenter(coords: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  const sumLat = coords.reduce((sum, coord) => sum + coord.lat, 0);
  const sumLng = coords.reduce((sum, coord) => sum + coord.lng, 0);

  return {
    lat: sumLat / coords.length,
    lng: sumLng / coords.length,
  };
}

/**
 * Processa um arquivo KMZ e extrai informações do terreno
 */
export async function parseKMZ(fileBuffer: Buffer): Promise<ParsedKMZData> {
  try {
    // Validar se o buffer não está vazio
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Arquivo vazio ou inválido");
    }

    // Descompactar o arquivo KMZ (que é um ZIP)
    const zip = await JSZip.loadAsync(fileBuffer, { 
      checkCRC32: false // Ignorar verificação CRC para arquivos corrompidos
    }).catch((error) => {
      console.error("Erro ao processar KMZ:", error);
      throw new Error("Arquivo KMZ inválido ou corrompido. Certifique-se de que é um arquivo KMZ válido exportado do Google Earth.");
    });

    // Procurar pelo arquivo KML dentro do ZIP
    let kmlContent: string | null = null;
    for (const filename in zip.files) {
      if (filename.endsWith(".kml")) {
        kmlContent = await zip.files[filename].async("string");
        break;
      }
    }

    if (!kmlContent) {
      throw new Error("Nenhum arquivo KML encontrado dentro do KMZ");
    }

    // Parsear o KML para XML
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlContent, "text/xml");

    // Converter KML para GeoJSON
    const geojson = kml(kmlDoc);

    // Extrair o primeiro polígono ou ponto
    const features = geojson.features;
    if (!features || features.length === 0) {
      throw new Error("Nenhuma geometria encontrada no arquivo KML");
    }

    const feature = features[0];
    let coordinates: Array<{ lat: number; lng: number }> = [];
    let name = feature.properties?.name;
    let description = feature.properties?.description;

    // Processar geometria
    const geometry = feature.geometry;
    if (!geometry) {
      throw new Error("Geometria não encontrada no feature");
    }

    if (geometry.type === "Polygon") {
      // Polígono - pegar o anel externo
      const ring = (geometry as any).coordinates[0];
      coordinates = ring.map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1],
      }));
    } else if (geometry.type === "Point") {
      // Ponto único - criar um pequeno quadrado ao redor
      const [lng, lat] = (geometry as any).coordinates;
      const offset = 0.0001; // ~11 metros
      coordinates = [
        { lat: lat + offset, lng: lng - offset },
        { lat: lat + offset, lng: lng + offset },
        { lat: lat - offset, lng: lng + offset },
        { lat: lat - offset, lng: lng - offset },
      ];
    } else if (geometry.type === "LineString") {
      // Linha - converter para polígono fechado
      coordinates = (geometry as any).coordinates.map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1],
      }));
      // Fechar o polígono se não estiver fechado
      if (
        coordinates[0].lat !== coordinates[coordinates.length - 1].lat ||
        coordinates[0].lng !== coordinates[coordinates.length - 1].lng
      ) {
        coordinates.push(coordinates[0]);
      }
    } else {
      throw new Error(`Tipo de geometria não suportado: ${geometry.type}`);
    }

    // Calcular área e centro
    const area = calculatePolygonArea(coordinates);
    const center = calculateCenter(coordinates);

    return {
      coordinates,
      area,
      centerLat: center.lat,
      centerLng: center.lng,
      name,
      description,
    };
  } catch (error) {
    console.error("Erro ao processar KMZ:", error);
    throw new Error(`Falha ao processar arquivo KMZ: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
  }
}
