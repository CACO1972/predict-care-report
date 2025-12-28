// Cálculo del Índice de Riesgo Periodontal (IRP)
// Escala de 0-100 puntos basado en las 3 preguntas periodontales

export interface IRPInput {
  gumBleeding: 'never' | 'sometimes' | 'frequently';
  looseTeethLoss: 'no' | '1-2' | 'several';
  oralHygiene: 'less-once' | 'once' | 'twice-plus';
}

export interface IRPResult {
  score: number; // 0-100
  level: 'bajo' | 'moderado' | 'alto';
  levelLabel: string;
  message: string;
  color: string;
  recommendations: string[];
}

/**
 * Calcula el IRP (Índice de Riesgo Periodontal)
 * Puntuación de 0-100 donde:
 * - 0-33: Riesgo Alto (peor pronóstico)
 * - 34-66: Riesgo Moderado
 * - 67-100: Riesgo Bajo (mejor pronóstico)
 */
export function calculateIRP(input: IRPInput): IRPResult {
  let score = 100; // Empezamos con puntuación perfecta y restamos según riesgo
  const recommendations: string[] = [];

  // Sangrado de encías (máximo 40 puntos de impacto)
  switch (input.gumBleeding) {
    case 'never':
      // No resta puntos - óptimo
      break;
    case 'sometimes':
      score -= 20;
      recommendations.push('Mejorar técnica de cepillado y usar hilo dental diariamente');
      break;
    case 'frequently':
      score -= 40;
      recommendations.push('Requiere evaluación periodontal profesional antes del implante');
      recommendations.push('El sangrado frecuente indica inflamación activa que debe tratarse');
      break;
  }

  // Pérdida de dientes por movilidad (máximo 35 puntos de impacto)
  switch (input.looseTeethLoss) {
    case 'no':
      // No resta puntos - óptimo
      break;
    case '1-2':
      score -= 20;
      recommendations.push('Historial de enfermedad periodontal leve - monitoreo recomendado');
      break;
    case 'several':
      score -= 35;
      recommendations.push('Historial de enfermedad periodontal significativa');
      recommendations.push('Tratamiento periodontal previo es esencial para el éxito del implante');
      break;
  }

  // Higiene oral (máximo 25 puntos de impacto)
  switch (input.oralHygiene) {
    case 'twice-plus':
      // No resta puntos - óptimo
      break;
    case 'once':
      score -= 12;
      recommendations.push('Aumentar frecuencia de cepillado a 2 veces por día');
      break;
    case 'less-once':
      score -= 25;
      recommendations.push('Establecer rutina de higiene oral es fundamental');
      recommendations.push('La higiene deficiente es un predictor fuerte de fallo de implante');
      break;
  }

  // Asegurar que el score esté entre 0 y 100
  score = Math.max(0, Math.min(100, score));

  // Determinar nivel y mensaje
  let level: 'bajo' | 'moderado' | 'alto';
  let levelLabel: string;
  let message: string;
  let color: string;

  if (score >= 67) {
    level = 'bajo';
    levelLabel = 'Riesgo Periodontal Bajo';
    message = '¡Excelente! Tu salud periodontal es favorable para el tratamiento con implantes. Las encías sanas son la base del éxito.';
    color = 'success';
  } else if (score >= 34) {
    level = 'moderado';
    levelLabel = 'Riesgo Periodontal Moderado';
    message = 'Tu perfil periodontal es manejable. Con algunas mejoras en tus hábitos y posible tratamiento previo, las condiciones pueden optimizarse.';
    color = 'warning';
    if (recommendations.length === 0) {
      recommendations.push('Mantener visitas regulares al dentista cada 6 meses');
    }
  } else {
    level = 'alto';
    levelLabel = 'Riesgo Periodontal Elevado';
    message = 'Se detectan factores de riesgo importantes. Un plan de tratamiento periodontal previo es recomendado para maximizar el éxito del implante.';
    color = 'destructive';
    if (!recommendations.some(r => r.includes('periodontal'))) {
      recommendations.push('Consulta con un periodoncista antes del implante');
    }
  }

  return {
    score,
    level,
    levelLabel,
    message,
    color,
    recommendations
  };
}

/**
 * Obtiene el color CSS/Tailwind basado en el nivel de riesgo
 */
export function getIRPColorClass(level: 'bajo' | 'moderado' | 'alto'): {
  bg: string;
  text: string;
  border: string;
  gradient: string;
} {
  switch (level) {
    case 'bajo':
      return {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500/20 to-emerald-500/5'
      };
    case 'moderado':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        gradient: 'from-amber-500/20 to-amber-500/5'
      };
    case 'alto':
      return {
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        gradient: 'from-rose-500/20 to-rose-500/5'
      };
  }
}
