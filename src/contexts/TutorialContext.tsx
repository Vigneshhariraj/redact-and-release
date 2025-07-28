import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface TutorialContextType {
  isActive: boolean;
  currentSlide: number;
  slides: TutorialSlide[];
  startTutorial: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  closeTutorial: () => void;
  dontShowAgain: () => void;
  showButton: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to PDF Redactor!',
    description: 'Securely redact sensitive information from your PDF documents with our enterprise-grade redaction tool.',
    image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop'
  },
  {
    id: 'upload',
    title: 'Upload Your Files',
    description: 'Drag and drop PDF files or browse files and folders. Multiple files are supported for batch processing.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop'
  },
  {
    id: 'process',
    title: 'Start Redaction',
    description: 'Select your output folder and click Start Redaction. Our system will securely process your documents.',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=600&fit=crop'
  },
  {
    id: 'download',
    title: 'Download Results',
    description: 'Once processing is complete, download your redacted PDF files to your selected folder.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop'
  }
];

const STORAGE_KEY = 'pdf-redactor-tutorial-dismissed';

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setTimeout(() => setIsActive(true), 1500);
    }
  }, []);

  const startTutorial = () => {
    setCurrentSlide(0);
    setIsActive(true);
  };

  const nextSlide = () => {
    if (currentSlide < TUTORIAL_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      closeTutorial();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const closeTutorial = () => {
    setIsActive(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsActive(false);
    setShowButton(false);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentSlide,
        slides: TUTORIAL_SLIDES,
        startTutorial,
        nextSlide,
        prevSlide,
        closeTutorial,
        dontShowAgain,
        showButton
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};