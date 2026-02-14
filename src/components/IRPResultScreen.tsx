import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRPResult, getIRPColorClass } from "@/utils/irpCalculation";
import { PurchaseLevel } from "@/types/questionnaire";
import RioAvatar from "./RioAvatar";

interface IRPResultScreenProps {
  irpResult: IRPResult;
  patientName: string;
  patientEmail?: string;
  onContinueFree: () => void;
  onPurchasePlan: (level: PurchaseLevel) => void;
  onSaveStateForPayment?: () => void;
}

const IRPResultScreen = ({ 
  irpResult, 
  patientName,
  onContinueFree,
}: IRPResultScreenProps) => {
  const colorClasses = getIRPColorClass(irpResult.level);

  return (
    <div className="space-y-6 animate-fade-in">
      <RioAvatar 
        message={`¡${patientName}, ya tengo tus resultados! He analizado tu perfil y calculado tu Índice de Riesgo Personalizado. Ahora continuaremos con tu evaluación clínica completa.`}
        userName={patientName}
        customAudioUrl="/audio/rio-resultados-intro.mp3"
        autoSpeak={true}
      />

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Resultado IRP</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {patientName}, aquí está tu índice
        </h2>
      </div>

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

      <Card className="border-primary/30 bg-primary/5 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Tu evaluación clínica completa es gratuita</p>
            <p className="text-sm text-muted-foreground">
              Incluye análisis detallado, simulación de sonrisa y plan de tratamiento
            </p>
          </div>
        </div>
      </Card>

      <Button 
        className="w-full gap-2 font-semibold text-lg h-14" 
        size="lg" 
        onClick={onContinueFree}
      >
        Continuar con mi evaluación completa
        <ArrowRight className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default IRPResultScreen;
