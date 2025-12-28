import { useEffect, useState } from "react";
import { Loader2, Brain, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IRPProcessingScreenProps {
  patientName: string;
  onComplete: () => void;
}

const IRPProcessingScreen = ({ patientName, onComplete }: IRPProcessingScreenProps) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    { icon: Brain, text: "Analizando respuestas periodontales..." },
    { icon: Activity, text: "Calculando índice de riesgo..." },
    { icon: CheckCircle2, text: "Generando tu resultado personalizado..." },
  ];

  useEffect(() => {
    // Simular progreso del análisis
    const timers = [
      setTimeout(() => setStep(1), 1200),
      setTimeout(() => setStep(2), 2400),
      setTimeout(() => onComplete(), 3600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
      {/* Animación de procesamiento */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
          <Brain className="w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>

      {/* Mensaje principal */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-xl font-bold text-foreground">
          Gracias por tus respuestas, {patientName}
        </h2>
        <p className="text-muted-foreground">
          Nuestro motor de análisis de IA predictiva está procesando tu información para darte un feedback personalizado.
        </p>
      </div>

      {/* Pasos del proceso */}
      <div className="space-y-3 w-full max-w-sm">
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = step === i;
          const isComplete = step > i;

          return (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
                isActive && "bg-primary/10 border border-primary/20",
                isComplete && "bg-muted/50 border border-transparent",
                !isActive && !isComplete && "opacity-40"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary text-primary-foreground",
                isComplete && "bg-emerald-500/20 text-emerald-400",
                !isActive && !isComplete && "bg-muted text-muted-foreground"
              )}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className={cn(
                "text-sm transition-all",
                isActive && "text-foreground font-medium",
                isComplete && "text-muted-foreground",
                !isActive && !isComplete && "text-muted-foreground"
              )}>
                {s.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Indicador de progreso */}
      <div className="w-full max-w-xs">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default IRPProcessingScreen;
