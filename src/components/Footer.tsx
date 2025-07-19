import { Shield } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-md">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Powered by Vignesh Solutions
              </p>
              <p className="text-muted-foreground">
                Secure document processing
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Vignesh Solutions. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Enterprise-grade PDF redaction technology
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};