import ReportPreview from "@/components/ReportPreview";
import { EnhancedAssessmentResult } from "@/utils/riskCalculation";
import { IRPResult } from "@/utils/irpCalculation";
import { UserProfile, ImplantXAnswers, PurchaseLevel } from "@/types/questionnaire";

interface ResultsStepProps {
  assessmentResult: EnhancedAssessmentResult;
  userProfile: Partial<UserProfile>;
  implantAnswers: Partial<ImplantXAnswers>;
  irpResult: IRPResult | null;
  purchaseLevel: PurchaseLevel;
  uploadedImage: string | null;
  imageAnalysis: string | null;
}

const getNTeethFromAnswer = (answer?: string): number => {
  const mapping: Record<string, number> = {
    '1': 1,
    '2-3': 3,
    '4-6': 5,
    '7-plus': 10,
    'all-upper': 14,
    'all-lower': 14,
    'all': 28
  };
  return mapping[answer || '1'] || 1;
};

const ResultsStep = ({ 
  assessmentResult, 
  userProfile, 
  implantAnswers, 
  irpResult, 
  purchaseLevel,
  uploadedImage,
  imageAnalysis
}: ResultsStepProps) => {
  const evaluationData = {
    id: `EV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: new Date().toLocaleDateString('es-ES'),
    patient: userProfile.name,
    pronosticoLabel: assessmentResult.pronosticoLabel,
    pronosticoMessage: assessmentResult.pronosticoMessage,
    pronosticoColor: assessmentResult.pronosticoColor,
    successProbability: assessmentResult.successProbability,
    factors: assessmentResult.riskFactors.map(rf => ({
      name: rf.name,
      value: rf.impact === 'high' ? 'Alto' : rf.impact === 'medium' ? 'Medio' : 'Bajo',
      impact: rf.impact === 'high' ? 15 : rf.impact === 'medium' ? 10 : 5
    })),
    recommendations: assessmentResult.recommendations.map(rec => ({
      text: rec.title,
      evidence: rec.description
    })),
    uploadedImage,
    imageAnalysis,
    synergies: assessmentResult.synergies?.map(s => s.description) || [],
    nTeeth: getNTeethFromAnswer(implantAnswers.teethToReplace)
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ReportPreview 
        evaluation={{
          ...evaluationData,
          irpResult: irpResult ? {
            score: irpResult.score,
            level: irpResult.level,
            message: irpResult.message
          } : undefined
        }} 
        purchaseLevel={purchaseLevel}
      />
    </div>
  );
};

export default ResultsStep;
