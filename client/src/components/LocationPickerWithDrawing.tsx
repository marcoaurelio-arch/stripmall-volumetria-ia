import { useState, useCallback, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Search, Pencil, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LocationPickerWithDrawingProps {
  onLocationSelect: (lat: string, lng: string) => void;
  onAreaCalculated: (area: number, coordinates: Array<{lat: number, lng: number}>) => void;
  initialLat?: string;
  initialLng?: string;
  initialPolygon?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Centro padrão: São Paulo, Brasil
const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };
const DEFAULT_ZOOM = 16;

export default function LocationPickerWithDrawing({ 
  onLocationSelect, 
  onAreaCalculated,
  initialLat, 
  initialLng,
  initialPolygon 
}: LocationPickerWithDrawingProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : null
  );
  
  const [searchAddress, setSearchAddress] = useState('');
  const [mapCenter, setMapCenter] = useState(
    initialLat && initialLng
      ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
      : DEFAULT_CENTER
  );

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [polygon, setPolygon] = useState<any>(null);
  const [polygonPath, setPolygonPath] = useState<Array<{lat: number, lng: number}>>([]);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const mapRef = useRef<any>(null);

  // Carregar polígono inicial se existir
  useEffect(() => {
    if (initialPolygon && mapRef.current) {
      try {
        const coords = JSON.parse(initialPolygon);
        if (Array.isArray(coords) && coords.length > 0) {
          setPolygonPath(coords);
          const area = calculatePolygonArea(coords);
          setCalculatedArea(area);
        }
      } catch (error) {
        console.error('Erro ao carregar polígono inicial:', error);
      }
    }
  }, [initialPolygon]);

  // Calcular perímetro do polígono
  const calculatePerimeter = (path: Array<{lat: number, lng: number}>): number => {
    if (!path || path.length < 2) return 0;
    
    const googleMaps = (window as any).google.maps;
    let perimeter = 0;
    
    for (let i = 0; i < path.length; i++) {
      const start = path[i];
      const end = path[(i + 1) % path.length];
      
      const distance = googleMaps.geometry.spherical.computeDistanceBetween(
        new googleMaps.LatLng(start.lat, start.lng),
        new googleMaps.LatLng(end.lat, end.lng)
      );
      
      perimeter += distance;
    }
    
    return perimeter;
  };
  
  // Calcular área do polígono usando a biblioteca de geometria do Google Maps
  const calculatePolygonArea = (path: Array<{lat: number, lng: number}>): number => {
    if (!path || path.length < 3) return 0;
    
    // Converter para LatLng do Google Maps
    const googleMaps = (window as any).google.maps;
    const latLngs = path.map(coord => new googleMaps.LatLng(coord.lat, coord.lng));
    
    // Calcular área em metros quadrados usando spherical geometry
    const area = googleMaps.geometry.spherical.computeArea(latLngs);
    
    return Math.round(area); // Retorna área em m²
  };

  const handleMapClick = useCallback((event: any) => {
    if (!isDrawingMode) {
      // Modo normal: selecionar ponto central
      if (event.detail.latLng) {
        const lat = event.detail.latLng.lat;
        const lng = event.detail.latLng.lng;
        
        setSelectedPosition({ lat, lng });
        onLocationSelect(lat.toFixed(6), lng.toFixed(6));
      }
    } else {
      // Modo desenho: adicionar ponto ao polígono
      if (event.detail.latLng) {
        const lat = event.detail.latLng.lat;
        const lng = event.detail.latLng.lng;
        
        const newPath = [...polygonPath, { lat, lng }];
        setPolygonPath(newPath);
        
        // Calcular área se temos pelo menos 3 pontos
        if (newPath.length >= 3) {
          const area = calculatePolygonArea(newPath);
          setCalculatedArea(area);
          onAreaCalculated(area, newPath);
        }
      }
    }
  }, [isDrawingMode, polygonPath, onLocationSelect, onAreaCalculated]);

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;

    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          setMapCenter({ lat, lng });
          setSelectedPosition({ lat, lng });
          onLocationSelect(lat.toFixed(6), lng.toFixed(6));
        } else {
          toast.error('Endereço não encontrado. Tente outro endereço.');
        }
      });
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      toast.error('Erro ao buscar endereço. Por favor, tente novamente.');
    }
  };

  const toggleDrawingMode = () => {
    if (isDrawingMode) {
      // Sair do modo desenho
      setIsDrawingMode(false);
      toast.info('Modo de desenho desativado');
    } else {
      // Entrar no modo desenho
      setIsDrawingMode(true);
      setPolygonPath([]);
      setCalculatedArea(null);
      toast.info('Clique no mapa para desenhar o polígono do terreno');
    }
  };

  const clearPolygon = () => {
    setPolygonPath([]);
    setCalculatedArea(null);
    setIsDrawingMode(false);
    toast.info('Polígono removido');
  };

  const finishDrawing = () => {
    if (polygonPath.length < 3) {
      toast.error('Desenhe pelo menos 3 pontos para formar um polígono');
      return;
    }
    
    setIsDrawingMode(false);
    toast.success(`Área calculada: ${calculatedArea?.toLocaleString()} m²`);
  };

  // Renderizar polígono no mapa
  useEffect(() => {
    if (mapRef.current && polygonPath.length > 0) {
      // Remover polígono anterior
      if (polygon) {
        polygon.setMap(null);
      }

      // Criar novo polígono
      const googleMaps = (window as any).google.maps;
      const newPolygon = new googleMaps.Polygon({
        paths: polygonPath,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
        map: mapRef.current,
        editable: false,
        draggable: false,
      });
      
      // Adicionar marcadores nos vértices do polígono
      polygonPath.forEach((point, index) => {
        new googleMaps.Marker({
          position: point,
          map: mapRef.current,
          label: {
            text: `${index + 1}`,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
        });
      });
      
      // Adicionar linhas de medida entre vértices
      for (let i = 0; i < polygonPath.length; i++) {
        const start = polygonPath[i];
        const end = polygonPath[(i + 1) % polygonPath.length];
        
        // Calcular distância entre pontos
        const distance = googleMaps.geometry.spherical.computeDistanceBetween(
          new googleMaps.LatLng(start.lat, start.lng),
          new googleMaps.LatLng(end.lat, end.lng)
        );
        
        // Ponto médio para label
        const midLat = (start.lat + end.lat) / 2;
        const midLng = (start.lng + end.lng) / 2;
        
        // Adicionar label de distância
        new googleMaps.Marker({
          position: { lat: midLat, lng: midLng },
          map: mapRef.current,
          label: {
            text: `${distance.toFixed(1)}m`,
            color: '#1e40af',
            fontSize: '11px',
            fontWeight: 'bold'
          },
          icon: {
            path: googleMaps.SymbolPath.CIRCLE,
            scale: 0, // Invisível, apenas para mostrar o label
          },
        });
      }
      
      // Adicionar indicador de Norte
      const bounds = new googleMaps.LatLngBounds();
      polygonPath.forEach(point => bounds.extend(point));
      const center = bounds.getCenter();
      
      // Posicionar indicador de Norte no canto superior direito do polígono
      const northLat = bounds.getNorthEast().lat();
      const eastLng = bounds.getNorthEast().lng();
      
      new googleMaps.Marker({
        position: { lat: northLat, lng: eastLng },
        map: mapRef.current,
        label: {
          text: '↑ N',
          color: '#dc2626',
          fontSize: '16px',
          fontWeight: 'bold'
        },
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 0,
        },
      });

      setPolygon(newPolygon);

      return () => {
        newPolygon.setMap(null);
      };
    }
  }, [polygonPath, mapRef.current]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="p-6 bg-destructive/10 border-destructive">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <h3 className="font-semibold text-destructive">Google Maps API Key não configurada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Para usar o mapa interativo, configure a variável de ambiente <code className="bg-muted px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> nas configurações do projeto.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Obtenha uma chave de API em: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca de endereço */}
      <Card className="p-4 bg-card">
        <Label htmlFor="search-address" className="text-sm font-medium mb-2 block">
          Buscar Endereço
        </Label>
        <div className="flex gap-2">
          <Input
            id="search-address"
            type="text"
            placeholder="Digite o endereço do terreno..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
            className="flex-1"
          />
          <Button onClick={handleSearchAddress} variant="secondary" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Controles de desenho */}
      <Card className="p-4 bg-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-sm font-medium mb-1">Desenhar Polígono do Terreno</h4>
            <p className="text-xs text-muted-foreground">
              {isDrawingMode 
                ? 'Clique no mapa para adicionar pontos do polígono' 
                : 'Ative o modo de desenho para medir a área exata'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isDrawingMode ? (
              <Button onClick={toggleDrawingMode} variant="default" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Desenhar
              </Button>
            ) : (
              <>
                <Button onClick={finishDrawing} variant="default" size="sm" disabled={polygonPath.length < 3}>
                  <Check className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
                <Button onClick={clearPolygon} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Área calculada e dimensões */}
        {calculatedArea !== null && (
          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Área total:</span>
              <span className="text-lg font-bold text-primary">{calculatedArea.toLocaleString()} m²</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vértices:</span>
                <span className="font-medium">{polygonPath.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perímetro:</span>
                <span className="font-medium">{calculatePerimeter(polygonPath).toFixed(1)}m</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              ℹ️ Medidas exibidas nas arestas do polígono
            </p>
          </div>
        )}
      </Card>

      {/* Mapa */}
      <Card className="overflow-hidden">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['geometry', 'drawing']}>
          <div style={{ height: '500px', width: '100%' }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={DEFAULT_ZOOM}
              center={mapCenter}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleMapClick}
              mapId="terrain-drawing-map"
              onLoad={(map: any) => {
                mapRef.current = map;
              }}
            >
              {selectedPosition && !isDrawingMode && (
                <AdvancedMarker position={selectedPosition}>
                  <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                </AdvancedMarker>
              )}
            </Map>
          </div>
        </APIProvider>
      </Card>

      {/* Coordenadas selecionadas */}
      {selectedPosition && !isDrawingMode && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Localização Selecionada</h4>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="ml-2 font-mono">{selectedPosition.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="ml-2 font-mono">{selectedPosition.lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
