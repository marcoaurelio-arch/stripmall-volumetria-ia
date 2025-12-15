/**
 * Utilitário para gerar imagens de terrenos usando Google Maps Static API
 */

interface Coordinate {
  lat: number;
  lng: number;
}

/**
 * Gera URL para imagem estática do Google Maps mostrando o terreno
 * com polígono desenhado e vista aérea
 */
export function generateStaticMapUrl(
  center: Coordinate,
  polygonCoordinates?: string,
  zoom: number = 18
): string {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("Google Maps API key not configured");
    return "";
  }

  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const params = new URLSearchParams({
    center: `${center.lat},${center.lng}`,
    zoom: zoom.toString(),
    size: "640x640",
    maptype: "satellite",
    key: apiKey,
  });

  // Adicionar polígono se fornecido
  if (polygonCoordinates) {
    try {
      const coords: Coordinate[] = JSON.parse(polygonCoordinates);
      
      if (coords && coords.length >= 3) {
        // Criar path do polígono
        const pathCoords = coords
          .map((coord) => `${coord.lat},${coord.lng}`)
          .join("|");
        
        // Fechar o polígono
        const closedPath = `${pathCoords}|${coords[0].lat},${coords[0].lng}`;
        
        // Adicionar polígono com preenchimento e borda
        params.append(
          "path",
          `color:0xff0000ff|weight:3|fillcolor:0xff000033|${closedPath}`
        );
      }
    } catch (error) {
      console.error("Error parsing polygon coordinates:", error);
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Calcula o nível de zoom apropriado baseado na área do terreno
 */
export function calculateAppropriateZoom(areaSqm: number): number {
  if (areaSqm < 500) return 20;
  if (areaSqm < 1000) return 19;
  if (areaSqm < 2500) return 18;
  if (areaSqm < 5000) return 17;
  if (areaSqm < 10000) return 16;
  return 15;
}
