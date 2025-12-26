import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Quote, FileText, ExternalLink } from "lucide-react";
import logoImplantX from "@/assets/logo-implantx-full.png";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";
import SplashScreen from "@/components/SplashScreen";

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
  const ctaReveal = useRevealAnimation();
  const testimonialsReveal = useRevealAnimation();
  const legalReveal = useRevealAnimation();

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} minDuration={4000} />
      )}
    <div className="min-h-screen overflow-hidden relative bg-background">
      {/* Premium Background Effects - Medical Blue Theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary blue glow */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-30"
          style={{ background: 'radial-gradient(circle, hsl(217 91% 60% / 0.15) 0%, transparent 60%)' }}
        />
        {/* Secondary cyan glow */}
        <div 
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(189 94% 43% / 0.1) 0%, transparent 60%)' }}
        />
        {/* Decorative lines */}
        <div 
          className="absolute top-[20%] -left-1/2 w-[200%] h-px -rotate-[8deg]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(217 91% 60% / 0.15) 50%, transparent 100%)' }}
        />
        <div 
          className="absolute bottom-[25%] -left-1/2 w-[200%] h-px rotate-[5deg]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, hsl(189 94% 43% / 0.1) 50%, transparent 100%)' }}
        />
      </div>

      {/* Header - Premium Dark with Medical Blue accent */}
      <header className="relative z-20 border-b border-primary/20 bg-card/40 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Clínica Miró Logo */}
          <a 
            href="https://clinicamiro.cl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoClinicaMiro} 
              alt="Clínica Miró" 
              className="h-10 w-auto"
            />
          </a>
          
          {/* humana.ia Badge */}
          <a 
            href="https://humanaia.cl" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs font-medium text-primary tracking-wider">humana.ia</span>
          </a>
        </div>
      </header>
      
      {/* Hero Section - Apple-style Clean Design */}
      <main className="relative z-10">
        <div className="container mx-auto px-6">
          
          {/* Hero Content - Generous Spacing */}
          <div 
            ref={heroReveal.ref}
            className={`max-w-2xl mx-auto text-center pt-16 sm:pt-24 pb-12 reveal ${heroReveal.isVisible ? 'reveal-active' : ''}`}
          >
            {/* Subtle Overline */}
            <p className="text-[0.65rem] tracking-[0.5em] uppercase text-muted-foreground/60 mb-8">
              Clínica Miró presenta
            </p>
            
            {/* Hero Title - Large & Bold */}
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tight mb-6">
              <span className="text-shimmer">Implant</span><span className="text-shimmer-gold">X</span><span className="text-muted-foreground/40">™</span>
            </h1>

            {/* Minimal Status Indicator */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[0.7rem] text-primary/80 uppercase tracking-widest">IA Activa</span>
              </div>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[0.7rem] text-muted-foreground/50 uppercase tracking-widest">Validado Clínicamente</span>
            </div>

            {/* Main Question - Clean Typography */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-foreground font-light leading-tight mb-4">
              ¿Te faltan dientes?
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground/70 font-extralight mb-8">
              Descubre si los implantes son para ti
            </p>

            {/* Description - Subtle */}
            <p className="text-base text-muted-foreground/50 font-light max-w-md mx-auto leading-relaxed">
              Te guiará y enseñará todo lo que debes saber antes de sentarte en el sillón dental.
            </p>
          </div>

          {/* Benefits - Minimal Inline Style */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 max-w-xl mx-auto mb-8">
            <span className="text-xs text-muted-foreground/60">
              <span className="text-foreground/80">5 min</span> · Desde casa
            </span>
            <span className="text-xs text-muted-foreground/60">
              <span className="text-foreground/80">Sin viajes</span> · Ahorra dinero
            </span>
            <span className="text-xs text-muted-foreground/60">
              <span className="text-foreground/80">Gratis</span> · Sin registro
            </span>
          </div>

          {/* Remote Areas Callout - Subtle & Elegant */}
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => setShowRemoteOverlay(true)}
              className="group relative text-sm text-muted-foreground/60 hover:text-primary transition-colors duration-500 cursor-pointer"
            >
              <span className="border-b border-dashed border-muted-foreground/20 group-hover:border-primary/50 pb-0.5 transition-colors duration-500">
                ¿Vives en una zona alejada?
              </span>
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/50 animate-pulse" />
            </button>
            
            {/* Overlay */}
            {showRemoteOverlay && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
                onClick={() => setShowRemoteOverlay(false)}
              >
                <div className="max-w-md mx-4 p-8 rounded-xl bg-card/80 border border-primary/20 text-center animate-fade-in">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    Esta app fue diseñada especialmente para quienes no tienen acceso a orientación dental especializada y deben gastar miles de pesos solo para saber si son o no candidatos a implantes.
                  </p>
                  <button 
                    onClick={() => setShowRemoteOverlay(false)}
                    className="mt-6 text-xs text-primary/80 hover:text-primary transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main CTA Button - Apple Style */}
          <div 
            ref={ctaReveal.ref}
            className={`max-w-sm mx-auto mb-32 reveal reveal-delay-200 ${ctaReveal.isVisible ? 'reveal-active' : ''}`}
          >
            <button 
              onClick={() => navigate('/evaluacion')}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition-all duration-300"
            >
              <span>Empezar Evaluación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <p className="text-center text-muted-foreground/40 text-[0.7rem] mt-4 tracking-wide">
              Sin registro · Privado · Resultados inmediatos
            </p>
          </div>
        </div>
      </main>
      
      {/* Testimonials Section */}
      <section className="relative pb-20">
        <div className="container mx-auto px-6">

          {/* Testimonials - Premium Dark Cards */}
          <div 
            ref={testimonialsReveal.ref}
            className={`max-w-3xl mx-auto mb-16 reveal reveal-delay-400 ${testimonialsReveal.isVisible ? 'reveal-active' : ''}`}
          >
            <div className="text-center mb-10">
              <h2 className="text-2xl font-display text-foreground mb-2 font-light">
                Historias Reales
              </h2>
              <p className="text-muted-foreground text-sm">
                Pacientes que hubieran ahorrado con ImplantX
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              {/* Testimonial 1 */}
              <div className="card-premium rounded-xl p-5">
                <Quote className="w-6 h-6 text-primary/30 mb-3" />
                
                <blockquote className="text-muted-foreground text-sm leading-relaxed mb-5">
                  "Viajé <strong className="text-foreground">6 horas, más de 600 km</strong>. Gasté{" "}
                  <strong className="text-primary">$250.000</strong>... 
                  solo para que me dijera que no podía hacerme el implante mientras 
                  no controle mi diabetes."
                </blockquote>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                    AM
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Ana María, 54</p>
                    <p className="text-xs text-muted-foreground">Temuco → Santiago</p>
                  </div>
                </div>

                <div className="mt-4 p-2.5 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-success font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Con ImplantX, lo hubiera sabido en 5 minutos.
                  </p>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="card-premium rounded-xl p-5">
                <Quote className="w-6 h-6 text-primary/30 mb-3" />
                
                <blockquote className="text-muted-foreground text-sm leading-relaxed mb-5">
                  "Tomé un vuelo de <strong className="text-foreground">3 horas</strong>, pedí{" "}
                  <strong className="text-foreground">2 días de permiso</strong> y gasté casi{" "}
                  <strong className="text-primary">$400.000</strong>. Me dijeron 
                  que primero debía tratar mi enfermedad periodontal."
                </blockquote>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                    RG
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Roberto, 62</p>
                    <p className="text-xs text-muted-foreground">Punta Arenas → Concepción</p>
                  </div>
                </div>

                <div className="mt-4 p-2.5 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-success font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ImplantX me habría orientado antes de gastar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Section - Premium Dark */}
      <section 
        ref={legalReveal.ref}
        className={`border-t border-border py-10 reveal reveal-delay-500 ${legalReveal.isVisible ? 'reveal-active' : ''}`}
      >
        <div className="container mx-auto px-6">
          <h3 className="text-xs font-medium text-primary/60 mb-5 text-center uppercase tracking-[0.3em]">Aviso Legal</h3>
          <div className="max-w-2xl mx-auto space-y-3 text-[11px] text-muted-foreground/70 leading-relaxed">
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

      {/* Footer - Premium Dark */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-5">
            {/* White Paper Badge */}
            <a 
              href="/docs/ImplantX_Clinical_Validation_White_Paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 px-5 py-3 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">White Paper · Validación Clínica 2025</p>
                <p className="text-xs text-muted-foreground">Documentación científica ImplantX</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </a>

            <p className="text-[0.65rem] tracking-[0.3em] uppercase text-primary/50">
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
                className="h-7"
              />
            </a>
            <p className="text-[10px] text-muted-foreground/50 text-center">
              Propiedad Intelectual y Patent Pending registrada a nombre de Dr. Carlos Montoya y Clínica Miró
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Home;
