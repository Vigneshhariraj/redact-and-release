import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTutorial } from '@/contexts/TutorialContext';
import { ChevronLeft, ChevronRight, X, SkipForward, EyeOff } from 'lucide-react';

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TutorialOverlay = () => {
  const { 
    isActive, 
    currentStep, 
    steps, 
    nextStep, 
    prevStep, 
    skipTutorial, 
    closeTutorial,
    dontShowAgain 
  } = useTutorial();
  
  const [targetPosition, setTargetPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const position = {
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height
        };
        
        setTargetPosition(position);
        
        // Calculate tooltip position
        const tooltipOffset = 20;
        let tooltipTop = position.top;
        let tooltipLeft = position.left;
        
        switch (steps[currentStep].position) {
          case 'top':
            tooltipTop = position.top - 200 - tooltipOffset;
            tooltipLeft = position.left + (position.width / 2) - 150;
            break;
          case 'bottom':
            tooltipTop = position.top + position.height + tooltipOffset;
            tooltipLeft = position.left + (position.width / 2) - 150;
            break;
          case 'left':
            tooltipTop = position.top + (position.height / 2) - 100;
            tooltipLeft = position.left - 320 - tooltipOffset;
            break;
          case 'right':
            tooltipTop = position.top + (position.height / 2) - 100;
            tooltipLeft = position.left + position.width + tooltipOffset;
            break;
        }
        
        // Ensure tooltip stays within viewport
        tooltipTop = Math.max(20, Math.min(tooltipTop, window.innerHeight - 220));
        tooltipLeft = Math.max(20, Math.min(tooltipLeft, window.innerWidth - 320));
        
        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
        
        // Scroll target into view
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, steps]);

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      style={{
        background: targetPosition 
          ? `radial-gradient(circle at ${targetPosition.left + targetPosition.width/2}px ${targetPosition.top + targetPosition.height/2}px, transparent 0px, transparent ${Math.max(targetPosition.width, targetPosition.height)/2 + 20}px, rgba(0,0,0,0.7) ${Math.max(targetPosition.width, targetPosition.height)/2 + 40}px)`
          : 'rgba(0,0,0,0.7)'
      }}
    >
      {/* Highlighted Area */}
      {targetPosition && (
        <div
          className="absolute border-2 border-primary rounded-lg shadow-lg"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
            background: 'transparent',
            boxShadow: '0 0 20px rgba(var(--primary), 0.5), inset 0 0 20px rgba(var(--primary), 0.1)'
          }}
        />
      )}

      {/* Tutorial Tooltip */}
      <Card 
        className="absolute w-80 p-6 animate-scale-in shadow-xl border-primary/20"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {currentStepData?.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentStepData?.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeTutorial}
              className="h-8 w-8 p-0 ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="h-8 text-muted-foreground"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            </div>

            <div className="flex space-x-2">
              {isFirstStep && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dontShowAgain}
                  className="h-8 text-muted-foreground"
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Don't show again
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={nextStep}
                className="h-8"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};