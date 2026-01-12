import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Restrict CORS to production domain
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://implantx.lovable.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DENTALINK_BASE_URL = 'https://api.dentalink.healthatom.com/api/v1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
        // Get clinic branches
        const response = await fetch(`${DENTALINK_BASE_URL}/sucursales`, { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Sucursales fetched:', result.data?.length || 0);
        break;
      }

      case 'getDentistas': {
        // Get dentists/professionals
        const url = new URL(`${DENTALINK_BASE_URL}/dentistas`);
        if (params.sucursalId) {
          url.searchParams.set('id_sucursal', params.sucursalId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Dentistas fetched:', result.data?.length || 0);
        break;
      }

      case 'getHorarios': {
        // Get available schedules
        const url = new URL(`${DENTALINK_BASE_URL}/horarios`);
        if (params.dentistaId) {
          url.searchParams.set('id_dentista', params.dentistaId);
        }
        if (params.fecha) {
          url.searchParams.set('fecha', params.fecha);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Horarios fetched:', result.data?.length || 0);
        break;
      }

      case 'getAgendas': {
        // Get agendas
        const url = new URL(`${DENTALINK_BASE_URL}/agendas`);
        if (params.dentistaId) {
          url.searchParams.set('id_dentista', params.dentistaId);
        }
        if (params.sucursalId) {
          url.searchParams.set('id_sucursal', params.sucursalId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Agendas fetched:', result.data?.length || 0);
        break;
      }

      case 'getCitas': {
        // Get appointments
        const url = new URL(`${DENTALINK_BASE_URL}/citas`);
        if (params.fecha) {
          url.searchParams.set('fecha', params.fecha);
        }
        if (params.dentistaId) {
          url.searchParams.set('id_dentista', params.dentistaId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Citas fetched:', result.data?.length || 0);
        break;
      }

      case 'createCita': {
        // Create a new appointment
        const response = await fetch(`${DENTALINK_BASE_URL}/citas`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id_agenda: params.agendaId,
            id_paciente: params.pacienteId,
            fecha: params.fecha,
            hora_inicio: params.horaInicio,
            hora_fin: params.horaFin,
            id_estado: params.estadoId || 1, // Default: scheduled
            observacion: params.observacion || '',
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Error creating appointment: ${JSON.stringify(errorData)}`);
        }
        result = await response.json();
        console.log('Cita created:', result);
        break;
      }

      case 'getBoxes': {
        // Get boxes/rooms
        const url = new URL(`${DENTALINK_BASE_URL}/boxes`);
        if (params.sucursalId) {
          url.searchParams.set('id_sucursal', params.sucursalId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Boxes fetched:', result.data?.length || 0);
        break;
      }

      case 'getEstadosCita': {
        // Get appointment statuses
        const response = await fetch(`${DENTALINK_BASE_URL}/estados_cita`, { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Estados de cita fetched:', result.data?.length || 0);
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
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
