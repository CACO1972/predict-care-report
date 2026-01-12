import { MessageCircle, Upload, FileText, CheckCircle2 } from "lucide-react";

const benefits = [
  {
    icon: CheckCircle2,
    text: "Te dice si hay cosas que pueden complicar",
  },
  {
    icon: CheckCircle2,
    text: "Te ayuda a no perder el viaje",
  },
  {
    icon: CheckCircle2,
    text: "Te dice qué hacer primero (encías, fumar, diabetes, etc.)",
  },
];

const steps = [
  {
    icon: MessageCircle,
    step: "1",
    title: "Cuéntanos de ti",
    description: "Responde unas preguntas cortas sobre tu salud",
  },
  {
    icon: Upload,
    step: "2",
    title: "Sube una foto (opcional)",
    description: "Si tienes radiografía, súbela. Si no, no pasa nada.",
    badge: "Opcional",
  },
  {
    icon: FileText,
    step: "3",
    title: "Recibe tu guía",
    description: "Te decimos qué hacer antes de pensar en implantes",
  },
];

const HowItWorksSection = () => {
  return (
    <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
      {/* ¿Para qué sirve? */}
      <div className="mb-10 sm:mb-12">
        <h2 className="text-center text-lg sm:text-xl font-display text-foreground mb-6">
          ¿Para qué sirve?
        </h2>

        <div className="max-w-lg mx-auto space-y-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm sm:text-base text-foreground">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pasos */}
      <h2 className="text-center text-lg sm:text-xl font-display text-foreground mb-2">
        ¿Cómo funciona?
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-8 sm:mb-10">
        3 pasos simples
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {steps.map((step, index) => (
          <div
            key={step.step}
            className="relative p-4 sm:p-5 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
          >
            {/* Step number */}
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[0.65rem] sm:text-xs font-bold">
              Paso {step.step}
            </div>

            {/* Optional badge */}
            {"badge" in step && step.badge && (
              <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[0.6rem] font-medium border border-border">
                {step.badge}
              </div>
            )}

            {/* Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 mt-2 group-hover:bg-primary/20 transition-colors">
              <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
