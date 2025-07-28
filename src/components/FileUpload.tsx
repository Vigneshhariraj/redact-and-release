import { useState, useCallback } from 'react';
import { Upload, File, X, Loader2, Folder, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FilePickerDialog } from '@/components/FilePickerDialog';
import { FolderPickerDialog } from '@/components/FolderPickerDialog';
import { OutputFolderDialog } from '@/components/OutputFolderDialog';

export interface FileWithMetadata {
  file: File;
  id: string;
  size: string;
  pages?: number;
}

interface FileUploadProps {
  onFilesChange: (files: FileWithMetadata[]) => void;
  files: FileWithMetadata[];
  onProcessingChange?: (processing: boolean) => void;
}

export const FileUpload = ({ onFilesChange, files, onProcessingChange }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ name: string; url: string }[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [outputDirectoryHandle, setOutputDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const { toast } = useToast();

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
    return new Promise<boolean>((resolve) => {
      // This will be handled by the OutputFolderDialog component
      const handleFolderSelection = (handle: FileSystemDirectoryHandle | null) => {
        setOutputDirectoryHandle(handle);
        if (!handle) {
          toast({
            title: "Downloads Folder Selected",
            description: "Files will be downloaded to your default Downloads folder.",
            variant: "default",
          });
        }
        resolve(true);
      };
      // The dialog will handle the selection
      resolve(true);
    });
  };

  const uploadFiles = async (directoryHandle?: FileSystemDirectoryHandle | null) => {
  if (directoryHandle !== undefined) {
    setOutputDirectoryHandle(directoryHandle);
  }

    setIsProcessing(true);
    onProcessingChange?.(true);
    setSaveMessage(null); // Clear any previous message

    const formData = new FormData();
    for (const fileData of files) {
      formData.append("files", fileData.file); // Note: 'files' must match backend
    }

    try {
      const res = await fetch("http://localhost:5000/redact-multi", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      let results: { name: string; url: string }[] = [];

      if (data.status === "success" && Array.isArray(data.results)) {
        results = data.results.map((item: { filename: string; url: string }) => ({
          name: item.filename,
          url: `http://localhost:5000${item.url}`
        }));

        setUploadResults(results);

        // ✅ Auto-save files to selected folder
        if (outputDirectoryHandle) {
          for (const { name, url } of results) {
            await downloadFile(url, name);
          }

          // ✅ Show message near the button
          setSaveMessage(`Saved ${results.length} files to: ${outputDirectoryHandle.name}`);
          toast({
            title: "Files Saved Successfully",
            description: `${results.length} files saved to: ${outputDirectoryHandle.name}`,
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Redaction Failed",
          description: "Batch redaction failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "Error uploading files. Please check your connection and try again.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
    onProcessingChange?.(false);
  };

  const clearAll = async () => {
    // Clear frontend state
    onFilesChange([]);
    setUploadResults([]);
    setSaveMessage(null);
    setOutputDirectoryHandle(null);

    // 🔁 Call backend to delete files
    try {
      await fetch("http://localhost:5000/clear-all", { method: "POST" });
      toast({
        title: "Cleared Successfully",
        description: "All files have been cleared and reset.",
        variant: "default",
      });
    } catch (err) {
      console.error("Failed to clear backend files:", err);
      toast({
        title: "Clear Warning",
        description: "Frontend cleared but backend cleanup may have failed.",
        variant: "default",
      });
    }
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
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
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
            <FilePickerDialog
              trigger={
                <span className="text-primary cursor-pointer hover:underline">
                  browse files
                </span>
              }
              onFilesSelected={(fileList) => handleFiles(fileList)}
              title="Select PDF Files"
              description="Choose one or more PDF files to redact"
            />
            {' or '}
            <FolderPickerDialog
              trigger={
                <span className="text-primary cursor-pointer hover:underline">
                  select folder
                </span>
              }
              onFolderSelected={(fileList) => handleFiles(fileList)}
              title="Select Folder"
              description="Choose a folder containing PDF files"
            />
          </p>
          <p className="text-sm text-muted-foreground">
            Support for individual files or entire folders of PDF files
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 tutorial-file-list">
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
          
          <div className="space-y-3">
            <OutputFolderDialog
              trigger={
                <Button 
                  className="w-full tutorial-process-button" 
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
              }
              onFolderSelected={(handle) => uploadFiles(handle)}
              title="Choose Output Folder"
            />
            
            {saveMessage && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-success/10 text-success border border-success/20 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{saveMessage}</p>
              </div>
            )}
          </div>
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

            {/* ✅ Clear Button Goes Here */}
            <Button
              variant="destructive"
              className="w-full mt-2"
              onClick={clearAll}
            >
              Clear All and Start Over
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};