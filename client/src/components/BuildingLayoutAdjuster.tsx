import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RotateCcw, Save, Move, RotateCw, Maximize2, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { OptimizationWeightsConfig } from "@/components/OptimizationWeightsConfig";
import { CustomTemplateEditor } from "@/components/CustomTemplateEditor";

type OptimizationWeights = {
  occupancy: number;
  solar: number;
  aesthetics: number;
  cost: number;
};

interface BuildingLayoutAdjusterProps {
  polygonCoordinates: string; // JSON string of coordinates
  onSave: (layout: BuildingLayout) => void;
  terrainDimensions: {
    width: number;
    length: number;
    area: number;
  };
  setbacks: {
    frontal: number;
    lateral: number;
    fundos: number;
  };
}

export interface BuildingLayout {
  offsetX: number; // Percentual de deslocamento horizontal (-50 a 50)
  offsetY: number; // Percentual de deslocamento vertical (-50 a 50)
  rotation: number; // Rotação em graus (0 a 360)
  scale: number; // Escala do edifício (50 a 100% da área disponível)
}

export function BuildingLayoutAdjuster({
  polygonCoordinates,
  terrainDimensions,
  setbacks,
  onSave,
}: BuildingLayoutAdjusterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutation de otimização
  const optimizeMutation = trpc.layoutOptimization.optimize.useMutation({
    onSuccess: (data) => {
      setOptimizedLayout(data);
      setOptimizationDialogOpen(true);
    },
    onError: (error) => {
      toast.error(`Erro ao otimizar layout: ${error.message}`);
    },
  });
  const [optimizationWeights, setOptimizationWeights] = useState<OptimizationWeights>({
    occupancy: 40,
    solar: 30,
    aesthetics: 20,
    cost: 10,
  });
  
  const [layout, setLayout] = useState<BuildingLayout>({
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    scale: 80,
  });
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [optimizedLayout, setOptimizedLayout] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Validação de recuos
  const { data: validation } = trpc.layoutValidation.validateSetbacks.useQuery({
    layout,
    terrain: terrainDimensions,
    setbacks,
  });

  useEffect(() => {
    drawLayout();
  }, [layout, polygonCoordinates]);

  const drawLayout = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const coords = JSON.parse(polygonCoordinates);
      if (!coords || coords.length === 0) return;

      // Calculate bounds
      const lats = coords.map((c: any) => c.lat);
      const lngs = coords.map((c: any) => c.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Convert coordinates to canvas space
      const points = coords.map((coord: any) => {
        const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvas.width;
        const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvas.height;
        return { x, y };
      });

      // Draw terrain polygon
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Fill terrain with semi-transparent blue
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fill();

      // Draw building footprint
      const centerX = canvas.width / 2 + (layout.offsetX / 100) * canvas.width;
      const centerY = canvas.height / 2 + (layout.offsetY / 100) * canvas.height;

      const buildingWidth = (canvas.width * layout.scale) / 100;
      const buildingHeight = (canvas.height * layout.scale) / 100 * 0.4; // Retangular

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((layout.rotation * Math.PI) / 180);

      // Draw building rectangle
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
      ctx.strokeRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);

      // Draw center cross
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 10);
      ctx.stroke();

      ctx.restore();

      // Draw legend
      ctx.fillStyle = "#64748b";
      ctx.font = "12px sans-serif";
      ctx.fillText("🔵 Terreno", 10, 20);
      ctx.fillText("🔴 Edifício (ajustável)", 10, 40);
    } catch (error) {
      console.error("Error drawing layout:", error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dx = e.nativeEvent.offsetX - dragStart.x;
    const dy = e.nativeEvent.offsetY - dragStart.y;

    setLayout((prev) => ({
      ...prev,
      offsetX: Math.max(-50, Math.min(50, prev.offsetX + (dx / canvas.width) * 100)),
      offsetY: Math.max(-50, Math.min(50, prev.offsetY + (dy / canvas.height) * 100)),
    }));

    setDragStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setLayout({
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      scale: 80,
    });
    toast.success("Layout resetado para posição padrão");
  };

  const handleSave = () => {
    onSave(layout);
    toast.success("Layout salvo! As próximas imagens geradas usarão esta configuração");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move className="h-5 w-5 text-primary" />
          Ajuste Manual de Layout
        </CardTitle>
        <CardDescription>
          Arraste o edifício (vermelho) para ajustar sua posição dentro do terreno (azul).
          Use os controles abaixo para rotação e escala.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Canvas interativo */}
        <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Controles */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Rotação: {layout.rotation}°</label>
            <Slider
              value={[layout.rotation]}
              onValueChange={([value]) => setLayout((prev) => ({ ...prev, rotation: value }))}
              min={0}
              max={360}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Escala: {layout.scale}%</label>
            <Slider
              value={[layout.scale]}
              onValueChange={([value]) => setLayout((prev) => ({ ...prev, scale: value }))}
              min={50}
              max={100}
              step={5}
            />
          </div>

          {/* Validação de Recuos */}
          {validation && (
            <div className={`p-4 rounded-lg border ${
              validation.isValid 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-2">
                {validation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p className={`font-medium text-sm ${
                    validation.isValid 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {validation.isValid 
                      ? '✅ Layout válido - Todos os recuos respeitados' 
                      : `⚠️ ${validation.violations.length} violação(ões) de recuo detectada(s)`
                    }
                  </p>
                  {!validation.isValid && (
                    <ul className="text-sm space-y-1 text-red-800 dark:text-red-200">
                      {validation.violations.map((v: any, i: number) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-600 dark:text-red-400">•</span>
                          <span>{v.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {validation.warnings.length > 0 && (
                    <div className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                      {validation.warnings.map((w: string, i: number) => (
                        <p key={i}>{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
            <Button 
              onClick={() => {
                optimizeMutation.mutate({
                  terrain: terrainDimensions,
                  setbacks,
                  preferences: {
                    prioritizeOccupancy: true,
                    prioritizeSolar: true,
                  },
                  weights: optimizationWeights,
                });
              }}
              variant="outline"
              className="flex-1"
              disabled={optimizeMutation.isPending}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {optimizeMutation.isPending ? "Otimizando..." : "Otimizar"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={validation && !validation.isValid}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Layout
            </Button>
            <CustomTemplateEditor
              currentLayout={layout}
              terrain={terrainDimensions}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Dica:</p>
          <p>
            Após salvar, as próximas imagens geradas (estudos conceituais, plantas, cortes)
            respeitarão esta configuração de layout, garantindo maior precisão na volumetria.
          </p>
        </div>
      </CardContent>

      {/* Dialog de Resultado da Otimização */}
      <Dialog open={optimizationDialogOpen} onOpenChange={setOptimizationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Layout Otimizado
            </DialogTitle>
            <DialogDescription>
              O algoritmo analisou seu terreno e recuos para sugerir o melhor layout
            </DialogDescription>
          </DialogHeader>

          {optimizedLayout && (
            <div className="space-y-4">
              {/* Score e Justificativa */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Score Geral</span>
                  <span className={`text-2xl font-bold ${
                    optimizedLayout.score >= 80 ? 'text-green-600' :
                    optimizedLayout.score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {optimizedLayout.score.toFixed(0)}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {optimizedLayout.reasoning}
                </p>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Taxa de Ocupação</p>
                  <p className="text-lg font-semibold">{optimizedLayout.metrics.occupancyRate.toFixed(1)}%</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Área do Edifício</p>
                  <p className="text-lg font-semibold">{optimizedLayout.metrics.footprintArea.toFixed(2)} m²</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Área Desperdício</p>
                  <p className="text-lg font-semibold">{optimizedLayout.metrics.wastedArea.toFixed(2)} m²</p>
                </div>
                <div className="border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Orientação Solar</p>
                  <p className="text-lg font-semibold">{optimizedLayout.metrics.solarOrientation}</p>
                </div>
              </div>

              {/* Parâmetros */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Parâmetros Sugeridos:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Posição X:</span>
                    <span className="ml-2 font-medium">{optimizedLayout.offsetX}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Posição Y:</span>
                    <span className="ml-2 font-medium">{optimizedLayout.offsetY}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rotação:</span>
                    <span className="ml-2 font-medium">{optimizedLayout.rotation}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Escala:</span>
                    <span className="ml-2 font-medium">{optimizedLayout.scale}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOptimizationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (optimizedLayout) {
                setLayout({
                  offsetX: optimizedLayout.offsetX,
                  offsetY: optimizedLayout.offsetY,
                  rotation: optimizedLayout.rotation,
                  scale: optimizedLayout.scale,
                });
                setOptimizationDialogOpen(false);
                toast.success("Layout otimizado aplicado!");
              }
            }}>
              Aplicar Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
