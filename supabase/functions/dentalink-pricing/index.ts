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
    console.log(`Dentalink pricing action: ${action}`, params);

    const headers = {
      'Authorization': `Token ${DENTALINK_API_KEY}`,
      'Content-Type': 'application/json',
    };

    let result;

    switch (action) {
      case 'getPrestaciones': {
        // Get all services/treatments catalog
        const url = new URL(`${DENTALINK_BASE_URL}/prestaciones`);
        if (params.categoriaId) {
          url.searchParams.set('id_categoria', params.categoriaId);
        }
        if (params.tipoId) {
          url.searchParams.set('id_tipo', params.tipoId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Prestaciones fetched:', result.data?.length || 0);
        break;
      }

      case 'getAranceles': {
        // Get pricing for services
        const url = new URL(`${DENTALINK_BASE_URL}/aranceles`);
        if (params.prestacionId) {
          url.searchParams.set('id_prestacion', params.prestacionId);
        }
        if (params.convenioId) {
          url.searchParams.set('id_convenio', params.convenioId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Aranceles fetched:', result.data?.length || 0);
        break;
      }

      case 'getCategorias': {
        // Get treatment categories
        const response = await fetch(`${DENTALINK_BASE_URL}/categorias`, { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Categorias fetched:', result.data?.length || 0);
        break;
      }

      case 'getTiposPrestaciones': {
        // Get treatment types
        const response = await fetch(`${DENTALINK_BASE_URL}/tipos_prestaciones`, { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Tipos de prestaciones fetched:', result.data?.length || 0);
        break;
      }

      case 'getTratamientos': {
        // Get treatment plans
        const url = new URL(`${DENTALINK_BASE_URL}/tratamientos`);
        if (params.pacienteId) {
          url.searchParams.set('id_paciente', params.pacienteId);
        }
        const response = await fetch(url.toString(), { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Tratamientos fetched:', result.data?.length || 0);
        break;
      }

      case 'getConvenios': {
        // Get insurance/agreement plans
        const response = await fetch(`${DENTALINK_BASE_URL}/convenios`, { headers });
        if (!response.ok) {
          throw new Error(`Dentalink API error: ${response.status}`);
        }
        result = await response.json();
        console.log('Convenios fetched:', result.data?.length || 0);
        break;
      }

      case 'simulateTreatmentCost': {
        // Simulate treatment cost based on teeth count and treatment type
        const { teethCount, treatmentType } = params;
        
        // Fetch prestaciones to find relevant treatments
        const prestacionesResponse = await fetch(`${DENTALINK_BASE_URL}/prestaciones`, { headers });
        if (!prestacionesResponse.ok) {
          throw new Error(`Dentalink API error: ${prestacionesResponse.status}`);
        }
        const prestaciones = await prestacionesResponse.json();
        
        // Fetch aranceles for pricing
        const arancelesResponse = await fetch(`${DENTALINK_BASE_URL}/aranceles`, { headers });
        if (!arancelesResponse.ok) {
          throw new Error(`Dentalink API error: ${arancelesResponse.status}`);
        }
        const aranceles = await arancelesResponse.json();
        
        // Filter implant-related services
        const implantServices = prestaciones.data?.filter((p: any) => 
          p.nombre?.toLowerCase().includes('implante') ||
          p.nombre?.toLowerCase().includes('corona') ||
          p.nombre?.toLowerCase().includes('pilar')
        ) || [];
        
        // Calculate cost estimate
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
        console.log('Treatment cost simulated:', result.estimate);
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
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
