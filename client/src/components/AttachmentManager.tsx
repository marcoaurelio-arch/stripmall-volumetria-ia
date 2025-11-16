import { useState } from "react";
import {
  File,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  Map,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ProjectAttachment } from "../../../drizzle/schema";

interface AttachmentManagerProps {
  projectId: number;
}

/**
 * Componente para visualizar e gerenciar anexos de um projeto
 * Exibe lista de arquivos com preview, download e exclusão
 */
export default function AttachmentManager({
  projectId,
}: AttachmentManagerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] =
    useState<ProjectAttachment | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Query para listar anexos
  const { data: attachments, isLoading, refetch } = trpc.attachment.listAttachments.useQuery({
    projectId,
  });

  // Mutation para excluir anexo
  const deleteMutation = trpc.attachment.deleteAttachment.useMutation({
    onSuccess: () => {
      toast.success("Arquivo excluído com sucesso!");
      refetch();
      setDeleteDialogOpen(false);
      setSelectedAttachment(null);
    },
    onError: () => {
      toast.error("Erro ao excluir arquivo");
    },
  });

  // Obter ícone baseado no tipo de arquivo
  const getFileIcon = (attachment: ProjectAttachment) => {
    if (attachment.fileType === "reference_image") {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (attachment.fileType === "kmz") {
      return <Map className="w-5 h-5 text-green-500" />;
    }
    if (attachment.fileType === "plant") {
      return <FileText className="w-5 h-5 text-purple-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Obter label do tipo de arquivo
  const getFileTypeLabel = (fileType: string) => {
    const labels: Record<string, string> = {
      plant: "Planta",
      document: "Documento",
      reference_image: "Imagem de Referência",
      kmz: "Arquivo KMZ/KML",
    };
    return labels[fileType] || fileType;
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Formatar data
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Verificar se é imagem
  const isImage = (mimeType: string | null): boolean => {
    if (!mimeType) return false;
    return mimeType.startsWith("image/");
  };

  // Abrir preview de imagem
  const handlePreview = (attachment: ProjectAttachment) => {
    if (isImage(attachment.mimeType)) {
      setSelectedAttachment(attachment);
      setPreviewDialogOpen(true);
    }
  };

  // Fazer download do arquivo
  const handleDownload = (attachment: ProjectAttachment) => {
    window.open(attachment.fileUrl, "_blank");
  };

  // Confirmar exclusão
  const handleDeleteClick = (attachment: ProjectAttachment) => {
    setSelectedAttachment(attachment);
    setDeleteDialogOpen(true);
  };

  // Executar exclusão
  const handleDeleteConfirm = () => {
    if (selectedAttachment) {
      deleteMutation.mutate({
        attachmentId: selectedAttachment.id,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!attachments || attachments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <File className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">
          Nenhum arquivo anexado a este projeto
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {attachments.map((attachment) => (
          <Card key={attachment.id} className="p-4">
            <div className="flex items-start gap-4">
              {/* Ícone ou preview de imagem */}
              <div className="flex-shrink-0">
                {isImage(attachment.mimeType) ? (
                  <div className="w-16 h-16 rounded border overflow-hidden bg-muted">
                    <img
                      src={attachment.fileUrl}
                      alt={attachment.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded border flex items-center justify-center bg-muted">
                    {getFileIcon(attachment)}
                  </div>
                )}
              </div>

              {/* Informações do arquivo */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{attachment.fileName}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                  <span>{getFileTypeLabel(attachment.fileType)}</span>
                  {attachment.fileSize && (
                    <span>{formatFileSize(attachment.fileSize)}</span>
                  )}
                  <span>{formatDate(attachment.createdAt)}</span>
                </div>
                {attachment.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {attachment.description}
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 flex-shrink-0">
                {isImage(attachment.mimeType) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(attachment)}
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(attachment)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(attachment)}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog de preview de imagem */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAttachment?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedAttachment && (
            <div className="mt-4">
              <img
                src={selectedAttachment.fileUrl}
                alt={selectedAttachment.fileName}
                className="w-full h-auto rounded"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo "
              {selectedAttachment?.fileName}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
