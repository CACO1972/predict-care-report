import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto text-center pt-12 sm:pt-20 lg:pt-24 pb-8 sm:pb-12">
      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
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

      {/* Emotional Hook */}
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
        <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
          Recupera tu sonrisa
        </span>
        <br />
        <span className="bg-gradient-to-b from-primary via-primary to-primary/70 bg-clip-text text-transparent">
          sin perder tiempo ni dinero
        </span>
      </h1>

      {/* Value Proposition */}
      <p className="text-lg sm:text-xl lg:text-2xl text-foreground/80 font-medium mb-3 sm:mb-4">
        Descubre en 5 minutos si eres candidato a implantes dentales
      </p>

      <p className="text-sm sm:text-base text-foreground/50 font-normal max-w-lg mx-auto leading-relaxed px-4 mb-8 sm:mb-10">
        Evita viajes costosos y consultas innecesarias. Nuestra IA analiza tu caso y te da una orientación personalizada antes de ir al dentista.
      </p>

      {/* Main CTA */}
      <div className="max-w-xs sm:max-w-sm mx-auto mb-6">
        <button
          onClick={() => navigate("/evaluacion")}
          className="w-full h-14 sm:h-16 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-base sm:text-lg font-semibold hover:brightness-110 transition-all duration-300 shadow-lg shadow-primary/25"
        >
          <span>Comenzar Evaluación Gratis</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-center text-muted-foreground/50 text-[0.65rem] sm:text-xs mt-3 tracking-wide">
          Sin registro · 100% privado · Resultados inmediatos
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
