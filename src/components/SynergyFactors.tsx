import { AlertTriangle, Link2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SynergyFactorsProps {
  synergies: string[];
  explanation?: string;
}

const SynergyFactors = ({ synergies, explanation }: SynergyFactorsProps) => {
  if (!synergies || synergies.length === 0) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Info className="w-4 h-4" />
          <span className="text-sm font-semibold">Sin factores sinérgicos</span>
        </div>
        <p className="text-sm text-muted-foreground">
          No se detectaron combinaciones de factores que aumenten el riesgo. 
          Esto es una excelente noticia para tu tratamiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-warning" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">Factores Sinérgicos Detectados</h4>
          <p className="text-xs text-muted-foreground">Combinaciones que requieren atención especial</p>
        </div>
      </div>

      {/* Visual explanation */}
      <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Los factores sinérgicos son combinaciones de condiciones que, juntas, pueden tener un impacto 
            mayor que la suma de sus efectos individuales. Identificarlos permite a tu especialista 
            diseñar un plan de tratamiento más preciso.
          </p>
        </div>
      </div>

      {/* Synergy cards */}
      <div className="space-y-2">
        {synergies.map((synergy, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-warning/30 bg-gradient-to-r from-warning/5 to-transparent p-4"
          >
            {/* Connection visual */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
            
            <div className="flex items-start gap-3 pl-2">
              <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-warning">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{synergy}</p>
                
                {/* Visual representation of synergy */}
                <div className="mt-2 flex items-center gap-2">
                  {synergy.split('+').map((factor, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {i > 0 && (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-warning/20 flex items-center justify-center">
                            <span className="text-[10px] text-warning">×</span>
                          </div>
                        </div>
                      )}
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs",
                        i === 0 ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {factor.trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Explanation */}
      {explanation && (
        <div className="bg-muted/30 rounded-xl p-4 space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Análisis personalizado
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
        </div>
      )}

      {/* Positive message */}
      <div className="text-center p-3 bg-primary/5 rounded-xl">
        <p className="text-xs text-muted-foreground">
          <strong className="text-primary">Nota importante:</strong> Identificar estos factores es positivo 
          — permite a tu especialista personalizar tu tratamiento para obtener los mejores resultados.
        </p>
      </div>
    </div>
  );
};

export default SynergyFactors;
