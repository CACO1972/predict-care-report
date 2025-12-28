import { ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReportPreviewSection = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto mb-16 sm:mb-24">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl font-display text-foreground mb-2">
          Lo que obtendrás
        </h2>
        <p className="text-muted-foreground text-sm">
          Un reporte personalizado con toda la información que necesitas
        </p>
      </div>

      {/* Report Preview Card */}
      <div className="relative mx-auto max-w-2xl">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl -z-10 scale-110" />

        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 px-5 sm:px-6 py-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  Tu Reporte ImplantX
                </h3>
                <p className="text-xs text-muted-foreground">Evaluación personalizada</p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Success Rate */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-foreground">Probabilidad de éxito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="w-[85%] h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
                <span className="text-sm font-bold text-emerald-400">85%</span>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-foreground">Factores de riesgo</span>
              </div>
              <span className="text-sm text-amber-400 font-medium">2 detectados</span>
            </div>

            {/* Recommendations */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">Recomendaciones</span>
              </div>
              <span className="text-sm text-primary font-medium">Personalizadas</span>
            </div>

            {/* Blur overlay for "locked" content */}
            <div className="relative p-4 rounded-xl bg-background/30 border border-border/30 overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-background/50 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+ Más detalles en tu reporte</span>
              </div>
              <div className="opacity-30">
                <div className="h-3 w-3/4 bg-muted rounded mb-2" />
                <div className="h-3 w-1/2 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <button
              onClick={() => navigate("/evaluacion")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              Obtener mi reporte gratis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewSection;
