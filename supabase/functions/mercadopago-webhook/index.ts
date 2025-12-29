import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const paymentId = body.data?.id || body.id;
    if (!paymentId) {
      console.error('No payment ID in webhook');
      return new Response(JSON.stringify({ error: 'No payment ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
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