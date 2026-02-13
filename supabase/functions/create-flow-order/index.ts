import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FLOW_API_URL = 'https://www.flow.cl/api';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, subject, purchaseLevel, commerceOrder } = await req.json();

    // Validate input
    if (!email || !amount || !subject || !purchaseLevel) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields: email, amount, subject, purchaseLevel' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const FLOW_API_KEY = Deno.env.get('FLOW_API_KEY');
    const FLOW_SECRET_KEY = Deno.env.get('FLOW_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

    if (!FLOW_API_KEY || !FLOW_SECRET_KEY || !SUPABASE_URL) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a unique commerce order if not provided
    const order = commerceOrder || `IX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Build Flow API params
    const params: Record<string, string> = {
      apiKey: FLOW_API_KEY,
      commerceOrder: order,
      subject: subject,
      currency: 'CLP',
      amount: String(amount),
      email: email,
      urlConfirmation: `${SUPABASE_URL}/functions/v1/flow-webhook`,
      urlReturn: 'https://implantx.lovable.app/pago-exitoso',
    };

    // Sign: sort keys alphabetically, concat key+value, HMAC-SHA256
    const sortedKeys = Object.keys(params).sort();
    const toSign = sortedKeys.map(k => `${k}${params[k]}`).join('');
    const hmac = createHmac('sha256', FLOW_SECRET_KEY);
    hmac.update(toSign);
    const signature = hmac.digest('hex');

    // Flow requires POST with application/x-www-form-urlencoded
    const formBody = sortedKeys.map(k => `${k}=${encodeURIComponent(params[k])}`).join('&') + `&s=${signature}`;

    console.log('Creating Flow order:', order, 'amount:', amount, 'email:', email);

    const flowResponse = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    const flowData = await flowResponse.json();

    if (!flowResponse.ok) {
      console.error('Flow API error:', flowData);
      return new Response(JSON.stringify({ success: false, error: 'Error creating payment', details: flowData }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Flow order created:', JSON.stringify(flowData));

    // Flow returns { url, token, flowOrder }
    // The redirect URL is: flowData.url + "?token=" + flowData.token
    const paymentUrl = `${flowData.url}?token=${flowData.token}`;

    // Pre-create payment record in pending status
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, supabaseServiceKey);

    await supabase.from('payments').insert({
      flow_order: String(flowData.flowOrder || order),
      flow_token: flowData.token,
      status: 'pending',
      amount,
      currency: 'CLP',
      payer_email: email.toLowerCase(),
      purchase_level: purchaseLevel,
      external_reference: order,
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        paymentUrl,
        token: flowData.token,
        flowOrder: flowData.flowOrder,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('create-flow-order error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
