import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Card } from './ui/card';
import { MapPin } from 'lucide-react';

interface LocationViewerProps {
  latitude: string;
  longitude: string;
  address?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export default function LocationViewer({ latitude, longitude, address }: LocationViewerProps) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Google Maps API Key não configurada. Configure para visualizar o mapa.
        </p>
      </Card>
    );
  }

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Coordenadas não disponíveis para este projeto.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mapa */}
      <Card className="overflow-hidden">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <div style={{ height: '300px', width: '100%' }}>
            <Map
              defaultCenter={{ lat, lng }}
              defaultZoom={16}
              gestureHandling="cooperative"
              disableDefaultUI={false}
              mapId="terrain-view-map"
            >
              <AdvancedMarker position={{ lat, lng }}>
                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <MapPin className="h-5 w-5" />
                </div>
              </AdvancedMarker>
            </Map>
          </div>
        </APIProvider>
      </Card>

      {/* Informações */}
      <Card className="p-3 bg-card/50">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Latitude:</span>
            <span className="ml-2 font-mono">{lat.toFixed(6)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Longitude:</span>
            <span className="ml-2 font-mono">{lng.toFixed(6)}</span>
          </div>
        </div>
        {address && (
          <div className="mt-2 pt-2 border-t text-sm">
            <span className="text-muted-foreground">Endereço:</span>
            <span className="ml-2">{address}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
