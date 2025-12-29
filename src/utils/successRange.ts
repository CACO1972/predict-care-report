/**
 * Obtiene el rango de éxito basado en el porcentaje de probabilidad
 * Centralizado para evitar duplicación en múltiples componentes
 */
export const getSuccessRange = (percentage: number): string => {
  if (percentage >= 95) return "95-98%";
  if (percentage >= 90) return "90-95%";
  if (percentage >= 85) return "85-92%";
  if (percentage >= 80) return "80-88%";
  if (percentage >= 70) return "70-82%";
  if (percentage >= 60) return "60-75%";
  return "50-65%";
};
