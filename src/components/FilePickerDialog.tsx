import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, File, Folder } from 'lucide-react';

interface FilePickerDialogProps {
  trigger: React.ReactNode;
  onFilesSelected: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  title: string;
  description: string;
}

export const FilePickerDialog = ({ 
  trigger, 
  onFilesSelected, 
  accept = ".pdf,application/pdf", 
  multiple = true,
  title,
  description 
}: FilePickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files);
      setOpen(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      onFilesSelected(e.dataTransfer.files);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Card className="p-6">
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
                {description}
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <label className="cursor-pointer">
                    <File className="mr-2 h-4 w-4" />
                    Select Files
                    <input
                      type="file"
                      multiple={multiple}
                      accept={accept}
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};