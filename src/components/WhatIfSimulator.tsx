import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  TrendingUp, 
  Cigarette, 
  Activity, 
  Smile,
  Brain,
  AlertTriangle,
  Bone,
  RotateCcw,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModifiableFactorConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  baseImpact: number; // Impact percentage when active/bad
  isModifiable: boolean;
  type: 'toggle' | 'slider';
  currentValue?: boolean | number;
  tooltipInfo: string;
}

interface WhatIfSimulatorProps {
  currentProbability: number;
  factors: Array<{ name: string; value: string; impact: number }>;
  synergies?: string[];
}

const WhatIfSimulator = ({ currentProbability, factors, synergies = [] }: WhatIfSimulatorProps) => {
  // Parse current state from factors
  const getInitialState = () => {
    const state: Record<string, boolean | number> = {};
    
    factors.forEach(factor => {
      const lowerName = factor.name.toLowerCase();
      
      if (lowerName.includes('tabaco') || lowerName.includes('fuma')) {
        state.smoking = factor.impact < 0;
      }
      if (lowerName.includes('diabetes')) {
        state.diabetes = factor.impact < 0;
        // Check if controlled
        if (factor.value.toLowerCase().includes('controlada')) {
          state.diabetesControlled = true;
        }
      }
      if (lowerName.includes('higiene') || lowerName.includes('oral')) {
        // Extract percentage from value if available
        const match = factor.value.match(/(\d+)/);
        state.oralHygiene = match ? parseInt(match[1]) : (factor.impact >= 0 ? 85 : 60);
      }
      if (lowerName.includes('bruxismo')) {
        state.bruxism = factor.impact < 0;
        state.bruxismTreated = factor.value.toLowerCase().includes('control') || factor.value.toLowerCase().includes('ferula');
      }
      if (lowerName.includes('gingival') || lowerName.includes('encía')) {
        state.gingival = factor.impact < 0;
      }
      if (lowerName.includes('periodontal')) {
        state.periodontal = factor.impact < 0;
        state.periodontalTreated = factor.value.toLowerCase().includes('tratado') || factor.value.toLowerCase().includes('control');
      }
    });
    
    return {
      smoking: state.smoking ?? false,
      diabetesControlled: state.diabetesControlled ?? true,
      oralHygiene: (state.oralHygiene as number) ?? 75,
      bruxismTreated: state.bruxismTreated ?? false,
      periodontalTreated: state.periodontalTreated ?? false,
      hasDiabetes: state.diabetes ?? false,
      hasBruxism: state.bruxism ?? false,
      hasPeriodontal: state.periodontal ?? false,
      hasGingival: state.gingival ?? false,
    };
  };
  
  const initialState = useMemo(() => getInitialState(), [factors]);
  
  const [simulatedState, setSimulatedState] = useState(initialState);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate simulated probability based on changes
  const calculateSimulatedProbability = useMemo(() => {
    let improvement = 0;
    
    // Smoking cessation: +4-6% improvement
    if (initialState.smoking && !simulatedState.smoking) {
      improvement += 5;
    }
    
    // Diabetes control improvement
    if (initialState.hasDiabetes && !initialState.diabetesControlled && simulatedState.diabetesControlled) {
      improvement += 4;
    }
    
    // Oral hygiene improvement (each 10% = ~1.5% improvement, max from 50% to 90%)
    const hygieneChange = simulatedState.oralHygiene - initialState.oralHygiene;
    if (hygieneChange > 0) {
      improvement += Math.round(hygieneChange / 10) * 1.5;
    }
    
    // Bruxism treatment
    if (initialState.hasBruxism && !initialState.bruxismTreated && simulatedState.bruxismTreated) {
      improvement += 3;
    }
    
    // Periodontal treatment
    if (initialState.hasPeriodontal && !initialState.periodontalTreated && simulatedState.periodontalTreated) {
      improvement += 4;
    }
    
    // Synergy reductions when multiple factors improve
    let synergyBonus = 0;
    const improvementCount = [
      initialState.smoking && !simulatedState.smoking,
      initialState.hasDiabetes && !initialState.diabetesControlled && simulatedState.diabetesControlled,
      hygieneChange > 20,
      initialState.hasBruxism && !initialState.bruxismTreated && simulatedState.bruxismTreated,
      initialState.hasPeriodontal && !initialState.periodontalTreated && simulatedState.periodontalTreated,
    ].filter(Boolean).length;
    
    if (improvementCount >= 2) {
      synergyBonus = improvementCount * 0.5;
    }
    
    const newProbability = Math.min(98, currentProbability + improvement + synergyBonus);
    return Math.round(newProbability * 10) / 10;
  }, [simulatedState, initialState, currentProbability]);
  
  const hasChanges = calculateSimulatedProbability !== currentProbability;
  const improvementDelta = calculateSimulatedProbability - currentProbability;
  
  // Trigger animation on change
  useEffect(() => {
    if (hasChanges) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [calculateSimulatedProbability]);
  
  const resetSimulation = () => {
    setSimulatedState(initialState);
  };
  
  // Determine which controls to show based on patient's actual risk factors
  const showSmokingControl = initialState.smoking;
  const showDiabetesControl = initialState.hasDiabetes && !initialState.diabetesControlled;
  const showBruxismControl = initialState.hasBruxism && !initialState.bruxismTreated;
  const showPeriodontalControl = initialState.hasPeriodontal && !initialState.periodontalTreated;
  const showHygieneControl = initialState.oralHygiene < 90;
  
  const hasModifiableFactors = showSmokingControl || showDiabetesControl || showBruxismControl || showPeriodontalControl || showHygieneControl;
  
  if (!hasModifiableFactors) {
    return null; // Don't show if no modifiable factors
  }

  return (
    <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                ¿Qué pasa si...?
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Simula cómo cambiaría tu probabilidad de éxito si modificas ciertos hábitos o controlas factores de riesgo.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <p className="text-xs text-muted-foreground">Simula el impacto de cambiar tus hábitos</p>
            </div>
          </div>
          
          {hasChanges && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetSimulation}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </Button>
          )}
        </div>
        
        {/* Comparison Display */}
        <div className="grid grid-cols-3 gap-3">
          {/* Current */}
          <div className="text-center p-3 rounded-xl bg-muted/50 border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Actual</p>
            <p className="text-2xl font-bold text-muted-foreground">{currentProbability}%</p>
          </div>
          
          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300",
              hasChanges 
                ? "bg-primary/20 text-primary" 
                : "bg-muted/30 text-muted-foreground"
            )}>
              <TrendingUp className={cn(
                "w-4 h-4 transition-transform",
                hasChanges && "animate-bounce"
              )} />
              {hasChanges && (
                <span className="text-sm font-bold">+{improvementDelta.toFixed(1)}%</span>
              )}
            </div>
          </div>
          
          {/* Simulated */}
          <div className={cn(
            "text-center p-3 rounded-xl border transition-all duration-300",
            hasChanges 
              ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30" 
              : "bg-muted/50 border-border"
          )}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Proyectado</p>
            <p className={cn(
              "text-2xl font-bold transition-all duration-300",
              hasChanges ? "text-primary" : "text-muted-foreground",
              isAnimating && "scale-110"
            )}>
              {calculateSimulatedProbability}%
            </p>
          </div>
        </div>
        
        {/* Modifiable Factors Controls */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-foreground">Ajusta los siguientes factores:</p>
          
          <div className="space-y-3">
            {/* Smoking */}
            {showSmokingControl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    !simulatedState.smoking ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                  )}>
                    <Cigarette className="w-4 h-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dejar de fumar</Label>
                    <p className="text-[10px] text-muted-foreground">Mejora esperada: +4-6%</p>
                  </div>
                </div>
                <Switch
                  checked={!simulatedState.smoking}
                  onCheckedChange={(checked) => setSimulatedState(s => ({ ...s, smoking: !checked }))}
                />
              </div>
            )}
            
            {/* Diabetes Control */}
            {showDiabetesControl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    simulatedState.diabetesControlled ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"
                  )}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Controlar diabetes (HbA1c &lt; 7%)</Label>
                    <p className="text-[10px] text-muted-foreground">Mejora esperada: +3-5%</p>
                  </div>
                </div>
                <Switch
                  checked={Boolean(simulatedState.diabetesControlled)}
                  onCheckedChange={(checked) => setSimulatedState(s => ({ ...s, diabetesControlled: checked }))}
                />
              </div>
            )}
            
            {/* Bruxism Treatment */}
            {showBruxismControl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    simulatedState.bruxismTreated ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"
                  )}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tratar bruxismo (férula oclusal)</Label>
                    <p className="text-[10px] text-muted-foreground">Mejora esperada: +2-4%</p>
                  </div>
                </div>
                <Switch
                  checked={Boolean(simulatedState.bruxismTreated)}
                  onCheckedChange={(checked) => setSimulatedState(s => ({ ...s, bruxismTreated: checked }))}
                />
              </div>
            )}
            
            {/* Periodontal Treatment */}
            {showPeriodontalControl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    simulatedState.periodontalTreated ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                  )}>
                    <Bone className="w-4 h-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tratar enfermedad periodontal</Label>
                    <p className="text-[10px] text-muted-foreground">Mejora esperada: +3-5%</p>
                  </div>
                </div>
                <Switch
                  checked={Boolean(simulatedState.periodontalTreated)}
                  onCheckedChange={(checked) => setSimulatedState(s => ({ ...s, periodontalTreated: checked }))}
                />
              </div>
            )}
            
            {/* Oral Hygiene Slider */}
            {showHygieneControl && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      simulatedState.oralHygiene >= 80 ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"
                    )}>
                      <Smile className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mejorar higiene oral</Label>
                      <p className="text-[10px] text-muted-foreground">Cada 10% = +1.5% probabilidad</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-2 py-0.5 rounded-full",
                    simulatedState.oralHygiene >= 80 
                      ? "bg-primary/20 text-primary" 
                      : "bg-warning/20 text-warning"
                  )}>
                    {simulatedState.oralHygiene}%
                  </span>
                </div>
                <Slider
                  value={[simulatedState.oralHygiene]}
                  onValueChange={([value]) => setSimulatedState(s => ({ ...s, oralHygiene: value }))}
                  min={initialState.oralHygiene}
                  max={95}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{initialState.oralHygiene}% (actual)</span>
                  <span>95% (óptimo)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Insight Message */}
        {hasChanges && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                ¡Podrías mejorar tu probabilidad en +{improvementDelta.toFixed(1)}%!
              </p>
              <p className="text-xs text-muted-foreground">
                Con los cambios simulados, tu probabilidad de éxito pasaría de {currentProbability}% a {calculateSimulatedProbability}%. 
                El <strong className="text-foreground">Informe Premium</strong> incluye un plan detallado para lograr estas mejoras.
              </p>
            </div>
          </div>
        )}
        
        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center italic">
          * Estimaciones basadas en literatura científica. Los resultados reales pueden variar según tu caso particular.
        </p>
      </div>
    </Card>
  );
};

export default WhatIfSimulator;
