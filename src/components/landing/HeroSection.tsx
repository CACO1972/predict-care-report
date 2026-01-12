import { ArrowRight, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import rioThumbnail from "@/assets/rio-video-thumbnail.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="max-w-5xl mx-auto text-center pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
      {/* Microcopy simple */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <span className="text-[0.65rem] sm:text-[0.7rem] text-foreground/60 tracking-wide">
          Basado en ciencia · No reemplaza la revisión del dentista
        </span>
      </div>

      {/* Título simple y directo */}
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
        <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
          ¿Puedo ponerme implantes?
        </span>
      </h1>

      {/* Subtítulo claro */}
      <p className="text-base sm:text-lg lg:text-xl text-foreground/80 font-medium mb-2 sm:mb-3 max-w-lg mx-auto px-4">
        Responde preguntas simples y recibe una guía antes de viajar o gastar plata.
      </p>

      <p className="text-sm text-foreground/50 font-normal max-w-lg mx-auto leading-relaxed px-4 mb-6 sm:mb-8">
        5 minutos · Gratis · Desde tu casa
      </p>

      {/* Video Avatar Section - Vertical 9:16 */}
      <div className="relative w-48 sm:w-56 md:w-64 lg:w-72 mx-auto mb-8 sm:mb-10">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 blur-2xl scale-105 opacity-60" />
        
        {/* Video container with 9:16 aspect ratio */}
        <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 bg-background aspect-[9/16]">
          <video
            key="rio-hero-speaking"
            ref={videoRef}
            src="/rio-hero-speaking.mp4"
            poster={rioThumbnail}
            playsInline
            preload="metadata"
            onEnded={handleVideoEnded}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Play/Pause button - moves to corner when playing */}
          <button
            onClick={togglePlay}
            className={`absolute transition-all duration-500 ease-out ${
              isPlaying 
                ? 'bottom-2 right-2 sm:bottom-3 sm:right-3 opacity-70 hover:opacity-100' 
                : 'inset-0 flex items-center justify-center'
            }`}
          >
            <div className={`rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 ${
              isPlaying ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-14 h-14 sm:w-16 sm:h-16'
            }`}>
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground ml-1" />
              )}
            </div>
          </button>
          
          {/* Video label */}
          {!isPlaying && (
            <div className="absolute bottom-2 sm:bottom-3 left-2 right-2 sm:left-3 sm:right-3 flex items-center justify-center">
              <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[0.65rem] sm:text-xs font-medium text-foreground/80">
                🎬 Conoce a Río, tu asistente de IA
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main CTA */}
      <div className="max-w-xs sm:max-w-sm mx-auto mb-6">
        <button
          onClick={() => navigate("/evaluacion")}
          className="w-full h-14 sm:h-16 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-base sm:text-lg font-semibold hover:brightness-110 transition-all duration-300 shadow-lg shadow-primary/25"
        >
          <span>Empezar ahora</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-muted-foreground/50 text-[0.65rem] sm:text-xs mt-3 tracking-wide">
          Sin registro · 100% privado
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
