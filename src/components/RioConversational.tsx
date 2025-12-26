import { Loader2, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import RioAvatarExpressive from "./RioAvatarExpressive";
import { RioExpression } from "@/hooks/useRioExpression";
import { useRioTTS } from "@/hooks/useRioTTS";

interface RioConversationalProps {
  message: string | null;
  isLoading: boolean;
  onContinue: () => void;
  showContinue: boolean;
  expression?: RioExpression;
  className?: string;
  autoSpeak?: boolean;
}

const RioConversational = ({ 
  message, 
  isLoading: isLoadingMessage, 
  onContinue, 
  showContinue,
  expression = 'encouraging',
  className,
  autoSpeak = true
}: RioConversationalProps) => {
  const { isPlaying, isLoading: isLoadingAudio, speak, stop } = useRioTTS();
  const lastSpokenRef = useRef<string>("");
  
  // Auto-speak when message arrives
  useEffect(() => {
    if (autoSpeak && message && !isLoadingMessage && message !== lastSpokenRef.current) {
      lastSpokenRef.current = message;
      speak(message);
    }
  }, [message, isLoadingMessage, autoSpeak, speak]);

  // Stop audio when component unmounts or message changes
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  if (!isLoadingMessage && !message) return null;

  // Determine expression based on state
  const currentExpression: RioExpression = isLoadingMessage ? 'thinking' : expression;

  const handleAudioToggle = () => {
    if (isPlaying) {
      stop();
    } else if (message) {
      speak(message);
    }
  };

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
            isSpeaking={isLoadingMessage || isPlaying}
            size="lg"
          />
          <div className="flex-1">
            <p className="text-base font-semibold text-foreground font-display">Río</p>
            <p className="text-xs text-muted-foreground">Asistente ImplantX</p>
          </div>
          
          {/* Audio control button */}
          {!isLoadingMessage && message && (
            <button
              onClick={handleAudioToggle}
              disabled={isLoadingAudio}
              className={cn(
                "p-2 rounded-full transition-all duration-200 mr-2",
                "hover:bg-primary/10 text-muted-foreground hover:text-primary",
                isPlaying && "text-primary bg-primary/10"
              )}
              aria-label={isPlaying ? "Detener audio" : "Reproducir audio"}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          )}
          
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
          {isLoadingMessage ? (
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
        {showContinue && !isLoadingMessage && message && (
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
