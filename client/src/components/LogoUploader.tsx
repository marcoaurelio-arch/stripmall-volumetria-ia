import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface LogoUploaderProps {
  projectId?: number;
  currentLogoUrl?: string | null;
  onLogoUploaded?: (logoUrl: string) => void;
}

export default function LogoUploader({ projectId, currentLogoUrl, onLogoUploaded }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
  const [brandColor, setBrandColor] = useState("#3B82F6");

  const uploadLogoMutation = trpc.project.uploadLogo.useMutation({
    onSuccess: (data: { success: boolean; logoUrl: string }) => {
      setLogoUrl(data.logoUrl);
      toast.success("Logo enviado com sucesso!");
      if (onLogoUploaded) {
        onLogoUploaded(data.logoUrl);
      }
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Erro ao enviar logo");
      setUploading(false);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setUploading(true);

    try {
      // Converter para base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (projectId) {
          uploadLogoMutation.mutate({
            projectId,
            logoBase64: base64,
            fileName: file.name,
          });
        } else {
          // Se não tem projectId, apenas exibe preview
          setLogoUrl(base64);
          setUploading(false);
          if (onLogoUploaded) {
            onLogoUploaded(base64);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      toast.error("Erro ao processar imagem");
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    if (onLogoUploaded) {
      onLogoUploaded("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="logo-upload">Logo do Projeto (Opcional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Adicione um logo personalizado para aparecer no PDF profissional
        </p>
        
        {logoUrl ? (
          <Card className="p-4 relative">
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border-2 border-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  alt="Logo do projeto" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Logo carregado</p>
                <p className="text-xs text-muted-foreground">
                  Este logo aparecerá na capa e rodapé do PDF profissional
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveLogo}
                title="Remover logo"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            <Label
              htmlFor="logo-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Enviando...</p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-primary/10 p-3">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG ou SVG (máx. 5MB)
                    </p>
                  </div>
                </>
              )}
            </Label>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="brand-color">Cor da Marca (Opcional)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Escolha uma cor para personalizar elementos do PDF
        </p>
        <div className="flex items-center gap-3">
          <Input
            id="brand-color"
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="w-20 h-10 cursor-pointer"
          />
          <Input
            type="text"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            placeholder="#3B82F6"
            className="flex-1 font-mono"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
}
