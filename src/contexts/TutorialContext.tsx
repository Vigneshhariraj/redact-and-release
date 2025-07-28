import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector or element ID
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  closeTutorial: () => void;
  dontShowAgain: () => void;
  showFloatingButton: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PDF Redactor!',
    description: 'Let me show you how to securely redact your PDF documents in just a few simple steps.',
    target: '.tutorial-welcome',
    position: 'bottom'
  },
  {
    id: 'upload-area',
    title: 'Upload Your Files',
    description: 'Drag and drop PDF files here, or click to browse files and folders. Multiple files are supported!',
    target: '.tutorial-upload-area',
    position: 'bottom'
  },
  {
    id: 'backend-status',
    title: 'Backend Connection',
    description: 'This indicator shows your connection status. Green means ready to process, yellow means connecting.',
    target: '.tutorial-backend-status',
    position: 'top'
  },
  {
    id: 'file-list',
    title: 'Manage Your Files',
    description: 'Here you can see all selected files, remove unwanted ones, and start the redaction process.',
    target: '.tutorial-file-list',
    position: 'top'
  },
  {
    id: 'process-button',
    title: 'Start Redaction',
    description: 'Click this button to begin the secure redaction process. You can select an output folder first.',
    target: '.tutorial-process-button',
    position: 'top'
  }
];

const STORAGE_KEY = 'pdf-redactor-tutorial-dismissed';

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    // Check if user has dismissed tutorial
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Start tutorial on first visit
      setTimeout(() => setIsActive(true), 1000);
    }
  }, []);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
  };

  const closeTutorial = () => {
    setIsActive(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsActive(false);
    setShowFloatingButton(false);
  };

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TUTORIAL_STEPS,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        closeTutorial,
        dontShowAgain,
        showFloatingButton
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