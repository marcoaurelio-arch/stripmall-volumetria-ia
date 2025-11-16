/**
 * Componente de Visualização de Tour Virtual 360°
 * 
 * Usa Pannellum para exibir panoramas equirectangulares com navegação imersiva
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// Importar Pannellum
import 'pannellum/build/pannellum.css';

// Declarar tipo global para Pannellum
declare global {
  interface Window {
    pannellum: any;
  }
}

interface VirtualTour360ViewerProps {
  projectId: number;
  onClose?: () => void;
}

export default function VirtualTour360Viewer({ projectId, onClose }: VirtualTour360ViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<any>(null);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { data: tour, isLoading } = trpc.virtualTour.getTour.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  useEffect(() => {
    // Carregar script do Pannellum dinamicamente
    if (!window.pannellum) {
      const script = document.createElement('script');
      script.src = '/node_modules/pannellum/build/pannellum.js';
      script.async = true;
      script.onload = () => {
        console.log('Pannellum carregado');
        initializeViewer();
      };
      document.body.appendChild(script);
    } else {
      initializeViewer();
    }

    return () => {
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [tour]);

  const initializeViewer = () => {
    if (!tour || !viewerRef.current || !window.pannellum) return;

    // Configurar cenas do Pannellum
    const scenes: any = {};
    
    tour.scenes.forEach((scene: any) => {
      const hotSpots = scene.hotspots?.map((hotspot: any) => ({
        pitch: hotspot.pitch,
        yaw: hotspot.yaw,
        type: hotspot.type,
        text: hotspot.text,
        ...(hotspot.type === 'scene' && { sceneId: hotspot.targetSceneId })
      })) || [];

      scenes[scene.id] = {
        type: 'equirectangular',
        panorama: scene.imageUrl,
        pitch: scene.position.pitch,
        yaw: scene.position.yaw,
        hfov: 100,
        autoLoad: scene.id === tour.defaultScene,
        hotSpots
      };
    });

    // Inicializar viewer
    const viewerInstance = window.pannellum.viewer(viewerRef.current, {
      default: {
        firstScene: tour.defaultScene,
        sceneFadeDuration: 1000
      },
      scenes
    });

    setViewer(viewerInstance);
    setCurrentScene(tour.defaultScene);

    // Listener para mudança de cena
    viewerInstance.on('scenechange', (sceneId: string) => {
      setCurrentScene(sceneId);
    });
  };

  const handleZoomIn = () => {
    if (viewer) {
      const currentHfov = viewer.getHfov();
      viewer.setHfov(Math.max(currentHfov - 10, 50));
    }
  };

  const handleZoomOut = () => {
    if (viewer) {
      const currentHfov = viewer.getHfov();
      viewer.setHfov(Math.min(currentHfov + 10, 120));
    }
  };

  const handleFullscreen = () => {
    if (viewerRef.current) {
      if (!isFullscreen) {
        viewerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const getCurrentSceneInfo = () => {
    if (!tour || !currentScene) return null;
    return tour.scenes.find((s: any) => s.id === currentScene);
  };

  const sceneInfo = getCurrentSceneInfo();

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando tour virtual...</p>
        </div>
      </Card>
    );
  }

  if (!tour) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-12">
        <div className="text-center">
          <Info className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Tour Virtual Não Disponível
          </h3>
          <p className="text-gray-400 mb-6">
            Nenhum tour virtual foi gerado para este projeto ainda.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Viewer Container */}
      <div
        ref={viewerRef}
        className="w-full h-[600px] rounded-lg overflow-hidden bg-black"
        style={{ position: 'relative' }}
      />

      {/* Controles */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {onClose && (
          <Button
            onClick={onClose}
            size="icon"
            variant="secondary"
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          onClick={handleZoomIn}
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleZoomOut}
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={handleFullscreen}
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={() => setShowInfo(!showInfo)}
          size="icon"
          variant="secondary"
          className="bg-black/50 hover:bg-black/70 text-white"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      {/* Informações da Cena */}
      {showInfo && sceneInfo && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-1">{sceneInfo.name}</h3>
          <p className="text-sm text-gray-300">{sceneInfo.description}</p>
        </div>
      )}

      {/* Navegação entre Cenas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {tour.scenes.map((scene: any) => (
          <Button
            key={scene.id}
            onClick={() => viewer?.loadScene(scene.id)}
            size="sm"
            variant={currentScene === scene.id ? 'default' : 'secondary'}
            className={currentScene === scene.id ? 'bg-blue-600' : 'bg-black/50 hover:bg-black/70'}
          >
            {scene.name}
          </Button>
        ))}
      </div>

      {/* Instruções */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>
          🖱️ Arraste para olhar ao redor • 🔍 Scroll para zoom • 📍 Clique nos pontos para navegar
        </p>
      </div>
    </div>
  );
}
