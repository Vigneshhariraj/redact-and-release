import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2, Folder } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; url: string }[]>([]);
  const [outputDirectoryHandle, setOutputDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);

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

  const handleFolderInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  }, [handleFiles]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const selectOutputFolder = async () => {
    try {
      // Check if File System Access API is supported
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setOutputDirectoryHandle(directoryHandle);
        return true;
      } else {
        alert('Your browser does not support folder selection. Files will be downloaded to your default Downloads folder.');
        return true;
      }
    } catch (err) {
      console.log('User cancelled folder selection');
      return false;
    }
  };

  const uploadFiles = async () => {
    // First ask user to select output folder
    const folderSelected = await selectOutputFolder();
    if (!folderSelected) return;

    setIsProcessing(true);
    const results: { name: string; url: string }[] = [];
    
    for (const fileData of files) {
      const formData = new FormData();
      formData.append("file", fileData.file);
      
      try {
        const res = await fetch("http://localhost:5000/redact", {
          method: "POST",
          body: formData
        });
        
        const data = await res.json();
        if (data.status === "success") {
          results.push({
            name: data.filename,
            url: `http://localhost:5000${data.url}`
          });
        } else {
          alert(`Redaction failed for ${fileData.file.name}`);
        }
      } catch (err) {
        alert(`Error uploading ${fileData.file.name}`);
      }
    }
    
    setUploadResults(results);
    setIsProcessing(false);
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      if (outputDirectoryHandle && 'showDirectoryPicker' in window) {
        // Save to selected folder
        const fileHandle = await outputDirectoryHandle.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        // Fallback to browser download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed. Please try again.');
    }
  };

  const downloadAllFiles = async () => {
    for (const { name, url } of uploadResults) {
      await downloadFile(url, name);
    }
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
        <div className="space-y-3">
          <p className="text-lg font-medium">
            Drop PDF files here or{' '}
            <label className="text-primary cursor-pointer hover:underline">
              browse files
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
            {' or '}
            <label className="text-primary cursor-pointer hover:underline">
              select folder
              <input
                type="file"
                {...({ webkitdirectory: "" } as any)}
                className="hidden"
                onChange={handleFolderInput}
              />
            </label>
          </p>
          <p className="text-sm text-muted-foreground">
            Support for individual files or entire folders of PDF files
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
          <Button 
            className="w-full mt-4" 
            onClick={uploadFiles}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Start Redaction'
            )}
          </Button>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-foreground">Redacted Files Ready:</h4>
          {outputDirectoryHandle && (
            <p className="text-sm text-muted-foreground">
              Files will be saved to: {outputDirectoryHandle.name}
            </p>
          )}
          <div className="space-y-2">
            <Button
              onClick={downloadAllFiles}
              variant="success"
              className="w-full"
            >
              <Folder className="mr-2 h-4 w-4" />
              Save All Files to Selected Folder
            </Button>
            <div className="space-y-1">
              {uploadResults.map(({ name, url }) => (
                <Button
                  key={name}
                  onClick={() => downloadFile(url, name)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                >
                  Save {name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};