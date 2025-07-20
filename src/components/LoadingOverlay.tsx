import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const quotes = [
  "Redacting sensitive data faster than you can say 'confidential'! 🔒",
  "Your PDFs are getting the VIP security treatment! ✨",
  "Turning your documents into Fort Knox, one page at a time! 🏰",
  "Even the FBI would be impressed with this level of redaction! 🕵️",
  "Making sure your secrets stay secret! 🤫",
  "Pixels are being professionally blackened... almost there! 🎨",
  "Your documents are going through witness protection! 👤",
  "Applying digital whiteout with surgical precision! 🩺",
  "Teaching your PDFs the art of keeping quiet! 🤐",
  "Censoring like it's 1984, but with better technology! 📚"
];

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay = ({ isVisible }: LoadingOverlayProps) => {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        const newIndex = (prev + 1) % quotes.length;
        setCurrentQuote(quotes[newIndex]);
        return newIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-xl shadow-2xl border max-w-md w-full mx-4 text-center space-y-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Processing Your Documents
          </h3>
          <div className="h-12 flex items-center justify-center">
            <p 
              key={quoteIndex}
              className="text-sm text-muted-foreground animate-fade-in"
            >
              {currentQuote}
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};