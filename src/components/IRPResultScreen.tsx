import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, ArrowRight, CheckCircle2, FileText, Lock, 
  Sparkles, TrendingUp, Shield, Zap, Crown, Download,
  X, Car, Plane, Clock, DollarSign, Bug
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IRPResult, getIRPColorClass } from "@/utils/irpCalculation";
import { PurchaseLevel } from "@/types/questionnaire";
import { useToast } from "@/hooks/use-toast";
import RioAvatar from "./RioAvatar";

interface IRPResultScreenProps {
  irpResult: IRPResult;
  patientName: string;
  onContinueFree: () => void;
  onPurchasePlan: (level: PurchaseLevel) => void;
}

// Payment link placeholders - replace with actual Flow links
const FLOW_PLAN_ACCION = ""; // TODO: Add Flow link for Plan de Acción ($14.900)
const FLOW_PREMIUM = ""; // TODO: Add Flow link for Premium ($29.990)

// Test mode bypass - use ?testMode=premium or ?testMode=plan-accion in URL
const getTestMode = (): PurchaseLevel | null => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const testMode = params.get('testMode');
    if (testMode === 'premium') return 'premium';
    if (testMode === 'plan-accion') return 'plan-accion';
  }
  return null;
};

const IRPResultScreen = ({ 
  irpResult, 
  patientName,
  onContinueFree,
  onPurchasePlan 
}: IRPResultScreenProps) => {
  const [isHoveringPremium, setIsHoveringPremium] = useState(false);
  const colorClasses = getIRPColorClass(irpResult.level);
  const { toast } = useToast();
  
  // Check for test mode
  const testMode = getTestMode();

  // Check if returning from Flow payment
  useEffect(() => {
    try {
      const saved = localStorage.getItem('implantx_purchase_verified');
      if (saved) {
        const { level, timestamp } = JSON.parse(saved);
        // Only use if less than 30 minutes old
        if (Date.now() - timestamp < 1800000) {
          toast({
            title: "¡Pago verificado!",
            description: `Tu ${level === 'premium' ? 'Informe Premium' : 'Plan de Acción'} está listo`,
          });
          localStorage.removeItem('implantx_purchase_verified');
          onPurchasePlan(level);
        } else {
          localStorage.removeItem('implantx_purchase_verified');
        }
      }
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Handle test mode bypass
  const handleTestBypass = (level: PurchaseLevel) => {
    toast({
      title: "🧪 Modo Test Activado",
      description: `Bypasseando pago: ${level}`,
    });
    onPurchasePlan(level);
  };

  const handleInitiatePurchase = (level: 'plan-accion' | 'premium') => {
    const url = level === 'premium' ? FLOW_PREMIUM : FLOW_PLAN_ACCION;
    
    if (!url) {
      toast({
        title: "Link de pago no configurado",
        description: "Por favor contacta al administrador",
        variant: "destructive",
      });
      return;
    }

    // Save state for when user returns from Flow
    try {
      localStorage.setItem('implantx_flow_payment', JSON.stringify({
        level,
        timestamp: Date.now(),
      }));
    } catch {}

    // Redirect to Flow payment
    window.location.href = url;
  };

  // Características de cada plan
  const planFeatures = {
    free: [
      { text: "Tu puntuación IRP", included: true },
      { text: "Nivel de riesgo periodontal", included: true },
      { text: "1-2 consejos generales", included: true },
      { text: "Análisis de factores de riesgo", included: false },
      { text: "Plan de acción personalizado", included: false },
      { text: "Recomendaciones clínicas", included: false },
      { text: "Evaluación de implantes previos", included: false },
      { text: "Análisis de zona dental", included: false },
      { text: "Simulación de sonrisa con IA", included: false },
    ],
    base: [
      { text: "Todo lo del plan gratuito", included: true, highlight: true },
      { text: "Análisis detallado de factores de riesgo", included: true },
      { text: "Plan de acción paso a paso", included: true },
      { text: "Recomendaciones clínicas específicas", included: true },
      { text: "Protocolo de preparación pre-implante", included: true },
      { text: "Evaluación de implantes previos", included: true },
      { text: "Análisis por zona dental", included: false },
      { text: "Simulación de sonrisa con IA", included: false },
      { text: "Estimación de costos", included: false },
    ],
    premium: [
      { text: "Todo lo del plan base", included: true, highlight: true },
      { text: "Cuestionario clínico completo", included: true },
      { text: "Análisis detallado por zona dental", included: true },
      { text: "Simulación de sonrisa con IA", included: true },
      { text: "Estimación de costos del tratamiento", included: true },
      { text: "Timeline del tratamiento", included: true },
      { text: "Infografía de alternativas", included: true },
      { text: "Análisis de imagen dental con IA", included: true },
      { text: "Soporte prioritario", included: true },
    ],
  };

  // Estado para el audio de planes
  const [selectedPlanAudio, setSelectedPlanAudio] = useState<string | null>(null);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  useEffect(() => {
    if (!hasPlayedIntro) {
      setHasPlayedIntro(true);
    }
  }, [hasPlayedIntro]);

  const getPlanAudio = (plan: 'free' | 'base' | 'premium') => {
    const audioMap = {
      free: '/audio/rio-plan-gratis.mp3',
      base: '/audio/rio-plan-accion.mp3',
      premium: '/audio/rio-plan-premium.mp3',
    };
    return audioMap[plan];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Rio Avatar con intro de resultados */}
      <RioAvatar 
        message={`¡${patientName}, ya tengo tus resultados! He analizado tu perfil y calculado tu Índice de Riesgo Personalizado. Ahora te explico qué significa y cómo podemos ayudarte.`}
        userName={patientName}
        customAudioUrl="/audio/rio-resultados-intro.mp3"
        autoSpeak={true}
      />

      {/* Header con resultado IRP */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Resultado IRP</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {patientName}, aquí está tu índice
        </h2>
      </div>

      {/* Gauge del IRP */}
      <Card className={cn(
        "relative overflow-hidden border-2 p-6",
        colorClasses.border,
        `bg-gradient-to-br ${colorClasses.gradient} to-background`
      )}>
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20",
          colorClasses.bg
        )} />

        <div className="relative text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
              <circle
                cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(irpResult.score / 100) * 352} 352`}
                className={colorClasses.text}
                style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-3xl font-bold", colorClasses.text)}>{irpResult.score}</span>
              <span className="text-xs text-muted-foreground">puntos</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm", colorClasses.bg, colorClasses.text)}>
              <span className="font-semibold">{irpResult.levelLabel}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">{irpResult.message}</p>
          </div>
        </div>
      </Card>

      {/* Banner de ahorro */}
      <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground">
              💡 Si tuvieras que viajar a Santiago para una evaluación presencial...
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Car className="w-3 h-3" /> Transporte: ~$30.000</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Tiempo: 1 día completo</span>
              <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> Si vuelas: ~$80.000+</span>
            </div>
            <p className="text-sm font-semibold text-emerald-600">
              Con ImplantX ahorras hasta $100.000 y tienes resultados en 5 minutos
            </p>
          </div>
        </div>
      </Card>

      {/* TEST MODE BANNER */}
      {testMode && (
        <Card className="border-2 border-orange-500 bg-orange-500/10 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground">🧪 Modo Test Activo</p>
              <p className="text-xs text-muted-foreground">
                Bypass de pagos habilitado. Haz clic para continuar sin pagar.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleTestBypass('plan-accion')} variant="outline" className="gap-2 border-orange-500/50 hover:bg-orange-500/10">
              <Zap className="w-4 h-4" />Test Plan Acción
            </Button>
            <Button onClick={() => handleTestBypass('premium')} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-white">
              <Crown className="w-4 h-4" />Test Premium
            </Button>
          </div>
        </Card>
      )}

      {/* Comparación de planes */}
      <div className="space-y-4">
        <h3 className="text-center text-lg font-semibold text-foreground">Elige tu nivel de análisis</h3>
        <p className="text-center text-xs text-muted-foreground">🔊 Toca en cada plan para escuchar a Río explicártelo</p>

        {/* Plan Premium - Destacado */}
        <Card 
          className={cn(
            "relative overflow-hidden border-2 transition-all duration-300",
            isHoveringPremium ? "border-amber-500 shadow-xl shadow-amber-500/20 scale-[1.01]" : "border-amber-500/50"
          )}
          onMouseEnter={() => setIsHoveringPremium(true)}
          onMouseLeave={() => setIsHoveringPremium(false)}
        >
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1.5 text-center flex items-center justify-center gap-1">
            <Crown className="w-3.5 h-3.5" />MÁS COMPLETO • RECOMENDADO
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50" />
          <div className="relative p-6 pt-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />Informe Premium
                </h3>
                <p className="text-sm text-muted-foreground">Análisis completo + Simulación de sonrisa con IA</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground line-through">$49.990</div>
                <div className="text-2xl font-bold text-amber-500">$29.990</div>
                <div className="text-xs text-emerald-600 font-medium">Ahorras $20.000</div>
              </div>
            </div>
            <div className="grid gap-1.5">
              {planFeatures.premium.map((feature, i) => (
                <div key={i} className={cn("flex items-center gap-2 text-sm", feature.highlight && "font-medium text-amber-600")}>
                  <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", feature.highlight ? "text-amber-500" : "text-emerald-500")} />
                  <span className="text-foreground/90">{feature.text}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                onClick={() => setSelectedPlanAudio(selectedPlanAudio === 'premium' ? null : 'premium')}>
                🔊 {selectedPlanAudio === 'premium' ? 'Pausar' : 'Escuchar sobre este plan'}
              </Button>
              <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                size="lg" onClick={() => handleInitiatePurchase('premium')}>
                Obtener Informe Premium<ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            {selectedPlanAudio === 'premium' && (
              <audio src={getPlanAudio('premium')} autoPlay onEnded={() => setSelectedPlanAudio(null)} />
            )}
          </div>
        </Card>

        {/* Plan Base */}
        <Card className="relative overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all">
          <div className="absolute top-0 right-0">
            <div className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />Plan de Acción
                </h3>
                <p className="text-sm text-muted-foreground">Tu guía paso a paso para prepararte</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">$14.900</div>
                <div className="text-xs text-muted-foreground">CLP</div>
              </div>
            </div>
            <div className="grid gap-1.5">
              {planFeatures.base.map((feature, i) => (
                <div key={i} className={cn("flex items-center gap-2 text-sm", feature.highlight && "font-medium text-primary")}>
                  {feature.included ? (
                    <CheckCircle2 className={cn("w-4 h-4 flex-shrink-0", feature.highlight ? "text-primary" : "text-emerald-500")} />
                  ) : (
                    <X className="w-4 h-4 flex-shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={cn(!feature.included && "text-muted-foreground/60")}>{feature.text}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2 text-xs"
                onClick={() => setSelectedPlanAudio(selectedPlanAudio === 'base' ? null : 'base')}>
                🔊 {selectedPlanAudio === 'base' ? 'Pausar' : 'Escuchar sobre este plan'}
              </Button>
              <Button className="w-full gap-2" size="lg" onClick={() => handleInitiatePurchase('plan-accion')}>
                Obtener Plan de Acción<ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            {selectedPlanAudio === 'base' && (
              <audio src={getPlanAudio('base')} autoPlay onEnded={() => setSelectedPlanAudio(null)} />
            )}
          </div>
        </Card>

        {/* Plan Gratuito */}
        <Card className="border border-border/50 bg-muted/5">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />Informe IRP Gratuito
                </h3>
                <p className="text-xs text-muted-foreground">Resumen básico de tu evaluación</p>
              </div>
              <div className="text-lg font-semibold text-emerald-600">GRATIS</div>
            </div>
            <div className="grid gap-1.5">
              {planFeatures.free.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {feature.included ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 flex-shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={cn(!feature.included && "text-muted-foreground/50")}>{feature.text}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full gap-2 text-xs"
                onClick={() => setSelectedPlanAudio(selectedPlanAudio === 'free' ? null : 'free')}>
                🔊 {selectedPlanAudio === 'free' ? 'Pausar' : 'Escuchar sobre este plan'}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={onContinueFree}>
                Solo quiero mi IRP gratis<Download className="w-4 h-4" />
              </Button>
            </div>
            {selectedPlanAudio === 'free' && (
              <audio src={getPlanAudio('free')} autoPlay onEnded={() => setSelectedPlanAudio(null)} />
            )}
          </div>
        </Card>
      </div>

      {/* Nota de seguridad */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>Pago seguro con Flow • Garantía de satisfacción</span>
      </div>
    </div>
  );
};

export default IRPResultScreen;
