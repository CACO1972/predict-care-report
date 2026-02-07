import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const getCorsHeaders = (requestOrigin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(requestOrigin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

type PurchaseLevel = 'free' | 'plan-accion' | 'premium';

interface ReportData {
  id: string;
  date: string;
  patientName: string;
  pronosticoLabel?: string;
  pronosticoMessage?: string;
  successRange: string;
  factors?: Array<{ name: string; value: string; impact: number }>;
  recommendations?: Array<{ text: string; evidence: string }>;
  synergies?: Array<{ text: string }>;
  purchaseLevel?: PurchaseLevel;
  irpResult?: { score: number; level: string; factors?: any[] };
}

// ============================================================
//  TIER CONFIG
// ============================================================
interface TierConfig {
  label: string;
  badge: string;
  color: string;
  colorLight: string;
  colorDark: string;
}

const getTierConfig = (level: PurchaseLevel): TierConfig => {
  switch (level) {
    case 'premium':
      return {
        label: 'EVALUACIÓN CLÍNICA AVANZADA',
        badge: '🏥',
        color: '#C9A86C',
        colorLight: 'rgba(201, 168, 108, 0.15)',
        colorDark: 'rgba(201, 168, 108, 0.08)',
      };
    case 'plan-accion':
      return {
        label: 'GUÍA CLÍNICA PERSONALIZADA',
        badge: '📋',
        color: '#00BFA5',
        colorLight: 'rgba(0, 191, 165, 0.15)',
        colorDark: 'rgba(0, 191, 165, 0.08)',
      };
    default:
      return {
        label: 'EVALUACIÓN INICIAL',
        badge: '📄',
        color: '#60A5FA',
        colorLight: 'rgba(96, 165, 250, 0.15)',
        colorDark: 'rgba(96, 165, 250, 0.08)',
      };
  }
};

// ============================================================
//  IRP GAUGE SVG
// ============================================================
const generateIRPGauge = (score: number, level: string): string => {
  const gaugeColor = level === 'Bajo' ? '#22c55e' : level === 'Moderado' ? '#eab308' : '#ef4444';
  const angle = Math.min(Math.max((score / 100) * 180, 0), 180);
  const rad = (angle - 90) * (Math.PI / 180);
  const x = 100 + 70 * Math.cos(rad);
  const y = 100 + 70 * Math.sin(rad);
  const largeArc = angle > 90 ? 1 : 0;

  return `
  <div style="text-align:center;margin:20px 0;">
    <svg width="200" height="120" viewBox="0 0 200 120">
      <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
      <path d="M 30 100 A 70 70 0 ${largeArc} 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${gaugeColor}" stroke-width="12" stroke-linecap="round"/>
      <text x="100" y="88" text-anchor="middle" fill="${gaugeColor}" font-size="32" font-weight="bold" font-family="Georgia,serif">${score}</text>
      <text x="100" y="112" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="Arial,sans-serif">IRP</text>
    </svg>
    <div style="margin-top:4px;">
      <span style="display:inline-block;padding:4px 16px;background:${gaugeColor}22;color:${gaugeColor};font-size:12px;font-weight:700;border-radius:20px;border:1px solid ${gaugeColor}44;">
        Riesgo ${level}
      </span>
    </div>
  </div>`;
};

// ============================================================
//  GENERATE BRANDED REPORT HTML
// ============================================================
const generateReportHTML = (data: ReportData): string => {
  const level = data.purchaseLevel || 'free';
  const tier = getTierConfig(level);
  const isPaid = level !== 'free';
  const isPremium = level === 'premium';
  const irp = data.irpResult;

  // ---- Factors section (paid only) ----
  const factorsHTML = isPaid && data.factors && data.factors.length > 0 ? `
    <div style="margin-top:32px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Georgia,serif;">
        Factores Clínicos Evaluados
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        ${data.factors.map(f => {
          const barColor = f.impact > 0 ? '#22c55e' : f.impact < -5 ? '#ef4444' : '#eab308';
          const barWidth = Math.min(Math.abs(f.impact) * 5, 100);
          return `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:14px;width:35%;">${f.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;font-size:13px;width:25%;">${f.value}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #1e293b;width:40%;">
              <div style="background:#1e293b;border-radius:4px;height:8px;width:100%;">
                <div style="background:${barColor};border-radius:4px;height:8px;width:${barWidth}%;"></div>
              </div>
            </td>
          </tr>`;
        }).join('')}
      </table>
    </div>` : '';

  // ---- Recommendations (paid only) ----
  const recsHTML = isPaid && data.recommendations && data.recommendations.length > 0 ? `
    <div style="margin-top:32px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Georgia,serif;">
        Recomendaciones Personalizadas
      </h2>
      ${data.recommendations.map((r, i) => `
        <div style="padding:14px 16px;background:${tier.colorDark};border-left:3px solid ${tier.color};margin-bottom:10px;border-radius:0 8px 8px 0;">
          <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600;">${i + 1}. ${r.text}</p>
          ${r.evidence ? `<p style="margin:6px 0 0;color:#94a3b8;font-size:12px;font-style:italic;">Evidencia: ${r.evidence}</p>` : ''}
        </div>
      `).join('')}
    </div>` : '';

  // ---- Synergies (paid only) ----
  const synergiesHTML = isPaid && data.synergies && data.synergies.length > 0 ? `
    <div style="margin-top:32px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Georgia,serif;">
        Sinergias Detectadas
      </h2>
      ${data.synergies.map(s => `
        <div style="padding:12px 16px;background:rgba(99,102,241,0.08);border-left:3px solid #818cf8;margin-bottom:8px;border-radius:0 8px 8px 0;">
          <p style="margin:0;color:#e2e8f0;font-size:13px;">${s.text}</p>
        </div>
      `).join('')}
    </div>` : '';

  // ---- IRP Section (paid only) ----
  const irpHTML = isPaid && irp ? `
    <div style="margin-top:32px;padding:24px;background:linear-gradient(135deg,rgba(0,191,165,0.08),rgba(0,191,165,0.03));border:1px solid rgba(0,191,165,0.2);border-radius:12px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 4px;font-family:Georgia,serif;text-align:center;">
        Índice de Riesgo Personalizado (IRP)
      </h2>
      <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0 0 8px;">
        Puntaje calculado según tus factores clínicos individuales
      </p>
      ${generateIRPGauge(irp.score, irp.level)}
    </div>` : '';

  // ---- Premium exclusive sections ----
  const premiumHTML = isPremium ? `
    <div style="margin-top:32px;padding:24px;background:linear-gradient(135deg,${tier.colorLight},${tier.colorDark});border:1px solid ${tier.color}44;border-radius:12px;">
      <h2 style="color:${tier.color};font-size:18px;font-weight:700;margin:0 0 16px;font-family:Georgia,serif;">
        🏥 Análisis Clínico Avanzado
      </h2>
      
      <!-- Treatment timeline -->
      <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 12px;">Línea de Tiempo Estimada</h3>
      <div style="position:relative;padding-left:24px;border-left:2px solid ${tier.color}44;">
        <div style="margin-bottom:16px;">
          <div style="position:absolute;left:-6px;width:10px;height:10px;background:${tier.color};border-radius:50%;"></div>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">Semana 1-2: Preparación</p>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Exámenes previos, ajustes de medicación, evaluación periodontal</p>
        </div>
        <div style="margin-bottom:16px;">
          <div style="position:absolute;left:-6px;width:10px;height:10px;background:${tier.color};border-radius:50%;margin-top:2px;"></div>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">Semana 3-4: Procedimiento</p>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Cirugía de colocación, protocolo post-operatorio inmediato</p>
        </div>
        <div style="margin-bottom:16px;">
          <div style="position:absolute;left:-6px;width:10px;height:10px;background:${tier.color};border-radius:50%;margin-top:2px;"></div>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">Mes 2-4: Oseointegración</p>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Período de cicatrización y fusión hueso-implante, controles mensuales</p>
        </div>
        <div>
          <div style="position:absolute;left:-6px;width:10px;height:10px;background:${tier.color};border-radius:50%;margin-top:2px;"></div>
          <p style="color:#e2e8f0;font-size:14px;font-weight:600;margin:0;">Mes 5-6: Rehabilitación</p>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Colocación de corona definitiva, ajustes oclusales finales</p>
        </div>
      </div>

      <!-- Cost estimate -->
      <div style="margin-top:24px;padding:16px;background:rgba(0,0,0,0.2);border-radius:8px;">
        <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 8px;">Rango de Inversión Referencial</h3>
        <p style="color:${tier.color};font-size:28px;font-weight:700;margin:0;">$800.000 – $1.500.000 CLP</p>
        <p style="color:#94a3b8;font-size:12px;margin:6px 0 0;">Por implante unitario. Valor referencial según complejidad clínica y tipo de rehabilitación protésica.</p>
      </div>

      <!-- Questions for specialist -->
      <div style="margin-top:24px;">
        <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 12px;">Preguntas Clave para tu Especialista</h3>
        ${[
          '¿Mi densidad ósea es suficiente o necesitaré injerto?',
          '¿Cuánto tiempo tomará mi oseointegración según mi perfil?',
          '¿Qué tipo de prótesis recomienda para mi caso?',
          '¿Cuáles son los riesgos específicos según mi historial?',
          '¿Necesito tratamiento periodontal previo?'
        ].map((q, i) => `
          <div style="padding:8px 12px;background:rgba(0,0,0,0.15);border-radius:6px;margin-bottom:6px;">
            <p style="margin:0;color:#e2e8f0;font-size:13px;">${i + 1}. ${q}</p>
          </div>
        `).join('')}
      </div>
    </div>` : '';

  // ---- Checklist (paid only) ----
  const checklistHTML = isPaid ? `
    <div style="margin-top:32px;">
      <h2 style="color:#fff;font-size:18px;font-weight:700;margin:0 0 16px;font-family:Georgia,serif;">
        ✅ Checklist Pre-Operatorio
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          'Radiografía panorámica o CBCT actualizada',
          'Exámenes de sangre (hemograma, glicemia, coagulación)',
          'Evaluación periodontal completa',
          'Control de enfermedades sistémicas (diabetes, hipertensión)',
          'Suspender tabaco al menos 2 semanas antes',
          'Informar todos los medicamentos actuales',
          'Planificar reposo post-operatorio (2-3 días)',
          isPremium ? 'Evaluación de densidad ósea (según perfil IRP)' : null,
          isPremium ? 'Consulta con especialista en rehabilitación oral' : null,
        ].filter(Boolean).map(item => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #1e293b;">
              <span style="color:#94a3b8;font-size:16px;margin-right:8px;">☐</span>
              <span style="color:#e2e8f0;font-size:13px;">${item}</span>
            </td>
          </tr>
        `).join('')}
      </table>
    </div>` : '';

  // ---- Upsell (free only) ----
  const upsellHTML = level === 'free' ? `
    <div style="margin-top:40px;padding:28px 24px;background:linear-gradient(135deg,rgba(0,191,165,0.12),rgba(0,191,165,0.04));border:2px solid rgba(0,191,165,0.3);border-radius:16px;text-align:center;">
      <p style="font-size:28px;margin:0 0 12px;">📋</p>
      <h2 style="color:#00BFA5;font-size:20px;font-weight:700;margin:0 0 8px;font-family:Georgia,serif;">
        ¿Quieres tu Guía Clínica Personalizada?
      </h2>
      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Obtén un plan paso a paso con recomendaciones específicas según tu perfil,
        checklist pre-operatorio y mucho más.
      </p>
      <div style="margin-bottom:20px;text-align:left;max-width:320px;display:inline-block;">
        ${['Índice de Riesgo Personalizado (IRP)', 'Plan de acción semana a semana', 'Recomendaciones basadas en evidencia', 'Checklist pre-operatorio completo'].map(b => `
          <p style="color:#e2e8f0;font-size:13px;margin:6px 0;">
            <span style="color:#22c55e;margin-right:6px;">✓</span>${b}
          </p>
        `).join('')}
      </div>
      <div>
        <a href="https://mpago.la/2eWC5q6" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#00BFA5,#00897B);color:#fff;font-size:16px;font-weight:700;text-decoration:none;border-radius:10px;box-shadow:0 4px 16px rgba(0,191,165,0.3);">
          Obtener Guía Clínica — $14.900
        </a>
        <p style="color:#64748b;font-size:11px;margin:10px 0 0;">🔒 Pago seguro con MercadoPago • Acceso inmediato</p>
      </div>
    </div>` : '';

  // ============================================================
  //  FULL REPORT HTML
  // ============================================================
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ImplantX — ${tier.label}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0f1a; color: #e2e8f0; font-family: 'DM Sans', -apple-system, sans-serif; }
    @media print {
      body { background: #fff; color: #1e293b; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
<div style="max-width:680px;margin:0 auto;padding:32px 24px;">

  <!-- ========== HEADER ========== -->
  <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:20px;border-bottom:1px solid #1e293b;margin-bottom:28px;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:44px;height:44px;background:linear-gradient(135deg,#00BFA5,#00897B);border-radius:10px;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-weight:700;font-size:16px;line-height:44px;text-align:center;display:block;width:44px;">IX</span>
        </div>
        <div>
          <p style="font-size:18px;font-weight:700;color:#fff;font-family:'Playfair Display',Georgia,serif;margin:0;">ImplantX</p>
          <p style="font-size:11px;color:#64748b;margin:0;">by Clínica Miró</p>
        </div>
      </div>
    </div>
    <div style="text-align:right;">
      <span style="display:inline-block;padding:6px 14px;background:${tier.colorLight};color:${tier.color};font-size:11px;font-weight:700;border-radius:20px;border:1px solid ${tier.color}44;letter-spacing:0.5px;">
        ${tier.badge} ${tier.label}
      </span>
    </div>
  </div>

  <!-- ========== PATIENT INFO ========== -->
  <div style="display:flex;justify-content:space-between;margin-bottom:28px;">
    <div>
      <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Paciente</p>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:0;">${data.patientName}</p>
    </div>
    <div style="text-align:right;">
      <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Fecha</p>
      <p style="color:#fff;font-size:14px;margin:0;">${data.date}</p>
    </div>
  </div>
  <div style="margin-bottom:28px;">
    <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">ID Reporte</p>
    <p style="color:#94a3b8;font-size:13px;font-family:monospace;margin:0;">${data.id}</p>
  </div>

  <!-- ========== MAIN RESULT ========== -->
  <div style="padding:28px;background:linear-gradient(135deg,rgba(0,191,165,0.1),rgba(0,191,165,0.03));border:1px solid rgba(0,191,165,0.25);border-radius:16px;text-align:center;margin-bottom:8px;">
    <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Rango de Éxito Estimado</p>
    <p style="color:#00BFA5;font-size:42px;font-weight:700;font-family:'Playfair Display',Georgia,serif;margin:0;line-height:1.1;">${data.successRange}</p>
    ${data.pronosticoLabel ? `
      <p style="color:#e2e8f0;font-size:15px;margin:10px 0 0;font-weight:500;">${data.pronosticoLabel}</p>
    ` : ''}
    ${data.pronosticoMessage ? `
      <p style="color:#94a3b8;font-size:13px;margin:8px 0 0;line-height:1.5;max-width:500px;display:inline-block;">${data.pronosticoMessage}</p>
    ` : ''}
  </div>

  <!-- ========== IRP ========== -->
  ${irpHTML}

  <!-- ========== FACTORS ========== -->
  ${factorsHTML}

  <!-- ========== RECOMMENDATIONS ========== -->
  ${recsHTML}

  <!-- ========== SYNERGIES ========== -->
  ${synergiesHTML}

  <!-- ========== PREMIUM EXCLUSIVE ========== -->
  ${premiumHTML}

  <!-- ========== CHECKLIST ========== -->
  ${checklistHTML}

  <!-- ========== UPSELL (free only) ========== -->
  ${upsellHTML}

  <!-- ========== DISCLAIMER ========== -->
  <div style="margin-top:40px;padding:16px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid #1e293b;">
    <p style="color:#64748b;font-size:11px;line-height:1.6;margin:0;">
      <strong style="color:#94a3b8;">Aviso importante:</strong> Este informe es una herramienta de orientación basada en inteligencia artificial y no reemplaza la evaluación clínica presencial de un profesional de la salud. Los resultados son estimaciones basadas en la información proporcionada y literatura científica disponible. Consulte siempre con su implantólogo antes de tomar decisiones de tratamiento.
    </p>
  </div>

  <!-- ========== FOOTER ========== -->
  <div style="margin-top:24px;padding-top:20px;border-top:1px solid #1e293b;text-align:center;">
    <p style="color:#64748b;font-size:12px;margin:0 0 4px;">
      ImplantX® — Tecnología de IA para Evaluación Dental
    </p>
    <p style="color:#475569;font-size:11px;margin:0 0 4px;">
      Desarrollado por Clínica Miró · clinicamiro.cl
    </p>
    <p style="color:#334155;font-size:10px;margin:0;">
      © 2026 Todos los derechos reservados
    </p>
  </div>

</div>
</body>
</html>`;
};

// ============================================================
//  HANDLER
// ============================================================
const handler = async (req: Request): Promise<Response> => {
  console.log("generate-pdf-report function invoked");
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    const purchaseLevel = reportData.purchaseLevel || 'free';
    console.log('Generating report:', reportData.id, 'Level:', purchaseLevel);

    const html = generateReportHTML(reportData);

    const levelSuffix = purchaseLevel === 'premium' ? '_Evaluacion_Avanzada'
      : purchaseLevel === 'plan-accion' ? '_Guia_Clinica'
      : '_Evaluacion_Inicial';

    return new Response(
      JSON.stringify({
        success: true,
        html,
        downloadName: `ImplantX${levelSuffix}_${reportData.id}.html`,
        contentType: 'text/html',
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
