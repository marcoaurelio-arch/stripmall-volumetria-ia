import { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import MapErrorBoundary from './MapErrorBoundary';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Search } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (lat: string, lng: string) => void;
  initialLat?: string;
  initialLng?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Centro padrão: São Paulo, Brasil
const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 };
const DEFAULT_ZOOM = 12;

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
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

  const handleMapClick = useCallback((event: any) => {
    if (event.detail.latLng) {
      const lat = event.detail.latLng.lat;
      const lng = event.detail.latLng.lng;
      
      setSelectedPosition({ lat, lng });
      onLocationSelect(lat.toFixed(6), lng.toFixed(6));
    }
  }, [onLocationSelect]);

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;

    try {
      // Usar Geocoding API do Google Maps
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
          alert('Endereço não encontrado. Tente outro endereço ou clique diretamente no mapa.');
        }
      });
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      alert('Erro ao buscar endereço. Por favor, tente novamente.');
    }
  };

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
        <p className="text-xs text-muted-foreground mt-2">
          Ou clique diretamente no mapa para selecionar a localização
        </p>
      </Card>

      {/* Mapa */}
      <MapErrorBoundary fallbackMessage="Erro ao carregar o mapa">
      <Card className="overflow-hidden">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <div style={{ height: '400px', width: '100%' }}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={DEFAULT_ZOOM}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleMapClick}
              mapId="terrain-location-map"
            >
              {selectedPosition && (
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
      </MapErrorBoundary>

      {/* Coordenadas selecionadas */}
      {selectedPosition && (
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
