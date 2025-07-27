import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Folder, HardDrive, Download } from 'lucide-react';

interface OutputFolderDialogProps {
  trigger: React.ReactNode;
  onFolderSelected: (handle: FileSystemDirectoryHandle | null) => void;
  title: string;
}

export const OutputFolderDialog = ({ 
  trigger, 
  onFolderSelected, 
  title 
}: OutputFolderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleFolderSelection = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setSelectedFolder(directoryHandle.name);
        onFolderSelected(directoryHandle);
        setOpen(false);
      } else {
        // Fallback for unsupported browsers
        onFolderSelected(null);
        setOpen(false);
      }
    } catch (err) {
      console.log('User cancelled folder selection');
    }
  };

  const handleDownloadsFolder = () => {
    onFolderSelected(null);
    setOpen(false);
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
        <Card className="p-6 space-y-4">
          <div className="text-center">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Choose where to save your redacted files
            </p>
          </div>
          
          <div className="space-y-3">
            {'showDirectoryPicker' in window ? (
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleFolderSelection}
              >
                <Folder className="mr-2 h-4 w-4" />
                Choose Custom Folder
              </Button>
            ) : null}
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleDownloadsFolder}
            >
              <Download className="mr-2 h-4 w-4" />
              Use Downloads Folder
            </Button>
          </div>

          {selectedFolder && (
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-sm text-center">
                Selected: <strong>{selectedFolder}</strong>
              </p>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
};