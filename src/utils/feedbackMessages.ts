// Feedback messages for each question based on answer value
export const getFeedbackMessage = (
  question: string,
  value: string
): { type: 'positive' | 'neutral' | 'negative', message: string } => {
  
  // Density questions
  if (question === 'fractures') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'No tener fracturas previas es un excelente indicador. Tu hueso tiene buena resistencia, lo que favorece la integración del implante.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'Las fracturas previas pueden indicar menor densidad ósea. Esto es importante evaluarlo, pero no impide el tratamiento. Con las precauciones adecuadas, podemos lograr excelentes resultados.' 
    };
  }

  if (question === 'heightLoss') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'Mantener tu estatura es un buen signo de salud ósea en tu columna vertebral.' 
      };
    }
    return { 
      type: 'neutral', 
      message: 'La pérdida de estatura puede relacionarse con la salud ósea. Lo importante es que ahora lo estamos evaluando.' 
    };
  }

  if (question === 'familyHistory') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'La ausencia de historial familiar reduce tu riesgo de problemas óseos.' 
      };
    }
    return { 
      type: 'neutral', 
      message: 'Los antecedentes familiares nos ayudan a estar más atentos, pero no determinan tu resultado. La prevención es nuestra mejor herramienta.' 
    };
  }

  if (question === 'corticosteroids') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'Excelente. No tomar corticoides protege tu densidad ósea y favorece la cicatrización.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'Los corticoides pueden afectar el hueso, pero con monitoreo y cuidados especiales podemos compensarlo. Muchos pacientes con este historial tienen implantes exitosos.' 
    };
  }

  if (question === 'alcohol') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'Perfecto. El consumo moderado o nulo de alcohol favorece la absorción de calcio y la salud ósea.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'El consumo elevado puede afectar el metabolismo del calcio. Reducirlo, incluso gradualmente, puede mejorar significativamente tu salud ósea y el éxito del implante.' 
    };
  }

  // Implant questions
  if (question === 'smoking') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: '¡Excelente! No fumar es uno de los factores más importantes para el éxito. La cicatrización será más rápida y el riesgo de complicaciones mucho menor.' 
      };
    }
    if (value === 'less-10') {
      return { 
        type: 'negative', 
        message: 'Fumar reduce el flujo sanguíneo y dificulta la cicatrización. La buena noticia: dejar de fumar incluso 2-3 semanas antes del implante puede mejorar significativamente tus probabilidades de éxito.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'El tabaco es uno de los principales enemigos del implante. Sin embargo, muchos fumadores logran excelentes resultados. Te recomendaríamos reducir o dejar de fumar antes del procedimiento para multiplicar tus posibilidades de éxito.' 
    };
  }

  if (question === 'bruxism') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'Perfecto. No apretar los dientes reduce el estrés sobre el implante y prolonga su vida útil.' 
      };
    }
    if (value === 'unsure') {
      return { 
        type: 'neutral', 
        message: 'Muchas personas aprietan los dientes sin saberlo, especialmente al dormir. Tu especialista puede evaluarlo y, de ser necesario, una férula de descarga protegerá tu implante.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'El bruxismo genera fuerzas excesivas, pero tiene solución simple: una férula de descarga protege el implante eficazmente. Te haré una pregunta más sobre esto.' 
    };
  }

  if (question === 'bruxismGuard') {
    if (value === 'yes') {
      return { 
        type: 'positive', 
        message: '¡Excelente! Usar férula de descarga es una decisión muy inteligente. Esto reduce significativamente el riesgo asociado al bruxismo y protegerá tu implante a largo plazo.' 
      };
    }
    return { 
      type: 'neutral', 
      message: 'No te preocupes, una férula de descarga es algo sencillo de obtener. Tu especialista te recomendará una que se ajuste perfectamente. Es una pequeña inversión que hace una gran diferencia.' 
    };
  }

  if (question === 'diabetes') {
    if (value === 'no') {
      return { 
        type: 'positive', 
        message: 'Excelente. No tener diabetes facilita la cicatrización y reduce el riesgo de infecciones.' 
      };
    }
    if (value === 'controlled') {
      return { 
        type: 'positive', 
        message: 'La diabetes controlada no es impedimento para un implante exitoso. Con un buen control glucémico, los resultados son similares a pacientes sin diabetes.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'La diabetes no controlada puede retrasar la cicatrización. Lo importante es trabajar con tu médico para mejorar el control antes del implante. Una vez controlada, las tasas de éxito son excelentes.' 
    };
  }

  if (question === 'implantHistory') {
    if (value === 'success') {
      return { 
        type: 'positive', 
        message: '¡Perfecto! Tener implantes exitosos previos es el mejor predictor de éxito futuro. Tu cuerpo ya demostró que integra bien los implantes.' 
      };
    }
    if (value === 'no') {
      return { 
        type: 'neutral', 
        message: 'Ser tu primer implante es completamente normal. La mayoría de los implantes son exitosos en el primer intento.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'Un fracaso previo requiere investigar la causa, pero NO significa que volverá a pasar. Muchas veces se debió a factores controlables. Con el diagnóstico correcto, las probabilidades de éxito en un segundo intento son altas.' 
    };
  }

  if (question === 'toothLossCause') {
    if (value === 'cavity' || value === 'trauma') {
      return { 
        type: 'positive', 
        message: 'Perder el diente por caries o trauma generalmente significa que el hueso y las encías alrededor están sanos, lo cual es ideal para el implante.' 
      };
    }
    if (value === 'periodontitis') {
      return { 
        type: 'negative', 
        message: 'La periodontitis puede haber afectado el hueso, pero esto NO impide el implante. Con tratamiento periodontal previo y buenos cuidados posteriores, los resultados son muy buenos.' 
      };
    }
    return { 
      type: 'neutral', 
      message: 'Entender la causa nos ayuda a planificar mejor el tratamiento y prevenir futuras complicaciones.' 
    };
  }

  if (question === 'gumBleeding') {
    if (value === 'never') {
      return { 
        type: 'positive', 
        message: '¡Excelente! Encías sanas que no sangran son fundamentales. Esto indica ausencia de inflamación activa, lo cual es ideal para el implante.' 
      };
    }
    if (value === 'sometimes') {
      return { 
        type: 'neutral', 
        message: 'El sangrado ocasional puede controlarse mejorando la técnica de cepillado. Tu especialista te guiará para lograr encías completamente sanas antes del implante.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'El sangrado frecuente indica inflamación activa que debe tratarse antes del implante. La buena noticia: con limpieza profesional y mejor higiene, esto se resuelve en pocas semanas.' 
    };
  }

  if (question === 'oralHygiene') {
    if (value === 'twice-plus') {
      return { 
        type: 'positive', 
        message: '¡Perfecto! Cepillarse dos o más veces al día es el mejor hábito para mantener tu implante sano a largo plazo. Esto reduce drásticamente el riesgo de infecciones.' 
      };
    }
    if (value === 'once') {
      return { 
        type: 'neutral', 
        message: 'Una vez al día es un inicio, pero aumentar a dos veces (mañana y noche) mejorará mucho la salud de tu implante. Es el factor más importante que está 100% bajo tu control.' 
      };
    }
    return { 
      type: 'negative', 
      message: 'La higiene es crucial para el éxito del implante. Mejorar tus hábitos de cepillado ahora es la mejor inversión para el éxito a largo plazo. Tu especialista te ayudará a crear una rutina efectiva.' 
    };
  }

  if (question === 'implantZones') {
    if (value === 'anterior-superior' || value === 'anterior-inferior') {
      return { 
        type: 'positive', 
        message: 'La zona anterior generalmente tiene hueso de buena calidad y recibe menos fuerza al masticar, lo cual es favorable para el implante.' 
      };
    }
    return { 
      type: 'neutral', 
      message: 'La zona posterior soporta más fuerza al masticar. Tu especialista diseñará el implante considerando estas fuerzas para garantizar durabilidad.' 
    };
  }

  return { type: 'neutral', message: 'Gracias por tu respuesta. Cada factor nos ayuda a crear un plan personalizado.' };
};
