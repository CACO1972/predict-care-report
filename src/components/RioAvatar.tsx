import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import RioAvatarExpressive from "./RioAvatarExpressive";
import { RioExpression } from "@/hooks/useRioExpression";
import { useRioTTS } from "@/hooks/useRioTTS";
import { getCachedAudio } from "@/hooks/useAudioPreload";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface RioAvatarProps {
  message: string;
  userName?: string;
  expression?: RioExpression;
  className?: string;
  autoSpeak?: boolean;
  customAudioUrl?: string;
}

const RioAvatar = ({ 
  message, 
  userName, 
  expression = 'encouraging', 
  className,
  autoSpeak = true,
  customAudioUrl
}: RioAvatarProps) => {
  const { isPlaying: isTTSPlaying, isLoading, speak, stop } = useRioTTS();
  const lastSpokenRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isCustomPlaying, setIsCustomPlaying] = useState(false);
  
  // Replace {name} placeholder with actual user name
  const processedMessage = userName ? message.replace(/{name}/g, userName) : message;

  const isPlaying = customAudioUrl ? isCustomPlaying : isTTSPlaying;

  // Play custom audio - use cached version if available for instant playback
  const playCustomAudio = () => {
    if (!customAudioUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Try to get cached audio first for faster playback
    const cachedAudio = getCachedAudio(customAudioUrl);
    if (cachedAudio) {
      audioRef.current = cachedAudio.cloneNode(true) as HTMLAudioElement;
    } else {
      audioRef.current = new Audio(customAudioUrl);
    }
    
    audioRef.current.onplay = () => setIsCustomPlaying(true);
    audioRef.current.onended = () => setIsCustomPlaying(false);
    audioRef.current.onpause = () => setIsCustomPlaying(false);
    audioRef.current.onerror = () => {
      // If custom audio fails, fall back to TTS
      console.warn(`Audio not found: ${customAudioUrl}, falling back to TTS`);
      speak(processedMessage);
    };
    audioRef.current.play().catch(() => {
      // Fallback to TTS on play error
      speak(processedMessage);
    });
  };

  const stopCustomAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsCustomPlaying(false);
  };

  // Auto-speak when message changes
  useEffect(() => {
    if (autoSpeak && processedMessage && processedMessage !== lastSpokenRef.current) {
      lastSpokenRef.current = processedMessage;
      if (customAudioUrl) {
        playCustomAudio();
      } else {
        speak(processedMessage);
      }
    }
  }, [processedMessage, autoSpeak, speak, customAudioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCustomAudio();
    };
  }, []);

  const handleAudioToggle = () => {
    if (customAudioUrl) {
      if (isCustomPlaying) {
        stopCustomAudio();
      } else {
        playCustomAudio();
      }
    } else {
      if (isTTSPlaying) {
        stop();
      } else {
        speak(processedMessage);
      }
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
