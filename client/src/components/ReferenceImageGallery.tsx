import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import type { ProjectAttachment } from "../../../drizzle/schema";

interface ReferenceImageGalleryProps {
  projectId: number;
  selectedImages: number[];
  onSelectionChange: (imageIds: number[]) => void;
}

/**
 * Componente de galeria para selecionar imagens de referência
 * Permite escolher quais imagens anexadas serão usadas pela IA na geração de estudos
 */
export default function ReferenceImageGallery({
  projectId,
  selectedImages,
  onSelectionChange,
}: ReferenceImageGalleryProps) {
  const [previewImage, setPreviewImage] = useState<ProjectAttachment | null>(
    null
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  // Query para listar apenas imagens de referência
  const { data: attachments, isLoading } =
    trpc.attachment.listAttachments.useQuery({
      projectId,
    });

  // Filtrar apenas imagens
  const referenceImages =
    attachments?.filter(
      (att) =>
        att.fileType === "reference_image" ||
        (att.mimeType && att.mimeType.startsWith("image/"))
    ) || [];

  // Toggle seleção de imagem
  const toggleImageSelection = (imageId: number) => {
    if (selectedImages.includes(imageId)) {
      onSelectionChange(selectedImages.filter((id) => id !== imageId));
    } else {
      onSelectionChange([...selectedImages, imageId]);
    }
  };

  // Abrir preview
  const handlePreview = (image: ProjectAttachment) => {
    setPreviewImage(image);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Carregando imagens...
      </div>
    );
  }

  if (referenceImages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma imagem de referência anexada. Envie imagens na aba "Anexos"
          para usar como referência visual.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Selecione imagens para usar como referência na geração de estudos
            volumétricos
          </p>
          {selectedImages.length > 0 && (
            <Badge variant="secondary">
              {selectedImages.length} selecionada
              {selectedImages.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {referenceImages.map((image) => {
            const isSelected = selectedImages.includes(image.id);

            return (
              <Card
                key={image.id}
                className={`relative overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:ring-1 hover:ring-muted-foreground"
                }`}
                onClick={() => toggleImageSelection(image.id)}
              >
                {/* Imagem */}
                <div className="aspect-square bg-muted relative">
                  <img
                    src={image.fileUrl}
                    alt={image.fileName}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay de seleção */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-2">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  )}

                  {/* Botão de preview */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(image);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Nome do arquivo */}
                <div className="p-2">
                  <p className="text-xs truncate" title={image.fileName}>
                    {image.fileName}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedImages.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Seleção
            </Button>
          </div>
        )}
      </div>

      {/* Dialog de preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewImage?.fileName}</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="mt-4">
              <img
                src={previewImage.fileUrl}
                alt={previewImage.fileName}
                className="w-full h-auto rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
