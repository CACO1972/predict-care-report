import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

interface ReportEmailRequest {
  email: string;
  patientName: string;
  reportId: string;
  date: string;
  successRange: string;
  purchaseLevel: 'free' | 'plan-accion' | 'premium';
  irpScore?: number;
  irpLevel?: string;
  pronosticoLabel?: string;
  factors?: Array<{ name: string; value: string; impact: number }>;
  recommendations?: Array<{ text: string; evidence: string }>;
}

const getLevelConfig = (level: string) => {
  switch (level) {
    case 'premium':
      return { label: 'Evaluación Clínica Avanzada', badge: '🔬', color: '#C9A86C', tagBg: 'rgba(201,168,108,0.15)', tagBorder: 'rgba(201,168,108,0.3)' };
    case 'plan-accion':
      return { label: 'Guía Clínica Personalizada', badge: '📋', color: '#C9A86C', tagBg: 'rgba(201,168,108,0.10)', tagBorder: 'rgba(201,168,108,0.25)' };
    default:
      return { label: 'Evaluación Inicial', badge: '📄', color: '#94a3b8', tagBg: 'rgba(148,163,184,0.10)', tagBorder: 'rgba(148,163,184,0.2)' };
  }
};

const generateEmailHTML = (data: ReportEmailRequest): string => {
  const config = getLevelConfig(data.purchaseLevel);
  const isPaid = data.purchaseLevel !== 'free';
  const today = data.date || new Date().toLocaleDateString('es-CL');
  
  // Top 3 risk factors for summary
  const topFactors = (data.factors || []).slice(0, 3);
  const topRecs = (data.recommendations || []).slice(0, 2);

  const riskBadge = (val: string) => {
    const v = val.toLowerCase();
    if (v === 'alto' || v === 'high') return `<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(220,38,38,0.15);color:#ef4444;border:1px solid rgba(220,38,38,0.3);">${val}</span>`;
    if (v === 'medio' || v === 'moderado' || v === 'medium') return `<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(234,179,8,0.15);color:#eab308;border:1px solid rgba(234,179,8,0.3);">${val}</span>`;
    return `<span style="font-size:11px;padding:2px 8px;border-radius:10px;background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);">${val}</span>`;
  };

  // Factors summary
  const factorsSummary = topFactors.length > 0 ? `
    <table role="presentation" style="width:100%;margin-top:20px;">
      <tr>
        <td colspan="2" style="padding-bottom:12px;">
          <span style="font-size:13px;color:#C9A86C;font-weight:600;">Factores principales evaluados:</span>
        </td>
      </tr>
      ${topFactors.map(f => `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#e2e8f0;">${f.name}</td>
        <td style="padding:6px 0;text-align:right;">${riskBadge(f.value)}</td>
      </tr>
      `).join('')}
    </table>
  ` : '';

  // Recommendations summary
  const recsSummary = topRecs.length > 0 ? `
    <div style="margin-top:20px;">
      <span style="font-size:13px;color:#C9A86C;font-weight:600;">Recomendaciones destacadas:</span>
      ${topRecs.map(r => `
        <div style="margin-top:8px;padding:10px 14px;background:rgba(201,168,108,0.06);border-left:3px solid rgba(201,168,108,0.4);border-radius:0 8px 8px 0;">
          <span style="font-size:13px;color:#e2e8f0;">${r.text}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  // IRP if available
  const irpSummary = isPaid && data.irpScore !== undefined ? `
    <div style="margin-top:20px;padding:16px;background:rgba(201,168,108,0.08);border:1px solid rgba(201,168,108,0.2);border-radius:12px;text-align:center;">
      <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Tu Índice de Riesgo Personalizado</span>
      <div style="font-size:36px;font-weight:800;color:#C9A86C;margin:8px 0 4px;">${data.irpScore}</div>
      <span style="font-size:12px;color:${data.irpLevel?.toLowerCase() === 'bajo' ? '#22c55e' : data.irpLevel?.toLowerCase() === 'moderado' ? '#eab308' : '#ef4444'};font-weight:600;">
        Riesgo ${data.irpLevel || 'Evaluado'}
      </span>
    </div>
  ` : '';

  // Upsell CTA for free level
  const upsellCTA = data.purchaseLevel === 'free' ? `
    <tr>
      <td style="padding:0 32px 32px;">
        <div style="padding:24px;background:linear-gradient(135deg,rgba(201,168,108,0.12) 0%,rgba(201,168,108,0.04) 100%);border:1px solid rgba(201,168,108,0.25);border-radius:14px;text-align:center;">
          <div style="font-size:20px;margin-bottom:8px;">🎯</div>
          <div style="font-size:15px;font-weight:700;color:#C9A86C;margin-bottom:4px;">
            ¿Quieres prepararte mejor para tu implante?
          </div>
          <div style="font-size:13px;color:#94a3b8;margin-bottom:16px;line-height:1.5;">
            Obtén tu Guía Clínica con plan de acción personalizado,<br>checklist pre-operatorio y recomendaciones específicas.
          </div>
          <a href="https://mpago.la/2eWC5q6" style="display:inline-block;padding:12px 36px;background:linear-gradient(135deg,#C9A86C,#a8884d);color:#0A0A0A;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
            Obtener Guía Clínica — $14.900
          </a>
          <div style="margin-top:10px;font-size:10px;color:#64748b;">🔒 Pago seguro · Acceso inmediato</div>
        </div>
      </td>
    </tr>
  ` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu ${config.label} ImplantX</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" style="width:100%;max-width:560px;border-collapse:collapse;">
          
          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="padding:24px 32px;background:linear-gradient(165deg,#0d0d0d 0%,#1a1510 50%,#0d0d0d 100%);border-radius:16px 16px 0 0;border:1px solid rgba(201,168,108,0.2);border-bottom:none;">
              <table role="presentation" style="width:100%;">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:800;color:#f1f5f9;">Implant</span><span style="font-size:22px;font-weight:800;color:#C9A86C;">X</span><span style="font-size:12px;color:#64748b;vertical-align:super;">™</span>
                  </td>
                  <td style="text-align:right;">
                    <span style="display:inline-block;padding:5px 12px;border-radius:16px;font-size:10px;font-weight:700;letter-spacing:0.5px;background:${config.tagBg};color:${config.color};border:1px solid ${config.tagBorder};">
                      ${config.badge} ${config.label.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- ═══ MAIN ═══ -->
          <tr>
            <td style="padding:32px;background:#0d0d0d;border:1px solid rgba(201,168,108,0.2);border-top:none;border-bottom:none;">
              
              <!-- Greeting -->
              <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;font-weight:700;">
                Hola ${data.patientName || 'Paciente'}
              </h1>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Tu evaluación de implantes está lista. A continuación un resumen de tus resultados.
              </p>
              
              <!-- Result Card -->
              <div style="padding:24px;background:radial-gradient(ellipse at center,rgba(201,168,108,0.08) 0%,transparent 70%);border:1px solid rgba(201,168,108,0.2);border-radius:14px;text-align:center;">
                <table role="presentation" style="width:100%;margin-bottom:16px;">
                  <tr>
                    <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">ID</td>
                    <td style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;text-align:right;">Fecha</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#e2e8f0;font-weight:600;">${data.reportId}</td>
                    <td style="font-size:13px;color:#e2e8f0;text-align:right;">${today}</td>
                  </tr>
                </table>
                
                <div style="padding:20px 0;border-top:1px solid rgba(201,168,108,0.15);border-bottom:1px solid rgba(201,168,108,0.15);">
                  <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">
                    Rango de Éxito Estimado
                  </div>
                  <div style="font-size:40px;font-weight:800;color:#C9A86C;letter-spacing:-1px;">
                    ${data.successRange || 'Pendiente'}
                  </div>
                  ${data.pronosticoLabel ? `
                  <div style="display:inline-block;margin-top:10px;padding:5px 18px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(201,168,108,0.12);color:#C9A86C;">
                    ${data.pronosticoLabel}
                  </div>` : ''}
                </div>

                ${irpSummary}
                ${factorsSummary}
                ${recsSummary}
              </div>

              <!-- Download Note -->
              <div style="margin-top:24px;padding:16px;background:rgba(201,168,108,0.06);border:1px solid rgba(201,168,108,0.15);border-radius:10px;">
                <p style="margin:0;color:#e2e8f0;font-size:13px;font-weight:500;">
                  💡 Tu reporte completo está disponible para descarga en ImplantX
                </p>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
                  Este informe fue diseñado para que lo compartas con tu dentista o implantólogo. 
                  Contiene información clínica valiosa para planificar tu tratamiento.
                </p>
              </div>
            </td>
          </tr>

          ${upsellCTA}
          
          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="padding:24px 32px;background:linear-gradient(165deg,#0d0d0d 0%,#1a1510 50%,#0d0d0d 100%);border-radius:0 0 16px 16px;border:1px solid rgba(201,168,108,0.2);border-top:none;text-align:center;">
              <div style="margin-bottom:4px;">
                <span style="font-size:14px;font-weight:700;color:#f1f5f9;">Implant</span><span style="font-size:14px;font-weight:700;color:#C9A86C;">X</span><span style="font-size:8px;color:#64748b;vertical-align:super;">™</span>
              </div>
              <div style="font-size:10px;color:#64748b;margin-bottom:2px;">
                Powered by humana.ia · Clínica Miró
              </div>
              <div style="font-size:9px;color:#475569;">
                © 2026 ImplantX · Tecnología de IA para Evaluación Dental
              </div>
              <div style="margin-top:8px;font-size:9px;color:#374151;">
                Si no solicitaste este correo, puedes ignorarlo de forma segura.
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-report-email function invoked");
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReportEmailRequest = await req.json();
    console.log("Request data:", { email: data.email, patientName: data.patientName, purchaseLevel: data.purchaseLevel });

    if (!data.email || !data.patientName) {
      throw new Error("Email y nombre del paciente son requeridos");
    }

    // Ensure defaults for missing fields
    data.date = data.date || new Date().toLocaleDateString('es-CL');
    data.successRange = data.successRange || 'Pendiente';
    data.purchaseLevel = data.purchaseLevel || 'free';
    data.reportId = data.reportId || data.patientName.substring(0, 3).toUpperCase() + '-' + Date.now().toString(36);

    const config = getLevelConfig(data.purchaseLevel);
    const html = generateEmailHTML(data);
    
    const subject = `${config.badge} Tu ${config.label} ImplantX — ${data.patientName}`;

    console.log("Sending email to:", data.email, "Subject:", subject);
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ImplantX <implantes@clinicamiro.cl>",
        to: [data.email],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email API response:", JSON.stringify(result));

    if (!emailResponse.ok) {
      throw new Error(`Resend API error: ${result.message || JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-report-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
