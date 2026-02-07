import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vawfalhuffbdpxyassyi.supabase.co";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

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

interface ReportEmailRequest {
  email: string;
  patientName: string;
  reportId: string;
  date: string;
  successRange: string;
  purchaseLevel: PurchaseLevel;
  irpScore?: number;
  irpLevel?: string;
  pronosticoLabel?: string;
  pronosticoMessage?: string;
  factors?: Array<{ name: string; value: string; impact: number }>;
  recommendations?: Array<{ text: string; evidence: string }>;
  synergies?: Array<{ text: string }>;
  irpResult?: { score: number; level: string; factors?: any[] };
}

// ============================================================
//  TIER CONFIG (same naming as report)
// ============================================================
const getTierLabel = (level: PurchaseLevel): string => {
  switch (level) {
    case 'premium': return 'Evaluación Clínica Avanzada';
    case 'plan-accion': return 'Guía Clínica Personalizada';
    default: return 'Evaluación Inicial';
  }
};

const getTierColor = (level: PurchaseLevel): string => {
  switch (level) {
    case 'premium': return '#C9A86C';
    case 'plan-accion': return '#00BFA5';
    default: return '#60A5FA';
  }
};

const getTierEmoji = (level: PurchaseLevel): string => {
  switch (level) {
    case 'premium': return '🏥';
    case 'plan-accion': return '📋';
    default: return '📄';
  }
};

// ============================================================
//  NOTIFICATION EMAIL (clean, short)
// ============================================================
const generateNotificationEmail = (data: ReportEmailRequest): string => {
  const tierLabel = getTierLabel(data.purchaseLevel);
  const tierColor = getTierColor(data.purchaseLevel);
  const tierEmoji = getTierEmoji(data.purchaseLevel);
  const isPaid = data.purchaseLevel !== 'free';

  const upsellBlock = data.purchaseLevel === 'free' ? `
    <!-- Upsell -->
    <tr>
      <td style="padding:28px 32px 0;">
        <table role="presentation" style="width:100%;background:linear-gradient(135deg,rgba(0,191,165,0.12),rgba(0,191,165,0.05));border-radius:12px;border:2px solid rgba(0,191,165,0.3);">
          <tr>
            <td style="padding:24px;text-align:center;">
              <p style="color:#00BFA5;font-size:17px;font-weight:700;margin:0 0 6px;">📋 ¿Quieres tu Guía Clínica Personalizada?</p>
              <p style="color:#94a3b8;font-size:13px;line-height:1.5;margin:0 0 16px;">
                Incluye IRP, plan de acción, recomendaciones personalizadas y checklist pre-operatorio.
              </p>
              <a href="https://mpago.la/2eWC5q6" style="display:inline-block;padding:12px 36px;background:linear-gradient(135deg,#00BFA5,#00897B);color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                Obtener por $14.900
              </a>
              <p style="color:#64748b;font-size:10px;margin:10px 0 0;">🔒 Pago seguro • Acceso inmediato</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Tu reporte ImplantX está listo</title>
</head>
<body style="margin:0;padding:0;background-color:#070b14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" style="width:100%;max-width:560px;border-collapse:collapse;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0d1520,#1a2332);border-radius:16px 16px 0 0;border:1px solid rgba(0,191,165,0.15);border-bottom:none;">
              <table role="presentation" style="width:100%;">
                <tr>
                  <td>
                    <div style="display:inline-block;width:40px;height:40px;background:linear-gradient(135deg,#00BFA5,#00897B);border-radius:10px;text-align:center;line-height:40px;">
                      <span style="color:#fff;font-weight:700;font-size:15px;">IX</span>
                    </div>
                  </td>
                  <td style="text-align:right;">
                    <span style="display:inline-block;padding:5px 12px;background:${tierColor}18;color:${tierColor};font-size:10px;font-weight:700;border-radius:16px;border:1px solid ${tierColor}33;letter-spacing:0.3px;">
                      ${tierEmoji} ${tierLabel.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;background:#0d1520;border:1px solid rgba(0,191,165,0.15);border-top:none;border-bottom:none;">

              <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:600;">
                ¡Hola ${data.patientName}!
              </h1>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">
                Tu reporte de evaluación dental está listo. Lo encontrarás adjunto a este correo como archivo HTML que puedes abrir en cualquier navegador e imprimir.
              </p>

              <!-- Result summary card -->
              <table role="presentation" style="width:100%;background:linear-gradient(135deg,rgba(0,191,165,0.08),rgba(0,191,165,0.03));border-radius:12px;border:1px solid rgba(0,191,165,0.25);">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px;">Tu Rango de Éxito</p>
                    <p style="color:#00BFA5;font-size:36px;font-weight:700;margin:0;">${data.successRange}</p>
                    ${data.pronosticoLabel ? `<p style="color:#e2e8f0;font-size:14px;margin:8px 0 0;">${data.pronosticoLabel}</p>` : ''}
                    ${isPaid && data.irpScore !== undefined ? `
                      <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(0,191,165,0.15);">
                        <p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Índice de Riesgo (IRP)</p>
                        <p style="color:#00BFA5;font-size:28px;font-weight:700;margin:0;">${data.irpScore}</p>
                        <span style="display:inline-block;margin-top:4px;padding:3px 10px;background:${data.irpLevel === 'Bajo' ? '#22c55522' : data.irpLevel === 'Moderado' ? '#eab30822' : '#ef444422'};color:${data.irpLevel === 'Bajo' ? '#22c555' : data.irpLevel === 'Moderado' ? '#eab308' : '#ef4444'};font-size:11px;font-weight:600;border-radius:16px;">
                          Riesgo ${data.irpLevel}
                        </span>
                      </div>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- Attachment notice -->
              <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
                <p style="margin:0;color:#e2e8f0;font-size:14px;font-weight:600;">
                  📎 Tu reporte completo está adjunto
                </p>
                <p style="margin:6px 0 0;color:#94a3b8;font-size:13px;line-height:1.5;">
                  Abre el archivo HTML adjunto en tu navegador para ver el reporte completo con todos los detalles. Puedes imprimirlo o guardarlo como PDF.
                </p>
              </div>

              <!-- Tip -->
              <div style="margin-top:20px;padding:14px 16px;background:rgba(0,191,165,0.05);border-left:3px solid #00BFA5;border-radius:0 8px 8px 0;">
                <p style="margin:0;color:#e2e8f0;font-size:13px;">
                  💡 <strong>Consejo:</strong> Comparte este reporte con tu dentista para que pueda planificar mejor tu tratamiento.
                </p>
              </div>

            </td>
          </tr>

          ${upsellBlock}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:#0d1520;border-radius:0 0 16px 16px;border:1px solid rgba(0,191,165,0.15);border-top:none;text-align:center;">
              <p style="color:#64748b;font-size:11px;margin:0 0 4px;">
                ImplantX® — Tecnología de IA para Evaluación Dental
              </p>
              <p style="color:#475569;font-size:10px;margin:0 0 4px;">
                Desarrollado por Clínica Miró · clinicamiro.cl
              </p>
              <p style="color:#334155;font-size:10px;margin:0;">
                © 2026 Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// ============================================================
//  GENERATE REPORT HTML (self-contained - no external call)
// ============================================================
const generateReportAttachment = async (data: ReportEmailRequest): Promise<{ html: string; filename: string }> => {
  // Build the report data payload
  const reportPayload = {
    id: data.reportId,
    date: data.date,
    patientName: data.patientName,
    pronosticoLabel: data.pronosticoLabel || '',
    pronosticoMessage: data.pronosticoMessage || '',
    successRange: data.successRange,
    factors: data.factors || [],
    recommendations: data.recommendations || [],
    synergies: data.synergies || [],
    purchaseLevel: data.purchaseLevel,
    irpResult: data.irpResult || (data.irpScore !== undefined ? {
      score: data.irpScore,
      level: data.irpLevel || 'Moderado',
    } : undefined),
  };

  // Call generate-pdf-report Edge Function
  try {
    const reportResponse = await fetch(`${SUPABASE_URL}/functions/v1/generate-pdf-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(reportPayload),
    });

    if (reportResponse.ok) {
      const result = await reportResponse.json();
      if (result.success && result.html) {
        return {
          html: result.html,
          filename: result.downloadName || `ImplantX_Reporte_${data.reportId}.html`,
        };
      }
    }
    console.warn('generate-pdf-report call failed, using inline fallback');
  } catch (err) {
    console.warn('Could not call generate-pdf-report:', err);
  }

  // Fallback: minimal inline report
  const levelLabel = getTierLabel(data.purchaseLevel);
  return {
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ImplantX - ${levelLabel}</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
<h1>ImplantX — ${levelLabel}</h1>
<p><strong>Paciente:</strong> ${data.patientName}</p>
<p><strong>Fecha:</strong> ${data.date}</p>
<p><strong>ID:</strong> ${data.reportId}</p>
<hr>
<h2>Rango de Éxito: ${data.successRange}</h2>
${data.pronosticoLabel ? `<p>${data.pronosticoLabel}</p>` : ''}
${data.irpScore !== undefined ? `<h3>IRP: ${data.irpScore} (Riesgo ${data.irpLevel})</h3>` : ''}
<hr>
<p style="color:#666;font-size:12px;">© 2026 ImplantX by Clínica Miró</p>
</body></html>`,
    filename: `ImplantX_Reporte_${data.reportId}.html`,
  };
};

// ============================================================
//  HANDLER
// ============================================================
const handler = async (req: Request): Promise<Response> => {
  console.log("send-report-email function invoked");
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReportEmailRequest = await req.json();
    console.log("Request:", { email: data.email, name: data.patientName, level: data.purchaseLevel });

    if (!data.email || !data.patientName) {
      throw new Error("Email y nombre del paciente son requeridos");
    }

    // Ensure purchaseLevel has a default
    if (!data.purchaseLevel) {
      (data as any).purchaseLevel = 'free';
    }

    // 1. Generate notification email HTML
    const notificationHTML = generateNotificationEmail(data);

    // 2. Generate report attachment
    const report = await generateReportAttachment(data);
    console.log("Report generated:", report.filename, "size:", report.html.length);

    // 3. Base64 encode the report for Resend attachment
    const encoder = new TextEncoder();
    const reportBytes = encoder.encode(report.html);
    const base64Report = btoa(String.fromCharCode(...reportBytes));

    // 4. Build subject line
    const tierLabel = getTierLabel(data.purchaseLevel);
    const subject = `${getTierEmoji(data.purchaseLevel)} Tu ${tierLabel} ImplantX — ${data.patientName}`;

    // 5. Send via Resend with attachment
    console.log("Sending email to:", data.email);

    const emailPayload: any = {
      from: "ImplantX <implantes@clinicamiro.cl>",
      to: [data.email],
      subject,
      html: notificationHTML,
      attachments: [
        {
          filename: report.filename,
          content: base64Report,
          content_type: "text/html",
        }
      ],
    };

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await emailResponse.json();
    console.log("Resend response:", JSON.stringify(result));

    if (!emailResponse.ok) {
      throw new Error(`Resend error: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-report-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
