import { useState, useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface FileWithMetadata {
  file: File;
  id: string;
  size: string;
  pages?: number;
}

interface FileUploadProps {
  onFilesChange: (files: FileWithMetadata[]) => void;
  files: FileWithMetadata[];
}

export const FileUpload = ({ onFilesChange, files }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;

    const pdfFiles = Array.from(fileList).filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    const newFiles: FileWithMetadata[] = pdfFiles.map(file => ({
      file,
      id: generateId(),
      size: formatFileSize(file.size),
      pages: Math.floor(Math.random() * 50) + 1 // Simulated page count
    }));

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFiles]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  return (
    <Card className="p-6 space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver 
            ? 'border-primary bg-accent' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            Drop PDF files here or{' '}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="text-sm text-muted-foreground">
            Support for multiple PDF files
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-foreground">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((fileData) => (
              <div
                key={fileData.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {fileData.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fileData.size} • {fileData.pages} pages
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileData.id)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};