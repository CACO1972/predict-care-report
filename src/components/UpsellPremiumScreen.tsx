import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, CheckCircle2, Crown, Sparkles, 
  Camera, FileText, TrendingUp, Shield, Gift, X
} from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: Replace with actual Flow link for Premium ($29.990)
const FLOW_PREMIUM = "";

interface UpsellPremiumScreenProps {
  patientName: string;
  onUpgrade: () => void;
  onSkip: () => void;
}

const UpsellPremiumScreen = ({ 
  patientName,
  onUpgrade,
  onSkip 
}: UpsellPremiumScreenProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleUpgrade = () => {
    if (FLOW_PREMIUM) {
      // Save state for return
      try {
        localStorage.setItem('implantx_flow_payment', JSON.stringify({
          level: 'premium',
          timestamp: Date.now(),
        }));
      } catch {}
      window.location.href = FLOW_PREMIUM;
    }
    onUpgrade();
  };

  const premiumFeatures = [
    { icon: Camera, title: "Simulación de Sonrisa con IA", description: "Ve cómo lucirá tu sonrisa con el implante antes del tratamiento", highlight: true },
    { icon: FileText, title: "Informe Clínico Detallado", description: "Documento PDF completo para tu dentista con análisis profundo" },
    { icon: TrendingUp, title: "Estimación de Costos", description: "Rango de precios según tu caso y zona geográfica" },
    { icon: Shield, title: "Plan de Tratamiento Personalizado", description: "Cronograma detallado con etapas y tiempos estimados" },
  ];

  const includedFromPlan = [
    "Todo lo del Plan de Acción ($14.990)",
    "Lista de acciones personalizadas",
    "Recomendaciones clínicas específicas",
    "Protocolo de preparación pre-implante"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400">¡Gracias por tu compra!</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{patientName}, tienes una oportunidad única</h2>
        <p className="text-muted-foreground max-w-md mx-auto">Aprovecha este momento para llevar tu evaluación al siguiente nivel</p>
      </div>

      <Card 
        className={cn(
          "relative overflow-hidden border-2 transition-all duration-300",
          isHovering ? "border-primary shadow-2xl shadow-primary/30 scale-[1.01]" : "border-primary/60"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary via-primary to-primary/80 py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-primary-foreground animate-pulse" />
            <span className="text-sm font-bold text-primary-foreground">OFERTA EXCLUSIVA POST-COMPRA</span>
            <Gift className="w-4 h-4 text-primary-foreground animate-pulse" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

        <div className="relative p-6 pt-14 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary" />Informe Premium Completo
              </h3>
              <p className="text-sm text-muted-foreground">La evaluación más completa disponible</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground line-through">$44.990</div>
              <div className="text-3xl font-bold text-primary">$29.990</div>
              <div className="text-xs text-emerald-400 font-medium">Ahorras $15.000</div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Incluye exclusivamente:</p>
            <div className="grid gap-3">
              {premiumFeatures.map((feature, i) => (
                <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl transition-all", feature.highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/30")}>
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", feature.highlight ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary")}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {feature.title}
                      {feature.highlight && <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">EXCLUSIVO</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/20 rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">+ Todo esto incluido:</p>
            <div className="flex flex-wrap gap-2">
              {includedFromPlan.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-background/50 rounded-md text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />{item}
                </span>
              ))}
            </div>
          </div>

          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-14" onClick={handleUpgrade}>
            <Sparkles className="w-5 h-5" />Obtener Informe Premium<ArrowRight className="w-5 h-5" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" /><span>Garantía de satisfacción • Soporte prioritario</span>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <button onClick={onSkip} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />No gracias, continuar con mi Plan de Acción
        </button>
      </div>
    </div>
  );
};

export default UpsellPremiumScreen;
