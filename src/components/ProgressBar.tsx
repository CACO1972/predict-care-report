import { Activity, Bone, Heart, Stethoscope, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  currentPhase: 'base' | 'density' | 'health' | 'oral' | 'mapping' | 'complete';
}

const phases = [
  { name: 'Datos', icon: Activity, range: [0, 10] },
  { name: 'Ósea', icon: Bone, range: [11, 20] },
  { name: 'Salud', icon: Heart, range: [21, 50] },
  { name: 'Oral', icon: Stethoscope, range: [51, 70] },
  { name: 'Zona', icon: MapPin, range: [71, 90] },
  { name: 'Listo', icon: Trophy, range: [91, 100] },
];

const ProgressBar = ({ currentStep, totalSteps, currentPhase }: ProgressBarProps) => {
  const progress = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
  
  const currentPhaseData = phases.find(phase => {
    return progress >= phase.range[0] && progress <= phase.range[1];
  }) || phases[0];

  const Icon = currentPhaseData.icon;

  return (
    <div className="w-full space-y-3">
      {/* Phase indicator - Minimalist with Electric Cyan accent */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              {currentPhaseData.name}
            </span>
            <p className="text-xs text-muted-foreground">
              {currentStep}/{totalSteps}
            </p>
          </div>
        </div>
        <span className="text-2xl font-bold text-foreground">
          {progress}<span className="text-accent">%</span>
        </span>
      </div>
      
      {/* Progress bar - Electric Cyan */}
      <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase dots - Accent */}
      <div className="flex justify-between px-1">
        {phases.slice(0, 5).map((phase, index) => {
          const phaseProgress = (index + 1) * 20;
          const isCompleted = progress >= phaseProgress;
          const isCurrent = progress >= phase.range[0] && progress <= phase.range[1];
          
          return (
            <div 
              key={phase.name}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                isCompleted ? "bg-accent" : "bg-muted",
                isCurrent && "ring-2 ring-accent/30 ring-offset-1 ring-offset-background"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;