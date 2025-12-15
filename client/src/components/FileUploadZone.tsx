import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface FileUploadZoneProps {
  projectId: number;
  onUploadComplete?: () => void;
}

/**
 * Componente de upload de arquivos com drag-and-drop
 * Suporta múltiplos formatos: PNG, JPG, PDF, DWG, KML, KMZ
 */
export default function FileUploadZone({
  projectId,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const uploadMutation = trpc.attachment.uploadAttachment.useMutation();

  // Tipos de arquivo aceitos
  const acceptedFileTypes = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
    "application/acad": [".dwg"],
    "application/x-dwg": [".dwg"],
    "application/vnd.google-earth.kml+xml": [".kml"],
    "application/vnd.google-earth.kmz": [".kmz"],
  };

  // Determinar tipo de arquivo baseado na extensão
  const getFileType = (fileName: string): "plant" | "document" | "reference_image" | "kmz" => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "kmz" || ext === "kml") return "kmz";
    if (ext === "png" || ext === "jpg" || ext === "jpeg") return "reference_image";
    if (ext === "dwg") return "plant";
    return "document";
  };

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover prefixo "data:mime/type;base64,"
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Fazer upload de um arquivo
  const uploadFile = async (file: File) => {
    try {
      const base64Data = await fileToBase64(file);
      const fileType = getFileType(file.name);

      await uploadMutation.mutateAsync({
        projectId,
        fileName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        fileData: base64Data,
      });

      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  };

  // Fazer upload de todos os arquivos selecionados
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      const success = await uploadFile(file);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    setUploading(false);
    setSelectedFiles([]);

    if (successCount > 0) {
      toast.success(
        `${successCount} arquivo${successCount > 1 ? "s" : ""} enviado${successCount > 1 ? "s" : ""} com sucesso!`
      );
      onUploadComplete?.();
    }

    if (errorCount > 0) {
      toast.error(
        `Erro ao enviar ${errorCount} arquivo${errorCount > 1 ? "s" : ""}`
      );
    }
  };

  // Callback do dropzone quando arquivos são selecionados
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validar tamanho máximo (16MB por arquivo)
    const maxSize = 16 * 1024 * 1024; // 16MB
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande (máximo 16MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
  });

  // Remover arquivo da lista
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      {/* Zona de drag-and-drop */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-12 h-12 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Solte os arquivos aqui...</p>
          ) : (
            <>
              <p className="text-lg font-medium">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: PNG, JPG, PDF, DWG, KML, KMZ (máximo 16MB por
                arquivo)
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Lista de arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">
            Arquivos selecionados ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Botão de upload */}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
            size="lg"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando arquivos...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar {selectedFiles.length} arquivo
                {selectedFiles.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
