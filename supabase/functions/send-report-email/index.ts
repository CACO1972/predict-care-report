import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Restrict CORS to production domain
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://implantx.lovable.app';

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

const getLevelLabel = (level: string): string => {
  switch (level) {
    case 'premium': return 'PREMIUM';
    case 'plan-accion': return 'PLAN DE ACCIÓN';
    default: return 'BÁSICO';
  }
};

const getLevelColor = (level: string): string => {
  switch (level) {
    case 'premium': return '#F59E0B';
    case 'plan-accion': return '#00BFA5';
    default: return '#00BFA5';
  }
};

const generateEmailHTML = (data: ReportEmailRequest): string => {
  const levelLabel = getLevelLabel(data.purchaseLevel);
  const levelColor = getLevelColor(data.purchaseLevel);
  const isPaid = data.purchaseLevel !== 'free';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu informe ImplantX + Recursos extra</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #0d1520 0%, #1a2332 100%); border-radius: 16px 16px 0 0; border: 1px solid rgba(0, 191, 165, 0.2); border-bottom: none;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #00BFA5, #00897B); border-radius: 12px; text-align: center; line-height: 48px;">
                      <span style="color: white; font-weight: bold; font-size: 18px;">IX</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <span style="display: inline-block; padding: 6px 14px; background: ${levelColor}22; color: ${levelColor}; font-size: 11px; font-weight: bold; border-radius: 20px; border: 1px solid ${levelColor}44;">
                      ${levelLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #0d1520; border: 1px solid rgba(0, 191, 165, 0.2); border-top: none; border-bottom: none;">
              
              <!-- Greeting -->
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ¡Hola ${data.patientName}! 📄
              </h1>
              <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                Aquí tienes tu informe de evaluación dental personalizado junto con recursos adicionales para prepararte mejor.
              </p>
              
              <!-- Report Card -->
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, rgba(0, 191, 165, 0.1), rgba(0, 191, 165, 0.05)); border-radius: 12px; border: 1px solid rgba(0, 191, 165, 0.3);">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="color: #94a3b8; font-size: 12px;">ID del Reporte</td>
                        <td style="color: #94a3b8; font-size: 12px; text-align: right;">Fecha</td>
                      </tr>
                      <tr>
                        <td style="color: #ffffff; font-size: 14px; font-weight: 600;">${data.reportId}</td>
                        <td style="color: #ffffff; font-size: 14px; text-align: right;">${data.date}</td>
                      </tr>
                    </table>
                    
                    <!-- Success Rate -->
                    <div style="margin-top: 24px; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Rango de Éxito Estimado
                      </p>
                      <p style="margin: 0; color: #00BFA5; font-size: 36px; font-weight: bold;">
                        ${data.successRange}
                      </p>
                      ${data.pronosticoLabel ? `<p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px;">${data.pronosticoLabel}</p>` : ''}
                    </div>
                    
                    ${isPaid && data.irpScore !== undefined ? `
                    <!-- IRP Score -->
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(0, 191, 165, 0.2); text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Tu Índice de Riesgo Personalizado
                      </p>
                      <p style="margin: 0; color: #00BFA5; font-size: 48px; font-weight: bold;">
                        ${data.irpScore}
                      </p>
                      <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; background: ${data.irpLevel === 'Bajo' ? '#22c55522' : data.irpLevel === 'Moderado' ? '#eab30822' : '#ef444422'}; color: ${data.irpLevel === 'Bajo' ? '#22c555' : data.irpLevel === 'Moderado' ? '#eab308' : '#ef4444'}; font-size: 12px; font-weight: 600; border-radius: 20px;">
                        Riesgo ${data.irpLevel}
                      </span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              ${isPaid && data.factors && data.factors.length > 0 ? `
              <!-- Factors -->
              <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  📊 Factores Evaluados
                </h3>
                <table role="presentation" style="width: 100%;">
                  ${data.factors.slice(0, 5).map(factor => `
                  <tr>
                    <td style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="color: #ffffff; font-size: 14px;">${factor.name}</td>
                          <td style="color: #94a3b8; font-size: 14px; text-align: right;">${factor.value}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
              
              ${isPaid && data.recommendations && data.recommendations.length > 0 ? `
              <!-- Recommendations -->
              <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  ✅ Recomendaciones Personalizadas
                </h3>
                ${data.recommendations.slice(0, 3).map(rec => `
                <div style="padding: 12px; background: rgba(0, 191, 165, 0.05); border-left: 3px solid #00BFA5; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; color: #ffffff; font-size: 14px;">${rec.text}</p>
                  <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">${rec.evidence}</p>
                </div>
                `).join('')}
              </div>
              ` : ''}
              
              <!-- Resources Section (for all users) -->
              <div style="margin-top: 30px; padding: 24px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  📚 Recursos Extra Incluidos
                </h3>
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <span style="font-size: 20px;">📖</span>
                          </td>
                          <td>
                            <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">Guía: "Prepárate para tu implante"</p>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Todo lo que necesitas saber antes de tu tratamiento</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <span style="font-size: 20px;">✅</span>
                          </td>
                          <td>
                            <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">Checklist pre-operatorio</p>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Lista de verificación para el día de tu procedimiento</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <span style="font-size: 20px;">❓</span>
                          </td>
                          <td>
                            <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">Preguntas clave para tu dentista</p>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Las 10 preguntas más importantes antes del tratamiento</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              ${data.purchaseLevel === 'free' ? `
              <!-- Premium Upsell CTA - Destacado -->
              <div style="margin-top: 30px; padding: 32px 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)); border-radius: 16px; border: 2px solid rgba(245, 158, 11, 0.4); text-align: center;">
                <div style="margin-bottom: 16px;">
                  <span style="font-size: 32px;">🎯</span>
                </div>
                <h3 style="margin: 0 0 8px 0; color: #F59E0B; font-size: 20px; font-weight: bold;">
                  ¿Listo para tu plan personalizado?
                </h3>
                <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  Tu IRP de ${data.irpScore || 'tu perfil'} tiene potencial de mejora
                </p>
                <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.5;">
                  Obtén un plan de acción paso a paso para optimizar tu perfil antes del tratamiento y aumentar significativamente tus probabilidades de éxito.
                </p>
                
                <!-- Benefits list -->
                <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 6px 0;">
                      <span style="color: #22c555;">✓</span>
                      <span style="color: #ffffff; font-size: 13px; margin-left: 8px;">Plan de acción personalizado semana a semana</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <span style="color: #22c555;">✓</span>
                      <span style="color: #ffffff; font-size: 13px; margin-left: 8px;">Recomendaciones específicas según tu IRP</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <span style="color: #22c555;">✓</span>
                      <span style="color: #ffffff; font-size: 13px; margin-left: 8px;">Checklist pre-operatorio completo</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0;">
                      <span style="color: #22c555;">✓</span>
                      <span style="color: #ffffff; font-size: 13px; margin-left: 8px;">Documento para compartir con tu dentista</span>
                    </td>
                  </tr>
                </table>
                
                <a href="https://mpago.la/2eWC5q6" style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #F59E0B, #D97706); color: #000; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);">
                  Obtener Plan de Acción - $14.900
                </a>
                
                <p style="margin: 16px 0 0 0; color: #64748b; font-size: 11px;">
                  🔒 Pago seguro con MercadoPago • Acceso inmediato
                </p>
              </div>
              ` : ''}
              
              <!-- Help Section -->
              <div style="margin-top: 30px; padding: 20px; background: rgba(0, 191, 165, 0.05); border-radius: 12px; border: 1px solid rgba(0, 191, 165, 0.2);">
                <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">
                  💡 ¿Tienes dudas sobre tu resultado?
                </p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                  Este informe está diseñado para que lo compartas con tu dentista. Él o ella podrá usar esta información para planificar mejor tu tratamiento.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #0d1520 0%, #1a2332 100%); border-radius: 0 0 16px 16px; border: 1px solid rgba(0, 191, 165, 0.2); border-top: none; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
                Este informe fue generado por ImplantX®
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © 2024 ImplantX - Tecnología de Inteligencia Artificial para Evaluación Dental
              </p>
              <p style="margin: 12px 0 0 0; color: #475569; font-size: 10px;">
                Si no solicitaste este correo, puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-report-email function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReportEmailRequest = await req.json();
    console.log("Request data:", { email: data.email, patientName: data.patientName, purchaseLevel: data.purchaseLevel });

    if (!data.email || !data.patientName) {
      throw new Error("Email y nombre del paciente son requeridos");
    }

    const html = generateEmailHTML(data);
    
    // Subject line based on purchase level
    const subject = data.purchaseLevel === 'free' 
      ? `Tu informe ImplantX + Recursos extra 📄`
      : `Tu Reporte ImplantX ${getLevelLabel(data.purchaseLevel)} - ${data.patientName}`;

    console.log("Sending email to:", data.email);
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ImplantX <onboarding@resend.dev>",
        to: [data.email],
        subject,
        html,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-report-email function:", error);
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
