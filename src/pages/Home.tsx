import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Quote, FileText, ExternalLink, Zap, Shield, Clock, Sparkles, MapPin } from "lucide-react";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";
import SplashScreen from "@/components/SplashScreen";
import LandingNavbar from "@/components/LandingNavbar";

const SPLASH_SEEN_KEY = "implantx_splash_seen";

const Home = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem(SPLASH_SEEN_KEY);
  });
  const [showRemoteOverlay, setShowRemoteOverlay] = useState(false);

  const handleSplashComplete = () => {
    localStorage.setItem(SPLASH_SEEN_KEY, "true");
    setShowSplash(false);
  };
  
  const heroReveal = useRevealAnimation();
  const featuresReveal = useRevealAnimation();
  const testimonialsReveal = useRevealAnimation();
  const legalReveal = useRevealAnimation();

  const features = [
    { icon: Clock, title: "5 minutos", description: "Evaluación rápida desde casa" },
    { icon: Shield, title: "100% Privado", description: "Tus datos protegidos" },
    { icon: Sparkles, title: "IA Avanzada", description: "Tecnología de última generación" },
    { icon: Zap, title: "Gratis", description: "Sin registro ni pagos" },
  ];

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} minDuration={4000} />
      )}
      <div className="min-h-screen overflow-hidden relative bg-background">
        {/* Premium Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] opacity-30"
            style={{ background: 'radial-gradient(circle, hsl(47 100% 50% / 0.12) 0%, transparent 60%)' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] opacity-20"
            style={{ background: 'radial-gradient(circle, hsl(47 100% 50% / 0.08) 0%, transparent 60%)' }}
          />
          <div 
            className="absolute top-[20%] -left-1/2 w-[200%] h-px -rotate-[8deg]"
            style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(47 100% 50% / 0.1) 50%, transparent 100%)' }}
          />
        </div>

        {/* Navbar */}
        <LandingNavbar />
        
        {/* Hero Section */}
        <main className="relative z-10 pt-16">
          <div className="container mx-auto px-4 sm:px-6">
            
            {/* Hero Content */}
            <div 
              ref={heroReveal.ref}
              className={`max-w-2xl mx-auto text-center pt-12 sm:pt-20 lg:pt-28 pb-8 sm:pb-12 reveal ${heroReveal.isVisible ? 'reveal-active' : ''}`}
            >
              {/* Hero Title - Más impactante */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-4 sm:mb-6 relative">
                <span className="bg-gradient-to-b from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent drop-shadow-sm">
                  Implant
                </span>
                <span className="bg-gradient-to-b from-primary via-primary to-primary/70 bg-clip-text text-transparent">X</span>
                <span className="text-foreground/30 font-light">™</span>
                {/* Glow effect behind */}
                <span className="absolute inset-0 blur-3xl bg-primary/10 -z-10 scale-150" />
              </h1>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[0.65rem] sm:text-[0.7rem] text-primary uppercase tracking-widest font-medium">IA Activa</span>
                </div>
                <span className="text-foreground/20">·</span>
                <span className="text-[0.65rem] sm:text-[0.7rem] text-foreground/60 uppercase tracking-widest">Validado Clínicamente</span>
              </div>

              {/* Main Question - Más legible */}
              <h2 className="text-xl sm:text-2xl lg:text-4xl text-foreground font-semibold leading-tight mb-3 sm:mb-4">
                ¿Te faltan dientes?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-foreground/70 font-light mb-6 sm:mb-8">
                Descubre si los implantes son para ti
              </p>

              {/* Description - Más visible */}
              <p className="text-sm sm:text-base text-foreground/50 font-normal max-w-md mx-auto leading-relaxed px-4">
                Te guiará y enseñará todo lo que debes saber antes de sentarte en el sillón dental.
              </p>
            </div>

            {/* Features Grid - Mobile Optimized */}
            <div 
              ref={featuresReveal.ref}
              className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8 sm:mb-12 reveal reveal-delay-100 ${featuresReveal.isVisible ? 'reveal-active' : ''}`}
            >
              {features.map((feature, index) => (
                <div 
                  key={feature.title}
                  className="flex flex-col items-center p-4 sm:p-5 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3" />
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground text-center">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Remote Areas Callout - Destacado */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <button 
                onClick={() => setShowRemoteOverlay(true)}
                className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 hover:border-primary/60 hover:from-primary/20 transition-all duration-500 cursor-pointer"
              >
                {/* Animated pulse dot */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                
                <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  ¿Vives en una zona alejada?
                </span>
                
                <ArrowRight className="w-4 h-4 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
              
              {showRemoteOverlay && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in p-4"
                  onClick={() => setShowRemoteOverlay(false)}
                >
                  <div className="max-w-md mx-4 p-6 sm:p-8 rounded-2xl bg-card border border-primary/30 text-center animate-fade-in shadow-xl shadow-primary/10">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Diseñada para ti</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Esta app fue creada especialmente para quienes <strong className="text-foreground">no tienen acceso a orientación dental especializada</strong> y deben gastar dinero en viajes, estadía, consultas, permisos y horas perdidas en el trabajo, solo para saber si son o no candidatos a implantes.
                    </p>
                    <p className="text-primary text-sm mt-4 font-medium">
                      Ahora puedes saberlo gratis, desde cualquier lugar.
                    </p>
                    <button 
                      onClick={() => setShowRemoteOverlay(false)}
                      className="mt-6 px-6 py-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Main CTA Button */}
            <div className="max-w-xs sm:max-w-sm mx-auto mb-16 sm:mb-24 lg:mb-32 px-4">
              <button 
                onClick={() => navigate('/evaluacion')}
                className="w-full h-12 sm:h-14 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-medium hover:brightness-110 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                <span>Empezar Evaluación</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <p className="text-center text-muted-foreground/40 text-[0.65rem] sm:text-xs mt-3 sm:mt-4 tracking-wide">
                Sin registro · Privado · Resultados inmediatos
              </p>
            </div>
          </div>
        </main>
        
        {/* Testimonials Section */}
        <section id="testimonios" className="relative py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">

            <div 
              ref={testimonialsReveal.ref}
              className={`max-w-3xl mx-auto mb-12 sm:mb-16 reveal reveal-delay-400 ${testimonialsReveal.isVisible ? 'reveal-active' : ''}`}
            >
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-display text-foreground mb-2 font-light">
                  Historias Reales
                </h2>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Pacientes que hubieran ahorrado con ImplantX
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Testimonial 1 */}
                <div className="card-premium rounded-xl p-4 sm:p-5">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary/30 mb-3" />
                  
                  <blockquote className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                    "Viajé <strong className="text-foreground">6 horas, más de 600 km</strong>. Gasté{" "}
                    <strong className="text-primary">$250.000</strong>... 
                    solo para que me dijera que no podía hacerme el implante mientras 
                    no controle mi diabetes."
                  </blockquote>
                  
                  <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                      AM
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-xs sm:text-sm">Ana María, 54</p>
                      <p className="text-[0.65rem] sm:text-xs text-muted-foreground">Temuco → Santiago</p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-[0.65rem] sm:text-xs text-success font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      Con ImplantX, lo hubiera sabido en 5 minutos.
                    </p>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="card-premium rounded-xl p-4 sm:p-5">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary/30 mb-3" />
                  
                  <blockquote className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                    "Tomé un vuelo de <strong className="text-foreground">3 horas</strong>, pedí{" "}
                    <strong className="text-foreground">2 días de permiso</strong> y gasté casi{" "}
                    <strong className="text-primary">$400.000</strong>. Me dijeron 
                    que primero debía tratar mi enfermedad periodontal."
                  </blockquote>
                  
                  <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                      RG
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-xs sm:text-sm">Roberto, 62</p>
                      <p className="text-[0.65rem] sm:text-xs text-muted-foreground">Punta Arenas → Concepción</p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-[0.65rem] sm:text-xs text-success font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      ImplantX me habría orientado antes de gastar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Section */}
        <section 
          ref={legalReveal.ref}
          className={`border-t border-border py-8 sm:py-10 reveal reveal-delay-500 ${legalReveal.isVisible ? 'reveal-active' : ''}`}
        >
          <div className="container mx-auto px-4 sm:px-6">
            <h3 className="text-[0.65rem] sm:text-xs font-medium text-primary/60 mb-4 sm:mb-5 text-center uppercase tracking-[0.2em] sm:tracking-[0.3em]">Aviso Legal</h3>
            <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3 text-[10px] sm:text-[11px] text-muted-foreground/70 leading-relaxed">
              <p>
                <strong className="text-muted-foreground">Disclaimer Médico:</strong> Esta herramienta proporciona una evaluación orientativa y NO constituye un diagnóstico médico.
              </p>
              <p>
                <strong className="text-muted-foreground">Privacidad:</strong> Sus datos personales son tratados conforme a la Ley 19.628 de Chile.
              </p>
              <p>
                <strong className="text-muted-foreground">Limitación:</strong> ImplantX no se hace responsable por decisiones médicas basadas exclusivamente en esta evaluación.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 sm:py-8 bg-card/50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center gap-4 sm:gap-5">
              {/* White Paper Badge */}
              <a 
                href="/docs/ImplantX_Clinical_Validation_White_Paper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 w-full sm:w-auto"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">White Paper · Validación Clínica 2025</p>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground truncate">Documentación científica ImplantX</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </a>

              <p className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary/50">
                Powered by <a href="https://humanaia.cl" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">humana.ia</a>
              </p>
              <a 
                href="https://www.safecreative.org/work/2510073245348" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-40 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="https://resources.safecreative.org/work/2510073245348/label/standard-300" 
                  alt="Safe Creative" 
                  className="h-6 sm:h-7"
                />
              </a>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 text-center px-4">
                Propiedad Intelectual y Patent Pending registrada a nombre de Dr. Carlos Montoya
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
