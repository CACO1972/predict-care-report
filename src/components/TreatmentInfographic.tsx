import { useState, useEffect } from "react";
import { 
  Calendar, Stethoscope, Bone, Heart, Shield, Check, 
  ChevronRight, ChevronDown, Loader2, Sparkles,
  ThumbsUp, ThumbsDown, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TreatmentStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

interface TreatmentAlternative {
  id: number;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  suitability: 'alto' | 'medio' | 'bajo';
}

interface TreatmentInfographicProps {
  synergies: string[];
  successProbability: number;
  pronosticoLabel: string;
  patientContext?: {
    nTeeth?: number;
    imageAnalysis?: string;
  };
}

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  stethoscope: Stethoscope,
  bone: Bone,
  heart: Heart,
  shield: Shield,
  check: Check,
};

const TreatmentInfographic = ({ 
  synergies, 
  successProbability, 
  pronosticoLabel,
  patientContext
}: TreatmentInfographicProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeAlternative, setActiveAlternative] = useState<number | null>(null);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([]);
  const [alternatives, setAlternatives] = useState<TreatmentAlternative[]>([]);
  const [synergyExplanation, setSynergyExplanation] = useState<string>("");
  const [personalizedAdvice, setPersonalizedAdvice] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateInfographic = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('generate-treatment-infographic', {
          body: { 
            synergies, 
            successProbability, 
            pronosticoLabel,
            patientContext
          }
        });

        if (fnError) throw fnError;

        if (data?.success) {
          setTreatmentSteps(data.treatmentSteps || []);
          setAlternatives(data.alternatives || []);
          setSynergyExplanation(data.synergyExplanation || "");
          setPersonalizedAdvice(data.personalizedAdvice || "");
        } else {
          throw new Error(data?.error || 'Error generando infografía');
        }
      } catch (err) {
        console.error('Error generating infographic:', err);
        setError('No se pudo generar la infografía. Mostrando información estándar.');
        // Set fallback data
        setTreatmentSteps([
          { id: 1, title: "Evaluación Inicial", description: "Consulta con el especialista para evaluar tu caso.", duration: "1 sesión", icon: "stethoscope" },
          { id: 2, title: "Planificación Digital", description: "Diseño 3D del tratamiento.", duration: "1-2 semanas", icon: "calendar" },
          { id: 3, title: "Preparación", description: "Tratamientos previos si son necesarios.", duration: "Variable", icon: "shield" },
          { id: 4, title: "Cirugía de Implante", description: "Colocación del implante de titanio.", duration: "1-2 horas", icon: "bone" },
          { id: 5, title: "Osteointegración", description: "El implante se fusiona con el hueso.", duration: "3-6 meses", icon: "heart" },
          { id: 6, title: "Corona Definitiva", description: "Colocación de la corona final.", duration: "2-3 semanas", icon: "check" }
        ]);
        setAlternatives([
          { id: 1, name: "Implante Unitario", description: "Reemplazo individual", pros: ["Preserva dientes vecinos", "Durabilidad"], cons: ["Requiere cirugía"], suitability: "alto" },
          { id: 2, name: "Puente Dental", description: "Prótesis fija", pros: ["Sin cirugía", "Rápido"], cons: ["Desgasta dientes"], suitability: "medio" },
          { id: 3, name: "Prótesis Removible", description: "Dentadura extraíble", pros: ["Económico"], cons: ["Menos cómodo"], suitability: "bajo" },
          { id: 4, name: "All-on-4", description: "Arcada completa", pros: ["Solución completa"], cons: ["Mayor inversión"], suitability: "alto" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateInfographic();
  }, [synergies, successProbability, pronosticoLabel, patientContext]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Generando tu infografía personalizada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg text-sm text-warning">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Personalized advice */}
      {personalizedAdvice && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Consejo personalizado</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{personalizedAdvice}</p>
        </div>
      )}

      {/* Treatment Steps Timeline */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Etapas del Tratamiento con Implantes
        </h4>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
          
          <div className="space-y-2">
            {treatmentSteps.map((step, index) => {
              const IconComponent = iconMap[step.icon] || Check;
              const isActive = activeStep === step.id;
              const isLast = index === treatmentSteps.length - 1;
              
              return (
                <div
                  key={step.id}
                  className={cn(
                    "relative pl-10 cursor-pointer transition-all duration-200",
                    isActive && "pl-12"
                  )}
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-2 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10",
                    isActive 
                      ? "bg-primary border-primary scale-110" 
                      : "bg-background border-border"
                  )}>
                    <span className={cn(
                      "text-xs font-bold",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )}>
                      {step.id}
                    </span>
                  </div>

                  <div className={cn(
                    "rounded-xl border transition-all",
                    isActive 
                      ? "bg-primary/5 border-primary/30 shadow-sm" 
                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                  )}>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.duration}</p>
                        </div>
                      </div>
                      {isActive ? (
                        <ChevronDown className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    
                    {isActive && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Treatment Alternatives */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Bone className="w-4 h-4 text-primary" />
          Alternativas de Tratamiento
        </h4>

        <div className="grid grid-cols-2 gap-2">
          {alternatives.map((alt) => {
            const isActive = activeAlternative === alt.id;
            
            return (
              <div
                key={alt.id}
                className={cn(
                  "rounded-xl border cursor-pointer transition-all",
                  isActive 
                    ? "col-span-2 bg-primary/5 border-primary/30" 
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
                onClick={() => setActiveAlternative(isActive ? null : alt.id)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{alt.name}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-medium",
                      alt.suitability === 'alto' && "bg-primary/20 text-primary",
                      alt.suitability === 'medio' && "bg-warning/20 text-warning",
                      alt.suitability === 'bajo' && "bg-muted text-muted-foreground"
                    )}>
                      {alt.suitability === 'alto' ? 'Recomendado' : alt.suitability === 'medio' ? 'Alternativa' : 'Básico'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alt.description}</p>
                  
                  {isActive && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-primary flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> Ventajas
                        </p>
                        <ul className="space-y-0.5">
                          {alt.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-primary">•</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-warning flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3" /> Consideraciones
                        </p>
                        <ul className="space-y-0.5">
                          {alt.cons.map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-warning">•</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synergy explanation */}
      {synergyExplanation && synergies.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-foreground">Sobre tus factores combinados</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{synergyExplanation}</p>
        </div>
      )}
    </div>
  );
};

export default TreatmentInfographic;
