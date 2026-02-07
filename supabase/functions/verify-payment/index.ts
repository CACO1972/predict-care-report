import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS configuration - allow production and preview domains
const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedPatterns = [
    'https://implantx.cl',
    'https://www.implantx.cl',
    'https://app.implantx.cl',
    'https://implantx.lovable.app',
    'https://predict-care-report.lovable.app',
    /^https:\/\/.*\.lovableproject\.com$/,
    /^https:\/\/.*\.lovable\.app$/,
  ];
  
  if (!requestOrigin) return '*';
  
  for (const pattern of allowedPatterns) {
    if (typeof pattern === 'string' && requestOrigin === pattern) {
      return requestOrigin;
    }
    if (pattern instanceof RegExp && pattern.test(requestOrigin)) {
      return requestOrigin;
    }
  }
  
  // Fallback to production domain
  return 'https://predict-care-report.lovable.app';
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { external_reference, payer_email } = await req.json();

    if (!external_reference && !payer_email) {
      return new Response(JSON.stringify({ 
        error: 'Either external_reference or payer_email is required' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create Supabase client with service role for secure access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Build query to find approved payments
    let query = supabase
      .from('payments')
      .select('id, status, purchase_level, verified_at, payer_email, amount, created_at')
      .eq('status', 'approved');

    // Search by external_reference or payer_email
    if (external_reference) {
      query = query.eq('external_reference', external_reference);
    } else if (payer_email) {
      query = query.eq('payer_email', payer_email.toLowerCase());
    }

    // Get the most recent approved payment
    const { data: payments, error } = await query
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!payments || payments.length === 0) {
      console.log('No approved payment found for:', { external_reference, payer_email });
      return new Response(JSON.stringify({ 
        verified: false,
        message: 'No approved payment found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const payment = payments[0];
    console.log('Found approved payment:', payment);

    return new Response(JSON.stringify({ 
      verified: true,
      purchase_level: payment.purchase_level,
      verified_at: payment.verified_at,
      amount: payment.amount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});