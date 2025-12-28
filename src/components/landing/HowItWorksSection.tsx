import { MessageCircle, ClipboardCheck, FileText } from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    step: "1",
    title: "Responde preguntas",
    description: "Río, nuestra IA, te guía con preguntas simples sobre tu salud bucal",
  },
  {
    icon: ClipboardCheck,
    step: "2",
    title: "Análisis inteligente",
    description: "Evaluamos factores de riesgo basados en evidencia clínica",
  },
  {
    icon: FileText,
    step: "3",
    title: "Recibe tu reporte",
    description: "Obtén un informe personalizado con recomendaciones claras",
  },
];

const HowItWorksSection = () => {
  return (
    <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
      <h2 className="text-center text-lg sm:text-xl font-display text-foreground mb-2">
        ¿Cómo funciona?
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 sm:mb-10">
        3 simples pasos para conocer tu candidatura
      </p>

      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className="relative p-5 sm:p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
          >
            {/* Step number */}
            <div className="absolute -top-3 left-5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              Paso {step.step}
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-primary/20 transition-colors">
              <step.icon className="w-6 h-6 text-primary" />
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Connector line for desktop */}
            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-border to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSection;
