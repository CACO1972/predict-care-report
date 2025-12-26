import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import RioAvatarExpressive from "./RioAvatarExpressive";
import { RioExpression } from "@/hooks/useRioExpression";
import { useRioTTS } from "@/hooks/useRioTTS";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface RioAvatarProps {
  message: string;
  userName?: string;
  expression?: RioExpression;
  className?: string;
  autoSpeak?: boolean;
}

const RioAvatar = ({ 
  message, 
  userName, 
  expression = 'encouraging', 
  className,
  autoSpeak = true 
}: RioAvatarProps) => {
  const { isPlaying, isLoading, speak, stop } = useRioTTS();
  const lastSpokenRef = useRef<string>("");
  
  // Replace {name} placeholder with actual user name
  const processedMessage = userName ? message.replace(/{name}/g, userName) : message;

  // Auto-speak when message changes
  useEffect(() => {
    if (autoSpeak && processedMessage && processedMessage !== lastSpokenRef.current) {
      lastSpokenRef.current = processedMessage;
      speak(processedMessage);
    }
  }, [processedMessage, autoSpeak, speak]);

  const handleAudioToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(processedMessage);
    }
  };

  return (
    <div className={cn("flex gap-4 sm:gap-5 items-start animate-fade-in", className)}>
      {/* Avatar with 3D dentist */}
      <RioAvatarExpressive 
        expression={expression}
        isSpeaking={isPlaying}
        size="lg"
      />
      
      {/* Message bubble */}
      <div className="flex-1 relative bg-card/90 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm p-5 sm:p-6 shadow-sm">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-primary flex items-center gap-2 font-display">
              Río
              <span className={cn(
                "inline-block w-2 h-2 rounded-full",
                isPlaying ? "bg-emerald-400 animate-pulse" : "bg-primary"
              )} />
            </p>
            
            {/* Audio control button */}
            <button
              onClick={handleAudioToggle}
              disabled={isLoading}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                "hover:bg-primary/10 text-muted-foreground hover:text-primary",
                isPlaying && "text-primary bg-primary/10"
              )}
              aria-label={isPlaying ? "Detener audio" : "Reproducir audio"}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-foreground leading-relaxed text-base">{processedMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default RioAvatar;
