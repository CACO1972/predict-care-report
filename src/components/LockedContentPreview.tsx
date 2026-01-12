import { Lock, TrendingUp, Target, FileText, Lightbulb, CheckCircle2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LockedContentPreviewProps {
  onUpgrade: () => void;
}

const LockedContentPreview = ({ onUpgrade }: LockedContentPreviewProps) => {
  const lockedFeatures = [
    {
      icon: TrendingUp,
      title: "¿Qué puedo mejorar?",
      description: "Te decimos qué cambiar para tener más chance de éxito",
    },
    {
      icon: Target,
      title: "Simulador ¿Qué pasa si...?",
      description: "Mira cómo cambia tu resultado si dejas de fumar, etc.",
    },
    {
      icon: Lightbulb,
      title: "Consejos para tu caso",
      description: "Pasos claros de qué hacer primero",
    },
    {
      icon: FileText,
      title: "Guía completa en PDF",
      description: "Para llevar al dentista o revisar después",
    },
  ];

  const includedFree = [
    "Tu resultado inicial",
    "Si hay cosas que pueden complicar",
    "Una idea de tu situación",
  ];

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 px-5 py-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              ¿Quieres más detalles?
            </h3>
            <p className="text-xs text-muted-foreground">
              Desbloquea la guía completa
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* What's included for free */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            ✓ Ya tienes esto gratis
          </p>
          <div className="space-y-2">
            {includedFree.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Locked features */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            🔒 Desbloquea con la guía completa
          </p>
          <div className="space-y-3">
            {lockedFeatures.map((feature, index) => (
              <div
                key={index}
                onClick={onUpgrade}
                className="group flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30 
                  opacity-75 cursor-pointer transition-all duration-300 ease-out
                  hover:opacity-100 hover:bg-primary/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10
                  hover:scale-[1.02] hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0
                  transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                  <feature.icon className="w-4 h-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground/70 transition-colors duration-300 group-hover:text-foreground">{feature.title}</p>
                    <Lock className="w-3 h-3 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:animate-pulse" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 transition-colors duration-300 group-hover:text-foreground/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onUpgrade}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Lock className="w-4 h-4" />
          Desbloquear guía completa - $14.900
        </button>

        <p className="text-xs text-center text-muted-foreground">
          La recibes al tiro después de pagar
        </p>
      </div>
    </Card>
  );
};

export default LockedContentPreview;
