import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface InspirationFile {
  file: File;
  preview: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
}

interface InspirationUploadProps {
  projectId?: number; // Opcional - se não fornecido, apenas prepara arquivos
  onFilesSelected?: (files: File[]) => void;
  onUploadComplete?: (uploadedCount: number) => void;
}

/**
 * Componente para upload de múltiplas imagens de inspiração
 * Suporta drag-and-drop e seleção manual de arquivos
 */
export default function InspirationUpload({
  projectId,
  onFilesSelected,
  onUploadComplete,
}: InspirationUploadProps) {
  const [files, setFiles] = useState<InspirationFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Configurar dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validar tamanho dos arquivos
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > 16 * 1024 * 1024) {
        toast.error(`${file.name} excede 16MB`);
        return false;
      }
      return true;
    });

    // Criar previews
    const newFiles: InspirationFile[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      uploading: false,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Notificar seleção
    if (onFilesSelected) {
      onFilesSelected(validFiles);
    }

    toast.success(`${validFiles.length} imagem(ns) adicionada(s)`);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: true,
  });

  // Remover arquivo da lista
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Limpar todos os arquivos
  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  // Fazer upload de um arquivo
  const uploadFile = async (file: File, index: number): Promise<boolean> => {
    if (!projectId) {
      return false;
    }

    try {
      // Converter para base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Fazer upload via tRPC
      const response = await fetch("/api/trpc/attachment.uploadAttachment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          fileName: file.name,
          fileType: "reference_image",
          mimeType: file.type,
          fileSize: file.size,
          fileData: base64Data,
          description: "Imagem de inspiração",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      // Atualizar estado
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index].uploaded = true;
        newFiles[index].uploading = false;
        return newFiles;
      });

      return true;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index].uploading = false;
        newFiles[index].error = "Erro ao fazer upload";
        return newFiles;
      });
      return false;
    }
  };

  // Fazer upload de todos os arquivos
  const uploadAll = async () => {
    if (!projectId) {
      toast.error("ID do projeto não fornecido");
      return;
    }

    setUploading(true);

    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].uploaded) {
        successCount++;
        continue;
      }

      // Marcar como uploading
      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[i].uploading = true;
        return newFiles;
      });

      const success = await uploadFile(files[i].file, i);
      if (success) {
        successCount++;
      }
    }

    setUploading(false);

    if (successCount === files.length) {
      toast.success(`${successCount} imagem(ns) enviada(s) com sucesso!`);
    } else {
      toast.warning(
        `${successCount}/${files.length} imagem(ns) enviada(s)`
      );
    }

    if (onUploadComplete) {
      onUploadComplete(successCount);
    }
  };

  const uploadedCount = files.filter((f) => f.uploaded).length;
  const uploadProgress = files.length > 0 ? (uploadedCount / files.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Área de drop */}
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive
                ? "Solte as imagens aqui..."
                : "Arraste imagens de inspiração ou clique para selecionar"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PNG ou JPG - Máximo 16MB por imagem
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {files.length} imagem(ns) selecionada(s)
              </span>
            </div>
            <div className="flex gap-2">
              {projectId && (
                <Button
                  onClick={uploadAll}
                  disabled={uploading || uploadedCount === files.length}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : uploadedCount === files.length ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Enviado
                    </>
                  ) : (
                    `Enviar Todas (${files.length - uploadedCount})`
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={uploading}
              >
                Limpar Todas
              </Button>
            </div>
          </div>

          {/* Barra de progresso */}
          {projectId && files.length > 0 && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-muted-foreground text-center">
                {uploadedCount} de {files.length} imagens enviadas
              </p>
            </div>
          )}

          {/* Grid de previews */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((fileItem, index) => (
              <Card key={index} className="relative overflow-hidden group">
                {/* Preview da imagem */}
                <div className="aspect-square bg-muted relative">
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay de status */}
                  {fileItem.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}

                  {fileItem.uploaded && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  {fileItem.error && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <p className="text-xs text-red-600 font-medium px-2 text-center">
                        {fileItem.error}
                      </p>
                    </div>
                  )}

                  {/* Botão de remover */}
                  {!fileItem.uploading && !fileItem.uploaded && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Nome do arquivo */}
                <div className="p-2">
                  <p className="text-xs truncate" title={fileItem.file.name}>
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
