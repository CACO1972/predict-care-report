import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
};

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  payment_type_id: string;
  payer: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

/**
 * Verify MercadoPago webhook signature
 */
function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  webhookSecret: string
): boolean {
  if (!xSignature || !xRequestId) {
    console.error('Missing x-signature or x-request-id headers');
    return false;
  }

  const parts = xSignature.split(',');
  let ts: string | null = null;
  let v1: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) {
    console.error('Invalid x-signature format');
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = createHmac('sha256', webhookSecret);
  hmac.update(manifest);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature.length !== v1.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < generatedSignature.length; i++) {
    result |= generatedSignature.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  
  const isValid = result === 0;
  
  if (!isValid) {
    console.error('Signature verification failed', { 
      manifest,
      expected: v1,
      generated: generatedSignature.substring(0, 10) + '...'
    });
  }

  return isValid;
}

/**
 * Send report email based on purchase level with full personalization
 */
async function sendReportEmail(
  email: string,
  purchaseLevel: string,
  assessment: {
    patient_name?: string;
    irp_score?: number;
    risk_level?: string;
    answers?: Record<string, unknown>;
  } | null
): Promise<void> {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  const patientName = assessment?.patient_name || 'Paciente';
  const irpScore = assessment?.irp_score;
  const riskLevel = assessment?.risk_level;
  
  // Calculate success range based on IRP score
  const successRange = irpScore 
    ? `${Math.max(85, 98 - (irpScore * 2))}-${Math.min(98, 100 - irpScore)}%`
    : '85-98%';

  // Build factors from answers if available
  const factors = buildFactorsFromAnswers(assessment?.answers);
  
  // Build recommendations based on purchase level and answers
  const recommendations = buildRecommendations(purchaseLevel, assessment?.answers, irpScore);

  const emailData = {
    email,
    patientName,
    reportId: `EV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: new Date().toLocaleDateString('es-CL'),
    successRange,
    purchaseLevel,
    irpScore,
    irpLevel: riskLevel,
    factors,
    recommendations,
  };

  console.log('Sending personalized report email:', { email, purchaseLevel, irpScore, factorsCount: factors.length });

  try {
    const html = generateReportEmailHTML(emailData);
    const subject = getEmailSubject(purchaseLevel, patientName);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ImplantX <onboarding@resend.dev>',
        to: [email],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send report email:', errorText);
    } else {
      const result = await response.json();
      console.log('Report email sent successfully:', result);
    }
  } catch (error) {
    console.error('Error sending report email:', error);
  }
}

function getEmailSubject(purchaseLevel: string, patientName: string): string {
  switch (purchaseLevel) {
    case 'premium':
      return `🏆 ${patientName}, tu Informe Premium ImplantX está listo`;
    case 'plan-accion':
      return `📋 ${patientName}, tu Plan de Acción ImplantX está listo`;
    default:
      return `Tu informe ImplantX + Recursos extra 📄`;
  }
}

interface EmailData {
  email: string;
  patientName: string;
  reportId: string;
  date: string;
  successRange: string;
  purchaseLevel: string;
  irpScore?: number;
  irpLevel?: string;
  factors: Array<{ name: string; value: string; impact: number }>;
  recommendations: Array<{ text: string; evidence: string }>;
}

function generateReportEmailHTML(data: EmailData): string {
  const isPaid = data.purchaseLevel !== 'free';
  const levelLabel = data.purchaseLevel === 'premium' ? 'PREMIUM' : 
                     data.purchaseLevel === 'plan-accion' ? 'PLAN DE ACCIÓN' : 'BÁSICO';
  const levelColor = data.purchaseLevel === 'premium' ? '#F59E0B' : '#00BFA5';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu Informe ImplantX ${levelLabel}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #0d1520, #1a2332); border-radius: 16px 16px 0 0; border: 1px solid rgba(0, 191, 165, 0.2);">
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
            <td style="padding: 40px 30px; background-color: #0d1520; border: 1px solid rgba(0, 191, 165, 0.2); border-top: none;">
              
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px;">
                ¡Hola ${data.patientName}! ${data.purchaseLevel === 'premium' ? '🏆' : '📋'}
              </h1>
              <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                ${data.purchaseLevel === 'premium' 
                  ? 'Gracias por confiar en nosotros. Aquí tienes tu Informe Premium completo con análisis detallado y recomendaciones personalizadas.'
                  : 'Gracias por tu compra. Aquí tienes tu Plan de Acción personalizado para optimizar tu perfil antes del tratamiento.'}
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
                        Riesgo ${data.irpLevel || 'Moderado'}
                      </span>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              
              ${data.factors.length > 0 ? `
              <!-- Factors Evaluated -->
              <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  📊 Factores Evaluados en Tu Perfil
                </h3>
                <table role="presentation" style="width: 100%;">
                  ${data.factors.map(factor => `
                  <tr>
                    <td style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 8px;">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="color: #ffffff; font-size: 14px;">${factor.name}</td>
                          <td style="color: ${factor.impact <= 8 ? '#22c555' : factor.impact <= 14 ? '#eab308' : '#ef4444'}; font-size: 14px; text-align: right;">${factor.value}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr><td style="height: 8px;"></td></tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
              
              ${data.recommendations.length > 0 ? `
              <!-- Personalized Recommendations -->
              <div style="margin-top: 30px;">
                <h3 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                  ✅ Tu Plan de Acción Personalizado
                </h3>
                ${data.recommendations.map((rec, idx) => `
                <div style="padding: 16px; background: rgba(0, 191, 165, 0.05); border-left: 3px solid #00BFA5; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
                  <p style="margin: 0; color: #00BFA5; font-size: 12px; font-weight: bold;">PASO ${idx + 1}</p>
                  <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 14px; font-weight: 500;">${rec.text}</p>
                  <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; font-style: italic;">📚 ${rec.evidence}</p>
                </div>
                `).join('')}
              </div>
              ` : ''}
              
              ${data.purchaseLevel === 'plan-accion' ? `
              <!-- Upsell to Premium -->
              <div style="margin-top: 30px; padding: 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)); border-radius: 12px; border: 2px solid rgba(245, 158, 11, 0.4); text-align: center;">
                <h3 style="margin: 0 0 8px 0; color: #F59E0B; font-size: 18px; font-weight: bold;">
                  🏆 ¿Quieres el Informe Premium?
                </h3>
                <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 14px;">
                  Incluye análisis de imagen, simulador What-If y más recomendaciones avanzadas.
                </p>
                <a href="https://mpago.li/2jpxDi2" style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #F59E0B, #D97706); color: #000; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                  Upgrade a Premium - $29.990
                </a>
              </div>
              ` : ''}
              
              <!-- Help Section -->
              <div style="margin-top: 30px; padding: 20px; background: rgba(0, 191, 165, 0.05); border-radius: 12px; border: 1px solid rgba(0, 191, 165, 0.2);">
                <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">
                  💡 Comparte este informe con tu dentista
                </p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                  Este informe contiene información valiosa que tu dentista puede usar para planificar mejor tu tratamiento y maximizar las probabilidades de éxito.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background: linear-gradient(135deg, #0d1520, #1a2332); border-radius: 0 0 16px 16px; border: 1px solid rgba(0, 191, 165, 0.2); border-top: none; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">
                Este informe fue generado por ImplantX®
              </p>
              <p style="margin: 0; color: #64748b; font-size: 11px;">
                © 2026 ImplantX - Tecnología de Inteligencia Artificial para Evaluación Dental
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


function buildFactorsFromAnswers(answers?: Record<string, unknown>): Array<{ name: string; value: string; impact: number }> {
  if (!answers) return [];
  
  const factors: Array<{ name: string; value: string; impact: number }> = [];
  
  if (answers.smoking) {
    const smokingMap: Record<string, { value: string; impact: number }> = {
      'no': { value: 'No fumador', impact: 5 },
      'less-10': { value: 'Fumador leve', impact: 12 },
      '10-plus': { value: 'Fumador moderado/alto', impact: 20 },
    };
    const smoking = smokingMap[answers.smoking as string];
    if (smoking) factors.push({ name: 'Tabaquismo', ...smoking });
  }
  
  if (answers.diabetes) {
    const diabetesMap: Record<string, { value: string; impact: number }> = {
      'no': { value: 'Sin diabetes', impact: 5 },
      'controlled': { value: 'Diabetes controlada', impact: 10 },
      'uncontrolled': { value: 'Diabetes no controlada', impact: 18 },
    };
    const diabetes = diabetesMap[answers.diabetes as string];
    if (diabetes) factors.push({ name: 'Diabetes', ...diabetes });
  }
  
  if (answers.bruxism) {
    const bruxismMap: Record<string, { value: string; impact: number }> = {
      'no': { value: 'No bruxismo', impact: 5 },
      'unsure': { value: 'Posible bruxismo', impact: 10 },
      'yes': { value: 'Bruxismo confirmado', impact: 15 },
    };
    const bruxism = bruxismMap[answers.bruxism as string];
    if (bruxism) factors.push({ name: 'Bruxismo', ...bruxism });
  }
  
  if (answers.gumBleeding) {
    const gumMap: Record<string, { value: string; impact: number }> = {
      'never': { value: 'Encías saludables', impact: 5 },
      'sometimes': { value: 'Sangrado ocasional', impact: 12 },
      'frequently': { value: 'Sangrado frecuente', impact: 18 },
    };
    const gum = gumMap[answers.gumBleeding as string];
    if (gum) factors.push({ name: 'Salud de encías', ...gum });
  }
  
  if (answers.oralHygiene) {
    const hygieneMap: Record<string, { value: string; impact: number }> = {
      'twice-plus': { value: 'Excelente', impact: 5 },
      'once': { value: 'Regular', impact: 10 },
      'less-once': { value: 'Insuficiente', impact: 15 },
    };
    const hygiene = hygieneMap[answers.oralHygiene as string];
    if (hygiene) factors.push({ name: 'Higiene oral', ...hygiene });
  }
  
  return factors;
}

function buildRecommendations(
  purchaseLevel: string, 
  answers?: Record<string, unknown>,
  irpScore?: number
): Array<{ text: string; evidence: string }> {
  const recommendations: Array<{ text: string; evidence: string }> = [];
  
  if (!answers) return recommendations;
  
  // Smoking recommendations
  if (answers.smoking === '10-plus') {
    recommendations.push({
      text: 'Reducir o eliminar el consumo de tabaco antes del tratamiento',
      evidence: 'El tabaquismo reduce la tasa de éxito de implantes en un 10-20%'
    });
  } else if (answers.smoking === 'less-10') {
    recommendations.push({
      text: 'Considerar dejar de fumar al menos 2 semanas antes y después de la cirugía',
      evidence: 'Incluso el tabaquismo leve afecta la cicatrización y oseointegración'
    });
  }
  
  // Diabetes recommendations
  if (answers.diabetes === 'uncontrolled') {
    recommendations.push({
      text: 'Optimizar el control glucémico antes del procedimiento',
      evidence: 'HbA1c < 7% mejora significativamente los resultados de implantes'
    });
  } else if (answers.diabetes === 'controlled') {
    recommendations.push({
      text: 'Mantener el control glucémico durante todo el tratamiento',
      evidence: 'Diabetes controlada tiene tasas de éxito similares a no diabéticos'
    });
  }
  
  // Bruxism recommendations
  if (answers.bruxism === 'yes') {
    if (answers.bruxismGuard !== 'yes') {
      recommendations.push({
        text: 'Usar férula de descarga nocturna para proteger el implante',
        evidence: 'El bruxismo aumenta el riesgo de fractura de la prótesis y aflojamiento'
      });
    }
  }
  
  // Gum health recommendations
  if (answers.gumBleeding === 'frequently') {
    recommendations.push({
      text: 'Tratamiento periodontal previo al implante',
      evidence: 'La periodontitis activa aumenta 4x el riesgo de periimplantitis'
    });
  }
  
  // Oral hygiene recommendations  
  if (answers.oralHygiene === 'less-once') {
    recommendations.push({
      text: 'Mejorar rutina de higiene: cepillado 2x/día + hilo dental',
      evidence: 'La higiene deficiente es el factor de riesgo más modificable'
    });
  }
  
  // Premium-specific recommendations
  if (purchaseLevel === 'premium' && irpScore && irpScore > 30) {
    recommendations.push({
      text: 'Considerar protocolo de carga diferida para mayor seguridad',
      evidence: 'IRP elevado sugiere beneficio de tiempo adicional de oseointegración'
    });
  }
  
  return recommendations.slice(0, purchaseLevel === 'premium' ? 5 : 3);
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    
    console.log('Received webhook - Topic:', topic);
    
    // Only process payment notifications
    if (topic !== 'payment') {
      console.log('Ignoring non-payment notification:', topic);
      return new Response(JSON.stringify({ message: 'Ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const body = await req.json();
    console.log('Webhook body:', JSON.stringify(body, null, 2));

    const paymentId = body.data?.id || body.id || body.resource;
    if (!paymentId) {
      console.error('No payment ID in webhook. Body:', JSON.stringify(body));
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log('Extracted payment ID:', paymentId);

    // Verify webhook signature
    const webhookSecret = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    if (webhookSecret) {
      const xSignature = req.headers.get('x-signature');
      const xRequestId = req.headers.get('x-request-id');
      
      const isValid = verifyWebhookSignature(
        xSignature,
        xRequestId,
        paymentId.toString(),
        webhookSecret
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
      
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured');
    }

    // Fetch payment details from MercadoPago API
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Fetching payment details for ID:', paymentId);
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Failed to fetch payment:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const payment: MercadoPagoPayment = await paymentResponse.json();
    console.log('Payment details:', JSON.stringify(payment, null, 2));

    // Determine purchase level from amount
    let purchaseLevel: 'plan-accion' | 'premium' = 'plan-accion';
    if (payment.transaction_amount >= 25000) {
      purchaseLevel = 'premium';
    }
    if (payment.external_reference) {
      if (payment.external_reference.includes('premium')) {
        purchaseLevel = 'premium';
      } else if (payment.external_reference.includes('plan-accion') || payment.external_reference.includes('plan_accion')) {
        purchaseLevel = 'plan-accion';
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upsert payment record
    const paymentRecord = {
      mercadopago_id: payment.id.toString(),
      external_reference: payment.external_reference || null,
      status: payment.status,
      status_detail: payment.status_detail,
      payment_type: payment.payment_type_id,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      payer_email: payment.payer?.email || null,
      payer_name: payment.payer?.first_name 
        ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim()
        : null,
      purchase_level: purchaseLevel,
      verified_at: payment.status === 'approved' ? new Date().toISOString() : null,
      raw_data: payment,
    };

    console.log('Upserting payment record:', JSON.stringify(paymentRecord, null, 2));

    const { data: savedPayment, error: paymentError } = await supabase
      .from('payments')
      .upsert(paymentRecord, { 
        onConflict: 'mercadopago_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return new Response(JSON.stringify({ error: 'Database error', details: paymentError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Payment saved successfully:', savedPayment);

    // If payment is approved, update patient_assessment and send report
    if (payment.status === 'approved' && payment.payer?.email) {
      const payerEmail = payment.payer.email.toLowerCase();
      
      // Find and update patient assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('patient_assessments')
        .update({
          purchase_level: purchaseLevel,
          payment_id: savedPayment.id,
          completed_at: new Date().toISOString(),
        })
        .eq('email', payerEmail)
        .is('completed_at', null)
        .select('id, patient_name, irp_score, risk_level, answers')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentError) {
        console.log('No pending assessment found for email:', payerEmail);
      } else {
        console.log('Updated patient assessment:', assessment.id);
      }

      // Send report email
      await sendReportEmail(payerEmail, purchaseLevel, assessment);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      payment_id: payment.id,
      status: payment.status,
      purchase_level: purchaseLevel
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', details: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
