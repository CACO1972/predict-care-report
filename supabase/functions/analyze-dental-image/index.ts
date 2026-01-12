import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Restrict CORS to production domain
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://implantx.lovable.app';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const ImageAnalysisSchema = z.object({
  imageBase64: z.string()
    .min(1, 'Se requiere una imagen')
    .max(15000000, 'La imagen es demasiado grande (máximo ~10MB)')
    .refine(
      (val) => val.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(val.substring(0, 100)),
      'Formato de imagen inválido'
    ),
  patientName: z.string()
    .max(100, 'El nombre es demasiado largo')
    .transform(val => val?.replace(/[<>{}]/g, '').trim())
    .optional()
    .default(''),
  isPremium: z.boolean().optional().default(false)
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Método no permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parse and validate input
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'JSON inválido en el cuerpo de la solicitud' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validated = ImageAnalysisSchema.safeParse(body);
    if (!validated.success) {
      console.error('Validation error:', validated.error.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Datos de entrada inválidos'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, patientName, isPremium } = validated.data;

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Servicio de análisis no disponible' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analizando imagen dental para:', patientName || 'paciente anónimo', '| Premium:', isPremium);

    // Different prompts for premium vs freemium
    const systemPrompt = isPremium 
      ? `Eres un experto implantólogo digital de Clínica Miró. Analizas imágenes dentales (fotos y radiografías) para proporcionar información educativa DETALLADA y clínicamente relevante.

CONTEXTO:
- Servicio educativo de Clínica Miró (MINSAL N° 2505251838764)
- Este es un ANÁLISIS PREMIUM COMPLETO
- Tu objetivo es proporcionar observaciones detalladas y específicas que ayuden al paciente a entender su situación

ANÁLISIS PREMIUM REQUERIDO (estructura tu respuesta así):

📷 TIPO DE IMAGEN:
Identifica: foto intraoral, radiografía panorámica, periapical, CBCT, foto de sonrisa, etc.

🦷 INVENTARIO DENTAL DETALLADO:
- Lista TODOS los dientes visibles/ausentes por cuadrante
- Identifica espacios edéntulos y su ubicación exacta
- Número exacto de dientes ausentes y zonas afectadas
- Estado individual de cada diente visible

🔍 OBSERVACIONES CLÍNICAS COMPLETAS:
- Estado del hueso: altura, densidad, anchura estimada
- Estado de las encías y tejidos blandos con detalle
- Restauraciones, coronas, implantes existentes
- Signos de patología: caries, lesiones periapicales, pérdida ósea
- Proporción corona-raíz de dientes visibles
- Calidad del tejido blando periimplantar

📊 CLASIFICACIÓN DETALLADA DEL CASO:
- Tipo de edentulismo: parcial/extenso/total
- Clasificación de Kennedy si aplica
- Biotipo gingival estimado

💡 PLAN DE IMPLANTES SUGERIDO:
- Número estimado de implantes necesarios
- Tipo de rehabilitación recomendada (unitario, puente, All-on-4/6, híbrida)
- Procedimientos adicionales probables (injertos, elevación de seno, regeneración)
- Tiempo estimado de tratamiento
- Consideraciones especiales del caso

✅ ASPECTOS POSITIVOS Y PRONÓSTICO:
- Factores favorables para el tratamiento
- Pronóstico general estimado

⚠️ FACTORES DE RIESGO IDENTIFICADOS:
- Riesgos específicos observados
- Recomendaciones preventivas

Responde en español chileno, de forma profesional pero accesible. Sé MUY específico y detallado.`
      : `Eres un asistente dental de Clínica Miró. Analizas imágenes dentales para dar información GENERAL orientativa.

CONTEXTO:
- Servicio educativo de Clínica Miró
- Este es un ANÁLISIS BÁSICO GRATUITO
- Da información general sin entrar en detalles clínicos profundos

ANÁLISIS BÁSICO (estructura breve):

📷 Tipo de imagen:
Identifica brevemente qué tipo de imagen es.

🦷 Observación general:
- Indica si se ven dientes ausentes (sin detallar cuántos exactamente)
- Menciona si la zona parece sana o requiere atención

💡 Recomendación:
- Sugiere que consulte con un especialista para evaluación completa
- Menciona que el análisis PREMIUM incluye detalles específicos

Responde en español chileno, de forma amigable y breve (máximo 150 palabras). NO des diagnósticos específicos.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: isPremium 
                  ? `Analiza esta imagen dental del paciente. Proporciona un ANÁLISIS PREMIUM COMPLETO siguiendo la estructura indicada, con todos los detalles clínicos relevantes.`
                  : `Analiza esta imagen dental brevemente. Proporciona un análisis BÁSICO general sin entrar en detalles clínicos específicos. Menciona que para más detalles necesita el análisis premium.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: isPremium ? 2000 : 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Por favor espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Servicio temporalmente no disponible.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Error en el servicio de análisis' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    console.log('Análisis completado exitosamente | Premium:', isPremium);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        isPremium,
        disclaimer: isPremium 
          ? 'Este análisis premium es orientativo y no reemplaza la evaluación presencial de un especialista.'
          : 'Este análisis básico es orientativo. Para un análisis completo, solicita el informe premium.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en analyze-dental-image:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Error interno del servidor',
        analysis: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
