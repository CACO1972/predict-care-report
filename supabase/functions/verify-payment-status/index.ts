import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Verify payment status by flow_token or payer_email.
 * Uses service_role to bypass RLS on the payments table.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, email } = await req.json();

    if (!token && !email) {
      return new Response(JSON.stringify({ success: false, error: 'token or email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from('payments')
      .select('status, purchase_level, payer_email')
      .order('created_at', { ascending: false })
      .limit(1);

    if (token) {
      query = query.eq('flow_token', token);
    } else {
      query = query.eq('payer_email', email!.toLowerCase());
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error('Error querying payments:', error);
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!payments || payments.length === 0) {
      return new Response(JSON.stringify({ success: true, data: { found: false } }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payment = payments[0];

    return new Response(JSON.stringify({
      success: true,
      data: {
        found: true,
        status: payment.status,
        purchaseLevel: payment.purchase_level,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('verify-payment-status error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
