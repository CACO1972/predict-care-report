import { cn } from "@/lib/utils";
import rioAvatar from "@/assets/avatar-implantx.png";
import { RioExpression } from "@/hooks/useRioExpression";

interface RioAvatarExpressiveProps {
  expression?: RioExpression;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-40 h-40',
};

const expressionStyles: Record<RioExpression, {
  overlay: string;
  ring: string;
  indicator: string;
  glow: string;
  animation?: string;
}> = {
  smile: {
    overlay: 'bg-gradient-to-t from-emerald-400/20 to-transparent',
    ring: 'ring-[3px] ring-emerald-400/70',
    indicator: 'bg-emerald-400',
    glow: 'bg-emerald-400/40',
    animation: 'animate-pulse',
  },
  neutral: {
    overlay: 'bg-transparent',
    ring: 'ring-2 ring-border/40',
    indicator: 'bg-muted-foreground',
    glow: 'bg-muted/20',
  },
  thinking: {
    overlay: 'bg-gradient-to-t from-blue-400/15 to-transparent',
    ring: 'ring-[3px] ring-blue-400/60',
    indicator: 'bg-blue-400',
    glow: 'bg-blue-400/30',
    animation: 'animate-pulse',
  },
  empathetic: {
    overlay: 'bg-gradient-to-t from-amber-400/20 to-transparent',
    ring: 'ring-[3px] ring-amber-400/70',
    indicator: 'bg-amber-400',
    glow: 'bg-amber-400/40',
  },
  encouraging: {
    overlay: 'bg-gradient-to-t from-primary/15 to-transparent',
    ring: 'ring-[3px] ring-primary/60',
    indicator: 'bg-primary',
    glow: 'bg-primary/30',
  },
  listening: {
    overlay: 'bg-transparent',
    ring: 'ring-2 ring-primary/40',
    indicator: 'bg-primary',
    glow: 'bg-primary/20',
    animation: 'animate-pulse',
  },
};

const RioAvatarExpressive = ({ 
  expression = 'neutral',
  isSpeaking = false,
  size = 'md',
  className 
}: RioAvatarExpressiveProps) => {
  const style = expressionStyles[expression];

  return (
    <div className={cn("relative flex-shrink-0 motion-safe:animate-[pulse_10s_ease-in-out_infinite]", className)}>
      {/* Dynamic glow effect based on expression */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-all duration-500",
          style.glow,
          style.animation
        )}
        style={{ transform: 'scale(1.3)' }}
      />
      
      {/* Main avatar container */}
      <div 
        className={cn(
          "relative rounded-full overflow-hidden bg-background shadow-lg transition-all duration-300",
          sizeClasses[size],
          style.ring,
          isSpeaking && "scale-105"
        )}
      >
        {/* Rio avatar image - positioned to show full face */}
        <img 
          src={rioAvatar} 
          alt="Río - Asistente ImplantX" 
          className={cn(
            "w-full h-[120%] object-cover object-[center_25%] transition-transform duration-300",
            isSpeaking && "scale-105"
          )}
        />
        
        {/* Expression overlay */}
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-500 pointer-events-none",
            style.overlay
          )}
        />
        
        {/* Speaking animation ring */}
        {isSpeaking && (
          <>
            <div className={cn(
              "absolute inset-0 rounded-full ring-2 animate-ping",
              expression === 'thinking' && "ring-blue-400/60",
              expression === 'smile' && "ring-emerald-400/60",
              expression === 'empathetic' && "ring-amber-400/60",
              expression === 'encouraging' && "ring-primary/60",
              expression === 'listening' && "ring-primary/60",
              expression === 'neutral' && "ring-border/60"
            )} />
          </>
        )}
      </div>
      
      {/* Status indicator */}
      <div 
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background shadow-sm flex items-center justify-center transition-colors duration-300",
          style.indicator
        )}
      >
        {isSpeaking && (
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default RioAvatarExpressive;
