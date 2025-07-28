import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTutorial } from '@/contexts/TutorialContext';
import { ChevronLeft, ChevronRight, X, EyeOff } from 'lucide-react';

export const ImageSlideTutorial = () => {
  const { 
    isActive, 
    currentSlide, 
    slides, 
    nextSlide, 
    prevSlide, 
    closeTutorial,
    dontShowAgain 
  } = useTutorial();

  if (!isActive) return null;

  const currentSlideData = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-background shadow-2xl animate-scale-in">
        {/* Image */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
          <img
            src={currentSlideData.image}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {currentSlideData.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeTutorial}
              className="h-8 w-8 p-0 ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentSlide + 1} of {slides.length}</span>
              <span>{Math.round(((currentSlide + 1) / slides.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-2">
              {!isFirstSlide && (
                <Button
                  variant="outline"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              {isFirstSlide && (
                <Button
                  variant="ghost"
                  onClick={dontShowAgain}
                  className="text-muted-foreground"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Don't show again
                </Button>
              )}
            </div>

            <Button onClick={nextSlide}>
              {isLastSlide ? 'Get Started' : 'Next'}
              {!isLastSlide && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};