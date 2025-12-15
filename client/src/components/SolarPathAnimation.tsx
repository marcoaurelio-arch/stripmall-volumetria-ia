import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Zap, ZapOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SolarPathAnimationProps {
  projectId: number;
  buildingLayout: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  };
  buildingHeight: number;
  terrain: {
    width: number;
    length: number;
    area: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  date?: string;
}

export function SolarPathAnimation({
  projectId,
  buildingLayout,
  buildingHeight,
  terrain,
  location,
  date = new Date().toISOString(),
}: SolarPathAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentHour, setCurrentHour] = useState(12); // Meio-dia
  const [speed, setSpeed] = useState(1); // 1x speed
  const [showPath, setShowPath] = useState(true);

  // Query para análise de múltiplos horários
  const { data: shadowData } = trpc.shadowAnalysis.analyzeMultipleHours.useQuery({
    buildingLayout,
    buildingHeight,
    terrain,
    location,
    date,
    hours: Array.from({ length: 13 }, (_, i) => i + 6), // 6h até 18h
  });

  // Desenhar canvas
  useEffect(() => {
    if (!canvasRef.current || !shadowData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configurar escala
    const scale = Math.min(canvas.width / terrain.width, canvas.height / terrain.length);
    const offsetX = (canvas.width - terrain.width * scale) / 2;
    const offsetY = (canvas.height - terrain.length * scale) / 2;

    // Desenhar terreno
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(offsetX, offsetY, terrain.width * scale, terrain.length * scale);
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, terrain.width * scale, terrain.length * scale);

    // Desenhar trajetória do sol (se ativado)
    if (showPath && shadowData.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      shadowData.forEach((data, index) => {
        const solarPos = data.solarPosition;
        // Converter posição solar para coordenadas do canvas
        const sunX = canvas.width / 2 + Math.sin(solarPos.azimuth * Math.PI / 180) * 150;
        const sunY = canvas.height / 2 - Math.cos(solarPos.azimuth * Math.PI / 180) * 150 * Math.sin(solarPos.elevation * Math.PI / 180);

        if (index === 0) {
          ctx.moveTo(sunX, sunY);
        } else {
          ctx.lineTo(sunX, sunY);
        }
      });

      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Encontrar dados do horário atual
    const hourIndex = Math.floor(currentHour) - 6;
    const currentData = shadowData[Math.max(0, Math.min(hourIndex, shadowData.length - 1))];

    if (currentData) {
      // Desenhar sombra
      if (currentData.shadow && currentData.shadow.polygonPoints.length > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        currentData.shadow.polygonPoints.forEach((point, index) => {
          const x = offsetX + point.x * scale;
          const y = offsetY + point.y * scale;
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
      const buildingCenterX = offsetX + (terrain.width / 2 + buildingLayout.offsetX) * scale;
      const buildingCenterY = offsetY + (terrain.length / 2 + buildingLayout.offsetY) * scale;
      const buildingWidth = (terrain.width * buildingLayout.scale / 100) * scale;
      const buildingHeight = (terrain.length * buildingLayout.scale / 100 * 0.4) * scale;

      ctx.save();
      ctx.translate(buildingCenterX, buildingCenterY);
      ctx.rotate(buildingLayout.rotation * Math.PI / 180);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
      ctx.restore();

      // Desenhar sol
      const solarPos = currentData.solarPosition;
      if (solarPos.elevation > 0) {
        const sunX = canvas.width / 2 + Math.sin(solarPos.azimuth * Math.PI / 180) * 150;
        const sunY = canvas.height / 2 - Math.cos(solarPos.azimuth * Math.PI / 180) * 150 * Math.sin(solarPos.elevation * Math.PI / 180);

        // Halo do sol
        const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Núcleo do sol
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Desenhar indicadores de nascer e pôr do sol
      if (showPath) {
        // Nascer do sol (6h)
        const sunrise = shadowData[0];
        if (sunrise && sunrise.solarPosition.elevation > 0) {
          const sunriseX = canvas.width / 2 + Math.sin(sunrise.solarPosition.azimuth * Math.PI / 180) * 150;
          const sunriseY = canvas.height / 2 - Math.cos(sunrise.solarPosition.azimuth * Math.PI / 180) * 150 * Math.sin(sunrise.solarPosition.elevation * Math.PI / 180);
          
          ctx.fillStyle = '#f97316';
          ctx.font = '12px sans-serif';
          ctx.fillText('☀️ 6h', sunriseX - 15, sunriseY - 10);
        }

        // Pôr do sol (18h)
        const sunset = shadowData[shadowData.length - 1];
        if (sunset && sunset.solarPosition.elevation > 0) {
          const sunsetX = canvas.width / 2 + Math.sin(sunset.solarPosition.azimuth * Math.PI / 180) * 150;
          const sunsetY = canvas.height / 2 - Math.cos(sunset.solarPosition.azimuth * Math.PI / 180) * 150 * Math.sin(sunset.solarPosition.elevation * Math.PI / 180);
          
          ctx.fillStyle = '#f97316';
          ctx.font = '12px sans-serif';
          ctx.fillText('🌅 18h', sunsetX - 15, sunsetY - 10);
        }
      }
    }
  }, [shadowData, currentHour, buildingLayout, terrain, showPath]);

  // Animação
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000; // segundos
      lastTime = now;

      setCurrentHour((prev) => {
        const next = prev + delta * speed * 2; // 2 horas por segundo na velocidade 1x
        if (next >= 18) {
          setIsPlaying(false);
          return 18;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentHour(6);
  };

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Animação de Trajetória Solar</CardTitle>
        <CardDescription>
          Visualize o movimento do sol e a sombra do edifício ao longo do dia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="relative bg-muted rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full"
          />
          
          {/* Horário atual overlay */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
            <p className="text-2xl font-bold">{formatHour(currentHour)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </p>
          </div>

          {/* Métricas overlay */}
          {shadowData && shadowData[Math.floor(currentHour) - 6] && (
            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-border text-xs space-y-1">
              <p>
                <span className="text-muted-foreground">Elevação:</span>{' '}
                <span className="font-semibold">
                  {shadowData[Math.floor(currentHour) - 6].solarPosition.elevation.toFixed(1)}°
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Azimute:</span>{' '}
                <span className="font-semibold">
                  {shadowData[Math.floor(currentHour) - 6].solarPosition.azimuth.toFixed(1)}°
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">Sombra:</span>{' '}
                <span className="font-semibold">
                  {shadowData[Math.floor(currentHour) - 6].shadow.length.toFixed(1)}m
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="space-y-4">
          {/* Slider de horário */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Horário</span>
              <span className="font-semibold">{formatHour(currentHour)}</span>
            </div>
            <Slider
              value={[currentHour]}
              onValueChange={(v) => {
                setIsPlaying(false);
                setCurrentHour(v[0]);
              }}
              min={6}
              max={18}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6:00</span>
              <span>12:00</span>
              <span>18:00</span>
            </div>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Reproduzir
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowPath(!showPath)}
              variant="outline"
              size="sm"
              title={showPath ? "Ocultar trajetória" : "Mostrar trajetória"}
            >
              {showPath ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
            </Button>
          </div>

          {/* Controle de velocidade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Velocidade</span>
              <span className="font-semibold">{speed}x</span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.5}
              max={4}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>2x</span>
              <span>4x</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
