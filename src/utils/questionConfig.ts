export type QuestionComplexity = 'simple' | 'moderate' | 'complex';

interface QuestionConfig {
  complexity: QuestionComplexity;
  clinicalContext?: string;
}

export const questionConfigs: Record<string, QuestionConfig> = {
  // DensityPro questions
  fractures: {
    complexity: 'complex',
    clinicalContext: 'Las fracturas por fragilidad (causadas por un trauma leve, como una caída desde la altura de pie) son un indicador importante de la salud ósea. Pueden sugerir osteoporosis. Si el paciente responde sí, explica que esto no impide el tratamiento pero es información valiosa para planificarlo mejor.'
  },
  heightLoss: {
    complexity: 'moderate',
    clinicalContext: 'Una pérdida de estatura superior a 3 cm puede indicar fracturas por compresión vertebral, a menudo relacionadas con osteoporosis. Explica de forma tranquilizadora que esto ayuda a personalizar el plan de tratamiento.'
  },
  familyHistory: {
    complexity: 'moderate',
    clinicalContext: 'La genética influye en la salud ósea. Tener padres con osteoporosis aumenta el riesgo propio. Tranquiliza al paciente diciendo que conocer esto nos ayuda a tomar precauciones preventivas.'
  },
  corticosteroids: {
    complexity: 'complex',
    clinicalContext: 'El uso prolongado de corticoides (prednisona, cortisona) puede afectar la densidad ósea. Si el paciente toma estos medicamentos, explica que esto se considera en la planificación y hay formas de optimizar el resultado.'
  },
  alcohol: {
    complexity: 'simple',
    clinicalContext: 'El consumo excesivo de alcohol interfiere con la absorción de calcio. Si el paciente indica que consume bastante, sugiere amablemente que reducir un poco puede ayudar a la cicatrización.'
  },

  // ImplantX questions
  smoking: {
    complexity: 'complex',
    clinicalContext: 'El tabaco reduce el flujo sanguíneo y aumenta 2-3 veces el riesgo de fracaso. IMPORTANTE: Si el paciente fuma, NO lo juzgues. Explica que reducir aunque sea temporalmente antes y después del procedimiento puede mejorar mucho los resultados. Ofrece esperanza.'
  },
  bruxism: {
    complexity: 'moderate',
    clinicalContext: 'El bruxismo (apretar o rechinar los dientes) ejerce fuerza excesiva sobre los implantes. Muchas personas lo hacen sin saberlo, especialmente al dormir. Si el paciente tiene bruxismo, menciona que existe una solución simple: la férula de descarga nocturna.'
  },
  bruxismGuard: {
    complexity: 'simple',
    clinicalContext: 'El uso de férula de descarga reduce significativamente el riesgo asociado al bruxismo. Si ya usa férula, felicítalo por cuidar su salud dental. Si no la usa, explica que es una inversión importante para proteger su implante a largo plazo.'
  },
  diabetes: {
    complexity: 'complex',
    clinicalContext: 'La diabetes afecta la cicatrización y la capacidad de combatir infecciones. IMPORTANTE: Si tiene diabetes controlada, felicítalo por su buen manejo. Si no está controlada, enfatiza que trabajar con su médico para mejorar el control antes del procedimiento puede marcar una gran diferencia. Nunca hagas sentir mal al paciente.'
  },
  implantHistory: {
    complexity: 'complex',
    clinicalContext: 'El historial de implantes previos es muy informativo. Si tuvieron éxito, es una buena señal. Si fracasaron, es uno de los predictores más fuertes de riesgo futuro, PERO no significa que no se pueda hacer bien esta vez. Explica que entender qué pasó nos ayuda a evitar los mismos problemas.'
  },
  toothLossCause: {
    complexity: 'moderate',
    clinicalContext: 'Si la pérdida fue por periodontitis (enfermedad de las encías), el hueso alrededor puede estar comprometido, pero esto se puede tratar. Si fue por trauma o caries, generalmente el hueso está en mejor estado. Adapta tu respuesta según la causa.'
  },
  toothLossTime: {
    complexity: 'moderate',
    clinicalContext: 'El tiempo transcurrido desde la pérdida dental afecta la cantidad de hueso disponible. Con el tiempo, el hueso donde estaba el diente tiende a reabsorberse. Si pasó menos de 1 año, generalmente hay buen volumen óseo. Entre 1-3 años puede haber algo de reabsorción. Más de 3 años suele requerir evaluación más detallada del hueso, pero hay técnicas como injertos que lo solucionan.'
  },
  gumBleeding: {
    complexity: 'moderate',
    clinicalContext: 'El sangrado frecuente de encías es signo de gingivitis o periodontitis activa. Si el paciente indica sangrado frecuente, explica amablemente que tratar esto primero asegura una base sólida para el implante.'
  },
  oralHygiene: {
    complexity: 'complex',
    clinicalContext: 'La higiene oral es CRÍTICA para el éxito a largo plazo del implante. Si el paciente se cepilla poco, NO lo critiques. En cambio, explica los beneficios de mejorar este hábito y ofrece motivación: "Es un pequeño cambio que puede hacer una gran diferencia en la duración de tu implante".'
  },
  implantZones: {
    complexity: 'simple',
    clinicalContext: 'Las zonas posteriores (muelas) soportan más fuerza al masticar y a veces tienen hueso de menor calidad. Las zonas anteriores son más visibles estéticamente. Menciona brevemente que el especialista evaluará las características específicas de esa zona.'
  },
  teethCount: {
    complexity: 'moderate',
    clinicalContext: 'El número de dientes a reemplazar determina el tipo de tratamiento. Para 1-2 dientes, implantes unitarios son ideales. Para varios dientes, puentes sobre implantes. Para edentulismo total (todos los dientes), tratamientos como All-on-4 o All-on-6 son los más recomendados. Tranquiliza al paciente explicando que hay soluciones para cada caso.'
  }
};

export const getQuestionConfig = (questionId: string): QuestionConfig => {
  return questionConfigs[questionId] || { complexity: 'simple' };
};
