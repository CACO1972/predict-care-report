import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Sparkles, Crown, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRPResult, getIRPColorClass } from "@/utils/irpCalculation";
import { PurchaseLevel } from "@/types/questionnaire";
import RioAvatar from "./RioAvatar";

interface IRPResultScreenProps {
  irpResult: IRPResult;
  patientName: string;
  /** Selecciona el plan y avanza el cuestionario; el cobro ocurre al final, tras el resumen */
  onSelectPlan: (level: PurchaseLevel) => void;
}

const IRPResultScreen = ({
  irpResult,
  patientName,
  onSelectPlan,
}: IRPResultScreenProps) => {
  const colorClasses = getIRPColorClass(irpResult.level);

  return (
    <div className="space-y-6 animate-fade-in">
      <RioAvatar
        message={`¡${patientName}, ya tengo tu Índice de Riesgo Personalizado! Para entregarte el informe completo, elige el plan que prefieras y continuemos con tu evaluación clínica.`}
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

      {/* IRP Score Card */}
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

      {/* Paywall — only paid plans */}
      <div className="space-y-3 pt-2">
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Desbloquea tu informe completo</h3>
          <p className="text-sm text-muted-foreground">Elige tu plan y continúa con la evaluación clínica</p>
        </div>

        {/* Plan de Acción */}
        <Card className="border-primary/40 bg-primary/5 p-5 space-y-3 relative">
          <div className="absolute -top-3 left-4 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            POPULAR
          </div>
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Plan de Acción
            </h3>
            <span className="text-lg font-bold text-primary">$14.990</span>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Índice de riesgo personalizado</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Lista de acciones personalizadas</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Protocolo de preparación pre-implante</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Informe PDF de 8 páginas</li>
          </ul>
          <Button
            className="w-full gap-2"
            onClick={() => onSelectPlan('plan-accion')}
          >
            <TrendingUp className="w-4 h-4" />
            Continuar con Plan de Acción
          </Button>
        </Card>

        {/* Premium */}
        <Card className="border-2 border-primary p-5 space-y-3 relative shadow-lg shadow-primary/10">
          <div className="absolute -top-3 left-4 px-3 py-0.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> MÁS COMPLETO
          </div>
          <div className="flex items-center justify-between pt-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Informe Premium
            </h3>
            <div className="text-right">
              <span className="text-sm text-muted-foreground line-through">$44.990</span>
              <span className="text-lg font-bold text-primary ml-2">$29.990</span>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Todo lo del Plan de Acción</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Odontograma interactivo + foto dental</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Simulación de sonrisa con IA</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Estimación de costos por zona</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />Informe PDF de 15 páginas</li>
          </ul>
          <Button
            className="w-full gap-2 bg-primary hover:bg-primary/90 font-bold text-lg h-12"
            onClick={() => onSelectPlan('premium')}
          >
            <Sparkles className="w-4 h-4" />
            Continuar con Premium
          </Button>
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> Ahorras $15.000 • Garantía de satisfacción
          </p>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-1">
          🔒 Pago seguro al final del cuestionario · No se cobra hasta confirmar tus respuestas
        </p>
      </div>
    </div>
  );
};

export default IRPResultScreen;
