import { ArrowRight, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import rioThumbnail from "@/assets/rio-video-thumbnail.png";
import ReportDemoPreview from "@/components/landing/ReportDemoPreview";

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
    <div className="max-w-7xl mx-auto px-4 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
      {/* Trust Badges - Centered */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[0.65rem] sm:text-[0.7rem] text-primary uppercase tracking-widest font-medium">
            IA Activa
          </span>
        </div>
        <span className="text-foreground/20">·</span>
        <span className="text-[0.65rem] sm:text-[0.7rem] text-foreground/60 uppercase tracking-widest">
          Validado Clínicamente
        </span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Side - CTA Section */}
        <div className="flex flex-col justify-center">
          <div className="bg-card rounded-2xl p-6 sm:p-8 border border-primary/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Headline */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight">
                <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                  ¿NECESITAS
                </span>
                <br />
                <span className="bg-gradient-to-b from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  IMPLANTES?
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-base sm:text-lg text-foreground/80 font-medium mb-2">
                Descubre en 5 minutos si eres candidato
              </p>

              <p className="text-sm text-foreground/50 font-normal leading-relaxed mb-6">
                Evita viajes costosos y consultas innecesarias. Nuestra IA analiza tu caso y te da una orientación personalizada.
              </p>

              {/* Video Preview (smaller) */}
              <div className="relative w-32 sm:w-40 mx-auto mb-6">
                <div className="relative rounded-xl overflow-hidden border border-primary/20 shadow-lg shadow-primary/10 bg-background aspect-[9/16]">
                  <video
                    key="hero-intro-v5"
                    ref={videoRef}
                    src="/hero-intro-v5.mp4"
                    poster={rioThumbnail}
                    playsInline
                    preload="metadata"
                    onEnded={handleVideoEnded}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Play/Pause button */}
                  <button
                    onClick={togglePlay}
                    className={`absolute transition-all duration-500 ease-out ${
                      isPlaying 
                        ? 'bottom-2 right-2 opacity-70 hover:opacity-100' 
                        : 'inset-0 flex items-center justify-center'
                    }`}
                  >
                    <div className={`rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 ${
                      isPlaying ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'
                    }`}>
                      {isPlaying ? (
                        <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
                      ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground ml-0.5" />
                      )}
                    </div>
                  </button>
                  
                  {/* Video label */}
                  {!isPlaying && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center">
                      <span className="px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[0.6rem] font-medium text-foreground/80">
                        🎬 Conoce a Río
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main CTA Button */}
              <button
                onClick={() => navigate("/evaluacion")}
                className="w-full h-14 sm:h-16 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-base sm:text-lg font-bold hover:brightness-110 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <span>Obtén Informe Gratuito</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-center text-muted-foreground/50 text-[0.65rem] sm:text-xs mt-3 tracking-wide">
                Sin registro · 100% privado · Resultados inmediatos
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Report Preview */}
        <div className="relative flex justify-center lg:justify-start">
          {/* Floating Badge */}
          <div className="absolute -top-3 right-4 lg:right-0 z-20">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center gap-2 text-sm">
              📊 Vista previa del informe
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15 blur-2xl scale-105 opacity-50" />
          
          {/* Report container - scrollable */}
          <div className="relative w-full max-w-sm lg:max-w-md rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 bg-card">
            <div className="h-[500px] sm:h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <ReportDemoPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
