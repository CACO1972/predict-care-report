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
 * @see https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#verificarorigenfirmadigital
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

  // Parse x-signature header: "ts=...,v1=..."
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

  // Build the manifest string as per MercadoPago documentation
  // Format: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Generate HMAC-SHA256 signature
  const hmac = createHmac('sha256', webhookSecret);
  hmac.update(manifest);
  const generatedSignature = hmac.digest('hex');

  // Constant-time comparison to prevent timing attacks
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get('topic') || url.searchParams.get('type');
    
    // MercadoPago sends notifications for different topics
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

    // Get payment ID from the notification
    // MercadoPago can send the ID in different formats:
    // - body.data.id (new format)
    // - body.id (legacy format)  
    // - body.resource (IPN format - just the payment ID as string)
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
        console.error('Invalid webhook signature - possible forgery attempt', {
          paymentId,
          xSignature: xSignature?.substring(0, 20) + '...',
          xRequestId,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip')
        });
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      }
      
      console.log('Webhook signature verified successfully');
    } else {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured - signature verification skipped (NOT RECOMMENDED FOR PRODUCTION)');
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

    // Determine purchase level from external_reference or amount
    let purchaseLevel: 'plan-accion' | 'premium' = 'plan-accion';
    
    // Check by amount (Plan de Acción: ~14990, Premium: ~29990)
    if (payment.transaction_amount >= 25000) {
      purchaseLevel = 'premium';
    }
    
    // Or check by external_reference if it contains level info
    if (payment.external_reference) {
      if (payment.external_reference.includes('premium')) {
        purchaseLevel = 'premium';
      } else if (payment.external_reference.includes('plan-accion') || payment.external_reference.includes('plan_accion')) {
        purchaseLevel = 'plan-accion';
      }
    }

    // Create Supabase client with service role for inserting
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

    const { data, error } = await supabase
      .from('payments')
      .upsert(paymentRecord, { 
        onConflict: 'mercadopago_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Database error', details: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('Payment saved successfully:', data);

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
