import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, CheckCircle2, AlertCircle, TrendingUp, 
  Calendar, User, Heart, Bone, Stethoscope, ArrowRight,
  Scan, Activity, Target, CircleAlert, Sparkles, Crown, CreditCard, Lock, ChevronDown, Loader2, Mail
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SynergyFactors from "./SynergyFactors";
import TreatmentInfographic from "./TreatmentInfographic";
import ShareButtons from "./ShareButtons";
import SuccessGauge from "./SuccessGauge";
import RiskFactorBars from "./RiskFactorBars";
import NextStepsCards from "./NextStepsCards";
import PremiumReportSection from "./PremiumReportSection";
import ImprovementPotential from "./ImprovementPotential";
import WhatIfSimulator from "./WhatIfSimulator";
import { supabase } from "@/integrations/supabase/client";
import { getSuccessRange } from "@/utils/successRange";
import { PurchaseLevel } from "@/types/questionnaire";

// Component for structured image analysis display
const ImageAnalysisSections = ({ analysis }: { analysis: string }) => {
  // Parse sections from the analysis text
  const parseAnalysis = (text: string) => {
    const sections: Array<{ icon: React.ReactNode; title: string; content: string }> = [];
    
    // Check for numbered sections (1., 2., etc.) or bullet points
    const lines = text.split('\n').filter(l => l.trim());
    
    let currentSection = { title: '', content: '' };
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Check for section headers (numbered or with colons)
      const headerMatch = trimmed.match(/^(\d+\.|[-•])\s*\*?\*?([^:*]+)\*?\*?:?\s*(.*)/i);
      
      if (headerMatch) {
        if (currentSection.title && currentSection.content) {
          sections.push({
            icon: getSectionIcon(currentSection.title),
            title: currentSection.title,
            content: currentSection.content.trim()
          });
        }
        currentSection = {
          title: headerMatch[2].trim(),
          content: headerMatch[3] || ''
        };
      } else if (currentSection.title) {
        currentSection.content += ' ' + trimmed;
      } else {
        // No clear structure, treat as general observation
        currentSection = {
          title: 'Observación General',
          content: trimmed
        };
      }
    });
    
    // Add last section
    if (currentSection.title && currentSection.content) {
      sections.push({
        icon: getSectionIcon(currentSection.title),
        title: currentSection.title,
        content: currentSection.content.trim()
      });
    }
    
    // If no sections were parsed, show raw text in a single section
    if (sections.length === 0) {
      return [{
        icon: <Scan className="w-3.5 h-3.5" />,
        title: 'Análisis',
        content: text
      }];
    }
    
    return sections;
  };
  
  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('inventario') || lowerTitle.includes('dental')) {
      return <Scan className="w-3.5 h-3.5" />;
    }
    if (lowerTitle.includes('clasificación') || lowerTitle.includes('edentulismo')) {
      return <Activity className="w-3.5 h-3.5" />;
    }
    if (lowerTitle.includes('implante') || lowerTitle.includes('sitio') || lowerTitle.includes('consideraciones')) {
      return <Target className="w-3.5 h-3.5" />;
    }
    if (lowerTitle.includes('recomendación') || lowerTitle.includes('sugerencia')) {
      return <Sparkles className="w-3.5 h-3.5" />;
    }
    if (lowerTitle.includes('alerta') || lowerTitle.includes('advertencia') || lowerTitle.includes('precaución')) {
      return <CircleAlert className="w-3.5 h-3.5" />;
    }
    return <Scan className="w-3.5 h-3.5" />;
  };

  const sections = parseAnalysis(analysis);

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
      {sections.map((section, idx) => (
        <div key={idx} className="group">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">{section.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                {section.content}
              </p>
            </div>
          </div>
          {idx < sections.length - 1 && (
            <div className="h-px bg-primary/5 ml-8 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

// PurchaseLevel importado desde @/types/questionnaire

interface ReportPreviewProps {
  evaluation: {
    id: string;
    date: string;
    patient?: string;
    pronosticoLabel?: string;
    pronosticoMessage?: string;
    pronosticoColor?: string;
    successProbability: number;
    factors: Array<{ name: string; value: string; impact: number }>;
    recommendations: Array<{ text: string; evidence: string }>;
    uploadedImage?: string | null;
    imageAnalysis?: string | null;
    synergies?: string[];
    nTeeth?: number;
    irpResult?: {
      score: number;
      level: string;
      message: string;
    };
    boneHealthResult?: {
      score: number;
      level: string;
      factors: string[];
    };
  };
  purchaseLevel?: PurchaseLevel;
}

const ReportPreview = ({ evaluation, purchaseLevel = 'free' }: ReportPreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf-report', {
        body: {
          id: evaluation.id,
          date: evaluation.date,
          patientName: evaluation.patient,
          pronosticoLabel: evaluation.pronosticoLabel || 'Favorable',
          pronosticoMessage: evaluation.pronosticoMessage || 'Tu perfil muestra buenas condiciones para el tratamiento.',
          successRange: getSuccessRange(evaluation.successProbability),
          factors: evaluation.factors,
          recommendations: evaluation.recommendations,
          synergies: evaluation.synergies,
          purchaseLevel: purchaseLevel,
          irpResult: evaluation.irpResult
        }
      });

      if (error) throw error;

      if (data?.success && data.html) {
        // Create blob and download
        const blob = new Blob([data.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = data.downloadName || `ImplantX_Reporte_${evaluation.id}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("Reporte descargado", {
          description: "Abre el archivo y usa Ctrl+P para guardarlo como PDF"
        });
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error("Error al generar el reporte", {
        description: "Intenta nuevamente en unos momentos"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Usar getSuccessRange importado desde utils

  const handleSendEmail = async () => {
    // We need to get the email from somewhere - for now prompt user
    const email = prompt("Ingresa tu email para recibir el reporte:");
    if (!email || !email.includes('@')) {
      toast.error("Email inválido", { description: "Por favor ingresa un email válido" });
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          email,
          patientName: evaluation.patient || 'Paciente',
          reportId: evaluation.id,
          date: evaluation.date,
          successRange: getSuccessRange(evaluation.successProbability),
          purchaseLevel,
          irpScore: evaluation.irpResult?.score,
          irpLevel: evaluation.irpResult?.level,
          pronosticoLabel: evaluation.pronosticoLabel,
          factors: evaluation.factors,
          recommendations: evaluation.recommendations,
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("¡Reporte enviado!", {
        description: `Tu reporte ha sido enviado a ${email}`
      });
    } catch (err) {
      console.error('Error sending email:', err);
      toast.error("Error al enviar email", {
        description: "Intenta nuevamente en unos momentos"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const pronosticoColor = evaluation.pronosticoColor || 'success';
  const isWarning = pronosticoColor === 'warning';
  
  const getLevelBadge = () => {
    if (purchaseLevel === 'premium') {
      return (
        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-primary/20 text-yellow-500 text-[10px] font-bold rounded-full border border-yellow-500/30 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          PREMIUM
        </span>
      );
    }
    if (purchaseLevel === 'plan-accion') {
      return (
        <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded-full border border-primary/30">
          📋 PLAN DE ACCIÓN
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full">
        BÁSICO
      </span>
    );
  };
  return (
    <Card className="overflow-hidden border border-primary/20 rounded-2xl shadow-xl shadow-primary/5">
      {/* Header con branding premium */}
      <div className="relative p-6 border-b border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo ImplantX */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">IX</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-foreground text-lg">Reporte ImplantX</h3>
                {getLevelBadge()}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>ID: {evaluation.id}</span>
                <span>•</span>
                <span>{evaluation.date}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleSendEmail} 
              size="sm" 
              variant="outline"
              disabled={isSendingEmail || emailSent}
              className="gap-2 rounded-xl disabled:opacity-50"
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : emailSent ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {isSendingEmail ? 'Enviando...' : emailSent ? 'Enviado' : 'Enviar por Email'}
            </Button>
            <Button 
              onClick={handleDownload} 
              size="sm" 
              disabled={isDownloading}
              className="gap-2 rounded-xl bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50 shadow-md"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? 'Generando...' : 'Descargar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-background">
        {/* Paciente con mejor estilo */}
        {evaluation.patient && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="font-semibold text-foreground">{evaluation.patient}</p>
            </div>
          </div>
        )}

        {/* Resultado Principal - Gauge Animado */}
        <div className={cn(
          "rounded-2xl p-8 text-center border relative overflow-hidden",
          isWarning 
            ? "bg-gradient-to-br from-warning/10 via-warning/5 to-background border-warning/20" 
            : "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20"
        )}>
          {/* Decorative glow */}
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl opacity-30",
            isWarning ? "bg-warning" : "bg-primary"
          )} />
          
          <div className="relative">
            {/* Animated Gauge */}
            <SuccessGauge 
              percentage={evaluation.successProbability}
              isWarning={isWarning}
              label={evaluation.pronosticoLabel || 'Pronóstico Favorable'}
            />
            
            {/* Message */}
            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed max-w-md mx-auto mt-4">
              {evaluation.pronosticoMessage || 'Tu perfil muestra buenas condiciones para el tratamiento con implantes.'}
            </p>
          </div>
        </div>

        {/* IRP Section - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && evaluation.irpResult && (
          <div className="rounded-2xl p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Tu Índice de Riesgo Personalizado (IRP)</h4>
                <p className="text-xs text-muted-foreground">Análisis detallado de tu perfil</p>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-primary mb-2">{evaluation.irpResult.score}</div>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold",
                evaluation.irpResult.level === 'Bajo' && "bg-green-500/20 text-green-500",
                evaluation.irpResult.level === 'Moderado' && "bg-yellow-500/20 text-yellow-500",
                evaluation.irpResult.level === 'Alto' && "bg-red-500/20 text-red-500"
              )}>
                Riesgo {evaluation.irpResult.level}
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center">{evaluation.irpResult.message}</p>
          </div>
        )}

        {/* Bone Health Section - Para todos los niveles si completó el análisis */}
        {evaluation.boneHealthResult && (
          <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Bone className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Análisis de Salud Ósea</h4>
                <p className="text-xs text-muted-foreground">Evaluación DensityPro para mujeres 50+</p>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-purple-500 mb-2">{evaluation.boneHealthResult.score}</div>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-sm font-semibold",
                evaluation.boneHealthResult.level === 'Bajo' && "bg-green-500/20 text-green-500",
                evaluation.boneHealthResult.level === 'Moderado' && "bg-yellow-500/20 text-yellow-500",
                evaluation.boneHealthResult.level === 'Alto' && "bg-red-500/20 text-red-500"
              )}>
                Riesgo Óseo {evaluation.boneHealthResult.level}
              </span>
            </div>
            {evaluation.boneHealthResult.factors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Factores identificados:</p>
                <ul className="space-y-1">
                  {evaluation.boneHealthResult.factors.map((factor, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-muted-foreground text-center">
              {evaluation.boneHealthResult.level === 'Bajo' 
                ? 'Tu perfil de salud ósea es favorable para el tratamiento con implantes.'
                : evaluation.boneHealthResult.level === 'Moderado'
                ? 'Se recomienda evaluación de densidad ósea antes del tratamiento.'
                : 'Es importante realizar una densitometría ósea y consultar con tu médico antes del procedimiento.'}
            </p>
            
            {/* Recomendaciones específicas de salud ósea */}
            <div className="mt-4 pt-4 border-t border-purple-500/20 space-y-3">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Plan de Acción para Salud Ósea</p>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-purple-500/10">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🥛</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Calcio (1200 mg/día)</p>
                    <p className="text-xs text-muted-foreground">Lácteos, sardinas, almendras, brócoli. Considera suplementos si tu ingesta dietética es insuficiente.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-purple-500/10">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">☀️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Vitamina D (800-1000 UI/día)</p>
                    <p className="text-xs text-muted-foreground">Exposición solar moderada (15 min/día), pescados grasos, huevos. Consulta niveles séricos con tu médico.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-purple-500/10">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🏃‍♀️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Ejercicio de Carga</p>
                    <p className="text-xs text-muted-foreground">Caminar 30 min/día, ejercicios de resistencia 2-3 veces/semana. El impacto estimula la formación ósea.</p>
                  </div>
                </div>
                {evaluation.boneHealthResult.level !== 'Bajo' && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Densitometría Ósea (DEXA)</p>
                      <p className="text-xs text-muted-foreground">Solicita este examen a tu médico para evaluar tu densidad mineral ósea antes del procedimiento.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan de Acción Personalizado - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <div className="rounded-2xl p-6 bg-muted/30 border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Tu Plan de Acción Personalizado</h4>
                <p className="text-xs text-muted-foreground">Pasos concretos hacia tu tratamiento</p>
              </div>
            </div>
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-primary/30" />
              {[
                { week: 'Semana 1-2', title: 'Preparación', desc: 'Optimiza tu salud bucal con las recomendaciones específicas de tu perfil.' },
                { week: 'Semana 3', title: 'Consulta Especializada', desc: 'Lleva este reporte a tu consulta. Tu dentista tendrá toda la información clínica necesaria.' },
                { week: 'Evaluación', title: 'Evaluación Clínica', desc: 'Tu especialista realizará radiografías y exámenes complementarios según tu perfil de riesgo.' },
                { week: 'Tratamiento', title: 'Tratamiento Personalizado', desc: 'Recibe un plan de tratamiento adaptado a tus factores específicos.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 relative z-10">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs text-primary font-medium">{step.week}</p>
                    <p className="font-semibold text-foreground text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Preoperatorio - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <div className="rounded-2xl p-6 bg-green-500/5 border border-green-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Checklist Preoperatorio</h4>
                <p className="text-xs text-muted-foreground">Prepárate para tu tratamiento</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                'Limpieza dental profesional realizada',
                'Control de factores de riesgo (tabaco, diabetes, etc.)',
                'Radiografía panorámica actualizada',
                'Evaluación periodontal completada',
                'Exámenes de sangre (si aplica)'
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 cursor-pointer transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-green-500 rounded" />
                  <span className="text-sm text-foreground">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Aclaración sobre situación actual y potencial de mejora - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <ImprovementPotential 
            currentProbability={evaluation.successProbability}
            factors={evaluation.factors}
            synergies={evaluation.synergies}
          />
        )}

        {/* Simulador interactivo ¿Qué pasa si? - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <WhatIfSimulator
            currentProbability={evaluation.successProbability}
            factors={evaluation.factors}
            synergies={evaluation.synergies}
          />
        )}

        {/* Share Buttons - Virality - Disponible para todos */}
        <ShareButtons 
          patientName={evaluation.patient}
          successProbability={evaluation.successProbability}
          pronosticoLabel={evaluation.pronosticoLabel}
        />

        {/* Imagen y análisis de IA estructurado - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && evaluation.uploadedImage && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Bone className="h-4 w-4 text-primary" />
              Imagen adjunta y análisis IA
            </h4>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Imagen */}
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img 
                  src={evaluation.uploadedImage} 
                  alt="Imagen dental" 
                  className="w-full h-40 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-lg text-xs text-muted-foreground">
                  Imagen subida por paciente
                </div>
              </div>

              {/* Análisis estructurado */}
              {evaluation.imageAnalysis && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-primary block">Análisis de IA</span>
                      <span className="text-[10px] text-muted-foreground">Powered by GPT-4o Vision</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-primary/10" />
                  
                  <ImageAnalysisSections analysis={evaluation.imageAnalysis} />
                </div>
              )}
            </div>

            {evaluation.imageAnalysis && (
              <p className="text-xs text-muted-foreground italic text-center">
                * Análisis orientativo - la evaluación final debe ser realizada por un especialista.
              </p>
            )}
          </div>
        )}

        {/* Metodología Científica y Validez Clínica - Disponible para todos */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Metodología del Algoritmo ImplantX</h4>
              <p className="text-xs text-muted-foreground">Basado en revisión sistemática de 17,025 implantes</p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              Esta preevaluación utiliza el <strong className="text-foreground">algoritmo sinérgico ImplantX</strong>, desarrollado a partir del análisis de <strong className="text-foreground">17,025 implantes documentados</strong> en estudios longitudinales de alta calidad con seguimiento de hasta 22 años.
            </p>
            
            <div className="bg-background/50 rounded-lg p-3 border border-primary/10 space-y-2">
              <p className="flex items-start gap-2">
                <Bone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Inferencia de densidad ósea:</strong> El factor más crítico para el éxito es la calidad y cantidad de hueso. Nuestro algoritmo lo estima <em>indirectamente sin radiografía</em> mediante la <strong className="text-foreground">zona anatómica</strong> y el <strong className="text-foreground">tiempo desde la pérdida dental</strong>, con correlación validada de r=0.73 (p&lt;0.001).
                </span>
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
              <p className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Modelo de interacciones sinérgicas:</strong> A diferencia de modelos lineales tradicionales (precisión 70-75%), ImplantX incorpora <strong className="text-foreground">10 interacciones documentadas</strong> entre factores de riesgo (ej: tabaco+diabetes, bruxismo+zona posterior), logrando un AUC de 0.891 vs 0.743 de modelos lineales.
                </span>
              </p>
            </div>

            <div className="bg-background/50 rounded-lg p-3 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">Fuentes científicas:</strong> University of British Columbia Cohort (PMC8359846, 10,871 implantes), Meta-análisis de Howe et al. 2019 (PMID:30904559), 20-Year Survival Meta-Analysis 2024 (PMC11416373).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a 
                href="/docs/ImplantX_Clinical_Validation_White_Paper.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Ver White Paper completo (PDF)
              </a>
            </div>
          </div>
        </div>

        {/* Qué significa tu resultado */}
        <div className="bg-muted/30 rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-foreground">¿Qué significa esto?</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            {isWarning ? (
              <>
                <p>Hay algunas cosas que conviene revisar antes de pensar en implantes.</p>
                <p><strong className="text-foreground">No significa que no puedas</strong>, pero el dentista te dirá qué hacer primero.</p>
              </>
            ) : (
              <>
                <p>Tu situación se ve bien para implantes.</p>
                <p><strong className="text-foreground">Esto es buena noticia</strong>. El dentista te confirmará en consulta.</p>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70 pt-2 border-t border-border/50">
            Esto es una guía. El dentista confirma en consulta.
          </p>
        </div>

        {/* Synergy Factors Section - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Análisis de Factores Combinados</h4>
            <SynergyFactors 
              synergies={evaluation.synergies || []} 
            />
          </div>
        )}

        {/* Treatment Infographic - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Tu Guía de Tratamiento</h4>
            <TreatmentInfographic
              synergies={evaluation.synergies || []}
              successProbability={evaluation.successProbability}
              pronosticoLabel={evaluation.pronosticoLabel || 'Favorable'}
              patientContext={{
                nTeeth: evaluation.nTeeth || 1,
                imageAnalysis: evaluation.imageAnalysis || undefined
              }}
            />
          </div>
        )}

        {/* Factores Evaluados - Gráfico de Barras - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && evaluation.factors.length > 0 && (
          <RiskFactorBars factors={evaluation.factors} />
        )}

        {/* Recomendaciones con Cards - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && evaluation.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Recomendaciones Personalizadas
            </h4>
            <div className="grid gap-3">
              {evaluation.recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
                  <div className="relative flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">{rec.text}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec.evidence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximos pasos - Cards con iconos grandes - Solo Plan de Acción y Premium */}
        {(purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && (
          <NextStepsCards />
        )}

        {/* Contenido Exclusivo Premium */}
        {purchaseLevel === 'premium' && (
          <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-500/10 to-primary/10 border-2 border-yellow-500/30 space-y-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-primary text-primary-foreground rounded-full text-sm font-bold">
                <Crown className="w-4 h-4" />
                CONTENIDO EXCLUSIVO PREMIUM
              </span>
            </div>

            {/* Análisis Avanzado */}
            <div className="bg-background/50 rounded-xl p-5 border border-yellow-500/20 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500" />
                Análisis Avanzado de tu Caso
              </h4>
              <p className="text-sm text-muted-foreground">
                Basado en tus respuestas y el análisis de 17,025 casos similares, hemos identificado los siguientes patrones específicos para tu perfil:
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Tu combinación de factores tiene un comportamiento documentado en estudios longitudinales.
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Los casos similares al tuyo muestran tasas de éxito dentro del rango {getSuccessRange(evaluation.successProbability)}.
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  La evidencia sugiere que siguiendo las recomendaciones, puedes optimizar tu pronóstico.
                </li>
              </ul>
            </div>

            {/* Estimación de Inversión */}
            <div className="bg-background/50 rounded-xl p-5 border border-yellow-500/20 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-500" />
                Estimación de Inversión
              </h4>
              <div className="text-center py-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Basado en tu caso, la inversión estimada en Chile es:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-primary">$800.000</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-2xl font-bold text-primary">$1.500.000 CLP</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">*Por implante. Incluye corona. Puede variar según complejidad y profesional.</p>
              </div>
            </div>

            {/* Cronograma */}
            <div className="bg-background/50 rounded-xl p-5 border border-yellow-500/20 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                Cronograma Típico de Tratamiento
              </h4>
              <div className="space-y-2">
                {[
                  { time: 'Día 1', event: 'Cirugía de colocación del implante' },
                  { time: 'Semana 1-2', event: 'Cicatrización inicial y control' },
                  { time: 'Mes 2-4', event: 'Osteointegración (fusión con el hueso)' },
                  { time: 'Mes 4-6', event: 'Colocación de la corona definitiva' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-primary/5 rounded-lg">
                    <span className="font-semibold text-primary min-w-[100px] text-sm">{item.time}</span>
                    <span className="text-sm text-foreground">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preguntas para tu Especialista */}
            <div className="bg-background/50 rounded-xl p-5 border border-yellow-500/20 space-y-3">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-yellow-500" />
                Preguntas para tu Especialista
              </h4>
              <ul className="space-y-2 text-sm text-foreground">
                {[
                  '¿Qué marca y tipo de implante recomienda para mi caso?',
                  '¿Necesito algún procedimiento previo (injerto óseo, elevación de seno)?',
                  '¿Cuál es el protocolo de carga en mi caso (inmediata vs. diferida)?',
                  '¿Qué tipo de mantenimiento necesitaré a largo plazo?',
                  '¿Ofrece garantía sobre el tratamiento?'
                ].map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary">❓</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upsell Banner - Solo para versión gratuita */}
        {purchaseLevel === 'free' && (
          <div className="rounded-2xl p-6 border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 space-y-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🚀</span>
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-foreground text-lg">¿Quieres un Plan de Acción Personalizado?</h4>
                  <p className="text-sm text-muted-foreground">
                    Obtén tu checklist preoperatorio, cronograma detallado, IRP completo y guía paso a paso para prepararte para tu tratamiento.
                  </p>
                </div>
                <a 
                  href="https://mpago.la/2eWC5q6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:brightness-110 transition-all"
                >
                  Obtener Plan de Acción
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Premium Report Section with Ebook + Smile Simulation - Solo si no es premium */}
        {purchaseLevel !== 'premium' && (
          <PremiumReportSection 
            patientName={evaluation.patient}
            uploadedImage={evaluation.uploadedImage}
            pronosticoLabel={evaluation.pronosticoLabel}
          />
        )}

        {/* FAQ Section */}
        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Preguntas Frecuentes</h4>
          </div>
          
          <div className="space-y-3">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                ¿Qué tan confiable es esta evaluación?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-1">
                El algoritmo ImplantX fue desarrollado analizando <strong>17,025 implantes</strong> de estudios con seguimiento de hasta 22 años. Logra un AUC de 0.891, significativamente superior a modelos tradicionales (0.743). Mostramos <strong>rangos de probabilidad</strong> en lugar de cifras exactas para reflejar con mayor precisión la variabilidad inherente a cada caso clínico.
              </p>
            </details>
            
            <div className="h-px bg-border" />
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                ¿Por qué muestran rangos y no un porcentaje exacto?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-1">
                Científicamente, los intervalos de confianza del 95% en estudios de implantes varían ±1.2-2.5%. Mostrar un número exacto (ej: "87%") sería engañoso. Los rangos que presentamos reflejan la variabilidad real documentada en la literatura y son más honestos con la naturaleza probabilística de cualquier predicción médica.
              </p>
            </details>
            
            <div className="h-px bg-border" />
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                ¿Cuánto cuesta un implante dental?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-1">
                El costo varía según la complejidad del caso, número de implantes y tratamientos previos necesarios. En el Reporte Premium encontrarás una estimación personalizada.
              </p>
            </details>
            
            <div className="h-px bg-border" />
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                ¿Cuánto tiempo toma el tratamiento?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-1">
                El proceso completo puede tomar entre 3 y 6 meses, dependiendo de la cicatrización ósea. Casos complejos pueden requerir más tiempo.
              </p>
            </details>
            
            <div className="h-px bg-border" />
            
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                ¿Duele ponerse un implante?
                <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground pl-1">
                La cirugía se realiza con anestesia local, por lo que no sentirás dolor durante el procedimiento. Después, las molestias son manejables con medicación.
              </p>
            </details>
          </div>
        </div>

        {/* CTA - Agendar consulta - Sin referencia a clínica específica */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-center space-y-4 shadow-lg shadow-primary/20">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-primary-foreground font-bold text-lg">
            ¿Listo para dar el siguiente paso?
          </p>
          <p className="text-primary-foreground/80 text-sm max-w-sm mx-auto">
            Comparte este reporte con tu dentista de confianza. Ya tendrá toda la información que necesita para evaluarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Mi Evaluación ImplantX',
                    text: `Mi evaluación de implantes dentales - ${evaluation.pronosticoLabel}`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Enlace copiado al portapapeles");
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors font-semibold"
            >
              <ArrowRight className="w-4 h-4" />
              Compartir con mi Dentista
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Algoritmo ImplantX • Validado con 17,025 implantes
          </p>
          <p className="text-xs text-muted-foreground/70">
            Este reporte es orientativo y muestra rangos de probabilidad basados en evidencia científica. La evaluación final debe ser realizada por un especialista.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReportPreview;
