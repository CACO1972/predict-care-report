import RioAvatar from "@/components/RioAvatar";
import { Loader2 } from "lucide-react";

interface ProcessingStepProps {
  userName?: string;
}

const ProcessingStep = ({ userName }: ProcessingStepProps) => (
  <div className="space-y-6 animate-fade-in text-center py-6">
    <RioAvatar 
      message="¡Gracias, {name}! Estoy analizando tus respuestas para generar tu reporte personalizado..."
      userName={userName}
    />
    <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Procesando evaluación</p>
          <p className="text-sm text-muted-foreground">Analizando factores clínicos...</p>
        </div>
      </div>
    </div>
  </div>
);

export default ProcessingStep;
