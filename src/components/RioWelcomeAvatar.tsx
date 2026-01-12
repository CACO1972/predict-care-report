import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import rioAvatarStatic from "@/assets/rio-avatar-static.png";

interface RioWelcomeAvatarProps {
  audioUrl?: string;
  autoPlayAudio?: boolean;
  className?: string;
}

const RioWelcomeAvatar = ({
  audioUrl,
  autoPlayAudio = true,
  className,
}: RioWelcomeAvatarProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl || !autoPlayAudio) return;

    audioRef.current?.pause();
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play().catch(() => {
      // Autoplay puede bloquearse hasta interacción del usuario
    });

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [audioUrl, autoPlayAudio]);

  return (
    <div className={cn("relative mx-auto", className)}>
      {/* Glow behind avatar */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-blue/30 via-cyan/20 to-medical-blue/30 blur-2xl scale-110 motion-safe:animate-[pulse_7s_ease-in-out_infinite]" />

      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
        <img
          src={rioAvatarStatic}
          alt="Río - Asistente ImplantX"
          loading="eager"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Online indicator */}
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-accent-blue/30">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-foreground/80">En línea</span>
      </div>
    </div>
  );
};

export default RioWelcomeAvatar;
