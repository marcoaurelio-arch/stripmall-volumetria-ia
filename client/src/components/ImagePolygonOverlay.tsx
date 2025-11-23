import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Download } from "lucide-react";

interface ImagePolygonOverlayProps {
  imageUrl: string;
  polygonCoordinates: string; // JSON string of coordinates
  projectName: string;
}

export function ImagePolygonOverlay({
  imageUrl,
  polygonCoordinates,
  projectName,
}: ImagePolygonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [opacity, setOpacity] = useState([70]);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the image
      ctx.drawImage(img, 0, 0);

      if (showOverlay) {
        try {
          const coords = JSON.parse(polygonCoordinates);
          if (!coords || coords.length === 0) return;

          // Calculate bounds to normalize coordinates
          const lats = coords.map((c: any) => c.lat);
          const lngs = coords.map((c: any) => c.lng);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);

          // Convert geographic coordinates to canvas coordinates
          const points = coords.map((coord: any) => {
            const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvas.width;
            const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvas.height;
            return { x, y };
          });

          // Draw polygon overlay
          ctx.strokeStyle = `rgba(255, 0, 0, ${opacity[0] / 100})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 5]);
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.closePath();
          ctx.stroke();

          // Fill with semi-transparent red
          ctx.fillStyle = `rgba(255, 0, 0, ${opacity[0] / 400})`;
          ctx.fill();

          // Draw vertices
          ctx.setLineDash([]);
          points.forEach((point: { x: number; y: number }, index: number) => {
            ctx.fillStyle = `rgba(255, 0, 0, ${opacity[0] / 100})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Draw vertex numbers
            ctx.fillStyle = "white";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText((index + 1).toString(), point.x, point.y);
          });
        } catch (error) {
          console.error("Error drawing polygon overlay:", error);
        }
      }
    };
  }, [imageUrl, polygonCoordinates, showOverlay, opacity, imageLoaded]);

  const handleDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-validacao.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOverlay(!showOverlay)}
        >
          {showOverlay ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Ocultar Overlay
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Mostrar Overlay
            </>
          )}
        </Button>

        {showOverlay && (
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-sm text-muted-foreground">Opacidade:</span>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              min={10}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-12">{opacity[0]}%</span>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Baixar com Overlay
        </Button>
      </div>

      <div className="relative border border-border rounded-lg overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-auto"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? "none" : "block" }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ display: imageLoaded ? "block" : "none" }}
        />
      </div>

      {showOverlay && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Validação Visual:</p>
          <p>
            O contorno vermelho representa o polígono exato do terreno. Verifique
            se o layout do edifício na imagem gerada respeita os limites do lote.
          </p>
        </div>
      )}
    </div>
  );
}
