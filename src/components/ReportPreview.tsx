import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, CheckCircle2, AlertCircle, TrendingUp, 
  Calendar, User, Heart, Bone, Stethoscope, ArrowRight,
  Scan, Activity, Target, CircleAlert, Sparkles, Crown, CreditCard, Lock, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SynergyFactors from "./SynergyFactors";
import TreatmentInfographic from "./TreatmentInfographic";
import ShareButtons from "./ShareButtons";
import UrgencyCounter from "./UrgencyCounter";
import SuccessGauge from "./SuccessGauge";
import RiskFactorBars from "./RiskFactorBars";
import NextStepsCards from "./NextStepsCards";

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
    nTeeth?: number; // Number of teeth to rehabilitate
  };
}

const ReportPreview = ({ evaluation }: ReportPreviewProps) => {
  const handleDownload = () => {
    toast.success("Generando reporte PDF", {
      description: "El reporte clínico se descargará en unos momentos"
    });
  };

  const pronosticoColor = evaluation.pronosticoColor || 'success';
  const isWarning = pronosticoColor === 'warning';

  // Remove old nextStepsInfo - now using NextStepsCards component

  return (
    <Card className="overflow-hidden border border-border rounded-2xl shadow-sm">
      {/* Header minimalista */}
      <div className="p-6 border-b border-border bg-background">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
              <FileText className="h-5 w-5 text-background" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Reporte de Evaluación</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>ID: {evaluation.id}</span>
                <span>•</span>
                <span>{evaluation.date}</span>
              </div>
            </div>
          </div>
          <Button onClick={handleDownload} size="sm" className="gap-2 rounded-xl bg-foreground text-background hover:bg-foreground/90">
            <Download className="h-4 w-4" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-background">
        {/* Paciente */}
        {evaluation.patient && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Paciente: <strong className="text-foreground">{evaluation.patient}</strong></span>
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

        {/* Share Buttons - Virality */}
        <ShareButtons 
          patientName={evaluation.patient}
          successProbability={evaluation.successProbability}
          pronosticoLabel={evaluation.pronosticoLabel}
        />

        {/* Imagen y análisis de IA estructurado */}
        {evaluation.uploadedImage && (
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

        {/* Qué significa tu resultado - NUEVO */}
        <div className="bg-muted/30 rounded-xl p-5 space-y-3">
          <h4 className="font-semibold text-foreground">¿Qué significa tu resultado?</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            {isWarning ? (
              <>
                <p>Tu evaluación indica que hay algunos factores que podrían requerir atención especial antes o durante el tratamiento con implantes.</p>
                <p><strong className="text-foreground">Esto no significa que no puedas recibir implantes</strong>, sino que tu especialista diseñará un plan personalizado considerando estos factores.</p>
              </>
            ) : (
              <>
                <p>Tu evaluación indica que tienes buenas condiciones generales para recibir implantes dentales.</p>
                <p><strong className="text-foreground">Esto es una excelente noticia</strong> y significa que el proceso debería desarrollarse de manera favorable con los cuidados adecuados.</p>
              </>
            )}
          </div>
        </div>

        {/* Synergy Factors Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Análisis de Factores Combinados</h4>
          <SynergyFactors 
            synergies={evaluation.synergies || []} 
          />
        </div>

        {/* Treatment Infographic */}
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

        {/* Factores Evaluados - Gráfico de Barras */}
        {evaluation.factors.length > 0 && (
          <RiskFactorBars factors={evaluation.factors} />
        )}

        {/* Recomendaciones con Cards */}
        {evaluation.recommendations.length > 0 && (
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

        {/* Próximos pasos - Cards con iconos grandes */}
        <NextStepsCards />

        {/* Premium Report CTA with Paywall */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 space-y-4">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-6 h-6 text-primary" />
              <h4 className="text-xl font-bold text-foreground">Reporte Premium Completo</h4>
            </div>
            
            {/* Blurred preview of premium content */}
            <div className="relative mb-4 rounded-xl overflow-hidden">
              <div className="blur-sm opacity-50 pointer-events-none p-4 bg-muted/30 space-y-2">
                <div className="h-4 bg-primary/20 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-primary/10 rounded w-full" />
                <div className="h-3 bg-primary/10 rounded w-5/6 mx-auto" />
                <div className="h-3 bg-primary/10 rounded w-4/5" />
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="h-16 bg-primary/10 rounded" />
                  <div className="h-16 bg-primary/10 rounded" />
                </div>
              </div>
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Contenido Premium</p>
                </div>
              </div>
            </div>
            
            <p className="text-center text-muted-foreground text-sm mb-4">
              Desbloquea el análisis completo con recomendaciones del especialista
            </p>

            <ul className="space-y-2 mb-4">
              {[
                "Análisis detallado de tu caso clínico",
                "Plan de tratamiento paso a paso",
                "Estimación de costos y tiempos reales",
                "Consulta prioritaria con el especialista"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            
            {/* Urgency Counter */}
            <UrgencyCounter className="mb-4" />

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground line-through">$49.990</span>
                <span className="text-3xl font-bold text-foreground">$29.990</span>
                <span className="text-sm text-muted-foreground">CLP</span>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-bold rounded-full">-40%</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <CreditCard className="w-3 h-3" />
                Hasta 3 cuotas sin interés
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="https://mpago.li/2jpxDi2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#009ee3] text-white hover:bg-[#007bb5] transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02]"
                >
                  <CreditCard className="w-5 h-5" />
                  Pagar con MercadoPago
                </a>
                <a 
                  href="https://www.flow.cl/uri/htBg1Fpys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#00b140] text-white hover:bg-[#009933] transition-all duration-300 font-semibold shadow-lg hover:scale-[1.02]"
                >
                  <CreditCard className="w-5 h-5" />
                  Pagar con Flow
                </a>
              </div>
            </div>
          </div>
        </div>

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
                Esta evaluación utiliza un motor de riesgo basado en literatura científica validada. Sin embargo, es orientativa y debe complementarse con una evaluación clínica presencial.
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

        {/* CTA - Agendar consulta */}
        <div className="bg-foreground rounded-xl p-6 text-center space-y-4">
          <p className="text-background font-medium">
            ¿Listo para dar el siguiente paso?
          </p>
          <p className="text-background/70 text-sm">
            Agenda tu consulta y el especialista ya tendrá tus resultados estudiados.
          </p>
          <a 
            href="https://www.dentalink.cl/clinicamiro" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background text-foreground hover:bg-background/90 transition-colors font-medium"
          >
            <Calendar className="w-4 h-4" />
            Agendar Consulta Online
          </a>
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-4 text-center space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Validado por Clínica Miró • Sistema ImplantX
          </p>
          <p className="text-xs text-muted-foreground/70">
            Este reporte es orientativo. La evaluación final debe ser realizada por un especialista.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReportPreview;
