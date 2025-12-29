import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseLevel } from '@/types/questionnaire';

interface PaymentVerificationResult {
  verified: boolean;
  purchase_level?: PurchaseLevel;
  verified_at?: string;
  amount?: number;
  message?: string;
}

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);

  const verifyPayment = useCallback(async (params: {
    externalReference?: string;
    payerEmail?: string;
  }): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          external_reference: params.externalReference,
          payer_email: params.payerEmail,
        },
      });

      if (error) {
        console.error('Payment verification error:', error);
        const result: PaymentVerificationResult = { 
          verified: false, 
          message: 'Error al verificar el pago' 
        };
        setVerificationResult(result);
        return result;
      }

      const result: PaymentVerificationResult = {
        verified: data.verified,
        purchase_level: data.purchase_level as PurchaseLevel,
        verified_at: data.verified_at,
        amount: data.amount,
        message: data.message,
      };
      
      setVerificationResult(result);
      return result;
    } catch (err) {
      console.error('Payment verification exception:', err);
      const result: PaymentVerificationResult = { 
        verified: false, 
        message: 'Error de conexión' 
      };
      setVerificationResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const clearVerification = useCallback(() => {
    setVerificationResult(null);
  }, []);

  return {
    verifyPayment,
    isVerifying,
    verificationResult,
    clearVerification,
  };
};