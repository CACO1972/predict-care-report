import { RefObject, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Volume2, VolumeX } from "lucide-react";
import rioThumbnail from "@/assets/rio-video-thumbnail.png";
import logoImplantX from "@/assets/logo-implantx-full.png";

interface WelcomeStepProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  welcomeVideoRef: RefObject<HTMLVideoElement>;
  onContinue: () => void;
}

const WelcomeStep = ({ isMuted, setIsMuted, welcomeVideoRef, onContinue }: WelcomeStepProps) => {
  const [needsTapForSound, setNeedsTapForSound] = useState(false);

  useEffect(() => {
    const v = welcomeVideoRef.current;
    if (!v) return;

    // Intentar reproducir con sonido (puede fallar por políticas del navegador)
    const tryPlay = async () => {
      try {
        v.muted = isMuted;
        await v.play();
        setNeedsTapForSound(false);
      } catch {
        // Si el navegador bloquea autoplay con audio, forzamos mute y pedimos un toque
        setIsMuted(true);
        setNeedsTapForSound(true);
      }
    };

    tryPlay();
  }, [welcomeVideoRef, isMuted, setIsMuted]);

  return (
    <div className="space-y-8 animate-fade-in text-center">
      <div className="relative bg-gradient-to-b from-card to-card/80 border border-primary/20 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative w-full max-w-sm mx-auto mb-6">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl shadow-primary/10 bg-background aspect-[9/16]">
            <video
              ref={welcomeVideoRef}
              src="/rio-welcome-speaking.mp4"
              poster={rioThumbnail}
              autoPlay
              playsInline
              preload="metadata"
              muted={isMuted}
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Logo ImplantX en el bolsillo del delantal - lado izquierdo (vista del espectador) */}
            <div className="absolute top-[42%] left-[18%] w-8 h-8 sm:w-10 sm:h-10 opacity-85">
              <img 
                src={logoImplantX} 
                alt="ImplantX" 
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            
            {/* Logo ImplantX en el bolsillo del delantal - lado derecho (vista del espectador) */}
            <div className="absolute top-[42%] right-[18%] w-8 h-8 sm:w-10 sm:h-10 opacity-85">
              <img 
                src={logoImplantX} 
                alt="ImplantX" 
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            
            {needsTapForSound && (
              <div className="absolute top-3 left-3 right-14 px-3 py-2 rounded-xl bg-background/85 backdrop-blur-sm border border-border/50 text-xs text-foreground/80">
                Toca el ícono de sonido para activarlo.
              </div>
            )}

            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (welcomeVideoRef.current) {
                  welcomeVideoRef.current.muted = nextMuted;
                  welcomeVideoRef.current.play().catch(() => {
                    setNeedsTapForSound(true);
                  });
                }
                if (!nextMuted) setNeedsTapForSound(false);
              }}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-foreground/70" />
              ) : (
                <Volume2 className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-background/50 border border-border/50 rounded-2xl">
          <p className="text-sm text-muted-foreground mb-4">
            Al continuar, acepto que mis datos se usan solo para crear mi guía. Nadie más los ve.
          </p>
          <Button
            onClick={onContinue}
            className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Shield className="w-5 h-5 mr-2" />
            Acepto y empiezo
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">Solo tú lo ves</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">5 minutos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
