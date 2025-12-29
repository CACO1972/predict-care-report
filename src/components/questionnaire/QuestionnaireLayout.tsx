import { ReactNode, RefObject } from "react";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import { QuestionnaireStep } from "@/types/questionnaire";

interface QuestionnaireLayoutProps {
  children: ReactNode;
  step: QuestionnaireStep;
  showRioResponse: boolean;
  canGoBack: boolean;
  onBack: () => void;
  getStepNumber: () => number;
  getTotalSteps: () => number;
  getCurrentPhase: () => 'base' | 'density' | 'health' | 'irp' | 'oral' | 'mapping' | 'complete';
  showLeadCapture: boolean;
  onLeadSubmit: (data: { email: string; phone: string }) => Promise<void>;
  patientName?: string;
}

export const QuestionnaireHeader = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-black/80 backdrop-blur-xl">
    <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-display text-lg sm:text-xl text-foreground font-bold tracking-tight">
          Implant<span className="text-primary">X</span>
        </span>
        <span className="text-foreground/30 text-xs font-light">™</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <span className="text-[10px] sm:text-xs font-medium text-primary tracking-wide">IA Activa</span>
      </div>
    </div>
  </header>
);

export const QuestionnaireFooter = () => (
  <footer className="border-t border-primary/10 py-6 bg-black/60 backdrop-blur-sm">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-sm text-foreground/60 font-medium">
            Implant<span className="text-primary">X</span>
          </span>
          <span className="text-foreground/20 text-[10px]">™</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <span>Powered by</span>
          <a 
            href="https://humanaia.cl" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            humana.ia
          </a>
        </div>
        
        <p className="text-[10px] text-muted-foreground/40">
          © 2025 ImplantX · Todos los derechos reservados
        </p>
      </div>
    </div>
  </footer>
);

const QuestionnaireLayout = ({
  children,
  step,
  showRioResponse,
  canGoBack,
  onBack,
  getStepNumber,
  getTotalSteps,
  getCurrentPhase,
  showLeadCapture,
  onLeadSubmit,
  patientName,
}: QuestionnaireLayoutProps) => {
  return (
    <>
      <div className="min-h-screen" style={{ background: 'linear-gradient(165deg, #0a0a0a 0%, #0d0d0d 30%, #1a1510 70%, #0d0d0d 100%)' }}>
        {/* Premium Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(201, 168, 124, 0.15) 0%, transparent 60%)' }}
          />
        </div>

        <QuestionnaireHeader />

        {/* Main Content */}
        <main className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            {step !== 'welcome' && step !== 'results' && !showRioResponse && (
              <div className="mb-6 max-w-xl mx-auto">
                {canGoBack && (
                  <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Volver</span>
                  </button>
                )}
                <ProgressBar
                  currentStep={getStepNumber()}
                  totalSteps={getTotalSteps()}
                  currentPhase={getCurrentPhase()}
                />
              </div>
            )}

            <div className="max-w-xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        <QuestionnaireFooter />
      </div>
      
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onSubmit={onLeadSubmit}
        patientName={patientName}
      />
    </>
  );
};

export default QuestionnaireLayout;
