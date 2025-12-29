// Types for the questionnaire flow

export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface DensityProAnswers {
  fractures: 'no' | 'once' | 'multiple';
  heightLoss: 'no' | 'yes' | 'unsure';
  familyHistory: 'no' | 'yes' | 'unknown';
  corticosteroids: 'no' | 'yes' | 'unsure';
  alcohol: 'no' | 'yes';
}

export interface ImplantXAnswers {
  smoking: 'no' | 'less-10' | '10-plus';
  bruxism: 'no' | 'unsure' | 'yes';
  bruxismGuard: 'no' | 'yes' | 'not-applicable'; // Si usa férula de descarga
  diabetes: 'no' | 'controlled' | 'uncontrolled';
  implantHistory: 'no' | 'success' | 'failed';
  toothLossCause: 'cavity' | 'periodontitis' | 'trauma' | 'other';
  toothLossTime: 'less-1' | '1-3' | 'more-3';
  gumBleeding: 'never' | 'sometimes' | 'frequently';
  looseTeethLoss: 'no' | '1-2' | 'several'; // Dientes perdidos por movilidad
  oralHygiene: 'less-once' | 'once' | 'twice-plus';
  implantZones: string[]; // Array of tooth numbers
  teethToReplace: '1-2' | '3-8' | 'all'; // Number of teeth to replace
}

export interface AssessmentResult {
  riskLevel: 'low' | 'medium' | 'high';
  successProbability: number;
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
}

export interface RiskFactor {
  name: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export type QuestionnaireStep = 
  | 'welcome'
  | 'name'
  | 'demographics'
  | 'density-intro'
  | 'density-q1'
  | 'density-q2'
  | 'density-q3'
  | 'density-q4'
  | 'density-q5'
  | 'density-complete'
  | 'smoking'
  | 'bruxism'
  | 'bruxism-guard' // Nueva pregunta: ¿usa férula?
  | 'diabetes'
  | 'gum-health' // Preguntas periodontales (3 en 1)
  | 'irp-processing' // Procesamiento IA del IRP
  | 'irp-result' // Resultado del IRP con upsell Plan de Acción
  | 'upsell-premium' // Upsell a Informe Premium después del pago
  | 'implant-history'
  | 'tooth-loss'
  | 'tooth-loss-time'
  | 'teeth-count'
  | 'odontogram'
  | 'summary'
  | 'processing'
  | 'results';

export type PurchaseLevel = 'free' | 'plan-accion' | 'premium';
