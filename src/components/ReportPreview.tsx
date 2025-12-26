import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, CheckCircle2, AlertCircle, TrendingUp, 
  Calendar, User, Heart, Bone, Stethoscope, ArrowRight, Phone,
  Scan, Activity, Target, CircleAlert, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SynergyFactors from "./SynergyFactors";
import TreatmentInfographic from "./TreatmentInfographic";

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

  // Información educativa sobre el proceso
  const nextStepsInfo = [
    {
      icon: Calendar,
      title: "Agenda tu consulta",
      description: "Lleva este reporte a tu cita con el especialista para una evaluación presencial completa."
    },
    {
      icon: Stethoscope,
      title: "Evaluación clínica",
      description: "El especialista realizará un examen físico y radiográfico para confirmar el diagnóstico."
    },
    {
      icon: Heart,
      title: "Plan personalizado",
      description: "Recibirás un plan de tratamiento adaptado a tus necesidades específicas."
    }
  ];

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

        {/* Resultado Principal - Pronóstico */}
        <div className={cn(
          "rounded-2xl p-6 text-center border",
          isWarning 
            ? "bg-warning/5 border-warning/20" 
            : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center justify-center gap-2 mb-3">
            {isWarning ? (
              <AlertCircle className="h-6 w-6 text-warning" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
            <span className={cn(
              "text-xl sm:text-2xl font-bold",
              isWarning ? "text-warning" : "text-primary"
            )}>
              {evaluation.pronosticoLabel || 'Pronóstico Favorable'}
            </span>
          </div>
          
          <p className="text-foreground/80 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-4">
            {evaluation.pronosticoMessage || 'Tu perfil muestra buenas condiciones para el tratamiento con implantes.'}
          </p>

          {/* Indicador visual */}
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-8 sm:w-10 h-2 rounded-full transition-all",
                  level <= (isWarning ? 2 : 3)
                    ? (isWarning ? "bg-warning" : "bg-primary")
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">
              Éxito esperado: <span className={cn("font-semibold", isWarning ? "text-warning" : "text-primary")}>{evaluation.successProbability}%</span>
            </span>
          </div>
        </div>

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

        {/* Factores Evaluados */}
        {evaluation.factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Factores analizados</h4>
            <div className="grid gap-2">
              {evaluation.factors.map((factor, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <span className="text-sm text-foreground">{factor.name}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    factor.value === 'Alto' 
                      ? "bg-warning/20 text-warning" 
                      : factor.value === 'Medio'
                      ? "bg-primary/20 text-primary"
                      : "bg-green-500/20 text-green-600"
                  )}>
                    {factor.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {evaluation.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Recomendaciones personalizadas</h4>
            <div className="space-y-2">
              {evaluation.recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-primary/5 rounded-xl border-l-2 border-primary"
                >
                  <p className="font-medium text-sm text-foreground mb-1">{rec.text}</p>
                  <p className="text-xs text-muted-foreground">{rec.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximos pasos - NUEVO */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Próximos pasos</h4>
          <div className="space-y-3">
            {nextStepsInfo.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-background" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Agendar consulta */}
        <div className="bg-foreground rounded-xl p-6 text-center space-y-4">
          <p className="text-background font-medium">
            ¿Quieres tomar hora presencial o primero una videollamada para hablar con el especialista?
          </p>
          <p className="text-background/70 text-sm">
            Él ya tendrá tus resultados estudiados.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href="https://wa.me/56912345678?text=Hola,%20quiero%20agendar%20una%20hora" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-background text-foreground hover:bg-background/90 transition-colors font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Agendar por WhatsApp
            </a>
            <a 
              href="https://www.dentalink.cl/clinicamiro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-background/30 text-background hover:bg-background/10 transition-colors font-medium"
            >
              <Calendar className="w-4 h-4" />
              Agendar online
            </a>
          </div>
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
