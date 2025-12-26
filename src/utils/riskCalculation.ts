import { DensityProAnswers, ImplantXAnswers, AssessmentResult, RiskFactor, Recommendation } from "@/types/questionnaire";

export type PronosticoLevel = 'excelente' | 'muy-favorable' | 'favorable' | 'favorable-precaucion' | 'requiere-atencion';

export interface SynergyFactor {
  description: string;
  impact: number;
}

export interface EnhancedAssessmentResult extends AssessmentResult {
  pronosticoLevel: PronosticoLevel;
  pronosticoLabel: string;
  pronosticoMessage: string;
  pronosticoColor: string;
  synergies: SynergyFactor[];
}

// ============= MOTOR DE RIESGO IMPLANTX v3.5 =============
// Basado en literatura científica y validación clínica

const BASE_FAIL = 0.05; // 5% tasa de fracaso base

interface RiskInput {
  // Tabaquismo
  smoker: boolean;
  cigsPerDay: number;
  
  // Diabetes
  diabetes: boolean;
  diabetesControlled: boolean;
  
  // Bruxismo
  bruxism: boolean;
  bruxismGuard: boolean;
  
  // Tiempo desde pérdida dental
  toothLossTime: '<1' | '1-3' | '>3';
  
  // Zona de implante
  zone: 'maxAnt' | 'maxPost' | 'mandAnt' | 'mandPost';
  
  // Número de dientes a rehabilitar
  nTeeth: number;
  
  // Causa de pérdida dental
  cause: 'trauma' | 'caries' | 'perio' | 'other';
  
  // Condición oral activa
  activeIssue: 'none' | 'caries' | 'mobility' | 'perioActive';
  
  // Higiene
  hygiene: 'good' | 'regular' | 'bad';
  
  // Periodontitis previa
  periodontitis: boolean;
  
  // Edad
  age: number;
  
  // NUEVO: Historial de implantes fallidos
  implantFailed: boolean;
}

interface RiskOutput {
  successPct: number;
  level: 1 | 2 | 3 | 4 | 5;
  synergies: string[];
  individualRisks: Record<string, number>;
}

function calculateImplantXRisk(input: RiskInput): RiskOutput {
  // 1. RR individuales
  const rrSmoke = !input.smoker ? 1.0 : input.cigsPerDay < 10 ? 1.3 : 2.0;
  const rrDiab = !input.diabetes ? 1.0 : input.diabetesControlled ? 1.2 : 1.8;
  const rrBrux = !input.bruxism ? 1.0 : input.bruxismGuard ? 1.4 : 4.0;
  const rrTime = input.toothLossTime === "<1" ? 1.0 : input.toothLossTime === "1-3" ? 1.2 : 1.4;
  const rrZone = input.zone === "maxAnt" ? 1.0 : input.zone === "maxPost" ? 1.3 : input.zone === "mandAnt" ? 1.1 : 1.4;
  const rrNumber = input.nTeeth === 1 ? 1.0 : input.nTeeth <= 4 ? 1.2 : 1.4;
  const rrCause = input.cause === "trauma" ? 1.0 : input.cause === "caries" ? 1.1 : input.cause === "perio" ? 2.0 : 1.1;
  const rrCond = input.activeIssue === "none" ? 1.0 : input.activeIssue === "caries" || input.activeIssue === "mobility" ? 1.5 : 2.0;
  const rrHyg = input.hygiene === "good" ? 1.0 : input.hygiene === "regular" ? 1.5 : 2.0;
  const rrPerio = input.periodontitis ? 2.5 : 1.0;
  const rrAge = input.age < 40 ? 1.0 : input.age <= 65 ? 1.1 : 1.2;
  
  // NUEVO: RR para historial de implantes fallidos (predictor fuerte según literatura)
  const rrImplantFailed = input.implantFailed ? 2.5 : 1.0;

  let rrInd = rrSmoke * rrDiab * rrBrux * rrTime * rrZone * rrNumber * rrCause * rrCond * rrHyg * rrPerio * rrAge * rrImplantFailed;

  // 2. Sinergias
  let sf = 1.0;
  const synergies: string[] = [];

  if (input.smoker && input.cigsPerDay >= 10 && input.diabetes) {
    sf *= 1.3;
    synergies.push("Tabaquismo intenso + diabetes");
  }

  if (input.bruxism && !input.bruxismGuard && input.zone === "mandPost") {
    sf *= 1.2;
    synergies.push("Bruxismo sin férula + mandíbula posterior");
  }

  if (input.periodontitis && input.hygiene === "bad") {
    sf *= 1.4;
    synergies.push("Antecedente de periodontitis + higiene deficiente");
  }

  if (input.smoker && input.cigsPerDay >= 10 && input.periodontitis) {
    sf *= 1.3;
    synergies.push("Tabaquismo intenso + periodontitis previa");
  }

  if (!input.diabetesControlled && input.diabetes && input.hygiene === "bad") {
    sf *= 1.3;
    synergies.push("Diabetes no controlada + higiene oral deficiente");
  }

  if (input.nTeeth > 1 && input.bruxism && !input.bruxismGuard) {
    sf *= 1.2;
    synergies.push("Rehabilitación múltiple + bruxismo sin férula");
  }

  if (input.toothLossTime === ">3" && input.zone === "maxPost") {
    sf *= 1.2;
    synergies.push("Pérdida de larga evolución + maxilar posterior");
  }

  if (input.age > 65 && input.periodontitis && input.hygiene === "bad") {
    sf *= 1.2;
    synergies.push("Edad avanzada + periodontitis + higiene deficiente");
  }

  const rrTot = rrInd * sf;

  // 3. Probabilidades
  let failProb = BASE_FAIL * rrTot;
  if (failProb > 0.80) failProb = 0.80;

  const successProb = 1 - failProb;
  const successPct = Math.round(successProb * 100);

  // 4. Nivel (1=excelente, 5=requiere atención)
  let level: 1 | 2 | 3 | 4 | 5;
  if (successProb >= 0.90) level = 1;
  else if (successProb >= 0.80) level = 2;
  else if (successProb >= 0.70) level = 3;
  else if (successProb >= 0.60) level = 4;
  else level = 5;

  return {
    successPct,
    level,
    synergies,
    individualRisks: {
      tabaco: rrSmoke,
      diabetes: rrDiab,
      bruxismo: rrBrux,
      tiempo: rrTime,
      zona: rrZone,
      cantidad: rrNumber,
      causa: rrCause,
      condicion: rrCond,
      higiene: rrHyg,
      periodontitis: rrPerio,
      edad: rrAge,
      implanteFallido: rrImplantFailed
    }
  };
}

// Mapear respuestas del cuestionario al formato del motor
function mapAnswersToRiskInput(
  densityAnswers: DensityProAnswers | null,
  implantAnswers: ImplantXAnswers,
  age: number
): RiskInput {
  // Mapear tabaquismo
  const smoker = implantAnswers.smoking !== 'no';
  const cigsPerDay = implantAnswers.smoking === '10-plus' ? 15 : implantAnswers.smoking === 'less-10' ? 5 : 0;

  // Mapear diabetes
  const diabetes = implantAnswers.diabetes !== 'no';
  const diabetesControlled = implantAnswers.diabetes === 'controlled';

  // Mapear bruxismo y uso de férula
  const bruxism = implantAnswers.bruxism === 'yes';
  const bruxismGuard = implantAnswers.bruxismGuard === 'yes';
  
  // Historial de implantes fallidos
  const implantFailed = implantAnswers.implantHistory === 'failed';

  // Mapear causa de pérdida
  const causeMap: Record<string, 'trauma' | 'caries' | 'perio' | 'other'> = {
    'trauma': 'trauma',
    'cavity': 'caries',
    'periodontitis': 'perio',
    'other': 'other'
  };
  const cause = causeMap[implantAnswers.toothLossCause] || 'other';

  // Determinar zona basándose en implantZones
  const zone = determineZone(implantAnswers.implantZones);

  // Número de dientes
  const nTeeth = implantAnswers.implantZones?.length || 1;

  // Mapear higiene
  const hygieneMap: Record<string, 'good' | 'regular' | 'bad'> = {
    'twice-plus': 'good',
    'once': 'regular',
    'less-once': 'bad'
  };
  const hygiene = hygieneMap[implantAnswers.oralHygiene] || 'regular';

  // Periodontitis previa
  const periodontitis = implantAnswers.toothLossCause === 'periodontitis';

  // Condición activa basada en sangrado de encías
  const activeIssue: 'none' | 'caries' | 'mobility' | 'perioActive' = 
    implantAnswers.gumBleeding === 'frequently' ? 'perioActive' :
    implantAnswers.gumBleeding === 'sometimes' ? 'mobility' : 'none';

  // Tiempo desde pérdida dental
  const toothLossTimeMap: Record<string, '<1' | '1-3' | '>3'> = {
    'less-1': '<1',
    '1-3': '1-3',
    'more-3': '>3'
  };
  const toothLossTime = toothLossTimeMap[implantAnswers.toothLossTime] || '1-3';

  return {
    smoker,
    cigsPerDay,
    diabetes,
    diabetesControlled,
    bruxism,
    bruxismGuard,
    toothLossTime,
    zone,
    nTeeth,
    cause,
    activeIssue,
    hygiene,
    periodontitis,
    age,
    implantFailed
  };
}

// Determinar zona predominante de implantes
function determineZone(zones: string[]): 'maxAnt' | 'maxPost' | 'mandAnt' | 'mandPost' {
  if (!zones || zones.length === 0) return 'maxAnt';
  
  // Clasificar dientes por zona
  const anteriorMaxilar = ['11', '12', '13', '21', '22', '23'];
  const posteriorMaxilar = ['14', '15', '16', '17', '18', '24', '25', '26', '27', '28'];
  const anteriorMandibular = ['31', '32', '33', '41', '42', '43'];
  const posteriorMandibular = ['34', '35', '36', '37', '38', '44', '45', '46', '47', '48'];

  let counts = { maxAnt: 0, maxPost: 0, mandAnt: 0, mandPost: 0 };

  for (const zone of zones) {
    if (anteriorMaxilar.includes(zone)) counts.maxAnt++;
    else if (posteriorMaxilar.includes(zone)) counts.maxPost++;
    else if (anteriorMandibular.includes(zone)) counts.mandAnt++;
    else if (posteriorMandibular.includes(zone)) counts.mandPost++;
  }

  // Retornar zona con más implantes
  const maxCount = Math.max(counts.maxAnt, counts.maxPost, counts.mandAnt, counts.mandPost);
  if (counts.mandPost === maxCount) return 'mandPost';
  if (counts.maxPost === maxCount) return 'maxPost';
  if (counts.mandAnt === maxCount) return 'mandAnt';
  return 'maxAnt';
}

// Obtener detalles del pronóstico basado en nivel
const getPronosticoDetails = (level: 1 | 2 | 3 | 4 | 5): { 
  level: PronosticoLevel; 
  label: string; 
  message: string; 
  color: string;
} => {
  switch (level) {
    case 1:
      return {
        level: 'excelente',
        label: 'Pronóstico Excelente',
        message: '¡Felicidades! Tu perfil de salud es ideal para un tratamiento con implantes. Las condiciones son óptimas para un resultado exitoso.',
        color: 'success'
      };
    case 2:
      return {
        level: 'muy-favorable',
        label: 'Pronóstico Muy Favorable',
        message: 'Tu perfil muestra muy buenas condiciones para el tratamiento. Con los cuidados estándar, las probabilidades de éxito son muy altas.',
        color: 'success'
      };
    case 3:
      return {
        level: 'favorable',
        label: 'Pronóstico Favorable',
        message: 'Tu perfil es adecuado para el tratamiento. Hay algunos factores a optimizar que tu especialista puede ayudarte a manejar.',
        color: 'warning'
      };
    case 4:
      return {
        level: 'favorable-precaucion',
        label: 'Favorable con Precauciones',
        message: 'El tratamiento es posible con un plan personalizado. Tu especialista diseñará un protocolo específico para optimizar tus resultados.',
        color: 'warning'
      };
    case 5:
      return {
        level: 'requiere-atencion',
        label: 'Requiere Preparación',
        message: 'Se recomienda preparación previa al tratamiento. Con los ajustes adecuados, podremos optimizar las condiciones para tu implante.',
        color: 'warning'
      };
  }
};

// Generar factores de riesgo explicados
function generateRiskFactors(input: RiskInput, individualRisks: Record<string, number>): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (individualRisks.tabaco > 1) {
    factors.push({
      name: 'Hábito de Tabaco',
      impact: individualRisks.tabaco >= 2 ? 'high' : 'medium',
      description: individualRisks.tabaco >= 2 
        ? 'El tabaquismo intenso afecta la cicatrización y la oseointegración'
        : 'El consumo moderado de tabaco puede impactar la cicatrización'
    });
  }

  if (individualRisks.diabetes > 1) {
    factors.push({
      name: 'Diabetes',
      impact: individualRisks.diabetes >= 1.8 ? 'high' : 'medium',
      description: individualRisks.diabetes >= 1.8
        ? 'La diabetes no controlada requiere estabilización previa'
        : 'Tu buen control glucémico es favorable para el tratamiento'
    });
  }

  if (individualRisks.bruxismo > 1) {
    factors.push({
      name: 'Bruxismo',
      impact: individualRisks.bruxismo >= 4 ? 'high' : 'medium',
      description: 'El rechinamiento dental puede manejarse con una férula de protección'
    });
  }

  if (individualRisks.periodontitis > 1) {
    factors.push({
      name: 'Salud Periodontal',
      impact: 'high',
      description: 'El historial periodontal requiere tratamiento previo para asegurar el éxito'
    });
  }

  if (individualRisks.higiene > 1) {
    factors.push({
      name: 'Higiene Oral',
      impact: individualRisks.higiene >= 2 ? 'high' : 'medium',
      description: 'Mejorar la rutina de higiene optimizará los resultados a largo plazo'
    });
  }

  if (individualRisks.condicion > 1) {
    factors.push({
      name: 'Salud de Encías',
      impact: individualRisks.condicion >= 2 ? 'high' : 'medium',
      description: 'La inflamación gingival debe tratarse antes del procedimiento'
    });
  }

  if (individualRisks.zona > 1.2) {
    factors.push({
      name: 'Zona de Implante',
      impact: 'medium',
      description: 'La zona posterior requiere consideraciones especiales de fuerza masticatoria'
    });
  }

  if (individualRisks.cantidad > 1) {
    factors.push({
      name: 'Rehabilitación Múltiple',
      impact: 'medium',
      description: 'Múltiples implantes requieren una planificación cuidadosa'
    });
  }

  // NUEVO: Factor de riesgo para implantes fallidos previos
  if (individualRisks.implanteFallido > 1) {
    factors.push({
      name: 'Historial de Implantes',
      impact: 'high',
      description: 'Un fracaso previo requiere investigar las causas para optimizar el nuevo tratamiento'
    });
  }

  return factors;
}

// Generar recomendaciones personalizadas
function generateRecommendations(input: RiskInput, synergies: string[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (input.smoker && input.cigsPerDay >= 10) {
    recommendations.push({
      title: 'Reducción de Tabaco',
      description: 'Reducir o pausar el consumo de tabaco 2-4 semanas antes y después del procedimiento mejora significativamente la cicatrización',
      priority: 'high'
    });
  } else if (input.smoker) {
    recommendations.push({
      title: 'Precaución con Tabaco',
      description: 'Evitar fumar las primeras 48-72 horas post-cirugía optimizará la cicatrización inicial',
      priority: 'medium'
    });
  }

  if (input.diabetes && !input.diabetesControlled) {
    recommendations.push({
      title: 'Control Glucémico',
      description: 'Trabajar con tu médico para estabilizar la glucosa (HbA1c <7%) antes del procedimiento',
      priority: 'high'
    });
  }

  if (input.bruxism && !input.bruxismGuard) {
    recommendations.push({
      title: 'Férula de Protección',
      description: 'Una férula nocturna protegerá tu implante de las fuerzas del bruxismo',
      priority: 'high'
    });
  }

  // NUEVO: Recomendación para historial de implantes fallidos
  if (input.implantFailed) {
    recommendations.push({
      title: 'Evaluación Diagnóstica',
      description: 'Antes del nuevo implante, es importante investigar las causas del fracaso anterior para evitar repetirlas',
      priority: 'high'
    });
  }

  if (input.periodontitis) {
    recommendations.push({
      title: 'Tratamiento Periodontal',
      description: 'Estabilizar la salud periodontal antes del implante asegura una base sólida',
      priority: 'high'
    });
  }

  if (input.hygiene === 'bad') {
    recommendations.push({
      title: 'Mejora de Higiene Oral',
      description: 'Establecer rutina de cepillado 2 veces al día + hilo dental es esencial para el éxito',
      priority: 'high'
    });
  }

  if (input.activeIssue !== 'none') {
    recommendations.push({
      title: 'Tratamiento Gingival',
      description: 'Tratar la inflamación de encías antes del procedimiento mejorará los resultados',
      priority: 'medium'
    });
  }

  // Agregar recomendaciones para sinergias
  if (synergies.length > 0) {
    recommendations.push({
      title: 'Plan Personalizado',
      description: 'Tu caso presenta factores combinados que requieren un protocolo especializado',
      priority: 'high'
    });
  }

  // Recomendaciones estándar
  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Mantenimiento Preventivo',
      description: 'Visitas de control cada 6 meses para asegurar el éxito a largo plazo',
      priority: 'medium'
    });
  }

  recommendations.push({
    title: 'Planificación 3D',
    description: 'Una tomografía permitirá planificar con precisión milimétrica tu tratamiento',
    priority: 'medium'
  });

  return recommendations;
}

export const calculateRiskAssessment = (
  densityAnswers: DensityProAnswers | null,
  implantAnswers: ImplantXAnswers,
  age: number = 45
): EnhancedAssessmentResult => {
  // Mapear respuestas al formato del motor
  const riskInput = mapAnswersToRiskInput(densityAnswers, implantAnswers, age);
  
  // Calcular riesgo con el motor ImplantX v3.5
  const riskOutput = calculateImplantXRisk(riskInput);
  
  // Obtener detalles del pronóstico
  const pronostico = getPronosticoDetails(riskOutput.level);
  
  // Generar factores y recomendaciones
  const riskFactors = generateRiskFactors(riskInput, riskOutput.individualRisks);
  const recommendations = generateRecommendations(riskInput, riskOutput.synergies);
  
  // Mapear sinergias a formato enriquecido
  const synergies: SynergyFactor[] = riskOutput.synergies.map(s => ({
    description: s,
    impact: 1.2
  }));

  // Determinar nivel de riesgo tradicional
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskOutput.level <= 2) riskLevel = 'low';
  else if (riskOutput.level <= 4) riskLevel = 'medium';
  else riskLevel = 'high';

  return {
    riskLevel,
    successProbability: riskOutput.successPct,
    riskFactors,
    recommendations,
    pronosticoLevel: pronostico.level,
    pronosticoLabel: pronostico.label,
    pronosticoMessage: pronostico.message,
    pronosticoColor: pronostico.color,
    synergies
  };
};
