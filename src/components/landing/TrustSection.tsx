import { Shield, Award, Users, CheckCircle2 } from "lucide-react";

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

      {/* Safe Creative Certificate */}
      <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-b from-card/60 to-card/30 border border-primary/20">
        <p className="text-xs text-muted-foreground mb-4 text-center">
          Propiedad Intelectual registrada y protegida
        </p>
        <a
          href="https://www.safecreative.org/work/2510073245348"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src="https://resources.safecreative.org/work/2510073245348/label/standard-300"
            alt="Safe Creative - Propiedad Intelectual Registrada"
            className="h-16 sm:h-20"
          />
        </a>
        <p className="text-[0.65rem] sm:text-xs text-muted-foreground/70 mt-3 text-center">
          Patent Pending · Dr. Carlos Montoya
        </p>
      </div>
    </div>
  );
};

export default TrustSection;
