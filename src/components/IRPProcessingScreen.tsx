import { useEffect, useState, useRef } from "react";
import { Loader2, Brain, Activity, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface IRPProcessingScreenProps {
  patientName: string;
  onComplete: () => void;
}

const IRPProcessingScreen = ({ patientName, onComplete }: IRPProcessingScreenProps) => {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const steps = [
    { icon: Brain, text: "Analizando respuestas periodontales..." },
    { icon: Activity, text: "Calculando índice de riesgo..." },
    { icon: CheckCircle2, text: "Generando tu resultado personalizado..." },
  ];

  useEffect(() => {
    // Reproducir audio de feedback
    audioRef.current = new Audio('/audio/rio-feedback-encias.mp3');
    audioRef.current.play().catch(() => {
      // Ignorar errores de autoplay
    });

    // Simular progreso del análisis - más lento
    const timers = [
      setTimeout(() => setStep(1), 2000),
      setTimeout(() => setStep(2), 4000),
      setTimeout(() => setIsComplete(true), 6000),
    ];

    return () => {
      timers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
      {/* Animación de procesamiento */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          {!isComplete && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-75" />
              <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
            </>
          )}
          {isComplete ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          ) : (
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          )}
        </div>
      </div>

      {/* Mensaje principal */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-xl font-bold text-foreground">
          {isComplete ? "¡Análisis completado!" : `Gracias por tus respuestas, ${patientName}`}
        </h2>
        <p className="text-muted-foreground">
          {isComplete 
            ? "Hemos calculado tu Índice de Riesgo Periodontal. Descubre tu resultado personalizado."
            : "Nuestro motor de análisis de IA predictiva está procesando tu información para darte un feedback personalizado."
          }
        </p>
      </div>

      {/* Pasos del proceso */}
      <div className="space-y-3 w-full max-w-sm">
        {steps.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = step === i && !isComplete;
          const stepComplete = step > i || isComplete;

          return (
            <div 
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
                isActive && "bg-primary/10 border border-primary/20",
                stepComplete && "bg-muted/50 border border-transparent",
                !isActive && !stepComplete && "opacity-40"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isActive && "bg-primary text-primary-foreground",
                stepComplete && "bg-emerald-500/20 text-emerald-400",
                !isActive && !stepComplete && "bg-muted text-muted-foreground"
              )}>
                {isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : stepComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className={cn(
                "text-sm transition-all",
                isActive && "text-foreground font-medium",
                stepComplete && "text-muted-foreground",
                !isActive && !stepComplete && "text-muted-foreground"
              )}>
                {s.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Indicador de progreso o botón continuar */}
      {isComplete ? (
        <Button 
          onClick={onComplete}
          size="lg"
          className="gap-2 animate-fade-in"
        >
          Ver mi resultado
          <ArrowRight className="w-4 h-4" />
        </Button>
      ) : (
        <div className="w-full max-w-xs">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IRPProcessingScreen;
