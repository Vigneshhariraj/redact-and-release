import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Folder } from 'lucide-react';

interface FolderPickerDialogProps {
  trigger: React.ReactNode;
  onFolderSelected: (files: FileList) => void;
  title: string;
  description: string;
}

export const FolderPickerDialog = ({ 
  trigger, 
  onFolderSelected, 
  title,
  description 
}: FolderPickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFolderSelected(e.target.files);
      setOpen(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      onFolderSelected(e.dataTransfer.files);
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
                    <Folder className="mr-2 h-4 w-4" />
                    Select Folder
                    <input
                      type="file"
                      {...({ webkitdirectory: "" } as any)}
                      className="hidden"
                      onChange={handleFolderInput}
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