import ReportPreview from "@/components/ReportPreview";
import { EnhancedAssessmentResult } from "@/utils/riskCalculation";
import { IRPResult } from "@/utils/irpCalculation";
import { UserProfile, ImplantXAnswers, DensityProAnswers, PurchaseLevel } from "@/types/questionnaire";

interface ResultsStepProps {
  assessmentResult: EnhancedAssessmentResult;
  userProfile: Partial<UserProfile>;
  implantAnswers: Partial<ImplantXAnswers>;
  densityAnswers: Partial<DensityProAnswers>;
  requiresDensityPro: boolean;
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

// Calcular puntaje de riesgo óseo basado en respuestas de DensityPro
const calculateBoneHealthScore = (answers: Partial<DensityProAnswers>): { score: number; level: string; factors: string[] } => {
  let riskPoints = 0;
  const factors: string[] = [];

  // Fracturas previas (peso alto)
  if (answers.fractures === 'multiple') {
    riskPoints += 3;
    factors.push('Múltiples fracturas previas');
  } else if (answers.fractures === 'once') {
    riskPoints += 1;
    factors.push('Fractura previa');
  }

  // Pérdida de altura
  if (answers.heightLoss === 'yes') {
    riskPoints += 2;
    factors.push('Pérdida de altura detectada');
  } else if (answers.heightLoss === 'unsure') {
    riskPoints += 1;
  }

  // Historia familiar
  if (answers.familyHistory === 'yes') {
    riskPoints += 2;
    factors.push('Antecedentes familiares de osteoporosis');
  } else if (answers.familyHistory === 'unknown') {
    riskPoints += 0.5;
  }

  // Uso de corticoides
  if (answers.corticosteroids === 'yes') {
    riskPoints += 2;
    factors.push('Uso prolongado de corticoides');
  } else if (answers.corticosteroids === 'unsure') {
    riskPoints += 1;
  }

  // Consumo de alcohol
  if (answers.alcohol === 'yes') {
    riskPoints += 1;
    factors.push('Consumo elevado de alcohol');
  }

  // Calcular nivel basado en puntos
  let level: string;
  if (riskPoints <= 2) {
    level = 'Bajo';
  } else if (riskPoints <= 5) {
    level = 'Moderado';
  } else {
    level = 'Alto';
  }

  // Convertir a escala 0-100 (inverso: menos puntos = mejor salud)
  const maxPoints = 10;
  const score = Math.max(0, Math.round(100 - (riskPoints / maxPoints) * 100));

  return { score, level, factors };
};

const ResultsStep = ({ 
  assessmentResult, 
  userProfile, 
  implantAnswers,
  densityAnswers,
  requiresDensityPro,
  irpResult, 
  purchaseLevel,
  uploadedImage,
  imageAnalysis
}: ResultsStepProps) => {
  // Calcular resultado de salud ósea si aplica
  const boneHealthResult = requiresDensityPro && Object.keys(densityAnswers).length > 0
    ? calculateBoneHealthScore(densityAnswers)
    : null;

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
          } : undefined,
          boneHealthResult: boneHealthResult ? {
            score: boneHealthResult.score,
            level: boneHealthResult.level,
            factors: boneHealthResult.factors
          } : undefined
        }} 
        purchaseLevel={purchaseLevel}
      />
    </div>
  );
};

export default ResultsStep;
