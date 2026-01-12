import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quote, FileText, ExternalLink, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { useRevealAnimation } from "@/hooks/useRevealAnimation";
import SplashScreen from "@/components/SplashScreen";
import LandingNavbar from "@/components/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TrustSection from "@/components/landing/TrustSection";
import ReportPreviewSection from "@/components/landing/ReportPreviewSection";
import FeaturesStrip from "@/components/landing/FeaturesStrip";

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
  const howItWorksReveal = useRevealAnimation();
  const trustReveal = useRevealAnimation();
  const reportReveal = useRevealAnimation();
  const testimonialsReveal = useRevealAnimation();
  const legalReveal = useRevealAnimation();

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
            style={{
              background:
                "radial-gradient(circle, hsl(47 100% 50% / 0.12) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] opacity-20"
            style={{
              background:
                "radial-gradient(circle, hsl(47 100% 50% / 0.08) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute top-[20%] -left-1/2 w-[200%] h-px -rotate-[8deg]"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, hsl(47 100% 50% / 0.1) 50%, transparent 100%)",
            }}
          />
        </div>

        {/* Navbar */}
        <LandingNavbar />

        {/* Hero Section */}
        <main className="relative z-10 pt-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div
              ref={heroReveal.ref}
              className={`reveal ${heroReveal.isVisible ? "reveal-active" : ""}`}
            >
              <HeroSection />
            </div>

            {/* Remote Areas Callout */}
            <div className="flex justify-center mb-10 sm:mb-14">
              <button
                onClick={() => setShowRemoteOverlay(true)}
                className="group relative flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 hover:border-primary/60 hover:from-primary/20 transition-all duration-500 cursor-pointer"
              >
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
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Diseñada para ti
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Esta app fue creada especialmente para quienes{" "}
                      <strong className="text-foreground">
                        no tienen acceso a orientación dental especializada
                      </strong>{" "}
                      y deben gastar dinero en viajes, estadía, consultas, permisos
                      y horas perdidas en el trabajo, solo para saber si son o no
                      candidatos a implantes.
                    </p>
                    <p className="text-primary text-sm mt-4 font-medium">
                      Ahora puedes saberlo gratis, desde cualquier lugar.
                    </p>
                    <button
                      onClick={() => {
                        setShowRemoteOverlay(false);
                        navigate("/evaluacion");
                      }}
                      className="mt-6 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium flex items-center gap-2 mx-auto"
                    >
                      Comenzar Evaluación
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div
              ref={howItWorksReveal.ref}
              className={`reveal reveal-delay-100 ${howItWorksReveal.isVisible ? "reveal-active" : ""}`}
            >
              <HowItWorksSection />
            </div>

            {/* Trust Section */}
            <div
              ref={trustReveal.ref}
              className={`reveal reveal-delay-200 ${trustReveal.isVisible ? "reveal-active" : ""}`}
            >
              <TrustSection />
            </div>

            {/* Report Preview */}
            <div
              ref={reportReveal.ref}
              className={`reveal reveal-delay-300 ${reportReveal.isVisible ? "reveal-active" : ""}`}
            >
              <ReportPreviewSection />
            </div>
          </div>

          {/* Features Strip (moved near footer) */}
          <FeaturesStrip />

          {/* Testimonials Section */}
          <section id="testimonios" className="relative py-12 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6">
              <div
                ref={testimonialsReveal.ref}
                className={`max-w-3xl mx-auto mb-12 sm:mb-16 reveal reveal-delay-400 ${testimonialsReveal.isVisible ? "reveal-active" : ""}`}
              >
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-xl sm:text-2xl font-display text-foreground mb-2 font-light">
                    Les pasó a otros
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    Gente que gastó plata de más
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Testimonial 1 */}
                  <div className="card-premium rounded-xl p-4 sm:p-5">
                    <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary/30 mb-3" />

                    <blockquote className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                      "Viajé <strong className="text-foreground">6 horas</strong>. 
                      Gasté <strong className="text-primary">$250.000</strong>... 
                      y me dijeron que primero tenía que controlar la diabetes."
                    </blockquote>

                    <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                        AM
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs sm:text-sm">
                          Ana María, 54
                        </p>
                        <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                          Temuco → Santiago
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-success/10 rounded-lg border border-success/20">
                      <p className="text-[0.65rem] sm:text-xs text-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        Con esta guía, lo hubiera sabido en 5 minutos.
                      </p>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="card-premium rounded-xl p-4 sm:p-5">
                    <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary/30 mb-3" />

                    <blockquote className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                      "Tomé un vuelo, pedí <strong className="text-foreground">2 días de permiso</strong>. 
                      Gasté casi <strong className="text-primary">$400.000</strong>. 
                      Me dijeron que primero tenía que tratar las encías."
                    </blockquote>

                    <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary text-xs font-medium border border-primary/20">
                        RG
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-xs sm:text-sm">
                          Roberto, 62
                        </p>
                        <p className="text-[0.65rem] sm:text-xs text-muted-foreground">
                          Punta Arenas → Concepción
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-success/10 rounded-lg border border-success/20">
                      <p className="text-[0.65rem] sm:text-xs text-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        Esta guía se lo hubiera dicho antes de gastar.
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
            className={`border-t border-border py-8 sm:py-10 reveal reveal-delay-500 ${legalReveal.isVisible ? "reveal-active" : ""}`}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mx-auto space-y-2 sm:space-y-3 text-[10px] sm:text-[11px] text-muted-foreground/70 leading-relaxed text-center">
                <p className="text-sm text-foreground/60 font-medium mb-4">
                  Esto es una guía. El dentista confirma en consulta.
                </p>
                <p>
                  Esta guía te orienta, pero no es un diagnóstico médico. 
                  Solo un dentista puede decirte con certeza si puedes ponerte implantes.
                </p>
                <p>
                  Tus datos son privados y nadie más los ve.
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
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      White Paper · Validación Clínica 2025
                    </p>
                    <p className="text-[0.65rem] sm:text-xs text-muted-foreground truncate">
                      Documentación científica ImplantX
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>

                <p className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary/50">
                  Powered by{" "}
                  <a
                    href="https://humanaia.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-medium hover:underline"
                  >
                    humana.ia
                  </a>
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 text-center px-4">
                  Propiedad Intelectual y Patent Pending registrada a nombre de Dr.
                  Carlos Montoya
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
};

export default Home;
