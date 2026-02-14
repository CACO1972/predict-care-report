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

// Cleanup stale entries
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
    console.log(`Dentalink availability action: ${action}`, params);

    const headers = {
      'Authorization': `Token ${DENTALINK_API_KEY}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'getSucursales': {
        const response = await fetch(`${DENTALINK_BASE_URL}/sucursales`, { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getDentistas': {
        const url = new URL(`${DENTALINK_BASE_URL}/dentistas`);
        if (params.sucursalId) url.searchParams.set('id_sucursal', params.sucursalId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getHorarios': {
        const url = new URL(`${DENTALINK_BASE_URL}/horarios`);
        if (params.dentistaId) url.searchParams.set('id_dentista', params.dentistaId);
        if (params.fecha) url.searchParams.set('fecha', params.fecha);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getAgendas': {
        const url = new URL(`${DENTALINK_BASE_URL}/agendas`);
        if (params.dentistaId) url.searchParams.set('id_dentista', params.dentistaId);
        if (params.sucursalId) url.searchParams.set('id_sucursal', params.sucursalId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getCitas': {
        const url = new URL(`${DENTALINK_BASE_URL}/citas`);
        if (params.fecha) url.searchParams.set('fecha', params.fecha);
        if (params.dentistaId) url.searchParams.set('id_dentista', params.dentistaId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'createCita': {
        const response = await fetch(`${DENTALINK_BASE_URL}/citas`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id_agenda: params.agendaId,
            id_paciente: params.pacienteId,
            fecha: params.fecha,
            hora_inicio: params.horaInicio,
            hora_fin: params.horaFin,
            id_estado: params.estadoId || 1,
            observacion: params.observacion || '',
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Error creating appointment: ${JSON.stringify(errorData)}`);
        }
        result = await response.json();
        break;
      }
      case 'getBoxes': {
        const url = new URL(`${DENTALINK_BASE_URL}/boxes`);
        if (params.sucursalId) url.searchParams.set('id_sucursal', params.sucursalId);
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
        break;
      }
      case 'getEstadosCita': {
        const response = await fetch(`${DENTALINK_BASE_URL}/estados_cita`, { headers });
        if (!response.ok) throw new Error(`Dentalink API error: ${response.status}`);
        result = await response.json();
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
    console.error('Dentalink availability error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
