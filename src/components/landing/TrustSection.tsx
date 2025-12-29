import { Shield, Award, Users, CheckCircle2, FileCheck, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SCLabelLoader: (workId: string, userId: string, options: object) => void;
  }
}

const trustPoints = [
  {
    icon: Award,
    title: "Validación Clínica",
    description: "Algoritmo basado en literatura científica y protocolos internacionales",
  },
  {
    icon: Shield,
    title: "Datos Protegidos",
    description: "Cumplimiento con Ley 19.628 de protección de datos personales",
  },
  {
    icon: Users,
    title: "Desarrollado por Expertos",
    description: "Creado por especialistas en implantología con años de experiencia",
  },
];

const TrustSection = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const script = document.createElement("script");
    script.src = `https://s3.eu-west-1.amazonaws.com/sc-widgets/scLabelLoader.js?${Date.now()}`;
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.async = true;

    script.onload = () => {
      if (window.SCLabelLoader && widgetRef.current) {
        window.SCLabelLoader("2510073245348", "2504145010774", {
          tplName: "license",
          locale: "es",
          logo: "safecreative",
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Respaldado científicamente</span>
        </div>
        <h2 className="text-lg sm:text-xl font-display text-foreground mb-2">
          Tecnología en la que puedes confiar
        </h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {trustPoints.map((point) => (
          <div
            key={point.title}
            className="flex flex-col items-center text-center p-5 rounded-xl bg-gradient-to-b from-card/80 to-card/40 border border-border/30"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <point.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{point.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{point.description}</p>
          </div>
        ))}
      </div>

      {/* Safe Creative Certificate - Enhanced */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-card/80 to-card/40 border border-primary/20">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Safe Creative Widget */}
          <div ref={widgetRef} className="shrink-0">
            <div id="scwdt2510073245348" className="scWidget scWidget-license"></div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              Propiedad Intelectual Registrada
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
              Algoritmo de predicción sinérgica para implantes dentales inscrito y protegido 
              mediante registro de propiedad intelectual con sello de tiempo certificado.
            </p>
            
            {/* Document Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <a
                href="/docs/SafeCreative_Certificate.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-xs font-medium text-primary transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Ver Certificado
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href="/docs/SafeCreative_Inscription.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                Inscripción de Derechos
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-6 pt-4 border-t border-border/30 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.65rem] sm:text-xs text-muted-foreground/70">
          <span>Patent Pending</span>
          <span className="hidden sm:inline">·</span>
          <span>Dr. Carlos Montoya</span>
          <span className="hidden sm:inline">·</span>
          <span>Registro: 7 Oct 2025</span>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
