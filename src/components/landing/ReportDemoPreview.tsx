import { AlertTriangle, CheckCircle, Clock, TrendingUp, User, Calendar, FileText, Shield } from "lucide-react";

const ReportDemoPreview = () => {
  return (
    <div className="relative bg-[#0A0A0A] text-white font-sans text-xs overflow-hidden rounded-lg border border-[#C9A86C]/30">
      {/* DEMO Badge */}
      <div className="absolute top-3 right-3 z-20">
        <span className="px-2 py-1 bg-[#C9A86C] text-[#0A0A0A] text-[10px] font-bold rounded tracking-wider">
          DEMO
        </span>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#0A0A0A] p-4 border-b border-[#C9A86C]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C9A86C]/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#C9A86C]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#C9A86C] tracking-wide">IMPLANTX</h1>
              <p className="text-[9px] text-white/60">Informe de Pre-Evaluación</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-white/50">
            <p>ID: IMX-2025-0847</p>
            <p>08/02/2025</p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="p-3 bg-[#1E3A5F]/20 border-b border-[#C9A86C]/10">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-[#C9A86C]" />
          <span className="text-white/80 font-medium">María González, 54 años</span>
        </div>
        <p className="text-[9px] text-white/50 mt-1 ml-5">Tratamiento: 2 implantes unitarios (zona 15, 36)</p>
      </div>

      {/* Executive Summary */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-3 h-3 text-[#C9A86C]" />
          <h2 className="text-xs font-semibold text-[#C9A86C]">Resumen Ejecutivo</h2>
        </div>

        {/* Classification Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1E3A5F]/30 rounded-lg p-2 text-center border border-[#C9A86C]/10">
            <p className="text-[9px] text-white/50 mb-1">Clasificación</p>
            <p className="text-xs font-bold text-amber-400">MODERADO</p>
          </div>
          <div className="bg-[#1E3A5F]/30 rounded-lg p-2 text-center border border-[#C9A86C]/10">
            <p className="text-[9px] text-white/50 mb-1">Probabilidad</p>
            <p className="text-xs font-bold text-[#C9A86C]">78%</p>
          </div>
          <div className="bg-[#1E3A5F]/30 rounded-lg p-2 text-center border border-[#C9A86C]/10">
            <p className="text-[9px] text-white/50 mb-1">Índice IRP</p>
            <p className="text-xs font-bold text-emerald-400">7.2</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[9px] text-white/50 mb-1">
            <span>Potencial de Éxito</span>
            <span>78%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#C9A86C] to-amber-500"
              style={{ width: '78%' }}
            />
          </div>
        </div>
      </div>

      {/* Top 3 Risk Factors */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-3 h-3 text-[#C9A86C]" />
          <h2 className="text-xs font-semibold text-[#C9A86C]">Top 3 Factores de Riesgo</h2>
        </div>

        <div className="space-y-2">
          {/* Factor 1 */}
          <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-red-400">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-white/90 truncate">Diabetes No Controlada</p>
              <p className="text-[8px] text-white/50">HbA1c &gt; 8% · Impacto: Alto</p>
            </div>
            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[8px] rounded font-medium">
              CRÍTICO
            </span>
          </div>

          {/* Factor 2 */}
          <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-amber-400">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-white/90 truncate">Bruxismo Severo</p>
              <p className="text-[8px] text-white/50">Sin férula · Impacto: Medio</p>
            </div>
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] rounded font-medium">
              ALERTA
            </span>
          </div>

          {/* Factor 3 */}
          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-yellow-400">3</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-white/90 truncate">Periodontitis Tratada</p>
              <p className="text-[8px] text-white/50">Bajo control · Impacto: Bajo</p>
            </div>
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[8px] rounded font-medium">
              ESTABLE
            </span>
          </div>
        </div>
      </div>

      {/* Preparation Timeline */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3 h-3 text-[#C9A86C]" />
          <h2 className="text-xs font-semibold text-[#C9A86C]">Timeline de Preparación</h2>
        </div>

        <div className="relative pl-4 space-y-3">
          {/* Timeline line */}
          <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-[#C9A86C] via-[#C9A86C]/50 to-transparent" />

          {/* Week 1-2 */}
          <div className="relative">
            <div className="absolute left-[-13px] w-2.5 h-2.5 rounded-full bg-[#C9A86C] border-2 border-[#0A0A0A]" />
            <div className="bg-[#1E3A5F]/20 rounded-lg p-2 border border-[#C9A86C]/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-medium text-[#C9A86C]">Semana 1-2</span>
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-[9px] text-white/70">Control glucémico con endocrinólogo</p>
            </div>
          </div>

          {/* Week 3 */}
          <div className="relative">
            <div className="absolute left-[-13px] w-2.5 h-2.5 rounded-full bg-[#C9A86C]/60 border-2 border-[#0A0A0A]" />
            <div className="bg-[#1E3A5F]/20 rounded-lg p-2 border border-[#C9A86C]/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-medium text-[#C9A86C]">Semana 3</span>
                <Calendar className="w-3 h-3 text-white/40" />
              </div>
              <p className="text-[9px] text-white/70">Fabricación de férula de descarga</p>
            </div>
          </div>

          {/* Week 4 */}
          <div className="relative">
            <div className="absolute left-[-13px] w-2.5 h-2.5 rounded-full bg-[#C9A86C]/30 border-2 border-[#0A0A0A]" />
            <div className="bg-[#1E3A5F]/20 rounded-lg p-2 border border-[#C9A86C]/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-medium text-[#C9A86C]">Semana 4</span>
                <TrendingUp className="w-3 h-3 text-white/40" />
              </div>
              <p className="text-[9px] text-white/70">Re-evaluación y planificación quirúrgica</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gradient-to-r from-[#1E3A5F]/30 to-transparent border-t border-[#C9A86C]/10">
        <div className="flex items-center justify-between">
          <p className="text-[8px] text-white/40">
            Este es un ejemplo del informe completo
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-[#C9A86C]">Ver más →</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDemoPreview;
