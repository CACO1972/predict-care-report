import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS configuration
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedPatterns = [
    'https://implantx.cl',
    'https://www.implantx.cl',
    'https://implantx.lovable.app',
    'https://predict-care-report.lovable.app',
    /^https:\/\/.*\.lovableproject\.com$/,
    /^https:\/\/.*\.lovable\.app$/,
  ];
  if (!requestOrigin) return '*';
  for (const pattern of allowedPatterns) {
    if (typeof pattern === 'string' && requestOrigin === pattern) return requestOrigin;
    if (pattern instanceof RegExp && pattern.test(requestOrigin)) return requestOrigin;
  }
  return 'https://implantx.cl';
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

const getLevelConfig = (level: PurchaseLevel) => {
  switch (level) {
    case 'premium':
      return {
        label: 'EVALUACIÓN CLÍNICA AVANZADA',
        shortLabel: 'Avanzada',
        badge: '🔬',
        color: '#C9A86C',
        bgGradient: 'linear-gradient(135deg, rgba(201,168,108,0.15) 0%, rgba(201,168,108,0.05) 100%)',
        borderColor: 'rgba(201,168,108,0.4)',
      };
    case 'plan-accion':
      return {
        label: 'GUÍA CLÍNICA PERSONALIZADA',
        shortLabel: 'Guía Clínica',
        badge: '📋',
        color: '#C9A86C',
        bgGradient: 'linear-gradient(135deg, rgba(201,168,108,0.10) 0%, rgba(201,168,108,0.03) 100%)',
        borderColor: 'rgba(201,168,108,0.3)',
      };
    default:
      return {
        label: 'EVALUACIÓN INICIAL',
        shortLabel: 'Inicial',
        badge: '📄',
        color: '#94a3b8',
        bgGradient: 'linear-gradient(135deg, rgba(148,163,184,0.10) 0%, rgba(148,163,184,0.03) 100%)',
        borderColor: 'rgba(148,163,184,0.2)',
      };
  }
};

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': getAllowedOrigin(req.headers.get('origin')),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    const purchaseLevel = reportData.purchaseLevel || 'free';
    console.log('Generating report:', reportData.id, 'Level:', purchaseLevel);

    const htmlContent = generateReportHTML(reportData);
    
    const levelSuffix = purchaseLevel === 'premium' ? '_Evaluacion_Avanzada' 
      : purchaseLevel === 'plan-accion' ? '_Guia_Clinica' 
      : '_Evaluacion_Inicial';
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        downloadName: `ImplantX${levelSuffix}_${reportData.patientName?.replace(/\s/g, '_') || 'Paciente'}_${reportData.id}.html`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating report:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateReportHTML(data: ReportData): string {
  const purchaseLevel = data.purchaseLevel || 'free';
  const config = getLevelConfig(purchaseLevel);
  const isPaid = purchaseLevel !== 'free';
  const isPremium = purchaseLevel === 'premium';
  const today = data.date || new Date().toLocaleDateString('es-CL');

  // Risk color helper
  const riskColor = (val: string) => {
    const v = val.toLowerCase();
    if (v === 'alto' || v === 'high') return { bg: 'rgba(220,38,38,0.15)', text: '#ef4444', border: 'rgba(220,38,38,0.3)' };
    if (v === 'medio' || v === 'moderado' || v === 'medium') return { bg: 'rgba(234,179,8,0.15)', text: '#eab308', border: 'rgba(234,179,8,0.3)' };
    return { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' };
  };

  // IRP gauge color
  const irpColor = (level: string) => {
    const l = level.toLowerCase();
    if (l === 'alto' || l === 'high') return '#ef4444';
    if (l === 'moderado' || l === 'medio') return '#eab308';
    return '#22c55e';
  };

  // ── SECTIONS ──

  const factorsHTML = (data.factors || []).map(f => {
    const rc = riskColor(f.value);
    const barWidth = Math.min(Math.max(f.impact * 6, 10), 100);
    return `
    <div style="margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:14px;color:#e2e8f0;font-weight:500;">${f.name}</span>
        <span style="font-size:11px;padding:3px 10px;border-radius:12px;background:${rc.bg};color:${rc.text};border:1px solid ${rc.border};font-weight:600;">${f.value}</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${barWidth}%;background:linear-gradient(90deg,#C9A86C,#e0c9a8);border-radius:3px;"></div>
      </div>
    </div>`;
  }).join('');

  const recsHTML = (data.recommendations || []).map(r => `
    <div style="display:flex;gap:14px;padding:16px;background:rgba(201,168,108,0.06);border:1px solid rgba(201,168,108,0.15);border-radius:12px;margin-bottom:10px;">
      <div style="width:28px;height:28px;min-width:28px;background:rgba(201,168,108,0.2);color:#C9A86C;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">✓</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:3px;">${r.text}</div>
        <div style="font-size:12px;color:#64748b;line-height:1.5;">${r.evidence}</div>
      </div>
    </div>
  `).join('');

  const synergiesHTML = (data.synergies && data.synergies.length > 0) ? `
    <div style="margin-top:32px;">
      <h3 style="font-size:16px;color:#C9A86C;margin:0 0 16px 0;padding-bottom:10px;border-bottom:1px solid rgba(201,168,108,0.2);">
        ⚡ Factores Combinados Identificados
      </h3>
      ${data.synergies.map(s => `
        <div style="padding:12px 16px;background:rgba(234,179,8,0.08);border-left:3px solid #eab308;margin-bottom:8px;border-radius:0 8px 8px 0;color:#fde68a;font-size:13px;">
          ${s}
        </div>
      `).join('')}
    </div>
  ` : '';

  // IRP Section (paid only)
  const irpHTML = isPaid && data.irpResult ? `
    <div style="margin-top:32px;background:${config.bgGradient};border:1px solid ${config.borderColor};border-radius:16px;padding:28px;text-align:center;">
      <h3 style="font-size:16px;color:#C9A86C;margin:0 0 20px 0;">
        🎯 Índice de Riesgo Personalizado (IRP)
      </h3>
      <div style="font-size:72px;font-weight:800;color:${irpColor(data.irpResult.level)};line-height:1;margin-bottom:8px;">
        ${data.irpResult.score}
      </div>
      <div style="display:inline-block;padding:6px 20px;border-radius:20px;font-weight:600;font-size:13px;background:${riskColor(data.irpResult.level).bg};color:${riskColor(data.irpResult.level).text};border:1px solid ${riskColor(data.irpResult.level).border};">
        Riesgo ${data.irpResult.level}
      </div>
      <p style="margin:16px auto 0;color:#94a3b8;font-size:13px;max-width:400px;line-height:1.5;">
        ${data.irpResult.message}
      </p>
    </div>
  ` : '';

  // Action Plan (paid only)
  const actionPlanHTML = isPaid ? `
    <div style="margin-top:32px;background:rgba(201,168,108,0.04);border:1px solid rgba(201,168,108,0.2);border-radius:16px;padding:28px;">
      <h3 style="font-size:16px;color:#C9A86C;margin:0 0 20px 0;padding-bottom:10px;border-bottom:1px solid rgba(201,168,108,0.15);">
        📋 Plan de Acción Personalizado
      </h3>
      ${[
        { n: '1', title: 'Semanas 1-2: Preparación Oral', desc: 'Optimiza tu salud bucal siguiendo las recomendaciones específicas de tu perfil de riesgo.' },
        { n: '2', title: 'Semana 3: Consulta Especializada', desc: 'Presenta este informe a tu implantólogo. Contiene toda la información clínica necesaria para planificar tu caso.' },
        { n: '3', title: 'Evaluación Complementaria', desc: 'Tu especialista indicará radiografías y exámenes complementarios según tu perfil de riesgo específico.' },
        { n: '4', title: 'Tratamiento Personalizado', desc: 'Recibe un plan de tratamiento adaptado a tus factores individuales, maximizando la probabilidad de éxito.' },
      ].map(step => `
        <div style="display:flex;gap:16px;margin-bottom:20px;">
          <div style="width:32px;height:32px;min-width:32px;background:#C9A86C;color:#0A0A0A;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">${step.n}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#f1f5f9;margin-bottom:4px;">${step.title}</div>
            <div style="font-size:13px;color:#94a3b8;line-height:1.5;">${step.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Checklist (paid only)
  const checklistHTML = isPaid ? `
    <div style="margin-top:32px;background:rgba(34,197,94,0.04);border:1px solid rgba(34,197,94,0.2);border-radius:16px;padding:28px;">
      <h3 style="font-size:16px;color:#22c55e;margin:0 0 16px 0;padding-bottom:10px;border-bottom:1px solid rgba(34,197,94,0.15);">
        ✅ Checklist Pre-Operatorio
      </h3>
      ${[
        'Limpieza dental profesional realizada',
        'Control de factores de riesgo identificados (tabaco, diabetes, medicamentos)',
        'Radiografía panorámica actualizada (máx. 6 meses)',
        'Evaluación periodontal completada',
        'Exámenes de laboratorio (hemograma, glicemia, coagulación)',
        'Confirmación de medicación actual con su médico tratante',
      ].map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(34,197,94,0.06);border-radius:8px;margin-bottom:6px;">
          <div style="width:20px;height:20px;min-width:20px;border:2px solid rgba(34,197,94,0.5);border-radius:4px;"></div>
          <span style="font-size:13px;color:#e2e8f0;">${item}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Premium exclusive content
  const premiumHTML = isPremium ? `
    <div style="margin-top:32px;background:linear-gradient(135deg,rgba(201,168,108,0.12) 0%,rgba(201,168,108,0.04) 100%);border:2px solid rgba(201,168,108,0.35);border-radius:16px;padding:28px;">
      <div style="text-align:center;font-size:13px;font-weight:700;color:#C9A86C;letter-spacing:2px;margin-bottom:24px;">
        🔬 CONTENIDO EXCLUSIVO — EVALUACIÓN CLÍNICA AVANZADA
      </div>
      
      <!-- Advanced Analysis -->
      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(201,168,108,0.2);border-radius:12px;padding:20px;margin-bottom:16px;">
        <h4 style="color:#C9A86C;margin:0 0 12px 0;font-size:15px;">📊 Análisis Avanzado de tu Caso</h4>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 12px 0;">
          Basado en tus respuestas y el análisis de <strong style="color:#e2e8f0;">17,025 casos documentados</strong>, 
          hemos identificado patrones específicos para tu perfil clínico:
        </p>
        <div style="padding-left:16px;border-left:2px solid rgba(201,168,108,0.3);">
          <p style="color:#cbd5e1;font-size:13px;margin:8px 0;">→ Tu combinación de factores tiene comportamiento documentado en estudios longitudinales de hasta 22 años.</p>
          <p style="color:#cbd5e1;font-size:13px;margin:8px 0;">→ Casos con perfil similar muestran tasas de éxito dentro del rango <strong style="color:#C9A86C;">${data.successRange}</strong>.</p>
          <p style="color:#cbd5e1;font-size:13px;margin:8px 0;">→ La evidencia sugiere que siguiendo las recomendaciones personalizadas, puedes optimizar significativamente tu pronóstico.</p>
        </div>
      </div>

      <!-- Cost Estimate -->
      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(201,168,108,0.2);border-radius:12px;padding:20px;margin-bottom:16px;">
        <h4 style="color:#C9A86C;margin:0 0 12px 0;font-size:15px;">💰 Estimación de Inversión por Implante</h4>
        <div style="text-align:center;padding:16px;background:rgba(201,168,108,0.08);border-radius:10px;">
          <div style="font-size:28px;font-weight:800;color:#C9A86C;margin-bottom:4px;">$800.000 – $1.500.000 CLP</div>
          <div style="font-size:11px;color:#64748b;font-style:italic;">*Por implante. Incluye corona. Varía según complejidad y profesional.</div>
        </div>
      </div>

      <!-- Treatment Timeline -->
      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(201,168,108,0.2);border-radius:12px;padding:20px;margin-bottom:16px;">
        <h4 style="color:#C9A86C;margin:0 0 16px 0;font-size:15px;">📅 Cronograma Típico de Tratamiento</h4>
        ${[
          { time: 'Día 1', event: 'Cirugía de colocación del implante' },
          { time: 'Semana 1-2', event: 'Cicatrización inicial y primer control' },
          { time: 'Mes 2-4', event: 'Osteointegración (fusión con el hueso)' },
          { time: 'Mes 4-6', event: 'Colocación de la corona definitiva' },
        ].map(t => `
          <div style="display:flex;gap:16px;padding:10px 14px;background:rgba(201,168,108,0.06);border-radius:8px;margin-bottom:6px;">
            <span style="font-weight:700;color:#C9A86C;min-width:90px;font-size:13px;">${t.time}</span>
            <span style="color:#e2e8f0;font-size:13px;">${t.event}</span>
          </div>
        `).join('')}
      </div>

      <!-- Questions for Specialist -->
      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(201,168,108,0.2);border-radius:12px;padding:20px;">
        <h4 style="color:#C9A86C;margin:0 0 12px 0;font-size:15px;">🔬 Preguntas Clave para tu Especialista</h4>
        ${[
          '¿Qué sistema y tipo de implante recomienda para mi caso específico?',
          '¿Necesito algún procedimiento previo (injerto óseo, elevación de seno maxilar)?',
          '¿Cuál es el protocolo de carga indicado: inmediata o diferida?',
          '¿Qué tipo de mantenimiento necesitaré a largo plazo?',
          '¿Ofrece garantía sobre los implantes y la rehabilitación protésica?',
        ].map(q => `
          <div style="padding:8px 0 8px 20px;position:relative;color:#cbd5e1;font-size:13px;line-height:1.5;">
            <span style="position:absolute;left:0;color:#C9A86C;">→</span>${q}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  // Upsell for free
  const upsellHTML = purchaseLevel === 'free' ? `
    <div style="margin-top:32px;background:linear-gradient(135deg,rgba(201,168,108,0.12) 0%,rgba(201,168,108,0.04) 100%);border:2px dashed rgba(201,168,108,0.35);border-radius:16px;padding:28px;text-align:center;">
      <div style="font-size:28px;margin-bottom:12px;">🎯</div>
      <h3 style="margin:0 0 8px 0;color:#C9A86C;font-size:18px;">¿Listo para prepararte mejor?</h3>
      <p style="margin:0 0 6px 0;color:#e2e8f0;font-size:15px;font-weight:600;">
        Tu IRP de ${data.irpResult?.score || 'tu perfil'} tiene potencial de optimización
      </p>
      <p style="margin:0 0 20px 0;color:#94a3b8;font-size:13px;line-height:1.5;max-width:400px;display:inline-block;">
        Obtén tu Guía Clínica Personalizada con plan de acción paso a paso, checklist pre-operatorio y recomendaciones específicas.
      </p>
      <div>
        <a href="https://mpago.la/2eWC5q6" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#C9A86C,#a8884d);color:#0A0A0A;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
          Obtener Guía Clínica — $14.900
        </a>
      </div>
      <p style="margin:12px 0 0 0;color:#64748b;font-size:11px;">🔒 Pago seguro con MercadoPago · Acceso inmediato</p>
    </div>
  ` : '';

  // ── FULL REPORT ──
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ImplantX — ${config.label} — ${data.patientName || 'Paciente'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #0A0A0A;
      color: #f1f5f9;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body { background: #0A0A0A !important; }
      .no-print { display: none !important; }
      .container { box-shadow: none; }
    }
    @page { margin: 12mm; size: A4; }
  </style>
</head>
<body>
  <div class="container" style="max-width:780px;margin:0 auto;padding:24px;">
    
    <!-- ═══ HEADER ═══ -->
    <div style="background:linear-gradient(165deg,#0d0d0d 0%,#1a1510 50%,#0d0d0d 100%);border:1px solid rgba(201,168,108,0.25);border-radius:20px;overflow:hidden;">
      
      <!-- Top bar -->
      <div style="padding:28px 32px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(201,168,108,0.15);">
        <div>
          <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px;">
            <span style="color:#f1f5f9;">Implant</span><span style="color:#C9A86C;">X</span><span style="color:#64748b;font-size:16px;vertical-align:super;">™</span>
          </div>
          <div style="font-size:11px;color:#64748b;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">
            Evaluación Clínica de Implantes
          </div>
        </div>
        <div style="text-align:right;">
          <div style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:1px;background:${config.bgGradient};color:${config.color};border:1px solid ${config.borderColor};">
            ${config.badge} ${config.label}
          </div>
        </div>
      </div>

      <!-- Patient info -->
      <div style="padding:16px 32px;display:flex;gap:32px;background:rgba(0,0,0,0.2);">
        <div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Paciente</div>
          <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-top:2px;">${data.patientName || 'No especificado'}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">ID Reporte</div>
          <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-top:2px;">${data.id}</div>
        </div>
        <div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Fecha</div>
          <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-top:2px;">${today}</div>
        </div>
      </div>

      <!-- ═══ MAIN RESULT ═══ -->
      <div style="padding:48px 32px;text-align:center;background:radial-gradient(ellipse at center,rgba(201,168,108,0.08) 0%,transparent 70%);">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px;">
          Rango de Éxito Estimado
        </div>
        <div style="font-size:56px;font-weight:800;color:#C9A86C;letter-spacing:-1px;line-height:1;">
          ${data.successRange}
        </div>
        <div style="display:inline-block;margin-top:16px;padding:8px 28px;border-radius:50px;font-size:14px;font-weight:600;background:rgba(201,168,108,0.15);color:#C9A86C;border:1px solid rgba(201,168,108,0.25);">
          ${data.pronosticoLabel || 'Pronóstico Favorable'}
        </div>
        <p style="margin:16px auto 0;max-width:480px;font-size:14px;color:#94a3b8;line-height:1.6;">
          ${data.pronosticoMessage || 'Tu perfil muestra condiciones favorables para el tratamiento con implantes dentales.'}
        </p>
      </div>

      <!-- ═══ CONTENT ═══ -->
      <div style="padding:32px;">
        
        ${irpHTML}

        <!-- Factors -->
        <div style="margin-top:32px;">
          <h3 style="font-size:16px;color:#C9A86C;margin:0 0 16px 0;padding-bottom:10px;border-bottom:1px solid rgba(201,168,108,0.2);">
            📊 Factores de Riesgo Evaluados
          </h3>
          ${factorsHTML}
        </div>

        ${synergiesHTML}
        ${actionPlanHTML}
        ${checklistHTML}

        <!-- Recommendations -->
        <div style="margin-top:32px;">
          <h3 style="font-size:16px;color:#C9A86C;margin:0 0 16px 0;padding-bottom:10px;border-bottom:1px solid rgba(201,168,108,0.2);">
            💡 Recomendaciones Personalizadas
          </h3>
          ${recsHTML}
        </div>

        ${premiumHTML}
        ${upsellHTML}

        <!-- Methodology -->
        <div style="margin-top:32px;background:rgba(201,168,108,0.04);border:1px solid rgba(201,168,108,0.12);border-radius:16px;padding:24px;">
          <h4 style="color:#C9A86C;margin:0 0 12px 0;font-size:14px;">📊 Metodología del Algoritmo ImplantX</h4>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;line-height:1.6;">
            Esta evaluación utiliza el <strong style="color:#e2e8f0;">algoritmo sinérgico ImplantX</strong>, 
            desarrollado a partir del análisis de <strong style="color:#e2e8f0;">17,025 implantes documentados</strong> 
            en estudios longitudinales con seguimiento de hasta 22 años.
          </p>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;line-height:1.6;">
            <strong style="color:#cbd5e1;">Fuentes:</strong> University of British Columbia Cohort (PMC8359846), 
            Meta-análisis Howe et al. 2019 (PMID:30904559), 20-Year Survival Meta-Analysis 2024 (PMC11416373).
          </p>
          <p style="font-size:11px;color:#475569;margin:12px 0 0 0;">
            *Los rangos de probabilidad reflejan la variabilidad inherente documentada en la literatura científica (IC 95% ±1.2-2.5%). 
            Este informe es orientativo y no reemplaza la evaluación presencial por un especialista.
          </p>
        </div>
      </div>

      <!-- ═══ FOOTER ═══ -->
      <div style="padding:24px 32px;border-top:1px solid rgba(201,168,108,0.15);background:rgba(0,0,0,0.25);text-align:center;">
        <div style="font-size:16px;font-weight:700;margin-bottom:4px;">
          <span style="color:#f1f5f9;">Implant</span><span style="color:#C9A86C;">X</span><span style="color:#64748b;font-size:10px;vertical-align:super;">™</span>
        </div>
        <div style="font-size:11px;color:#64748b;margin-bottom:2px;">
          Powered by <span style="color:#C9A86C;">humana.ia</span> · Clínica Miró
        </div>
        <div style="font-size:10px;color:#475569;">
          © 2026 ImplantX · Este reporte es orientativo. La evaluación definitiva debe ser realizada por un especialista en implantología.
        </div>
      </div>

    </div>

    <!-- Print button -->
    <div class="no-print" style="text-align:center;margin-top:24px;">
      <button onclick="window.print()" style="padding:12px 32px;background:#C9A86C;color:#0A0A0A;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;">
        📄 Imprimir / Guardar como PDF
      </button>
    </div>
  </div>
</body>
</html>`;
}
