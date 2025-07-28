import { Shield, HelpCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';

export const Header = () => {
  const { startTutorial, showButton } = useTutorial();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-lg shadow-soft">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Secure PDF Redactor
            </h1>
            <p className="text-xs text-muted-foreground">
              Professional document redaction tool
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={startTutorial}
              className="h-9 w-9 p-0"
              title="Show Tutorial"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};