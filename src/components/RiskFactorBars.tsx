import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Cigarette, Heart, Bone, Sparkles, Droplets, 
  ShieldAlert, Activity, Clock, MapPin, Hash
} from "lucide-react";

interface Factor {
  name: string;
  value: string;
  impact: number;
}

interface RiskFactorBarsProps {
  factors: Factor[];
}

const iconMap: Record<string, React.ElementType> = {
  "Hábito de Tabaco": Cigarette,
  "Diabetes": Heart,
  "Bruxismo": Activity,
  "Salud Periodontal": Droplets,
  "Higiene Oral": Sparkles,
  "Salud de Encías": Droplets,
  "Zona de Implante": MapPin,
  "Rehabilitación Múltiple": Hash,
  "Historial de Implantes": ShieldAlert,
};

const RiskFactorBars = ({ factors }: RiskFactorBarsProps) => {
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(factors.map(() => 0));
  
  useEffect(() => {
    // Stagger the animations
    factors.forEach((factor, index) => {
      setTimeout(() => {
        setAnimatedWidths(prev => {
          const newWidths = [...prev];
          // Map impact to percentage (impact is typically 5, 10, or 15)
          newWidths[index] = factor.impact <= 5 ? 30 : factor.impact <= 10 ? 60 : 90;
          return newWidths;
        });
      }, 200 + index * 150);
    });
  }, [factors]);

  const getBarColor = (value: string) => {
    switch (value) {
      case 'Alto':
        return 'bg-gradient-to-r from-red-500 to-red-400';
      case 'Medio':
        return 'bg-gradient-to-r from-warning to-yellow-400';
      default:
        return 'bg-gradient-to-r from-green-500 to-green-400';
    }
  };

  const getGlowClass = (value: string) => {
    switch (value) {
      case 'Alto':
        return 'shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      case 'Medio':
        return 'shadow-[0_0_12px_rgba(251,191,36,0.4)]';
      default:
        return 'shadow-[0_0_12px_rgba(34,197,94,0.4)]';
    }
  };

  if (factors.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        Análisis de Factores de Riesgo
      </h4>
      
      <div className="space-y-3">
        {factors.map((factor, index) => {
          const Icon = iconMap[factor.name] || ShieldAlert;
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    factor.value === 'Alto' 
                      ? "bg-red-500/20 text-red-500" 
                      : factor.value === 'Medio'
                        ? "bg-warning/20 text-warning"
                        : "bg-green-500/20 text-green-500"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{factor.name}</span>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold",
                  factor.value === 'Alto' 
                    ? "bg-red-500/20 text-red-500" 
                    : factor.value === 'Medio'
                      ? "bg-warning/20 text-warning"
                      : "bg-green-500/20 text-green-500"
                )}>
                  {factor.value}
                </span>
              </div>
              
              {/* Animated bar */}
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out",
                    getBarColor(factor.value),
                    getGlowClass(factor.value)
                  )}
                  style={{ width: `${animatedWidths[index]}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskFactorBars;