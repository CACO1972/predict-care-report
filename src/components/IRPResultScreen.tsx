import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, ArrowRight, CheckCircle2, FileText, Lock, 
  Sparkles, TrendingUp, Shield, Zap, Crown, Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IRPResult, getIRPColorClass } from "@/utils/irpCalculation";

interface IRPResultScreenProps {
  irpResult: IRPResult;
  patientName: string;
  onContinueFree: () => void;
  onPurchasePlan: () => void;
}

const IRPResultScreen = ({ 
  irpResult, 
  patientName,
  onContinueFree,
  onPurchasePlan 
}: IRPResultScreenProps) => {
  const [isHoveringPremium, setIsHoveringPremium] = useState(false);
  const colorClasses = getIRPColorClass(irpResult.level);

  // Beneficios del Plan de Acción
  const planBenefits = [
    { icon: CheckCircle2, text: "Lista de acciones personalizadas paso a paso" },
    { icon: TrendingUp, text: "Análisis predictivo detallado de tu caso" },
    { icon: Shield, text: "Recomendaciones clínicas específicas" },
    { icon: Zap, text: "Protocolo de preparación pre-implante" },
  ];

  // Lo que incluye el IRP gratuito
  const freeBenefits = [
    "Tu puntuación IRP",
    "Nivel de riesgo periodontal", 
    "1-2 consejos generales"
  ];

  return (
    <div className="space-y-6 animate-fade-in">
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
        "relative overflow-hidden border-2 p-8",
        colorClasses.border,
        `bg-gradient-to-br ${colorClasses.gradient} to-background`
      )}>
        {/* Decorative glow */}
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20",
          colorClasses.bg
        )} />

        <div className="relative text-center space-y-4">
          {/* Score circular */}
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/20"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(irpResult.score / 100) * 440} 440`}
                className={colorClasses.text}
                style={{
                  transition: 'stroke-dasharray 1.5s ease-out'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-4xl font-bold", colorClasses.text)}>
                {irpResult.score}
              </span>
              <span className="text-xs text-muted-foreground">puntos</span>
            </div>
          </div>

          {/* Label y mensaje */}
          <div className="space-y-2">
            <div className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full",
              colorClasses.bg, colorClasses.text
            )}>
              <span className="font-semibold">{irpResult.levelLabel}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {irpResult.message}
            </p>
          </div>
        </div>
      </Card>

      {/* Sección de decisión: Gratis vs Pago */}
      <div className="grid gap-4">
        {/* Opción Premium - Plan de Acción */}
        <Card 
          className={cn(
            "relative overflow-hidden border-2 transition-all duration-300 cursor-pointer",
            isHoveringPremium 
              ? "border-primary shadow-xl shadow-primary/20 scale-[1.01]" 
              : "border-primary/50"
          )}
          onMouseEnter={() => setIsHoveringPremium(true)}
          onMouseLeave={() => setIsHoveringPremium(false)}
          onClick={onPurchasePlan}
        >
          {/* Badge recomendado */}
          <div className="absolute top-0 right-0">
            <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Crown className="w-3 h-3" />
              RECOMENDADO
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

          <div className="relative p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Plan de Acción Personalizado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tu guía completa para maximizar el éxito del implante
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">$14.900</div>
                <div className="text-xs text-muted-foreground">CLP</div>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid gap-2">
              {planBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-foreground/90">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button 
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
            >
              Obtener Plan de Acción
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Opción Gratuita */}
        <Card className="border border-border/50 bg-muted/5">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Informe IRP Gratuito
                </h3>
                <p className="text-xs text-muted-foreground">
                  Resumen básico de tu evaluación periodontal
                </p>
              </div>
              <div className="text-lg font-semibold text-muted-foreground">$0</div>
            </div>

            {/* Lo que incluye */}
            <div className="flex flex-wrap gap-2">
              {freeBenefits.map((benefit, i) => (
                <span 
                  key={i} 
                  className="px-2 py-1 bg-muted/50 rounded-md text-xs text-muted-foreground"
                >
                  {benefit}
                </span>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={onContinueFree}
            >
              Solo quiero mi IRP gratis
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Nota de seguridad */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>Pago seguro con MercadoPago • Garantía de satisfacción</span>
      </div>
    </div>
  );
};

export default IRPResultScreen;
