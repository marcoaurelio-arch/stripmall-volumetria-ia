import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Cloud, Clock, Calendar, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { BuildingLayout } from "./BuildingLayoutAdjuster";

interface ShadowVisualizationProps {
  projectId: number;
  buildingLayout: BuildingLayout;
  buildingHeight: number; // Altura do edifício em metros
  terrain: {
    width: number;
    length: number;
    area: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
}

export function ShadowVisualization({
  buildingLayout,
  buildingHeight,
  terrain,
  location,
}: ShadowVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedHour, setSelectedHour] = useState(12); // 12h (meio-dia)
  const [selectedSeason, setSelectedSeason] = useState<'summer' | 'winter' | 'spring' | 'fall'>('summer');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Query para análise de estações
  const { data: seasonsData, isLoading: seasonsLoading } = trpc.shadowAnalysis.analyzeSeasons.useQuery({
    buildingLayout,
    buildingHeight,
    terrain,
    location,
    year: selectedDate.getFullYear(),
  });

  // Dados da estação e horário selecionados
  const currentSeasonData = seasonsData?.[selectedSeason];
  const currentHourData = currentSeasonData?.find((data) => {
    const hour = new Date(data.solarPosition.timestamp).getHours();
    return hour === selectedHour;
  });

  // Desenhar visualização no canvas
  useEffect(() => {
    if (!currentHourData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = Math.min(width / terrain.width, height / terrain.length);

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    // Desenhar terreno
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, width, height);

    // Desenhar grid
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    for (let i = 0; i <= terrain.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i * scale, 0);
      ctx.lineTo(i * scale, height);
      ctx.stroke();
    }
    for (let i = 0; i <= terrain.length; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i * scale);
      ctx.lineTo(width, i * scale);
      ctx.stroke();
    }

    // Desenhar sombra
    if (currentHourData.shadow.polygonPoints.length > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.beginPath();
      currentHourData.shadow.polygonPoints.forEach((point, index) => {
        const x = point.x * scale;
        const y = point.y * scale;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
    }

    // Desenhar edifício
    const buildingWidth = (terrain.width * buildingLayout.scale) / 100;
    const buildingLength = (terrain.length * buildingLayout.scale) / 100 * 0.4;
    const buildingCenterX = terrain.width / 2 + (buildingLayout.offsetX / 100) * terrain.width;
    const buildingCenterY = terrain.length / 2 + (buildingLayout.offsetY / 100) * terrain.length;

    ctx.save();
    ctx.translate(buildingCenterX * scale, buildingCenterY * scale);
    ctx.rotate((buildingLayout.rotation * Math.PI) / 180);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(
      (-buildingWidth / 2) * scale,
      (-buildingLength / 2) * scale,
      buildingWidth * scale,
      buildingLength * scale
    );

    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      (-buildingWidth / 2) * scale,
      (-buildingLength / 2) * scale,
      buildingWidth * scale,
      buildingLength * scale
    );

    ctx.restore();

    // Desenhar indicador de direção do sol
    const sunIndicatorX = width - 60;
    const sunIndicatorY = 60;
    const sunAngleRad = (currentHourData.solarPosition.azimuth * Math.PI) / 180;

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(sunIndicatorX, sunIndicatorY, 20, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sunIndicatorX, sunIndicatorY);
    ctx.lineTo(
      sunIndicatorX + Math.sin(sunAngleRad) * 30,
      sunIndicatorY - Math.cos(sunAngleRad) * 30
    );
    ctx.stroke();

    // Legenda
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText("Sol", sunIndicatorX - 10, sunIndicatorY + 40);
  }, [currentHourData, buildingLayout, terrain]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Análise de Sombreamento Solar
        </CardTitle>
        <CardDescription>
          Visualize as sombras projetadas pelo edifício em diferentes horários e estações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <Tabs value={selectedSeason} onValueChange={(v) => setSelectedSeason(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summer">Verão</TabsTrigger>
            <TabsTrigger value="fall">Outono</TabsTrigger>
            <TabsTrigger value="winter">Inverno</TabsTrigger>
            <TabsTrigger value="spring">Primavera</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Slider de horário */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário: {selectedHour}:00
            </label>
          </div>
          <Slider
            value={[selectedHour]}
            onValueChange={(v) => setSelectedHour(v[0])}
            min={6}
            max={18}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
          </div>
        </div>

        {/* Canvas de visualização */}
        <div className="border border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full"
          />
        </div>

        {/* Métricas */}
        {currentHourData && (
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Posição Solar</p>
              <p className="text-sm font-semibold">
                Az: {currentHourData.solarPosition.azimuth.toFixed(1)}° | 
                El: {currentHourData.solarPosition.elevation.toFixed(1)}°
              </p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Cobertura de Sombra</p>
              <p className="text-sm font-semibold">
                {currentHourData.shadow.coverage.toFixed(1)}% do terreno
              </p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Comprimento da Sombra</p>
              <p className="text-sm font-semibold">
                {currentHourData.shadow.length.toFixed(2)} m
              </p>
            </div>
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Horas de Sol Estimadas</p>
              <p className="text-sm font-semibold">
                {currentHourData.sunlightHours}h/dia
              </p>
            </div>
          </div>
        )}

        {/* Recomendação */}
        {currentHourData && (
          <div className={`border rounded-lg p-3 ${
            currentHourData.shadow.coverage < 30
              ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
              : currentHourData.shadow.coverage < 60
              ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              <Info className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                currentHourData.shadow.coverage < 30
                  ? 'text-green-600 dark:text-green-400'
                  : currentHourData.shadow.coverage < 60
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium mb-1">Recomendação</p>
                <p className="text-sm text-muted-foreground">
                  {currentHourData.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {seasonsLoading && (
          <div className="text-center text-muted-foreground py-8">
            Calculando sombreamento solar...
          </div>
        )}

        {/* Legenda */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
          <p className="font-medium">Legenda:</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-700"></div>
            <span>Edifício</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black/30 border border-black/50"></div>
            <span>Sombra projetada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <span>Direção do sol</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
