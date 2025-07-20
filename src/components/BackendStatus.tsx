import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface BackendStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export const BackendStatus = ({ onStatusChange }: BackendStatusProps) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:5000/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      const connected = response.ok;
      setIsConnected(connected);
      onStatusChange?.(connected);
    } catch (error) {
      setIsConnected(false);
      onStatusChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    if (isChecking) {
      return {
        icon: Loader2,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        animation: 'animate-spin',
        text: 'Checking backend connection...'
      };
    }
    
    if (isConnected) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-500',
        animation: '',
        text: 'Backend connected - Live processing available'
      };
    }
    
    return {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500',
      animation: 'animate-pulse',
      text: 'Backend disconnected - Using simulation mode (Connect to localhost:5000)'
    };
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center space-x-3 text-sm">
        <div className="relative">
          <div className={`w-3 h-3 ${config.bgColor} rounded-full ${config.animation}`} />
          {!isChecking && (
            <StatusIcon className={`absolute -top-0.5 -left-0.5 h-4 w-4 ${config.color}`} />
          )}
        </div>
        <div className="flex-1">
          <span className="text-muted-foreground">
            Backend Status: 
          </span>
          <span className={`ml-1 font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>
        <button
          onClick={checkBackendStatus}
          className="text-xs text-primary hover:text-primary/80 underline"
          disabled={isChecking}
        >
          {isChecking ? 'Checking...' : 'Refresh'}
        </button>
      </div>
    </Card>
  );
};