import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Flow Webhook (urlConfirmation)
 * 
 * Flow sends a POST with { token } to this endpoint after payment.
 * We use the token to query Flow's API for payment status and save to DB.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Flow sends token as form-urlencoded POST
    const contentType = req.headers.get('content-type') || '';
    let token: string | null = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      token = formData.get('token') as string;
    } else {
      const body = await req.json();
      token = body.token;
    }

    if (!token) {
      console.error('No token received from Flow');
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Flow webhook received token:', token);

    const FLOW_API_KEY = Deno.env.get('FLOW_API_KEY');
    const FLOW_SECRET_KEY = Deno.env.get('FLOW_SECRET_KEY');

    if (!FLOW_API_KEY || !FLOW_SECRET_KEY) {
      console.error('Flow API credentials not configured');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query Flow API for payment status
    const params: Record<string, string> = {
      apiKey: FLOW_API_KEY,
      token: token,
    };

    // Generate signature: sort params alphabetically, concatenate key+value, HMAC-SHA256
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(k => `${k}${params[k]}`).join('');
    const hmac = createHmac('sha256', FLOW_SECRET_KEY);
    hmac.update(toSign);
    const signature = hmac.digest('hex');

    // Call Flow's getStatus endpoint
    const queryString = sortedKeys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&');
    const flowUrl = `https://www.flow.cl/api/payment/getStatus?${queryString}&s=${signature}`;

    console.log('Querying Flow API for payment status...');
    const flowResponse = await fetch(flowUrl);
    const flowData = await flowResponse.json();

    if (!flowResponse.ok) {
      console.error('Flow API error:', flowData);
      return new Response(JSON.stringify({ error: 'Flow API error', details: flowData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Flow payment data:', JSON.stringify(flowData));

    // Flow status: 1=pending, 2=paid, 3=rejected, 4=cancelled
    const statusMap: Record<number, string> = {
      1: 'pending',
      2: 'approved',
      3: 'rejected',
      4: 'cancelled',
    };

    const status = statusMap[flowData.status] || 'unknown';
    const flowOrder = String(flowData.flowOrder || flowData.commerceOrder || '');
    const payerEmail = flowData.payer || '';
    const amount = flowData.amount || 0;

    // Determine purchase level based on amount
    let purchaseLevel = 'free';
    if (amount >= 25000) {
      purchaseLevel = 'premium';
    } else if (amount >= 10000) {
      purchaseLevel = 'plan-accion';
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if payment already exists
    const { data: existing } = await supabase
      .from('payments')
      .select('id')
      .eq('flow_order', flowOrder)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status,
          amount,
          payer_email: payerEmail.toLowerCase(),
          purchase_level: purchaseLevel,
          flow_token: token,
          verified_at: status === 'approved' ? new Date().toISOString() : null,
          raw_data: flowData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
      } else {
        console.log('Payment updated:', existing[0].id);
      }
    } else {
      // Insert new payment
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          flow_order: flowOrder,
          flow_token: token,
          status,
          amount,
          currency: 'CLP',
          payer_email: payerEmail.toLowerCase(),
          purchase_level: purchaseLevel,
          verified_at: status === 'approved' ? new Date().toISOString() : null,
          raw_data: flowData,
          external_reference: flowData.commerceOrder || null,
        });

      if (insertError) {
        console.error('Error inserting payment:', insertError);
      } else {
        console.log('Payment inserted for flow order:', flowOrder);
      }
    }

    // If payment is approved, update the patient assessment
    if (status === 'approved' && payerEmail) {
      const { data: assessment } = await supabase
        .from('patient_assessments')
        .select('id')
        .eq('email', payerEmail.toLowerCase())
        .is('completed_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (assessment) {
        await supabase
          .from('patient_assessments')
          .update({ purchase_level: purchaseLevel })
          .eq('id', assessment.id);
        console.log('Updated assessment purchase level:', assessment.id, purchaseLevel);
      }
    }

    // Flow expects a 200 response
    return new Response(JSON.stringify({ success: true, status }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Flow webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
