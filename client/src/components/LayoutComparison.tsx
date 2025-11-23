import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, TrendingUp, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface LayoutComparisonProps {
  projectId: number;
  polygonCoordinates: string;
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

interface LayoutMetrics {
  layoutId: number;
  name: string;
  footprintArea: number; // m²
  occupancyRate: number; // %
  buildableArea: number; // m²
  wastedArea: number; // m²
  setbackCompliance: boolean;
  violationCount: number;
  score: number; // 0-100
}

export function LayoutComparison({
  projectId,
  polygonCoordinates,
  terrainDimensions,
  setbacks,
}: LayoutComparisonProps) {
  const [selectedLayouts, setSelectedLayouts] = useState<number[]>([]);
  const canvasRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];

  // Queries
  const { data: layouts } = trpc.savedLayout.list.useQuery({ projectId });

  // Calcular métricas para cada layout selecionado (sem validação de recuos por enquanto)
  const calculateMetrics = (layout: any): LayoutMetrics => {
    const buildingWidth = (terrainDimensions.width * layout.scale) / 100;
    const buildingHeight = (terrainDimensions.length * layout.scale) / 100 * 0.4;
    const footprintArea = buildingWidth * buildingHeight;
    const occupancyRate = (footprintArea / terrainDimensions.area) * 100;
    const buildableArea = footprintArea;
    const wastedArea = terrainDimensions.area - footprintArea;

    // Usar informação de validade já salva no layout
    const setbackCompliance = layout.isValid === 1;
    const violationCount = setbackCompliance ? 0 : 1; // Simplificado

    // Score: 100 pontos base
    // -20 por violação de recuo
    // +10 por cada 10% de aproveitamento acima de 50%
    let score = 100;
    score -= violationCount * 20;
    score += Math.max(0, (occupancyRate - 50) / 10) * 10;
    score = Math.max(0, Math.min(100, score));

    return {
      layoutId: layout.id,
      name: layout.name,
      footprintArea,
      occupancyRate,
      buildableArea,
      wastedArea,
      setbackCompliance,
      violationCount,
      score,
    };
  };

  const drawLayoutOnCanvas = (canvas: HTMLCanvasElement, layout: any) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

      // Convert coordinates to canvas space
      const points = coords.map((coord: any) => {
        const x = ((coord.lng - minLng) / (maxLng - minLng)) * canvas.width;
        const y = ((maxLat - coord.lat) / (maxLat - minLat)) * canvas.height;
        return { x, y };
      });

      // Draw terrain polygon
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
      ctx.fill();

      // Draw building footprint
      const centerX = canvas.width / 2 + (layout.offsetX / 100) * canvas.width;
      const centerY = canvas.height / 2 + (layout.offsetY / 100) * canvas.height;
      const buildingWidth = (canvas.width * layout.scale) / 100;
      const buildingHeight = (canvas.height * layout.scale) / 100 * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((layout.rotation * Math.PI) / 180);

      // Color based on validity
      const isValid = layout.isValid === 1;
      ctx.fillStyle = isValid ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";
      ctx.strokeStyle = isValid ? "#22c55e" : "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
      ctx.strokeRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);

      ctx.restore();
    } catch (error) {
      console.error("Error drawing layout:", error);
    }
  };

  useEffect(() => {
    if (!layouts) return;

    selectedLayouts.forEach((layoutId, index) => {
      const layout = layouts.find((l) => l.id === layoutId);
      const canvas = canvasRefs[index].current;
      if (layout && canvas) {
        drawLayoutOnCanvas(canvas, layout);
      }
    });
  }, [selectedLayouts, layouts, polygonCoordinates]);

  const handleLayoutSelect = (index: number, layoutId: string) => {
    const newSelected = [...selectedLayouts];
    newSelected[index] = parseInt(layoutId);
    setSelectedLayouts(newSelected);
  };

  const selectedLayoutsData = selectedLayouts
    .map((id) => layouts?.find((l) => l.id === id))
    .filter(Boolean);

  const metrics = selectedLayoutsData.map((layout) => calculateMetrics(layout!));
  const bestLayout = metrics.reduce((best, current) => 
    current.score > best.score ? current : best, 
    metrics[0] || { score: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Comparação de Layouts
        </CardTitle>
        <CardDescription>
          Compare até 3 layouts lado a lado e veja métricas de aproveitamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Layouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">Layout {index + 1}</label>
              <Select
                value={selectedLayouts[index]?.toString() || ""}
                onValueChange={(value) => handleLayoutSelect(index, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um layout" />
                </SelectTrigger>
                <SelectContent>
                  {layouts?.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id.toString()}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {/* Visualização dos Layouts */}
        {selectedLayoutsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedLayoutsData.map((layout, index) => (
              <div key={layout!.id} className="space-y-2">
                <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                  <canvas
                    ref={canvasRefs[index]}
                    width={400}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{layout!.name}</p>
                  {bestLayout.layoutId === layout!.id && (
                    <Badge variant="default" className="mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Recomendado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabela Comparativa de Métricas */}
        {metrics.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Métrica</th>
                  {metrics.map((metric) => (
                    <th key={metric.layoutId} className="text-center p-3 font-medium">
                      {metric.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">Área do Edifício</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      {metric.footprintArea.toFixed(2)} m²
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-border bg-muted/50">
                  <td className="p-3 font-medium">Taxa de Ocupação</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      {metric.occupancyRate.toFixed(1)}%
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">Área Aproveitável</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      {metric.buildableArea.toFixed(2)} m²
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-border bg-muted/50">
                  <td className="p-3 font-medium">Área Desperdiçada</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      {metric.wastedArea.toFixed(2)} m²
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-border">
                  <td className="p-3 font-medium">Recuos</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      {metric.setbackCompliance ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Válido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          {metric.violationCount} violação(ões)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-border bg-muted/50">
                  <td className="p-3 font-medium">Score Geral</td>
                  {metrics.map((metric) => (
                    <td key={metric.layoutId} className="text-center p-3">
                      <span className={`font-bold ${
                        metric.score >= 80 ? 'text-green-600' :
                        metric.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {metric.score.toFixed(0)}/100
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Análise e Recomendação */}
        {bestLayout && metrics.length > 1 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm mb-2">Recomendação:</p>
                <p className="text-sm text-muted-foreground">
                  O layout <strong>{bestLayout.name}</strong> apresenta o melhor score geral ({bestLayout.score.toFixed(0)}/100),
                  com {bestLayout.occupancyRate.toFixed(1)}% de taxa de ocupação
                  {bestLayout.setbackCompliance ? 
                    " e todos os recuos respeitados." : 
                    ` mas possui ${bestLayout.violationCount} violação(ões) de recuo que precisam ser corrigidas.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedLayoutsData.length === 0 && (
          <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
            <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Selecione layouts acima para comparar</p>
            <p className="text-xs mt-1">Escolha de 2 a 3 layouts para ver a comparação</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
