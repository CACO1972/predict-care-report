import { Calendar, Stethoscope, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NextStepsCards = () => {
  const steps = [
    {
      icon: Calendar,
      title: "1. Agenda tu consulta",
      description: "Lleva este reporte a tu cita con el especialista.",
      color: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500",
    },
    {
      icon: Stethoscope,
      title: "2. Evaluación clínica",
      description: "Examen físico y radiográfico completo.",
      color: "from-purple-500/20 to-purple-600/10",
      iconBg: "bg-purple-500",
    },
    {
      icon: Heart,
      title: "3. Plan personalizado",
      description: "Tratamiento adaptado a tus necesidades.",
      color: "from-primary/20 to-primary/10",
      iconBg: "bg-primary",
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
        <ArrowRight className="w-4 h-4 text-primary" />
        Próximos Pasos
      </h4>
      
      <div className="grid gap-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "group relative overflow-hidden rounded-xl p-4 border border-border/50 transition-all duration-300 hover:border-primary/30 hover:scale-[1.02]",
              `bg-gradient-to-br ${step.color}`
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Decorative gradient blob */}
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
              step.iconBg
            )} />
            
            <div className="relative flex items-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg",
                step.iconBg
              )}>
                <step.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-foreground mb-1">
                  {step.title}
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextStepsCards;