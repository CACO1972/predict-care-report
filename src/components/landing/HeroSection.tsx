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
    <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-10 lg:pt-14 pb-6 sm:pb-10">
      {/* Trust Badges - Centered */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[0.6rem] sm:text-[0.7rem] text-primary uppercase tracking-widest font-medium">
            IA Activa
          </span>
        </div>
        <span className="text-foreground/20">·</span>
        <span className="text-[0.6rem] sm:text-[0.7rem] text-foreground/60 uppercase tracking-widest">
          Validado Clínicamente
        </span>
      </div>

      {/* Mobile: Stacked layout / Desktop: Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        
        {/* Left Side - CTA Section */}
        <div className="flex flex-col justify-center order-1 lg:order-1">
          <div className="bg-card rounded-2xl p-5 sm:p-6 lg:p-8 border border-primary/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Headline - Smaller on mobile */}
              <h1 className="font-display text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight mb-3 leading-tight text-center lg:text-left">
                <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
                  ¿NECESITAS
                </span>
                {" "}
                <span className="bg-gradient-to-b from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  IMPLANTES?
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-sm sm:text-base lg:text-lg text-foreground/80 font-medium mb-1 sm:mb-2 text-center lg:text-left">
                Descubre en 5 minutos si eres candidato
              </p>

              <p className="text-xs sm:text-sm text-foreground/50 font-normal leading-relaxed mb-4 sm:mb-5 text-center lg:text-left">
                Evita viajes costosos y consultas innecesarias. Nuestra IA analiza tu caso.
              </p>

              {/* Video Preview - Larger size */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="relative w-40 sm:w-48 lg:w-56">
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
                          ? 'bottom-1.5 right-1.5 opacity-70 hover:opacity-100' 
                          : 'inset-0 flex items-center justify-center'
                      }`}
                    >
                      <div className={`rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-110 ${
                        isPlaying ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-10 sm:h-10'
                      }`}>
                        {isPlaying ? (
                          <Pause className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                        ) : (
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground ml-0.5" />
                        )}
                      </div>
                    </button>
                    
                    {/* Video label */}
                    {!isPlaying && (
                      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-[0.5rem] sm:text-[0.55rem] font-medium text-foreground/80">
                          🎬 Conoce a Río
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main CTA Button */}
              <button
                onClick={() => navigate("/evaluacion")}
                className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:brightness-110 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <span>Obtén Informe Gratuito</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <p className="text-center text-muted-foreground/50 text-[0.6rem] sm:text-xs mt-2 sm:mt-3 tracking-wide">
                Sin registro · 100% privado · Resultados inmediatos
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Report Preview */}
        <div className="relative flex justify-center order-2 lg:order-2">
          {/* Floating Badge */}
          <div className="absolute -top-2 sm:-top-3 right-2 sm:right-4 lg:right-0 z-20">
            <div className="bg-primary text-primary-foreground px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold shadow-lg shadow-primary/30 flex items-center gap-1.5 text-[0.65rem] sm:text-xs">
              📊 Vista previa
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/15 via-accent/10 to-primary/15 blur-2xl scale-105 opacity-50" />
          
          {/* Report container - smaller size */}
          <div className="relative w-full max-w-[200px] sm:max-w-[220px] lg:max-w-[260px] rounded-2xl overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10 bg-card">
            <div className="h-[280px] sm:h-[320px] lg:h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <ReportDemoPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;