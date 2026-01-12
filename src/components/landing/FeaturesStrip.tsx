import { Clock, Shield, Sparkles, Zap } from "lucide-react";

const features = [
  { icon: Clock, title: "5 minutos", description: "Evaluación rápida" },
  { icon: Shield, title: "100% Privado", description: "Datos protegidos" },
  { icon: Sparkles, title: "IA Avanzada", description: "Tecnología de punta" },
  { icon: Zap, title: "Gratis", description: "Sin pagos" },
];

const FeaturesStrip = () => {
  return (
    <div className="border-y border-border/50 bg-card/30 py-6 sm:py-8 mb-12 sm:mb-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-16">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesStrip;
