import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type QuestionComplexity = 'simple' | 'moderate' | 'complex';

interface RioFeedbackParams {
  questionId: string;
  questionText: string;
  answerValue: string;
  answerLabel: string;
  patientName: string;
  questionComplexity: QuestionComplexity;
  clinicalContext?: string;
}

interface UseRioFeedbackReturn {
  feedback: string | null;
  isLoading: boolean;
  error: string | null;
  generateFeedback: (params: RioFeedbackParams) => Promise<void>;
  clearFeedback: () => void;
}

export const useRioFeedback = (): UseRioFeedbackReturn => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = useCallback(async (params: RioFeedbackParams) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('rio-feedback', {
        body: params,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setFeedback(data.feedback);
    } catch (err) {
      console.error('Error generating Rio feedback:', err);
      setError(err instanceof Error ? err.message : 'Error al generar respuesta');
      // Fallback message
      setFeedback('Gracias por tu respuesta. Esta información es muy valiosa para tu evaluación.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return {
    feedback,
    isLoading,
    error,
    generateFeedback,
    clearFeedback,
  };
};
