import { Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RioAvatarExpressive from "./RioAvatarExpressive";
import { RioExpression } from "@/hooks/useRioExpression";

interface RioConversationalProps {
  message: string | null;
  isLoading: boolean;
  onContinue: () => void;
  showContinue: boolean;
  expression?: RioExpression;
  className?: string;
}

const RioConversational = ({ 
  message, 
  isLoading, 
  onContinue, 
  showContinue,
  expression = 'encouraging',
  className 
}: RioConversationalProps) => {
  if (!isLoading && !message) return null;

  // Determine expression based on state
  const currentExpression: RioExpression = isLoading ? 'thinking' : expression;

  return (
    <div className={cn(
      "w-full max-w-xl mx-auto animate-fade-in",
      className
    )}>
      <div className="relative bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary rounded-t-2xl" />
        
        {/* Rio Header with 3D Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
          <RioAvatarExpressive 
            expression={currentExpression}
            isSpeaking={isLoading}
            size="lg"
          />
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground font-display">Río</p>
            <p className="text-xs text-muted-foreground">Asistente ImplantX</p>
          </div>
          {/* Online indicator with expression color */}
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-colors duration-300",
            currentExpression === 'smile' && "bg-cyan-400",
            currentExpression === 'empathetic' && "bg-amber-400",
            currentExpression === 'encouraging' && "bg-emerald-400",
            currentExpression === 'thinking' && "bg-blue-400 animate-pulse",
            (currentExpression === 'neutral' || currentExpression === 'listening') && "bg-primary"
          )} />
        </div>

        {/* Message Content */}
        <div className="min-h-[60px]">
          {isLoading ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="space-y-1">
                <span className="text-sm font-medium">Analizando tu respuesta...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap">
              {message}
            </p>
          )}
        </div>

        {/* Continue Button */}
        {showContinue && !isLoading && message && (
          <div className="mt-6 pt-4 border-t border-border">
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 group"
            >
              Continuar
              <ChevronRight className="ml-2 w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RioConversational;
