import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileUpload, type FileWithMetadata } from '@/components/FileUpload';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { BackendStatus } from '@/components/BackendStatus';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Professional PDF Redaction
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Securely redact sensitive information from your PDF documents with our 
            enterprise-grade redaction tool. Upload, process, and download your 
            protected documents in minutes.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Secure Processing</h3>
            <p className="text-sm text-muted-foreground">
              All files processed locally for maximum security
            </p>
          </Card>
          
          <Card className="p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Batch Processing</h3>
            <p className="text-sm text-muted-foreground">
              Process multiple PDF files simultaneously
            </p>
          </Card>
          
          <Card className="p-4 text-center space-y-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Enterprise Ready</h3>
            <p className="text-sm text-muted-foreground">
              Professional-grade redaction for business use
            </p>
          </Card>
        </div>

        {/* Status Alert */}
        {files.length === 0 && (
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>Getting Started:</strong> Upload your PDF files using the area below. 
              The system supports multiple file selection and drag-and-drop functionality.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground text-center">
              Upload & Redact PDF Files
            </h3>
            <div>
              <FileUpload 
                files={files} 
                onFilesChange={setFiles}
                onProcessingChange={setIsProcessing}
              />
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <div>
          <BackendStatus onStatusChange={setIsBackendConnected} />
        </div>
      </main>

      <Footer />
      
      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
};

export default Index;