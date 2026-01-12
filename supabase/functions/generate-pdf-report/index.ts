import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Restrict CORS to production domain
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://implantx.lovable.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PurchaseLevel = 'free' | 'plan-accion' | 'premium';

interface ReportData {
  id: string;
  date: string;
  patientName?: string;
  pronosticoLabel: string;
  pronosticoMessage: string;
  successRange: string;
  factors: Array<{ name: string; value: string; impact: number }>;
  recommendations: Array<{ text: string; evidence: string }>;
  synergies?: string[];
  methodology?: string;
  purchaseLevel?: PurchaseLevel;
  irpResult?: {
    score: number;
    level: string;
    message: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    console.log('Generating PDF for report:', reportData.id, 'Level:', reportData.purchaseLevel);

    // Generate HTML content based on purchase level
    const htmlContent = generateReportHTML(reportData);
    
    const levelSuffix = reportData.purchaseLevel === 'premium' ? '_Premium' 
      : reportData.purchaseLevel === 'plan-accion' ? '_PlanAccion' 
      : '_Basico';
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        downloadName: `ImplantX_Reporte${levelSuffix}_${reportData.patientName?.replace(/\s/g, '_') || 'Paciente'}_${reportData.id}.html`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating PDF:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateReportHTML(data: ReportData): string {
  const purchaseLevel = data.purchaseLevel || 'free';
  
  const factorsHTML = data.factors.map(f => `
    <div class="factor">
      <div class="factor-header">
        <span class="factor-name">${f.name}</span>
        <span class="factor-value ${f.value.toLowerCase()}">${f.value}</span>
      </div>
      <div class="factor-bar">
        <div class="factor-fill" style="width: ${f.impact * 6}%"></div>
      </div>
    </div>
  `).join('');

  const recommendationsHTML = data.recommendations.map(r => `
    <div class="recommendation">
      <div class="rec-icon">✓</div>
      <div class="rec-content">
        <strong>${r.text}</strong>
        <p>${r.evidence}</p>
      </div>
    </div>
  `).join('');

  const synergiesHTML = data.synergies?.length ? `
    <div class="section">
      <h3>Factores Combinados Identificados</h3>
      <ul class="synergies">
        ${data.synergies.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  // IRP Section (Plan de Acción y Premium)
  const irpSectionHTML = (purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') && data.irpResult ? `
    <div class="section irp-section">
      <h3>🎯 Tu Índice de Riesgo Personalizado (IRP)</h3>
      <div class="irp-gauge">
        <div class="irp-score">${data.irpResult.score}</div>
        <div class="irp-level ${data.irpResult.level.toLowerCase()}">${data.irpResult.level}</div>
      </div>
      <p class="irp-message">${data.irpResult.message}</p>
    </div>
  ` : '';

  // Plan de Acción Personalizado (Solo Plan de Acción y Premium)
  const actionPlanHTML = (purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') ? `
    <div class="section action-plan">
      <h3>📋 Tu Plan de Acción Personalizado</h3>
      <div class="action-timeline">
        <div class="action-item">
          <div class="action-number">1</div>
          <div class="action-content">
            <strong>Semana 1-2: Preparación</strong>
            <p>Optimiza tu salud bucal con las recomendaciones específicas de tu perfil.</p>
          </div>
        </div>
        <div class="action-item">
          <div class="action-number">2</div>
          <div class="action-content">
            <strong>Semana 3: Consulta Especializada</strong>
            <p>Lleva este reporte a tu consulta. Tu dentista tendrá toda la información clínica necesaria.</p>
          </div>
        </div>
        <div class="action-item">
          <div class="action-number">3</div>
          <div class="action-content">
            <strong>Evaluación Clínica</strong>
            <p>Tu especialista realizará radiografías y exámenes complementarios según tu perfil de riesgo.</p>
          </div>
        </div>
        <div class="action-item">
          <div class="action-number">4</div>
          <div class="action-content">
            <strong>Tratamiento Personalizado</strong>
            <p>Recibe un plan de tratamiento adaptado a tus factores específicos.</p>
          </div>
        </div>
      </div>
    </div>
  ` : '';

  // Checklist Preoperatorio (Solo Plan de Acción y Premium)
  const checklistHTML = (purchaseLevel === 'plan-accion' || purchaseLevel === 'premium') ? `
    <div class="section checklist">
      <h3>✅ Checklist Preoperatorio</h3>
      <div class="checklist-items">
        <label class="checklist-item">
          <input type="checkbox" />
          <span>Limpieza dental profesional realizada</span>
        </label>
        <label class="checklist-item">
          <input type="checkbox" />
          <span>Control de factores de riesgo (tabaco, diabetes, etc.)</span>
        </label>
        <label class="checklist-item">
          <input type="checkbox" />
          <span>Radiografía panorámica actualizada</span>
        </label>
        <label class="checklist-item">
          <input type="checkbox" />
          <span>Evaluación periodontal completada</span>
        </label>
        <label class="checklist-item">
          <input type="checkbox" />
          <span>Exámenes de sangre (si aplica)</span>
        </label>
      </div>
    </div>
  ` : '';

  // Premium Exclusive Content
  const premiumExclusiveHTML = purchaseLevel === 'premium' ? `
    <div class="section premium-exclusive">
      <div class="premium-badge">👑 CONTENIDO EXCLUSIVO PREMIUM</div>
      
      <div class="premium-block">
        <h4>📊 Análisis Avanzado de tu Caso</h4>
        <p>Basado en tus respuestas y el análisis de 17,025 casos similares, hemos identificado los siguientes patrones específicos para tu perfil:</p>
        <ul>
          <li>Tu combinación de factores tiene un comportamiento documentado en estudios longitudinales.</li>
          <li>Los casos similares al tuyo muestran tasas de éxito dentro del rango ${data.successRange}.</li>
          <li>La evidencia sugiere que siguiendo las recomendaciones, puedes optimizar tu pronóstico.</li>
        </ul>
      </div>

      <div class="premium-block">
        <h4>💰 Estimación de Inversión</h4>
        <div class="price-estimate">
          <p>Basado en tu caso, la inversión estimada en Chile es:</p>
          <div class="price-range">
            <span class="price-min">$800.000</span>
            <span class="price-sep">-</span>
            <span class="price-max">$1.500.000 CLP</span>
          </div>
          <p class="price-note">*Por implante. Incluye corona. Puede variar según complejidad y profesional.</p>
        </div>
      </div>

      <div class="premium-block">
        <h4>📅 Cronograma Típico de Tratamiento</h4>
        <div class="timeline">
          <div class="timeline-item">
            <span class="timeline-time">Día 1</span>
            <span class="timeline-event">Cirugía de colocación del implante</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-time">Semana 1-2</span>
            <span class="timeline-event">Cicatrización inicial y control</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-time">Mes 2-4</span>
            <span class="timeline-event">Osteointegración (fusión con el hueso)</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-time">Mes 4-6</span>
            <span class="timeline-event">Colocación de la corona definitiva</span>
          </div>
        </div>
      </div>

      <div class="premium-block">
        <h4>🔬 Preguntas para tu Especialista</h4>
        <ul class="questions-list">
          <li>¿Qué marca y tipo de implante recomienda para mi caso?</li>
          <li>¿Necesito algún procedimiento previo (injerto óseo, elevación de seno)?</li>
          <li>¿Cuál es el protocolo de carga en mi caso (inmediata vs. diferida)?</li>
          <li>¿Qué tipo de mantenimiento necesitaré a largo plazo?</li>
          <li>¿Ofrece garantía sobre el tratamiento?</li>
        </ul>
      </div>
    </div>
  ` : '';

  // Upsell banner for free version
  const upsellBannerHTML = purchaseLevel === 'free' ? `
    <div class="section upsell-banner">
      <div class="upsell-content">
        <span class="upsell-icon">🚀</span>
        <div>
          <strong>¿Quieres un Plan de Acción Personalizado?</strong>
          <p>Obtén tu checklist preoperatorio, cronograma detallado y guía paso a paso.</p>
          <a href="https://mpago.la/2eWC5q6" class="upsell-button">Obtener Plan de Acción →</a>
        </div>
      </div>
    </div>
  ` : '';

  // Level badge
  const levelBadge = purchaseLevel === 'premium' 
    ? '<span class="level-badge premium">👑 PREMIUM</span>'
    : purchaseLevel === 'plan-accion'
    ? '<span class="level-badge plan-accion">📋 PLAN DE ACCIÓN</span>'
    : '<span class="level-badge free">📄 BÁSICO</span>';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte ImplantX - ${data.patientName || 'Paciente'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      line-height: 1.6;
      padding: 40px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(165deg, #0d0d0d 0%, #1a1510 50%, #0d0d0d 100%);
      border: 1px solid rgba(201, 168, 124, 0.3);
      border-radius: 24px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, rgba(201, 168, 124, 0.15) 0%, transparent 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 1px solid rgba(201, 168, 124, 0.2);
    }
    
    .logo {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .logo span { color: #c9a87c; }
    
    .subtitle {
      color: #888;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .level-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 12px;
    }
    
    .level-badge.premium {
      background: linear-gradient(135deg, #ffd700 0%, #c9a87c 100%);
      color: #000;
    }
    
    .level-badge.plan-accion {
      background: rgba(201, 168, 124, 0.3);
      color: #c9a87c;
      border: 1px solid rgba(201, 168, 124, 0.5);
    }
    
    .level-badge.free {
      background: rgba(255,255,255,0.1);
      color: #888;
    }
    
    .patient-info {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .patient-info span {
      color: #888;
      font-size: 13px;
    }
    
    .patient-info strong {
      color: #fafafa;
    }
    
    .main-result {
      padding: 50px 40px;
      text-align: center;
      background: radial-gradient(circle at center, rgba(201, 168, 124, 0.1) 0%, transparent 70%);
    }
    
    .success-range {
      font-size: 48px;
      font-weight: 700;
      color: #c9a87c;
      margin-bottom: 8px;
    }
    
    .success-label {
      font-size: 14px;
      color: #888;
      margin-bottom: 16px;
    }
    
    .pronostico-badge {
      display: inline-block;
      background: rgba(201, 168, 124, 0.2);
      color: #c9a87c;
      padding: 8px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .pronostico-message {
      color: #aaa;
      max-width: 500px;
      margin: 0 auto;
      font-size: 15px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h3 {
      font-size: 18px;
      color: #c9a87c;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(201, 168, 124, 0.2);
    }
    
    .factor {
      margin-bottom: 16px;
    }
    
    .factor-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    
    .factor-name {
      font-weight: 500;
    }
    
    .factor-value {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 10px;
    }
    
    .factor-value.alto { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .factor-value.medio { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .factor-value.bajo { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    
    .factor-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .factor-fill {
      height: 100%;
      background: linear-gradient(90deg, #c9a87c, #e0c9a8);
      border-radius: 3px;
    }
    
    .recommendation {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: rgba(201, 168, 124, 0.08);
      border: 1px solid rgba(201, 168, 124, 0.2);
      border-radius: 12px;
      margin-bottom: 12px;
    }
    
    .rec-icon {
      width: 28px;
      height: 28px;
      background: rgba(201, 168, 124, 0.2);
      color: #c9a87c;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .rec-content strong {
      display: block;
      margin-bottom: 4px;
    }
    
    .rec-content p {
      font-size: 13px;
      color: #888;
    }
    
    .synergies {
      list-style: none;
    }
    
    .synergies li {
      padding: 12px 16px;
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid #f59e0b;
      margin-bottom: 8px;
      border-radius: 0 8px 8px 0;
    }
    
    /* IRP Section Styles */
    .irp-section {
      background: linear-gradient(135deg, rgba(201, 168, 124, 0.1) 0%, rgba(201, 168, 124, 0.05) 100%);
      border: 1px solid rgba(201, 168, 124, 0.3);
      border-radius: 16px;
      padding: 24px;
    }
    
    .irp-gauge {
      text-align: center;
      margin: 20px 0;
    }
    
    .irp-score {
      font-size: 64px;
      font-weight: 700;
      color: #c9a87c;
    }
    
    .irp-level {
      display: inline-block;
      padding: 6px 20px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .irp-level.bajo { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .irp-level.moderado { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .irp-level.alto { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    
    .irp-message {
      text-align: center;
      color: #aaa;
      font-size: 14px;
    }
    
    /* Action Plan Styles */
    .action-plan {
      background: rgba(201, 168, 124, 0.05);
      border: 1px solid rgba(201, 168, 124, 0.2);
      border-radius: 16px;
      padding: 24px;
    }
    
    .action-timeline {
      position: relative;
      padding-left: 30px;
    }
    
    .action-timeline::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: rgba(201, 168, 124, 0.3);
    }
    
    .action-item {
      position: relative;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
    }
    
    .action-number {
      width: 28px;
      height: 28px;
      background: #c9a87c;
      color: #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    
    .action-content strong {
      display: block;
      color: #fafafa;
      margin-bottom: 4px;
    }
    
    .action-content p {
      font-size: 13px;
      color: #888;
    }
    
    /* Checklist Styles */
    .checklist {
      background: rgba(34, 197, 94, 0.05);
      border: 1px solid rgba(34, 197, 94, 0.2);
      border-radius: 16px;
      padding: 24px;
    }
    
    .checklist h3 {
      color: #22c55e;
      border-bottom-color: rgba(34, 197, 94, 0.2);
    }
    
    .checklist-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(34, 197, 94, 0.08);
      border-radius: 8px;
      cursor: pointer;
    }
    
    .checklist-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #22c55e;
    }
    
    /* Premium Exclusive Styles */
    .premium-exclusive {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(201, 168, 124, 0.1) 100%);
      border: 2px solid rgba(255, 215, 0, 0.3);
      border-radius: 16px;
      padding: 24px;
    }
    
    .premium-badge {
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      color: #ffd700;
      margin-bottom: 24px;
      letter-spacing: 1px;
    }
    
    .premium-block {
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255, 215, 0, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .premium-block h4 {
      color: #ffd700;
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .premium-block p {
      color: #aaa;
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .premium-block ul {
      list-style: none;
      padding-left: 0;
    }
    
    .premium-block li {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      color: #ddd;
      font-size: 14px;
    }
    
    .premium-block li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #c9a87c;
    }
    
    .price-estimate {
      text-align: center;
      padding: 20px;
      background: rgba(201, 168, 124, 0.1);
      border-radius: 12px;
    }
    
    .price-range {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin: 16px 0;
    }
    
    .price-min, .price-max {
      font-size: 24px;
      font-weight: 700;
      color: #c9a87c;
    }
    
    .price-sep {
      color: #666;
    }
    
    .price-note {
      font-size: 12px !important;
      color: #666 !important;
      font-style: italic;
    }
    
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .timeline-item {
      display: flex;
      gap: 16px;
      padding: 12px;
      background: rgba(201, 168, 124, 0.08);
      border-radius: 8px;
    }
    
    .timeline-time {
      font-weight: 600;
      color: #c9a87c;
      min-width: 100px;
    }
    
    .timeline-event {
      color: #ddd;
    }
    
    .questions-list li::before {
      content: '❓';
    }
    
    /* Upsell Banner */
    .upsell-banner {
      background: linear-gradient(135deg, rgba(201, 168, 124, 0.15) 0%, rgba(201, 168, 124, 0.05) 100%);
      border: 2px dashed rgba(201, 168, 124, 0.4);
      border-radius: 16px;
      padding: 24px;
    }
    
    .upsell-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    
    .upsell-icon {
      font-size: 32px;
    }
    
    .upsell-content strong {
      display: block;
      color: #c9a87c;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .upsell-content p {
      color: #888;
      font-size: 14px;
      margin-bottom: 12px;
    }
    
    .upsell-button {
      display: inline-block;
      background: #c9a87c;
      color: #000;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
    }
    
    .methodology {
      background: rgba(201, 168, 124, 0.05);
      border: 1px solid rgba(201, 168, 124, 0.15);
      border-radius: 16px;
      padding: 24px;
    }
    
    .methodology h4 {
      color: #c9a87c;
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .methodology p {
      font-size: 13px;
      color: #888;
      margin-bottom: 12px;
    }
    
    .methodology .highlight {
      color: #fafafa;
      font-weight: 500;
    }
    
    .footer {
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid rgba(201, 168, 124, 0.2);
      background: rgba(0,0,0,0.3);
    }
    
    .footer-logo {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .footer-logo span { color: #c9a87c; }
    
    .footer p {
      font-size: 11px;
      color: #666;
    }
    
    .footer a {
      color: #c9a87c;
      text-decoration: none;
    }
    
    @media print {
      body { padding: 0; background: white; color: #1a1a1a; }
      .container { border: none; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Implant<span>X</span>™</div>
      <div class="subtitle">Reporte de Evaluación Clínica</div>
      ${levelBadge}
      <div class="patient-info">
        <span><strong>${data.patientName || 'Paciente'}</strong></span>
        <span>ID: <strong>${data.id}</strong></span>
        <span>Fecha: <strong>${data.date}</strong></span>
      </div>
    </div>
    
    <div class="main-result">
      <div class="success-range">${data.successRange}</div>
      <div class="success-label">Rango de éxito estimado*</div>
      <div class="pronostico-badge">${data.pronosticoLabel}</div>
      <p class="pronostico-message">${data.pronosticoMessage}</p>
    </div>
    
    <div class="content">
      ${irpSectionHTML}
      
      <div class="section">
        <h3>Factores de Riesgo Evaluados</h3>
        ${factorsHTML}
      </div>
      
      ${synergiesHTML}
      
      ${actionPlanHTML}
      
      ${checklistHTML}
      
      <div class="section">
        <h3>Recomendaciones Personalizadas</h3>
        ${recommendationsHTML}
      </div>
      
      ${premiumExclusiveHTML}
      
      ${upsellBannerHTML}
      
      <div class="section methodology">
        <h4>📊 Metodología del Algoritmo ImplantX</h4>
        <p>
          Esta evaluación utiliza el <span class="highlight">algoritmo sinérgico ImplantX</span>, 
          desarrollado a partir del análisis de <span class="highlight">17,025 implantes documentados</span> 
          en estudios longitudinales con seguimiento de hasta 22 años.
        </p>
        <p>
          <span class="highlight">Fuentes científicas:</span> University of British Columbia Cohort (PMC8359846), 
          Meta-análisis de Howe et al. 2019 (PMID:30904559), 20-Year Survival Meta-Analysis 2024 (PMC11416373).
        </p>
        <p style="font-size: 11px; color: #666; margin-top: 16px;">
          *Los rangos de probabilidad reflejan la variabilidad inherente documentada en la literatura científica (IC 95% ±1.2-2.5%).
        </p>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">Implant<span>X</span>™</div>
      <p>Powered by <a href="https://humanaia.cl">humana.ia</a></p>
      <p style="margin-top: 8px;">© 2025 ImplantX · Este reporte es orientativo. La evaluación final debe ser realizada por un especialista.</p>
    </div>
  </div>
</body>
</html>
  `;
}
