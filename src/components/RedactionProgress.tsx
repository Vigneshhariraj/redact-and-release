import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FileWithMetadata } from './FileUpload';

export interface RedactionResult {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

interface RedactionProgressProps {
  files: FileWithMetadata[];
  isProcessing: boolean;
  onStartRedaction: () => void;
  onReset: () => void;
}

export const RedactionProgress = ({ 
  files, 
  isProcessing, 
  onStartRedaction, 
  onReset 
}: RedactionProgressProps) => {
  const [results, setResults] = useState<RedactionResult[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Initialize results when files change
  useEffect(() => {
    if (files.length > 0 && !isProcessing) {
      setResults(files.map(file => ({
        id: file.id,
        filename: file.file.name,
        status: 'pending',
        progress: 0
      })));
    }
  }, [files, isProcessing]);

  // Simulate redaction process
  useEffect(() => {
    if (!isProcessing || results.length === 0) return;

    const processFiles = async () => {
      for (let i = 0; i < results.length; i++) {
        // Update status to processing
        setResults(prev => prev.map((result, index) => 
          index === i 
            ? { ...result, status: 'processing', progress: 0 }
            : result
        ));

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setResults(prev => prev.map((result, index) => 
            index === i 
              ? { ...result, progress }
              : result
          ));
        }

        // Simulate completion (90% success rate)
        const isSuccess = Math.random() > 0.1;
        setResults(prev => prev.map((result, index) => 
          index === i 
            ? { 
                ...result, 
                status: isSuccess ? 'completed' : 'failed',
                progress: 100,
                downloadUrl: isSuccess ? `#download-${result.id}` : undefined,
                error: !isSuccess ? 'Redaction failed: Unable to process file' : undefined
              }
            : result
        ));

        // Update overall progress
        setOverallProgress(((i + 1) / results.length) * 100);
      }
    };

    processFiles();
  }, [isProcessing, results.length]);

  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const isAllDone = results.length > 0 && results.every(r => r.status === 'completed' || r.status === 'failed');

  const getStatusIcon = (status: RedactionResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleDownload = (downloadUrl: string, filename: string) => {
    // Simulate file download
    const element = document.createElement('a');
    element.href = downloadUrl;
    element.download = `redacted_${filename}`;
    element.click();
  };

  if (files.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        Upload PDF files to begin redaction
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Redaction Progress</h3>
        {isAllDone && (
          <Button variant="outline" onClick={onReset} size="sm">
            Start New Batch
          </Button>
        )}
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="w-full" />
        </div>
      )}

      {!isProcessing && !isAllDone && (
        <Button 
          onClick={onStartRedaction} 
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-md transition-all"
          size="lg"
        >
          Start Redaction Process
        </Button>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Processing {results.length} file{results.length > 1 ? 's' : ''}
            {isAllDone && (
              <span className="ml-2 font-medium">
                • {completedCount} completed • {failedCount} failed
              </span>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(result.status)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {result.filename}
                    </p>
                    {result.status === 'processing' && (
                      <div className="mt-1">
                        <Progress value={result.progress} className="h-1" />
                      </div>
                    )}
                    {result.error && (
                      <p className="text-xs text-destructive mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>

                {result.status === 'completed' && result.downloadUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(result.downloadUrl!, result.filename)}
                    className="ml-2 hover:bg-success/10 hover:text-success"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};