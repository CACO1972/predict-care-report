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
import SuccessGauge from "./SuccessGauge";
import RiskFactorBars from "./RiskFactorBars";
import NextStepsCards from "./NextStepsCards";
import PremiumReportSection from "./PremiumReportSection";

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

        {/* Metodología Científica y Validez Clínica */}
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

        {/* Premium Report Section with Ebook + Smile Simulation */}
        <PremiumReportSection 
          patientName={evaluation.patient}
          uploadedImage={evaluation.uploadedImage}
          pronosticoLabel={evaluation.pronosticoLabel}
        />

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
