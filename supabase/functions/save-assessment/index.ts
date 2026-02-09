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
  
  if (!requestOrigin) return 'https://predict-care-report.lovable.app';
  
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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const getClientIP = (req: Request): string => {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
};

const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now };
};

interface AssessmentData {
  patient_name?: string;
  email: string;
  phone?: string;
  answers: Record<string, unknown>;
  irp_score?: number;
  risk_level?: string;
  missing_teeth_count?: number;
  treatment_type?: string;
  session_id?: string;
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Demasiadas solicitudes. Por favor espera un momento.',
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
        } 
      }
    );
  }

  try {
    const data: AssessmentData = await req.json();
    console.log('Saving assessment for:', data.email);

    if (!data.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique session ID if not provided
    const sessionId = data.session_id || crypto.randomUUID();

    // Check if there's an existing assessment for this email that's not completed
    const { data: existingAssessment } = await supabase
      .from('patient_assessments')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let assessmentId: string;

    if (existingAssessment) {
      // Update existing assessment
      const { data: updated, error: updateError } = await supabase
        .from('patient_assessments')
        .update({
          patient_name: data.patient_name,
          phone: data.phone,
          answers: data.answers,
          irp_score: data.irp_score,
          risk_level: data.risk_level,
          missing_teeth_count: data.missing_teeth_count,
          treatment_type: data.treatment_type,
          session_id: sessionId,
        })
        .eq('id', existingAssessment.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating assessment:', updateError);
        throw updateError;
      }

      assessmentId = updated.id;
      console.log('Updated existing assessment:', assessmentId);
    } else {
      // Create new assessment
      const { data: created, error: insertError } = await supabase
        .from('patient_assessments')
        .insert({
          patient_name: data.patient_name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          answers: data.answers,
          irp_score: data.irp_score,
          risk_level: data.risk_level,
          missing_teeth_count: data.missing_teeth_count,
          treatment_type: data.treatment_type,
          session_id: sessionId,
          purchase_level: 'free',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating assessment:', insertError);
        throw insertError;
      }

      assessmentId = created.id;
      console.log('Created new assessment:', assessmentId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment_id: assessmentId,
        session_id: sessionId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Save assessment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
