// Datos de ejemplo completos para probar los 3 tiers del Reporte ImplantX v3.0
import { ImplantXReportRequest, RiskFactor, TimelineWeek, PostOpPhase, Synergy, AnatomicalSector, AdherenceScenario } from '@/types/implantx-report';

// ============================================================================
// DATOS COMPARTIDOS (usados en todos los tiers)
// ============================================================================

const sharedRiskFactors: RiskFactor[] = [
  {
    factorName: "Tabaquismo Activo",
    yourSituation: "Fuma 15 cigarrillos diarios desde hace 12 años",
    relativeRisk: 2.4,
    realWorldComparison: "De cada 100 fumadores que se colocan implantes, 24 experimentan complicaciones vs solo 10 en no fumadores",
    biologicalMechanisms: [
      {
        title: "Vasoconstricción",
        points: [
          "La nicotina reduce el flujo sanguíneo al hueso en un 30-40%",
          "Menor aporte de oxígeno y nutrientes a la zona del implante",
          "Retraso en la cicatrización de 2-3 semanas adicionales"
        ]
      },
      {
        title: "Deterioro Inmunológico",
        points: [
          "Reducción de la actividad de macrófagos y neutrófilos",
          "Mayor susceptibilidad a infecciones periimplantarias",
          "Respuesta inflamatoria crónica que afecta la osteointegración"
        ]
      }
    ],
    requiredActions: [
      "Suspender tabaco mínimo 4 semanas antes de la cirugía",
      "Mantener abstinencia durante 8 semanas post-cirugía",
      "Considerar terapia de reemplazo de nicotina bajo supervisión médica"
    ],
    adherenceBenefit: {
      riskReduction: "Del RR 2.4 → 1.3 (reducción del 46%)",
      successIncrease: "De 76% → 91% probabilidad de éxito",
      complicationsReduction: "Infecciones tempranas reducidas en 65%"
    },
    supportResources: [
      "Programa de cesación tabáquica MINSAL",
      "App Quitnow! para seguimiento",
      "Línea de apoyo 600-360-7777"
    ],
    evidenceLevel: 'A',
    scientificReference: "Chrcanovic et al. (2015) - Meta-análisis de 107 estudios, n=19,214 implantes"
  },
  {
    factorName: "Diabetes Mellitus Tipo 2",
    yourSituation: "HbA1c de 7.8% (control moderado)",
    relativeRisk: 1.8,
    realWorldComparison: "De cada 100 diabéticos con HbA1c >7%, 18 tienen complicaciones vs 10 con control óptimo",
    biologicalMechanisms: [
      {
        title: "Microangiopatía",
        points: [
          "Daño a pequeños vasos sanguíneos que irrigan el hueso",
          "Reducción del aporte de células reparadoras",
          "Cicatrización retardada en un 40%"
        ]
      },
      {
        title: "Alteración del Metabolismo Óseo",
        points: [
          "Menor actividad de osteoblastos (células formadoras de hueso)",
          "Acumulación de AGEs que debilitan la matriz ósea",
          "Osteointegración más lenta (4-6 semanas adicionales)"
        ]
      }
    ],
    requiredActions: [
      "Optimizar HbA1c a <7% antes de la cirugía",
      "Control glucémico estricto perioperatorio",
      "Coordinación con endocrinólogo para ajuste de medicación"
    ],
    adherenceBenefit: {
      riskReduction: "Del RR 1.8 → 1.2 con HbA1c <7%",
      successIncrease: "De 82% → 93% probabilidad de éxito",
      complicationsReduction: "Infecciones reducidas en 55%"
    },
    supportResources: [
      "Control mensual con diabetólogo",
      "Monitoreo continuo de glucosa",
      "Educación nutricional especializada"
    ],
    evidenceLevel: 'A',
    scientificReference: "Naujokat et al. (2016) - Revisión sistemática, 23 estudios clínicos"
  },
  {
    factorName: "Bruxismo Nocturno",
    yourSituation: "Bruxismo moderado diagnosticado, sin tratamiento actual",
    relativeRisk: 1.6,
    realWorldComparison: "De cada 100 bruxómanos, 16 experimentan aflojamiento del implante vs 10 sin bruxismo",
    biologicalMechanisms: [
      {
        title: "Sobrecarga Mecánica",
        points: [
          "Fuerzas de hasta 1000N aplicadas durante el sueño",
          "Microfracturas en la interfaz hueso-implante",
          "Pérdida ósea marginal acelerada"
        ]
      },
      {
        title: "Fatiga del Material",
        points: [
          "Desgaste prematuro de componentes protésicos",
          "Aflojamiento de tornillos de fijación",
          "Riesgo de fractura de la corona"
        ]
      }
    ],
    requiredActions: [
      "Confección de placa de descarga nocturna",
      "Uso obligatorio durante el sueño post-implante",
      "Evaluación de técnicas de relajación mandibular"
    ],
    adherenceBenefit: {
      riskReduction: "Del RR 1.6 → 1.1 con placa de descarga",
      successIncrease: "De 84% → 95% a largo plazo",
      complicationsReduction: "Fracturas protésicas reducidas en 80%"
    },
    supportResources: [
      "Terapia de relajación muscular",
      "Ejercicios de fisioterapia mandibular",
      "App de seguimiento del sueño"
    ],
    evidenceLevel: 'B',
    scientificReference: "Lobbezoo et al. (2019) - Consenso internacional sobre bruxismo"
  }
];

const sharedTimeline: TimelineWeek[] = [
  {
    weekLabel: "Semana 1-2",
    title: "Preparación Sistémica",
    actions: [
      { category: 'CRÍTICO', action: "Suspender tabaco completamente" },
      { category: 'CRÍTICO', action: "Control glucémico con endocrinólogo" },
      { category: 'IMPORTANTE', action: "Exámenes de laboratorio (hemograma, coagulación)" },
      { category: 'RECOMENDADO', action: "Inicio de suplementación con Vitamina D" }
    ]
  },
  {
    weekLabel: "Semana 2-3",
    title: "Preparación Bucal",
    actions: [
      { category: 'CRÍTICO', action: "Limpieza dental profesional profunda" },
      { category: 'IMPORTANTE', action: "Tratamiento de caries activas" },
      { category: 'IMPORTANTE', action: "Confección de placa de descarga" },
      { category: 'RECOMENDADO', action: "Enjuague con clorhexidina 0.12%" }
    ]
  },
  {
    weekLabel: "Semana 3-4",
    title: "Pre-Quirúrgico",
    actions: [
      { category: 'CRÍTICO', action: "Confirmación de suspensión de tabaco (mínimo 14 días)" },
      { category: 'CRÍTICO', action: "HbA1c de control (<7%)" },
      { category: 'IMPORTANTE', action: "Planificación 3D del implante" },
      { category: 'RECOMENDADO', action: "Instrucciones post-operatorias revisadas" }
    ]
  },
  {
    weekLabel: "Semana 4",
    title: "Cirugía",
    actions: [
      { category: 'CRÍTICO', action: "Cirugía de colocación del implante" },
      { category: 'CRÍTICO', action: "Antibiótico profiláctico 1 hora antes" },
      { category: 'IMPORTANTE', action: "Dieta blanda inmediata" },
      { category: 'RECOMENDADO', action: "Hielo local las primeras 24 horas" }
    ]
  }
];

const sharedPostOpProtocol: PostOpPhase[] = [
  {
    period: "Día 1-3",
    title: "Fase Inflamatoria Aguda",
    instructions: [
      "Hielo local 20 min on/off las primeras 48 horas",
      "Analgésicos según prescripción (no aspirina)",
      "Dieta líquida fría o tibia (no caliente)",
      "NO enjuagar las primeras 24 horas",
      "Dormir con cabeza elevada 30°"
    ]
  },
  {
    period: "Día 4-14",
    title: "Fase de Cicatrización Inicial",
    instructions: [
      "Enjuagues suaves con agua tibia y sal",
      "Cepillado suave evitando zona del implante",
      "Dieta blanda (purés, sopas, huevos)",
      "Control a los 7 días para revisión de suturas",
      "Mantener abstinencia de tabaco estricta"
    ]
  },
  {
    period: "Semana 2-6",
    title: "Fase de Osteointegración Temprana",
    instructions: [
      "Retorno gradual a dieta normal (evitar duros)",
      "Cepillado normal con cepillo suave",
      "Control radiográfico a las 4 semanas",
      "Uso nocturno de placa de descarga",
      "Evitar masticar del lado del implante"
    ]
  },
  {
    period: "Mes 2-4",
    title: "Fase de Consolidación",
    instructions: [
      "Controles mensuales de osteointegración",
      "Evaluación de carga funcional",
      "Higiene interdental con cepillos especiales",
      "Mantener control glucémico óptimo",
      "Preparación para fase protésica"
    ]
  }
];

// ============================================================================
// DATOS EXCLUSIVOS PARA PLAN COMPLETE (12 páginas)
// ============================================================================

const completeSynergies: Synergy[] = [
  {
    combination: "Tabaquismo + Diabetes",
    individualRisks: [
      { factor: "Tabaquismo", rr: 2.4 },
      { factor: "Diabetes", rr: 1.8 }
    ],
    multiplicativeEffect: 3.2,
    biologicalSynergies: [
      {
        title: "Doble Compromiso Vascular",
        points: [
          "La microangiopatía diabética se potencia con la vasoconstricción nicotínica",
          "Reducción del flujo sanguíneo al hueso de hasta 60%",
          "Hipoxia tisular severa que compromete la cicatrización"
        ]
      },
      {
        title: "Inmunosupresión Combinada",
        points: [
          "Leucocitos disfuncionales por hiperglucemia + toxinas del tabaco",
          "Mayor colonización bacteriana periimplantaria",
          "Respuesta inflamatoria desregulada y persistente"
        ]
      }
    ],
    prioritizedInterventions: [
      {
        priority: "1",
        action: "Cesación tabáquica inmediata",
        impact: "Reduce RR combinado de 3.2 a 2.1",
        result: "Mayor beneficio por menor costo"
      },
      {
        priority: "2",
        action: "Optimización de HbA1c <7%",
        impact: "Reduce RR residual de 2.1 a 1.4",
        result: "Normalización de cicatrización"
      },
      {
        priority: "3",
        action: "Profilaxis antibiótica extendida",
        impact: "Protección adicional durante vulnerabilidad",
        result: "Cobertura durante osteointegración"
      }
    ],
    finalRiskReduction: {
      optimizedRisk: 1.4,
      percentReduction: "56% de reducción del riesgo sinérgico"
    },
    evidence: "Alsaadi et al. (2008) + Marchand et al. (2012) - Estudios combinados n=3,200"
  },
  {
    combination: "Diabetes + Bruxismo",
    individualRisks: [
      { factor: "Diabetes", rr: 1.8 },
      { factor: "Bruxismo", rr: 1.6 }
    ],
    multiplicativeEffect: 2.4,
    biologicalSynergies: [
      {
        title: "Hueso Debilitado + Sobrecarga",
        points: [
          "Matriz ósea diabética con menor capacidad de absorción de fuerzas",
          "Microfracturas más frecuentes bajo carga bruxómana",
          "Pérdida ósea marginal acelerada (0.5mm/año adicional)"
        ]
      },
      {
        title: "Reparación Comprometida",
        points: [
          "Menor capacidad de remodelación ósea adaptativa",
          "Acumulación de daño mecánico sin reparación completa",
          "Mayor riesgo de periimplantitis mecánica"
        ]
      }
    ],
    prioritizedInterventions: [
      {
        priority: "1",
        action: "Placa de descarga nocturna obligatoria",
        impact: "Reduce fuerzas nocturnas en 80%",
        result: "Protección mecánica inmediata"
      },
      {
        priority: "2",
        action: "Control glucémico estricto",
        impact: "Mejora calidad ósea en 12 semanas",
        result: "Mayor resistencia a microfracturas"
      },
      {
        priority: "3",
        action: "Carga protésica progresiva",
        impact: "Adaptación gradual del hueso",
        result: "Osteointegración más estable"
      }
    ],
    finalRiskReduction: {
      optimizedRisk: 1.3,
      percentReduction: "46% de reducción del riesgo sinérgico"
    },
    evidence: "Quintero et al. (2020) - Estudio multicéntrico prospectivo n=890"
  }
];

const completeAnatomicalSectors: AnatomicalSector[] = [
  {
    sector: "Maxilar Posterior (Zona Molar Superior)",
    classification: 'COMPLEX',
    riskLevel: 'HIGH',
    anatomicalChallenges: [
      "Proximidad al seno maxilar (neumatización)",
      "Hueso tipo III-IV (baja densidad)",
      "Altura ósea disponible: 6mm (insuficiente)",
      "Requiere elevación de seno maxilar"
    ],
    surgicalProtocol: [
      {
        phase: "Elevación de Seno",
        timing: "Mes 1",
        details: "Técnica de ventana lateral con injerto óseo particulado",
        duration: "90 minutos"
      },
      {
        phase: "Maduración del Injerto",
        timing: "Mes 2-7",
        details: "Período de consolidación del injerto (6 meses)",
        duration: "6 meses espera"
      },
      {
        phase: "Colocación de Implante",
        timing: "Mes 7",
        details: "Implante de 10mm con torque de inserción controlado",
        duration: "45 minutos"
      },
      {
        phase: "Osteointegración",
        timing: "Mes 7-11",
        details: "Cicatrización sumergida por 4 meses (hueso injertado)",
        duration: "4 meses espera"
      },
      {
        phase: "Rehabilitación Protésica",
        timing: "Mes 11-12",
        details: "Corona definitiva atornillada",
        duration: "2 semanas"
      }
    ],
    totalTimeline: "12 meses",
    specificRisks: [
      "Perforación de membrana sinusal (5-10%)",
      "Sinusitis post-operatoria (3%)",
      "Pérdida parcial del injerto (8%)",
      "Osteointegración más lenta en hueso injertado"
    ],
    estimatedCost: {
      min: 3500000,
      max: 4500000,
      breakdown: [
        { item: "Elevación de seno + injerto", cost: "$1.200.000 - $1.500.000" },
        { item: "Implante premium", cost: "$890.000 - $1.100.000" },
        { item: "Pilar y corona definitiva", cost: "$650.000 - $850.000" },
        { item: "Controles y radiografías", cost: "$180.000 - $250.000" },
        { item: "Medicamentos y cuidados", cost: "$80.000 - $120.000" }
      ]
    }
  },
  {
    sector: "Mandíbula Anterior (Zona Incisivos Inferiores)",
    classification: 'SIMPLE',
    riskLevel: 'LOW',
    anatomicalChallenges: [
      "Hueso tipo I-II (alta densidad)",
      "Altura ósea generalmente suficiente",
      "Considerar nervio mentoniano (más posterior)"
    ],
    surgicalProtocol: [
      {
        phase: "Colocación de Implante",
        timing: "Mes 1",
        details: "Implante directo con carga inmediata posible",
        duration: "30 minutos"
      },
      {
        phase: "Provisorio",
        timing: "Mes 1",
        details: "Corona provisional si estética es prioritaria",
        duration: "Mismo día"
      },
      {
        phase: "Osteointegración",
        timing: "Mes 1-3",
        details: "Cicatrización estándar (3 meses)",
        duration: "3 meses"
      },
      {
        phase: "Corona Definitiva",
        timing: "Mes 3-4",
        details: "Corona cerámica definitiva",
        duration: "2 semanas"
      }
    ],
    totalTimeline: "4 meses",
    specificRisks: [
      "Fenestración vestibular por hueso fino (5%)",
      "Recesión gingival estética (10%)",
      "Expectativas estéticas altas en zona visible"
    ],
    estimatedCost: {
      min: 1200000,
      max: 1800000,
      breakdown: [
        { item: "Implante estándar", cost: "$650.000 - $890.000" },
        { item: "Pilar y corona cerámica", cost: "$450.000 - $650.000" },
        { item: "Controles", cost: "$80.000 - $120.000" }
      ]
    }
  }
];

const completeAdherenceScenarios: AdherenceScenario[] = [
  {
    scenario: "Cumplimiento Total",
    adherenceLevel: '100%',
    icon: "✅",
    actions: [
      "Suspende tabaco 4 semanas antes y mantiene abstinencia",
      "Logra HbA1c de 6.5% antes de la cirugía",
      "Usa placa de descarga todas las noches",
      "Asiste a todos los controles programados",
      "Sigue protocolo de higiene al 100%"
    ],
    results: {
      overallSuccess: "96%",
      healingTime: "3 meses (estándar)",
      minorComplications: "5%",
      majorComplications: "<1%",
      lifeExpectancy: ">20 años",
      qualityOfLife: "Excelente",
      totalCost: "$1.800.000 - $2.200.000"
    }
  },
  {
    scenario: "Cumplimiento Parcial",
    adherenceLevel: 'PARCIAL',
    icon: "⚠️",
    actions: [
      "Reduce tabaco pero no suspende completamente",
      "HbA1c mejora a 7.5% pero no alcanza meta",
      "Usa placa de descarga ocasionalmente",
      "Asiste a la mayoría de los controles",
      "Higiene irregular"
    ],
    results: {
      overallSuccess: "78%",
      healingTime: "5-6 meses (prolongado)",
      minorComplications: "25%",
      majorComplications: "8%",
      lifeExpectancy: "10-15 años",
      qualityOfLife: "Aceptable con ajustes",
      totalCost: "$2.500.000 - $3.500.000",
      costDifference: "+$700.000 - $1.300.000 por complicaciones"
    },
    specialWarning: "Riesgo de periimplantitis a mediano plazo"
  },
  {
    scenario: "Sin Cambios de Hábitos",
    adherenceLevel: 'NULA',
    icon: "❌",
    actions: [
      "Continúa fumando igual que antes",
      "No modifica control de diabetes",
      "No usa placa de descarga",
      "Falta a controles frecuentemente",
      "Higiene oral deficiente"
    ],
    results: {
      overallSuccess: "52%",
      healingTime: "8+ meses o fracaso",
      minorComplications: "45%",
      majorComplications: "22%",
      lifeExpectancy: "<5 años",
      qualityOfLife: "Comprometida",
      totalCost: "$4.000.000 - $6.000.000",
      costDifference: "+$2.200.000 - $3.800.000 por reintervenciones"
    },
    specialWarning: "ALTO RIESGO de pérdida del implante y necesidad de reintervención"
  }
];

// ============================================================================
// EXPORTAR DATOS DE EJEMPLO PARA CADA TIER
// ============================================================================

export const sampleFreeRequest: ImplantXReportRequest = {
  patientName: "Carlos González Mendoza",
  patientEmail: "carlos.gonzalez@email.com",
  age: 58,
  city: "Santiago",
  plan: 'FREE',
  classification: 'DUDOSO',
  successProbability: 72,
  riskIndex: 28,
  globalRiskMultiplier: 1.8,
  mainAffectingFactors: [
    "Tabaquismo activo (15 cigarrillos/día)",
    "Diabetes tipo 2 (HbA1c 7.8%)",
    "Bruxismo nocturno sin tratamiento"
  ],
  riskFactors: sharedRiskFactors,
  preparationTimeline: sharedTimeline,
  postOpProtocol: sharedPostOpProtocol
};

export const sampleBaseRequest: ImplantXReportRequest = {
  patientName: "Carlos González Mendoza",
  patientEmail: "carlos.gonzalez@email.com",
  age: 58,
  city: "Santiago",
  plan: 'BASE',
  classification: 'DUDOSO',
  successProbability: 72,
  riskIndex: 28,
  globalRiskMultiplier: 1.8,
  mainAffectingFactors: [
    "Tabaquismo activo (15 cigarrillos/día)",
    "Diabetes tipo 2 (HbA1c 7.8%)",
    "Bruxismo nocturno sin tratamiento"
  ],
  riskFactors: sharedRiskFactors,
  preparationTimeline: sharedTimeline,
  postOpProtocol: sharedPostOpProtocol
};

export const sampleCompleteRequest: ImplantXReportRequest = {
  patientName: "Carlos González Mendoza",
  patientEmail: "carlos.gonzalez@email.com",
  age: 58,
  city: "Santiago",
  plan: 'COMPLETE',
  classification: 'DUDOSO',
  successProbability: 72,
  riskIndex: 28,
  globalRiskMultiplier: 1.8,
  mainAffectingFactors: [
    "Tabaquismo activo (15 cigarrillos/día)",
    "Diabetes tipo 2 (HbA1c 7.8%)",
    "Bruxismo nocturno sin tratamiento"
  ],
  riskFactors: sharedRiskFactors,
  preparationTimeline: sharedTimeline,
  postOpProtocol: sharedPostOpProtocol,
  synergies: completeSynergies,
  anatomicalSectors: completeAnatomicalSectors,
  adherenceScenarios: completeAdherenceScenarios
};

// JSON puro para testing en Edge Functions
export const sampleRequestsJSON = {
  FREE: sampleFreeRequest,
  BASE: sampleBaseRequest,
  COMPLETE: sampleCompleteRequest
};

export default sampleRequestsJSON;
