import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// CORS configuration - restrict to production domain
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
    .default('')
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

    const { imageBase64, patientName } = validated.data;

    const openAIApiKey = Deno.env.get('OPENAI');
    if (!openAIApiKey) {
      console.error('OPENAI API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Servicio de análisis no disponible' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analizando imagen dental para:', patientName || 'paciente anónimo');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un experto implantólogo digital de Clínica Miró. Analizas imágenes dentales (fotos y radiografías) para proporcionar información educativa detallada y clínicamente relevante.

CONTEXTO:
- Servicio educativo de Clínica Miró (MINSAL N° 2505251838764)
- Tu objetivo es proporcionar observaciones detalladas y específicas que ayuden al paciente a entender su situación
- La información es orientativa y requiere confirmación profesional

ANÁLISIS REQUERIDO (estructura tu respuesta así):

📷 TIPO DE IMAGEN:
Identifica: foto intraoral, radiografía panorámica, periapical, CBCT, foto de sonrisa, etc.

🦷 INVENTARIO DENTAL:
- Lista los dientes visibles/ausentes por cuadrante si es posible
- Identifica espacios edéntulos (sin dientes) y su ubicación aproximada
- Estima el número de dientes ausentes y zonas afectadas

🔍 OBSERVACIONES CLÍNICAS:
- Estado del hueso visible (si es radiografía): altura, densidad aparente
- Estado de las encías y tejidos blandos
- Presencia de restauraciones, coronas, implantes existentes
- Signos de patología visible (caries, lesiones periapicales, pérdida ósea)

📊 CLASIFICACIÓN DEL CASO:
- Edentulismo parcial (pocos dientes ausentes) vs extenso (múltiples) vs total (todos los dientes)
- Si es edentulismo total o extenso, mencionarlo claramente para orientar el tratamiento

💡 CONSIDERACIONES PARA IMPLANTES:
- Calidad ósea aparente para recibir implantes
- Necesidad potencial de procedimientos adicionales (injertos, elevación de seno)
- Tipo de rehabilitación más probable según el caso (unitario, puente sobre implantes, All-on-4/6, prótesis híbrida)

✅ ASPECTOS POSITIVOS:
Destaca elementos favorables para el tratamiento

Responde en español chileno, de forma profesional pero accesible. Sé específico y detallado en tus observaciones.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza esta imagen dental del paciente. Proporciona un análisis detallado siguiendo la estructura indicada, identificando específicamente el tipo de caso (edentulismo parcial/extenso/total), zonas afectadas, y consideraciones relevantes para planificación de implantes.`
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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Demasiadas solicitudes. Por favor espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Error en el servicio de análisis' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    console.log('Análisis completado exitosamente');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        disclaimer: 'Este análisis es orientativo y no reemplaza la evaluación de un especialista.'
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
