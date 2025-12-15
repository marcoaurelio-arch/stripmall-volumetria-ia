import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Save, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CustomTemplateEditorProps {
  currentLayout?: {
    offsetX: number;
    offsetY: number;
    rotation: number;
    scale: number;
  };
  terrain?: {
    width: number;
    length: number;
    area: number;
  };
  onSaved?: () => void;
}

export function CustomTemplateEditor({
  currentLayout = { offsetX: 0, offsetY: 0, rotation: 0, scale: 80 },
  terrain = { width: 50, length: 100, area: 5000 },
  onSaved,
}: CustomTemplateEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<'retangular' | 'L' | 'esquina' | 'irregular' | 'outro'>('retangular');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [recommendedMinArea, setRecommendedMinArea] = useState("");
  const [recommendedMaxArea, setRecommendedMaxArea] = useState("");

  const createMutation = trpc.customTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      setOpen(false);
      resetForm();
      onSaved?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar template: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory('retangular');
    setTags([]);
    setTagInput("");
    setIsPublic(false);
    setRecommendedMinArea("");
    setRecommendedMaxArea("");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    const aspectRatio = terrain.width / terrain.length;

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      offsetX: currentLayout.offsetX,
      offsetY: currentLayout.offsetY,
      rotation: currentLayout.rotation,
      scale: currentLayout.scale,
      tags: tags.length > 0 ? tags : undefined,
      isPublic,
      recommendedMinArea: recommendedMinArea ? parseInt(recommendedMinArea) : undefined,
      recommendedMaxArea: recommendedMaxArea ? parseInt(recommendedMaxArea) : undefined,
      recommendedAspectRatio: aspectRatio,
    });
  };

  // Desenhar preview
  useEffect(() => {
    if (!canvasRef.current || !open) return;

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

    // Desenhar edifício
    const buildingCenterX = offsetX + (terrain.width / 2 + currentLayout.offsetX) * scale;
    const buildingCenterY = offsetY + (terrain.length / 2 + currentLayout.offsetY) * scale;
    const buildingWidth = (terrain.width * currentLayout.scale / 100) * scale;
    const buildingHeight = (terrain.length * currentLayout.scale / 100 * 0.4) * scale;

    ctx.save();
    ctx.translate(buildingCenterX, buildingCenterY);
    ctx.rotate(currentLayout.rotation * Math.PI / 180);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.strokeRect(-buildingWidth / 2, -buildingHeight / 2, buildingWidth, buildingHeight);
    ctx.restore();

    // Desenhar parâmetros
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Offset: (${currentLayout.offsetX.toFixed(1)}, ${currentLayout.offsetY.toFixed(1)})`, 10, 20);
    ctx.fillText(`Rotação: ${currentLayout.rotation}°`, 10, 35);
    ctx.fillText(`Escala: ${currentLayout.scale}%`, 10, 50);
  }, [open, currentLayout, terrain]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Salvar como Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Template Personalizado</DialogTitle>
          <DialogDescription>
            Salve o layout atual como um template reutilizável
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview do Layout
            </Label>
            <div className="bg-muted rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full"
              />
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="template-name">Nome do Template *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Layout Centralizado Otimizado"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Descrição</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as características e vantagens deste template..."
              rows={3}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="template-category">Categoria</Label>
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger id="template-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retangular">Terreno Retangular</SelectItem>
                <SelectItem value="L">Terreno em L</SelectItem>
                <SelectItem value="esquina">Terreno de Esquina</SelectItem>
                <SelectItem value="irregular">Terreno Irregular</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Adicionar tag..."
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Área recomendada */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-area">Área Mínima Recomendada (m²)</Label>
              <Input
                id="min-area"
                type="number"
                value={recommendedMinArea}
                onChange={(e) => setRecommendedMinArea(e.target.value)}
                placeholder="Ex: 3000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-area">Área Máxima Recomendada (m²)</Label>
              <Input
                id="max-area"
                type="number"
                value={recommendedMaxArea}
                onChange={(e) => setRecommendedMaxArea(e.target.value)}
                placeholder="Ex: 8000"
              />
            </div>
          </div>

          {/* Público */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is-public">Compartilhar com a Comunidade</Label>
              <p className="text-sm text-muted-foreground">
                Permitir que outros usuários vejam e usem este template
              </p>
            </div>
            <Switch
              id="is-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Salvando..." : "Salvar Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
