import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Dynamic CORS whitelist
const allowedPatterns = [
  'https://implantx.cl',
  'https://www.implantx.cl',
  'https://app.implantx.cl',
  'https://implantx.lovable.app',
];
const allowedRegex = [
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  if (allowedPatterns.includes(origin)) return true;
  return allowedRegex.some(r => r.test(origin));
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = isOriginAllowed(origin) ? origin : allowedPatterns[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// Rate limiting: 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function cleanupRateLimit() {
  if (rateLimitMap.size > 1000) {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }
}

const DENTALINK_BASE_URL = 'https://api.dentalink.healthatom.com/api/v1';

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Origin validation
  const origin = req.headers.get('origin');
  if (!isOriginAllowed(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting
  cleanupRateLimit();
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('cf-connecting-ip') || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  try {
    const DENTALINK_API_KEY = Deno.env.get('DENTALINK_API_KEY');
    if (!DENTALINK_API_KEY) {
      throw new Error('DENTALINK_API_KEY not configured');
    }

    const { action, ...params } = await req.json();
    console.log(`Dentalink pricing action: ${action}`, params);

    const headers = {
      'Authorization': `Token ${DENTALINK_API_KEY}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'getPrestaciones': {
        const url = new URL(`${DENTALINK_BASE_URL}/prestaciones`);
        if (params.categoriaId) url.searchParams.set('id_categoria', params.categoriaId);
        if (params.tipoId) url.searchParams.set('id_tipo', params.tipoId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getAranceles': {
        const url = new URL(`${DENTALINK_BASE_URL}/aranceles`);
        if (params.prestacionId) url.searchParams.set('id_prestacion', params.prestacionId);
        if (params.convenioId) url.searchParams.set('id_convenio', params.convenioId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getCategorias': {
        const response = await fetch(`${DENTALINK_BASE_URL}/categorias`, { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getTiposPrestaciones': {
        const response = await fetch(`${DENTALINK_BASE_URL}/tipos_prestaciones`, { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getTratamientos': {
        const url = new URL(`${DENTALINK_BASE_URL}/tratamientos`);
        if (params.pacienteId) url.searchParams.set('id_paciente', params.pacienteId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getConvenios': {
        const response = await fetch(`${DENTALINK_BASE_URL}/convenios`, { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'simulateTreatmentCost': {
        const { teethCount, treatmentType } = params;
        const prestacionesResponse = await fetch(`${DENTALINK_BASE_URL}/prestaciones`, { headers });
        if (!prestacionesResponse.ok) throw new Error(`Dentalink API error: ${prestacionesResponse.status}`);
        const prestaciones = await prestacionesResponse.json();
        
        const arancelesResponse = await fetch(`${DENTALINK_BASE_URL}/aranceles`, { headers });
        if (!arancelesResponse.ok) throw new Error(`Dentalink API error: ${arancelesResponse.status}`);
        const aranceles = await arancelesResponse.json();
        
        const implantServices = prestaciones.data?.filter((p: any) => 
          p.nombre?.toLowerCase().includes('implante') ||
          p.nombre?.toLowerCase().includes('corona') ||
          p.nombre?.toLowerCase().includes('pilar')
        ) || [];
        
        let totalEstimate = 0;
        const breakdown: any[] = [];
        
        for (const service of implantServices.slice(0, 5)) {
          const arancel = aranceles.data?.find((a: any) => a.id_prestacion === service.id);
          if (arancel) {
            const price = arancel.valor || arancel.precio || 0;
            totalEstimate += price * (teethCount || 1);
            breakdown.push({
              service: service.nombre,
              unitPrice: price,
              quantity: teethCount || 1,
              subtotal: price * (teethCount || 1),
            });
          }
        }
        
        result = {
          estimate: totalEstimate,
          breakdown,
          currency: 'CLP',
          disclaimer: 'Este es un estimado. El costo final puede variar según tu caso clínico específico.',
        };
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dentalink pricing error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
