import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";

interface RiskAssessmentProps {
  evaluation: any;
}

const RiskAssessment = ({ evaluation }: RiskAssessmentProps) => {
  const getRiskIcon = () => {
    switch (evaluation.risk.label) {
      case "Bajo":
        return <CheckCircle2 className="h-12 w-12 text-success" />;
      case "Medio":
        return <AlertTriangle className="h-12 w-12 text-warning" />;
      case "Alto":
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      default:
        return null;
    }
  };

  const getRiskBadgeVariant = () => {
    switch (evaluation.risk.label) {
      case "Bajo":
        return "default";
      case "Medio":
        return "secondary";
      case "Alto":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Evaluación de Riesgo</h2>
        <Badge variant={getRiskBadgeVariant() as any} className="text-base px-4 py-2">
          Riesgo {evaluation.risk.label}
        </Badge>
      </div>

      {/* Main Risk Indicator */}
      <div className="mb-8 flex items-center gap-6 rounded-lg bg-muted/30 p-6">
        <div className="flex-shrink-0">
          {getRiskIcon()}
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold">{evaluation.successProbability}%</span>
            <span className="text-muted-foreground">probabilidad de éxito</span>
          </div>
          <Progress value={evaluation.successProbability} className="h-3" />
        </div>
      </div>

      {/* Factors Analysis */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Factores Analizados
        </h3>
        <div className="space-y-3">
          {evaluation.factors.map((factor: any, index: number) => (
            <div key={index} className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">{factor.name}</span>
                <span className="text-sm text-muted-foreground">{factor.value}</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress 
                  value={factor.impact} 
                  className="h-2 flex-1" 
                />
                <span className={`text-sm font-semibold ${
                  factor.impact > 20 ? 'text-destructive' : 
                  factor.impact > 10 ? 'text-warning' : 
                  'text-success'
                }`}>
                  {factor.impact > 0 ? `+${factor.impact}%` : 'Óptimo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 space-y-3">
        <h3 className="font-semibold text-lg">Recomendaciones Clínicas</h3>
        {evaluation.recommendations.map((rec: any, index: number) => (
          <div key={index} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="mb-2 font-medium text-sm">{rec.text}</p>
            <p className="text-xs text-muted-foreground italic">
              <strong>Evidencia:</strong> {rec.evidence}
            </p>
          </div>
        ))}
        {evaluation.recommendations.length === 0 && (
          <div className="rounded-lg border border-success/20 bg-success/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Perfil óptimo para implante. Proceder con protocolo estándar.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskAssessment;
