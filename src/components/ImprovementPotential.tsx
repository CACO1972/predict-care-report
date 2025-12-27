import { TrendingUp, AlertCircle, Sparkles, Lock, ArrowUp, Crown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModifiableFactor {
  name: string;
  currentImpact: 'high' | 'medium' | 'low';
  potentialImprovement: number; // Porcentaje de mejora potencial
  action: string;
  isPremiumDetail?: boolean;
}

interface ImprovementPotentialProps {
  currentProbability: number;
  factors: Array<{ name: string; value: string; impact: number }>;
  synergies?: string[];
}

// Calcular factores modificables y su potencial de mejora
const calculateModifiableFactors = (
  factors: Array<{ name: string; value: string; impact: number }>,
  synergies: string[] = []
): ModifiableFactor[] => {
  const modifiableFactors: ModifiableFactor[] = [];

  factors.forEach(factor => {
    const lowerName = factor.name.toLowerCase();
    
    // Tabaco - altamente modificable
    if (lowerName.includes('tabaco') || lowerName.includes('smoking')) {
      modifiableFactors.push({
        name: 'Reducción/Cese de Tabaco',
        currentImpact: factor.impact > 12 ? 'high' : 'medium',
        potentialImprovement: factor.impact > 12 ? 8 : 4,
        action: 'Dejar de fumar 2-4 semanas antes de la cirugía'
      });
    }
    
    // Diabetes - modificable con control
    if (lowerName.includes('diabetes')) {
      modifiableFactors.push({
        name: 'Control Glucémico',
        currentImpact: factor.impact > 12 ? 'high' : 'medium',
        potentialImprovement: factor.impact > 12 ? 6 : 3,
        action: 'Estabilizar HbA1c por debajo de 7%'
      });
    }
    
    // Higiene oral - altamente modificable
    if (lowerName.includes('higiene')) {
      modifiableFactors.push({
        name: 'Mejora de Higiene Oral',
        currentImpact: factor.impact > 12 ? 'high' : 'medium',
        potentialImprovement: factor.impact > 12 ? 7 : 4,
        action: 'Establecer rutina de cepillado 2x/día + hilo dental'
      });
    }
    
    // Salud gingival - modificable con tratamiento
    if (lowerName.includes('encías') || lowerName.includes('gingival') || lowerName.includes('gum')) {
      modifiableFactors.push({
        name: 'Tratamiento Gingival',
        currentImpact: factor.impact > 12 ? 'high' : 'medium',
        potentialImprovement: factor.impact > 12 ? 5 : 3,
        action: 'Tratamiento periodontal previo al implante'
      });
    }
    
    // Bruxismo - modificable con férula
    if (lowerName.includes('bruxismo')) {
      modifiableFactors.push({
        name: 'Férula de Protección',
        currentImpact: factor.impact > 12 ? 'high' : 'medium',
        potentialImprovement: factor.impact > 12 ? 6 : 3,
        action: 'Uso de férula de descarga nocturna'
      });
    }
    
    // Salud periodontal
    if (lowerName.includes('periodontal')) {
      modifiableFactors.push({
        name: 'Estabilización Periodontal',
        currentImpact: 'high',
        potentialImprovement: 8,
        action: 'Tratamiento periodontal completo antes del implante'
      });
    }
  });

  // Añadir factores de sinergias si existen
  if (synergies.length > 0) {
    modifiableFactors.push({
      name: 'Manejo de Factores Combinados',
      currentImpact: 'high',
      potentialImprovement: synergies.length * 2,
      action: 'Plan personalizado para abordar interacciones de riesgo',
      isPremiumDetail: true
    });
  }

  return modifiableFactors;
};

// Calcular probabilidad máxima potencial
const calculatePotentialMaxProbability = (
  currentProbability: number,
  modifiableFactors: ModifiableFactor[]
): number => {
  const totalPotentialImprovement = modifiableFactors.reduce(
    (sum, factor) => sum + factor.potentialImprovement,
    0
  );
  
  // Aplicar fórmula de rendimientos decrecientes
  const effectiveImprovement = totalPotentialImprovement * 0.7; // Factor de ajuste realista
  const potentialMax = Math.min(98, currentProbability + effectiveImprovement);
  
  return Math.round(potentialMax);
};

const ImprovementPotential = ({ currentProbability, factors, synergies = [] }: ImprovementPotentialProps) => {
  const modifiableFactors = calculateModifiableFactors(factors, synergies);
  const potentialMaxProbability = calculatePotentialMaxProbability(currentProbability, modifiableFactors);
  const totalPotentialGain = potentialMaxProbability - currentProbability;

  // Si no hay factores modificables significativos
  if (modifiableFactors.length === 0 || totalPotentialGain < 2) {
    return (
      <div className="bg-gradient-to-br from-success/10 to-success/5 border border-success/20 rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Perfil Óptimo</h4>
            <p className="text-sm text-muted-foreground">
              Tu evaluación actual refleja condiciones excelentes. Mantén tus buenos hábitos para asegurar el éxito a largo plazo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aclaración importante sobre la foto actual */}
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              Importante: Esta es una "Foto" de tu Situación Actual
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El porcentaje de éxito estimado ({currentProbability}%) representa tu <strong className="text-foreground">situación actual</strong>. 
              Este valor <strong className="text-foreground">puede mejorar significativamente</strong> si trabajas en los factores de riesgo modificables.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Cambiar hábitos y controlar factores de riesgo = mejores probabilidades de éxito.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Potencial de mejora */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Tu Potencial de Mejora</h4>
            <p className="text-xs text-muted-foreground">Factores que puedes optimizar para aumentar tu probabilidad de éxito</p>
          </div>
        </div>

        {/* Visualización de mejora potencial */}
        <div className="bg-background/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Situación actual</span>
            <span className="font-bold text-foreground">{currentProbability}%</span>
          </div>
          
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary/50 rounded-full transition-all duration-1000"
              style={{ width: `${currentProbability}%` }}
            />
            <div 
              className={cn(
                "absolute top-0 h-full rounded-full transition-all duration-1000 delay-300",
                "bg-gradient-to-r from-primary to-success"
              )}
              style={{ 
                left: `${currentProbability}%`,
                width: `${totalPotentialGain}%`
              }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-success" />
              Potencial máximo
            </span>
            <span className="font-bold text-success">{potentialMaxProbability}%</span>
          </div>
          
          <div className="text-center pt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold">
              <TrendingUp className="w-4 h-4" />
              +{totalPotentialGain}% de mejora posible
            </span>
          </div>
        </div>

        {/* Lista de factores modificables (versión básica) */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Acciones recomendadas:</p>
          {modifiableFactors.slice(0, 3).map((factor, i) => (
            <div 
              key={i}
              className="flex items-start gap-2 p-2 rounded-lg bg-background/30"
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{factor.name}</p>
                <p className="text-xs text-muted-foreground">{factor.action}</p>
              </div>
              <span className="text-xs font-semibold text-success whitespace-nowrap">
                +{factor.potentialImprovement}%
              </span>
            </div>
          ))}
          
          {modifiableFactors.length > 3 && (
            <div className="text-xs text-muted-foreground text-center pt-1">
              +{modifiableFactors.length - 3} factor(es) adicional(es)
            </div>
          )}
        </div>

        {/* Teaser premium */}
        <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold text-foreground text-sm">Reporte Premium</h5>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 text-[10px] font-bold rounded-full">
                  INCLUYE
                </span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Porcentaje exacto de mejora por cada factor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Plan de acción personalizado con cronograma</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Simulación de escenarios: "¿Qué pasa si...?"</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Impacto de sinergias en tu caso específico</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovementPotential;
