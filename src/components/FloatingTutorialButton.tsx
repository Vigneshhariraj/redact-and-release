import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { HelpCircle, Play } from 'lucide-react';

export const FloatingTutorialButton = () => {
  const { startTutorial, showFloatingButton } = useTutorial();
  const [isVisible, setIsVisible] = useState(true);

  if (!showFloatingButton || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Pulsing ring animation */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        
        <Button
          onClick={startTutorial}
          size="lg"
          className="relative rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          title="Start Tutorial"
        >
          <div className="flex flex-col items-center">
            <HelpCircle className="h-6 w-6" />
            <Play className="h-3 w-3 absolute bottom-1 right-1 opacity-70" />
          </div>
        </Button>
      </div>

      {/* Swipe down hint - shows for a few seconds */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground whitespace-nowrap border animate-fade-in">
        Swipe down for tutorial
      </div>
    </div>
  );
};