// Componente para mostrar preview del informe demo en la landing

import { Card } from "@/components/ui/card";

const ReportDemoPreview = () => {
  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header del reporte */}
      <div className="bg-[#0A0A0A] text-white p-6 text-center">
        <div className="text-2xl font-bold mb-2">IMPLANTX</div>
        <div className="text-sm text-[#C9A86C]">
          Evaluación Inteligente de Implantes Dentales
        </div>
      </div>

      {/* Contenido del preview */}
      <div className="p-8 space-y-6">
        {/* Título del informe */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Informe Clínico Personalizado
          </h2>
          <p className="text-gray-600">Vista previa del reporte</p>
        </div>

        {/* Datos del paciente (ejemplo) */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Paciente:</span>
            <span className="font-semibold text-gray-900">María González</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Edad:</span>
            <span className="font-semibold text-gray-900">45 años</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('es-CL')}</span>
          </div>
        </div>

        {/* Resumen ejecutivo */}
        <div className="border-t-4 border-[#C9A86C] pt-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            📊 Resumen Ejecutivo
          </h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3 text-center bg-yellow-50 border-yellow-200">
              <div className="text-xs text-gray-600 mb-1">Clasificación</div>
              <div className="text-lg font-bold text-yellow-600">MODERADO</div>
            </Card>
            
            <Card className="p-3 text-center bg-blue-50 border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Prob. Éxito</div>
              <div className="text-lg font-bold text-blue-600">87%</div>
            </Card>
            
            <Card className="p-3 text-center bg-[#fff9e6] border-[#C9A86C]">
              <div className="text-xs text-gray-600 mb-1">Índice Riesgo</div>
              <div className="text-lg font-bold text-[#C9A86C]">1.8x</div>
            </Card>
          </div>
        </div>

        {/* Top factores */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="font-bold text-red-800 mb-2">
            🎯 Top 3 Factores de Riesgo
          </div>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Tabaquismo activo (RR: 2.3x)</li>
            <li>• Diabetes tipo 2 (RR: 1.8x)</li>
            <li>• Higiene oral deficiente (RR: 1.5x)</li>
          </ul>
        </div>

        {/* Timeline preview */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">
            📅 Timeline de Preparación
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-xs">
              <div className="w-16 flex-shrink-0 font-semibold text-[#1E3A5F]">
                Semana 1
              </div>
              <div className="text-gray-600">
                Iniciar cesación tabáquica, limpieza dental
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-16 flex-shrink-0 font-semibold text-[#1E3A5F]">
                Semana 2-4
              </div>
              <div className="text-gray-600">
                Control glucémico, protocolo higiene oral
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <div className="w-16 flex-shrink-0 font-semibold text-[#1E3A5F]">
                Pre-op
              </div>
              <div className="text-gray-600">
                Exámenes finales, confirmación
              </div>
            </div>
          </div>
        </div>

        {/* CTA para ver completo */}
        <div className="bg-gradient-to-r from-[#1E3A5F] to-[#C9A86C] text-white p-4 rounded-lg text-center">
          <div className="text-sm font-bold mb-1">
            📄 Este reporte contiene 7-15 páginas
          </div>
          <div className="text-xs opacity-90">
            Análisis detallado + Protocolo completo + Plan de acción
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-3 text-center text-xs text-gray-600">
        Clínica Miró · Av. Nueva Providencia 2214, Providencia
      </div>

      {/* Badge flotante */}
      <div className="absolute top-4 right-4">
        <div className="bg-[#C9A86C] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          DEMO
        </div>
      </div>
    </div>
  );
};

export default ReportDemoPreview;
