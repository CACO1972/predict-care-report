// ImplantX Report v3.0 Types

export type PlanType = 'FREE' | 'BASE' | 'COMPLETE';

// Mapeo entre PurchaseLevel existente y PlanType v3
export const purchaseLevelToPlanType = (level: string): PlanType => {
  switch (level) {
    case 'premium': return 'COMPLETE';
    case 'plan-accion': return 'BASE';
    default: return 'FREE';
  }
};

export const planTypeToPurchaseLevel = (plan: PlanType): string => {
  switch (plan) {
    case 'COMPLETE': return 'premium';
    case 'BASE': return 'plan-accion';
    default: return 'free';
  }
};

export interface ImplantXReportRequest {
  // Datos del paciente
  patientName: string;
  patientEmail: string;
  age: number;
  city?: string;
  
  // Configuración del plan
  plan: PlanType;
  
  // Datos de evaluación
  classification: ClassificationType;
  successProbability: number;
  riskIndex: number;
  globalRiskMultiplier: number;
  
  mainAffectingFactors: string[];
  
  riskFactors: RiskFactor[];
  preparationTimeline: TimelineWeek[];
  postOpProtocol: PostOpPhase[];
  
  // Solo para COMPLETE
  synergies?: Synergy[];
  anatomicalSectors?: AnatomicalSector[];
  adherenceScenarios?: AdherenceScenario[];
}

export type ClassificationType = 
  | 'FAVORABLE' 
  | 'FAVORABLE CON CONDICIONES' 
  | 'DUDOSO' 
  | 'DESFAVORABLE';

export interface RiskFactor {
  factorName: string;
  yourSituation: string;
  relativeRisk: number;
  
  realWorldComparison: string;
  
  biologicalMechanisms: BiologicalMechanism[];
  
  requiredActions: string[];
  
  adherenceBenefit: {
    riskReduction: string;
    successIncrease: string;
    complicationsReduction: string;
  };
  
  supportResources: string[];
  
  evidenceLevel: 'A' | 'B' | 'C';
  scientificReference: string;
}

export interface BiologicalMechanism {
  title: string;
  points: string[];
}

export interface TimelineWeek {
  weekLabel: string;
  title: string;
  actions: TimelineAction[];
}

export interface TimelineAction {
  category: 'CRÍTICO' | 'IMPORTANTE' | 'RECOMENDADO';
  action: string;
}

export interface PostOpPhase {
  period: string;
  title: string;
  instructions: string[];
}

export interface Synergy {
  combination: string;
  individualRisks: Array<{
    factor: string;
    rr: number;
  }>;
  multiplicativeEffect: number;
  
  biologicalSynergies: BiologicalMechanism[];
  
  prioritizedInterventions: Array<{
    priority: string;
    action: string;
    impact: string;
    result: string;
  }>;
  
  finalRiskReduction: {
    optimizedRisk: number;
    percentReduction: string;
  };
  
  evidence: string;
}

export interface AnatomicalSector {
  sector: string;
  classification: 'SIMPLE' | 'ADVANCED' | 'COMPLEX';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  
  anatomicalChallenges: string[];
  
  surgicalProtocol: Array<{
    phase: string;
    timing: string;
    details: string;
    duration: string;
  }>;
  
  totalTimeline: string;
  
  specificRisks: string[];
  
  estimatedCost: {
    min: number;
    max: number;
    breakdown: Array<{
      item: string;
      cost: string;
    }>;
  };
}

export interface AdherenceScenario {
  scenario: string;
  adherenceLevel: '100%' | 'PARCIAL' | 'NULA';
  icon: string;
  actions: string[];
  
  results: {
    overallSuccess: string;
    healingTime: string;
    minorComplications: string;
    majorComplications: string;
    lifeExpectancy: string;
    qualityOfLife: string;
    totalCost: string;
    costDifference?: string;
  };
  
  specialWarning?: string;
}

// Plan pricing and features
export interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  priceAmount: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  cta: string;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Evaluación Inicial',
    price: '$0',
    priceAmount: 0,
    description: 'Evaluación básica de riesgo',
    features: [
      { text: 'Resumen ejecutivo básico', included: true },
      { text: 'Top 3 factores de riesgo', included: true },
      { text: 'Clasificación de riesgo', included: true },
      { text: 'Detalles de factores con RR', included: false },
      { text: 'Timeline de preparación', included: false },
      { text: 'Protocolo post-operatorio', included: false },
      { text: 'Análisis de sinergias', included: false },
    ],
    cta: 'Ver Reporte Gratuito'
  },
  {
    id: 'BASE',
    name: 'Plan de Acción',
    price: '$14.900',
    priceAmount: 14900,
    description: 'Reporte completo con plan de acción',
    popular: true,
    features: [
      { text: 'Todo lo de Evaluación Inicial', included: true },
      { text: 'Análisis detallado de factores', included: true },
      { text: 'Timeline preparación 4-6 semanas', included: true },
      { text: 'Protocolo post-op completo', included: true },
      { text: 'Evidencia científica por factor', included: true },
      { text: 'Recursos de apoyo', included: true },
      { text: 'Análisis de sinergias', included: false },
    ],
    cta: 'Obtener Plan de Acción'
  },
  {
    id: 'COMPLETE',
    name: 'Evaluación Clínica Avanzada',
    price: '$29.990',
    priceAmount: 29990,
    description: 'Análisis integral con optimización',
    features: [
      { text: 'Todo lo de Plan de Acción', included: true },
      { text: 'Análisis de sinergias de factores', included: true },
      { text: 'Planificación por sector anatómico', included: true },
      { text: 'Comparación de escenarios', included: true },
      { text: 'Estimación de costos detallada', included: true },
      { text: 'Simulador What-If', included: true },
      { text: 'Cronograma clínico 6 meses', included: true },
    ],
    cta: 'Obtener Premium'
  }
];
