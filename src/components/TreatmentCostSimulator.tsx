import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Calculator, Info, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface TreatmentCostSimulatorProps {
  teethCount: number;
  treatmentType?: 'single' | 'bridge' | 'all-on-4' | 'all-on-6';
  className?: string;
}

interface PrestacionItem {
  service: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface CostEstimate {
  estimate: number;
  breakdown: PrestacionItem[];
  currency: string;
  disclaimer: string;
}

const TreatmentCostSimulator = ({ 
  teethCount, 
  treatmentType = 'single',
  className 
}: TreatmentCostSimulatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [costData, setCostData] = useState<CostEstimate | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Fallback prices when Dentalink is unavailable
  const getFallbackEstimate = (): CostEstimate => {
    const baseImplantPrice = 890000; // CLP per implant
    const crownPrice = 350000;
    const abutmentPrice = 180000;
    
    let breakdown: PrestacionItem[] = [];
    let total = 0;

    if (teethCount <= 2) {
      // Single implants
      breakdown = [
        { service: "Implante dental unitario", unitPrice: baseImplantPrice, quantity: teethCount, subtotal: baseImplantPrice * teethCount },
        { service: "Corona sobre implante", unitPrice: crownPrice, quantity: teethCount, subtotal: crownPrice * teethCount },
        { service: "Pilar de conexión", unitPrice: abutmentPrice, quantity: teethCount, subtotal: abutmentPrice * teethCount },
      ];
    } else if (teethCount <= 8) {
      // Bridge on implants
      const implants = Math.ceil(teethCount / 2);
      breakdown = [
        { service: "Implante dental", unitPrice: baseImplantPrice, quantity: implants, subtotal: baseImplantPrice * implants },
        { service: "Puente sobre implantes", unitPrice: 450000, quantity: 1, subtotal: 450000 },
        { service: "Coronas en puente", unitPrice: 280000, quantity: teethCount, subtotal: 280000 * teethCount },
      ];
    } else {
      // All-on-4/6
      const implants = teethCount > 12 ? 6 : 4;
      breakdown = [
        { service: `Sistema All-on-${implants}`, unitPrice: implants === 4 ? 4500000 : 5200000, quantity: 1, subtotal: implants === 4 ? 4500000 : 5200000 },
        { service: "Prótesis híbrida completa", unitPrice: 1800000, quantity: 1, subtotal: 1800000 },
        { service: "Provisorio inmediato", unitPrice: 600000, quantity: 1, subtotal: 600000 },
      ];
    }

    total = breakdown.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      estimate: total,
      breakdown,
      currency: "CLP",
      disclaimer: "Precios referenciales. El costo final puede variar según tu caso clínico específico.",
    };
  };

  const fetchCostFromDentalink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('dentalink-pricing', {
        body: {
          action: 'simulateTreatmentCost',
          teethCount,
          treatmentType,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // If we got an empty or invalid response, use fallback
      if (!data?.estimate || data.estimate === 0) {
        setUseFallback(true);
        setCostData(getFallbackEstimate());
      } else {
        setCostData(data as CostEstimate);
      }
    } catch (err) {
      console.error('Error fetching cost from Dentalink:', err);
      // Use fallback on error
      setUseFallback(true);
      setCostData(getFallbackEstimate());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostFromDentalink();
  }, [teethCount, treatmentType]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTreatmentLabel = () => {
    if (teethCount <= 2) return "Implante unitario";
    if (teethCount <= 8) return "Puente sobre implantes";
    return "Rehabilitación completa";
  };

  return (
    <Card className={cn("border-primary/20 bg-gradient-to-br from-primary/5 to-transparent", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          Estimación de Costos
          {useFallback && (
            <Badge variant="outline" className="text-xs ml-auto">
              Referencial
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Calculando costos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchCostFromDentalink}
            >
              Reintentar
            </Button>
          </div>
        ) : costData ? (
          <>
            {/* Treatment Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">{getTreatmentLabel()}</p>
                <p className="text-xs text-muted-foreground">
                  {teethCount} {teethCount === 1 ? 'diente' : 'dientes'} a reemplazar
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {costData.currency}
              </Badge>
            </div>

            {/* Total Estimate */}
            <div className="text-center py-4 border-y border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Costo estimado total</p>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(costData.estimate)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aproximadamente {formatPrice(Math.round(costData.estimate / teethCount))} por diente
              </p>
            </div>

            {/* Breakdown Toggle */}
            {costData.breakdown && costData.breakdown.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Ver desglose
                  </span>
                  {showBreakdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {showBreakdown && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {costData.breakdown.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-xs">{item.service}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {costData.disclaimer}
              </p>
            </div>

            {/* Financing CTA */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                💳 Opciones de financiamiento disponibles
              </p>
              <p className="text-xs text-muted-foreground">
                Consulta por pagos en cuotas sin interés. Tu sonrisa no tiene que esperar.
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default TreatmentCostSimulator;
