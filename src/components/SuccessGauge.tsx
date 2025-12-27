import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SuccessGaugeProps {
  percentage: number;
  isWarning?: boolean;
  label?: string;
}

// Función para convertir porcentaje exacto a rango científicamente respaldado
const getSuccessRange = (percentage: number): { range: string; midpoint: number } => {
  // Rangos basados en meta-análisis de 17,025 implantes (PMC8359846, PMID:30904559, PMC11416373)
  // Baseline: 96.4% (95% CI: 95.2%-97.5%) para paciente ideal
  if (percentage >= 95) return { range: "95-98%", midpoint: 96.5 };
  if (percentage >= 90) return { range: "90-95%", midpoint: 92.5 };
  if (percentage >= 85) return { range: "85-92%", midpoint: 88.5 };
  if (percentage >= 80) return { range: "80-88%", midpoint: 84 };
  if (percentage >= 70) return { range: "70-82%", midpoint: 76 };
  if (percentage >= 60) return { range: "60-75%", midpoint: 67.5 };
  return { range: "50-65%", midpoint: 57.5 };
};

const SuccessGauge = ({ percentage, isWarning = false, label }: SuccessGaugeProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const { range, midpoint } = getSuccessRange(percentage);
  
  useEffect(() => {
    // Animate to the midpoint of the range (more scientifically accurate representation)
    const target = midpoint;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedPercentage(Math.round(target));
        clearInterval(timer);
      } else {
        setAnimatedPercentage(Math.round(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [midpoint]);

  // Calculate the stroke dash for the arc (semicircle)
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;
  
  // Get color based on percentage
  const getColor = () => {
    if (isWarning || percentage < 70) return "hsl(47 100% 50%)"; // warning/golden
    if (percentage >= 90) return "hsl(142 70% 45%)"; // green
    return "hsl(47 100% 50%)"; // golden
  };

  const getGlowColor = () => {
    if (isWarning || percentage < 70) return "hsla(47, 100%, 50%, 0.4)";
    if (percentage >= 90) return "hsla(142, 70%, 45%, 0.4)";
    return "hsla(47, 100%, 50%, 0.4)";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg 
        width="200" 
        height="120" 
        viewBox="0 0 200 120"
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Animated progress arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 0.1s ease-out",
            filter: `drop-shadow(0 0 8px ${getGlowColor()})`,
          }}
        />
        
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = Math.PI - (tick / 100) * Math.PI;
          const innerRadius = 65;
          const outerRadius = 70;
          const x1 = 100 + innerRadius * Math.cos(angle);
          const y1 = 100 - innerRadius * Math.sin(angle);
          const x2 = 100 + outerRadius * Math.cos(angle);
          const y2 = 100 - outerRadius * Math.sin(angle);
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
        
        {/* Center range text instead of exact percentage */}
        <text
          x="100"
          y="82"
          textAnchor="middle"
          className="fill-foreground"
          style={{ 
            fontSize: "28px", 
            fontWeight: "700",
            fontFamily: "var(--font-display)"
          }}
        >
          {range}
        </text>
        
        {/* Label */}
        <text
          x="100"
          y="102"
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: "10px" }}
        >
          Rango de éxito estimado*
        </text>
      </svg>
      
      {/* Status label below */}
      {label && (
        <div className={cn(
          "mt-2 px-4 py-1.5 rounded-full text-sm font-semibold",
          isWarning 
            ? "bg-warning/20 text-warning" 
            : percentage >= 90 
              ? "bg-green-500/20 text-green-500"
              : "bg-primary/20 text-primary"
        )}>
          {label}
        </div>
      )}
      
      {/* Scientific reference note */}
      <p className="mt-3 text-[10px] text-muted-foreground/70 text-center max-w-[200px]">
        *Basado en análisis de 17,025 implantes
      </p>
    </div>
  );
};

export default SuccessGauge;