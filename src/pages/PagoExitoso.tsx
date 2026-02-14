import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const PagoExitoso = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [purchaseLevel, setPurchaseLevel] = useState<string | null>(null);

  useEffect(() => {
    // Try to get saved flow token from localStorage
    let savedToken: string | null = null;
    let savedEmail: string | null = null;
    try {
      const saved = localStorage.getItem('implantx_flow_payment');
      if (saved) {
        const parsed = JSON.parse(saved);
        savedToken = parsed.flowToken || null;
        savedEmail = parsed.email || null;
      }
    } catch {}

    const verifyPayment = async () => {
      // Give Flow webhook time to process
      await new Promise(r => setTimeout(r, 3000));

      if (!savedToken && !savedEmail) {
        // No identifiers saved — show generic pending
        setStatus('pending');
        return;
      }

      // Poll via edge function (uses service_role internally)
      let attempts = 0;
      const maxAttempts = 10;

      const poll = async () => {
        attempts++;
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment-status', {
            body: savedToken ? { token: savedToken } : { email: savedEmail },
          });

          if (!error && data?.success && data.data?.found && data.data.status === 'approved') {
            setPurchaseLevel(data.data.purchaseLevel);
            setStatus('success');
            try {
              localStorage.setItem('implantx_purchase_verified', JSON.stringify({
                level: data.data.purchaseLevel,
                timestamp: Date.now(),
              }));
              localStorage.removeItem('implantx_flow_payment');
            } catch {}
            return;
          }
        } catch (err) {
          console.error('Payment verification error:', err);
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setStatus('pending');
        }
      };

      await poll();
    };

    verifyPayment();
  }, [searchParams]);

  const handleContinue = () => {
    navigate('/evaluacion');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 text-center">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Verificando tu pago...</h2>
            <p className="text-sm text-muted-foreground">
              Estamos confirmando tu transacción con Flow. Esto puede tomar unos segundos.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">¡Pago confirmado!</h2>
            <p className="text-sm text-muted-foreground">
              Tu {purchaseLevel === 'premium' ? 'Informe Premium' : 'Plan de Acción'} ha sido desbloqueado exitosamente.
            </p>
            <Button onClick={handleContinue} className="w-full gap-2" size="lg">
              Continuar a mi informe
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Pago en proceso</h2>
            <p className="text-sm text-muted-foreground">
              Tu pago está siendo procesado. Puede tardar unos minutos en confirmarse.
              Puedes volver al cuestionario y tu compra se activará automáticamente.
            </p>
            <Button onClick={handleContinue} className="w-full gap-2" size="lg" variant="outline">
              Volver al cuestionario
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Error en el pago</h2>
            <p className="text-sm text-muted-foreground">
              Hubo un problema con tu pago. Por favor intenta nuevamente.
            </p>
            <Button onClick={handleContinue} className="w-full gap-2" size="lg" variant="outline">
              Volver al cuestionario
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Pago procesado de forma segura por Flow
        </p>
      </Card>
    </div>
  );
};

export default PagoExitoso;
