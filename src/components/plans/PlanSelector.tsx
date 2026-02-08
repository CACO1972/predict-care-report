import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanType, PLAN_CONFIGS } from "@/types/implantx-report";

interface PlanSelectorProps {
  onSelectPlan: (planId: PlanType) => void;
  selectedPlan?: PlanType;
  currentPlan?: PlanType;
  loading?: boolean;
}

export function PlanSelector({ onSelectPlan, selectedPlan, currentPlan, loading }: PlanSelectorProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Seleccione su Plan de Reporte
        </h2>
        <p className="text-muted-foreground">
          Todos los planes se abonan 100% al costo final del tratamiento
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLAN_CONFIGS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = currentPlan === plan.id;
          const isUpgrade = currentPlan === 'FREE' && plan.id !== 'FREE';
          
          return (
            <Card 
              key={plan.id}
              className={`relative transition-all duration-200 ${
                plan.popular 
                  ? 'border-primary border-2 shadow-xl scale-[1.02]' 
                  : 'border-border'
              } ${
                isSelected 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : ''
              } ${
                isCurrent
                  ? 'bg-primary/5'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    Más Popular
                  </span>
                </div>
              )}
              
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    ✓ Actual
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.priceAmount > 0 && (
                    <span className="text-muted-foreground ml-1 text-sm">CLP</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check 
                        className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          feature.included 
                            ? 'text-green-600' 
                            : 'text-muted-foreground/30'
                        }`}
                      />
                      <span className={`text-sm ${
                        feature.included 
                          ? 'text-foreground' 
                          : 'text-muted-foreground line-through'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={loading || isCurrent}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                  variant={isSelected ? 'outline' : 'default'}
                >
                  {loading && isSelected ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Procesando...
                    </span>
                  ) : isCurrent ? (
                    '✓ Plan Actual'
                  ) : isSelected ? (
                    '✓ Seleccionado'
                  ) : isUpgrade ? (
                    `Upgrade a ${plan.name}`
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
        <p>* Todos los pagos se abonan 100% al costo del tratamiento final</p>
        <p>** Plan Premium incluye videoconsulta de 30-45 minutos con especialista</p>
      </div>
    </div>
  );
}

export default PlanSelector;
