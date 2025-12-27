import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const FeedbackRequestSchema = z.object({
  questionId: z.string()
    .min(1, 'Se requiere questionId')
    .max(50, 'questionId demasiado largo'),
  questionText: z.string()
    .min(1, 'Se requiere questionText')
    .max(500, 'questionText demasiado largo')
    .transform(val => val.replace(/[<>{}]/g, '')),
  answerValue: z.string()
    .min(1, 'Se requiere answerValue')
    .max(100, 'answerValue demasiado largo'),
  answerLabel: z.string()
    .min(1, 'Se requiere answerLabel')
    .max(200, 'answerLabel demasiado largo')
    .transform(val => val.replace(/[<>{}]/g, '')),
  patientName: z.string()
    .max(100, 'patientName demasiado largo')
    .transform(val => val?.replace(/[<>{}]/g, '').trim())
    .optional()
    .default('Paciente'),
  questionComplexity: z.enum(['simple', 'moderate', 'complex'])
    .optional()
    .default('simple'),
  clinicalContext: z.string()
    .max(1000, 'clinicalContext demasiado largo')
    .transform(val => val?.replace(/[<>{}]/g, ''))
    .optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
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
        JSON.stringify({ error: 'JSON inválido en el cuerpo de la solicitud' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validated = FeedbackRequestSchema.safeParse(body);
    if (!validated.success) {
      console.error('Validation error:', validated.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Datos de entrada inválidos'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { questionId, questionText, answerValue, answerLabel, patientName, questionComplexity, clinicalContext } = validated.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Servicio no disponible', feedback: 'Gracias por tu respuesta.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine response depth based on complexity
    let depthInstruction = '';
    if (questionComplexity === 'simple') {
      depthInstruction = 'Responde en 1-2 oraciones breves pero cálidas y empáticas.';
    } else if (questionComplexity === 'moderate') {
      depthInstruction = 'Responde en 2-3 oraciones. Incluye un dato educativo útil explicado de forma simple.';
    } else {
      depthInstruction = 'Responde en 3-4 oraciones. Explica las consecuencias clínicas de forma simple y da una recomendación constructiva si aplica.';
    }

    const systemPrompt = `Eres Río, un asistente dental amigable de ImplantX. Tu rol es guiar a pacientes a través de una evaluación de riesgo para implantes dentales.

PERSONALIDAD:
- Cálido, empático y reconfortante como un amigo de confianza
- Usas el nombre del paciente de forma natural
- NUNCA juzgas ni criticas las respuestas del paciente
- Siempre encuentras algo positivo o constructivo que decir
- Explicas las cosas de forma simple, como a un amigo

REGLAS CRÍTICAS PARA RESPUESTAS:
1. Si el paciente indica un factor de riesgo (fuma, no se lava los dientes, tiene diabetes descontrolada, etc.):
   - NUNCA digas "eso está mal" o "deberías dejar de..."
   - EN LUGAR de eso: reconoce su honestidad, explica cómo ese factor afecta los implantes, y da un consejo CONSTRUCTIVO y ESPERANZADOR
   - Ejemplo para tabaco: "Gracias por tu honestidad, [nombre]. El tabaco reduce el flujo sanguíneo hacia las encías, lo que puede hacer más lenta la cicatrización. La buena noticia es que reducir aunque sea un poco puede mejorar mucho tus resultados."
   - Ejemplo para higiene oral deficiente: "¡Gracias por compartir esto! Cepillarse al menos dos veces al día ayuda mucho a mantener los implantes sanos a largo plazo. Es un hábito que puedes ir mejorando poco a poco."

2. Si el paciente indica una respuesta positiva (no fuma, buena higiene, etc.):
   - Celebra brevemente sin exagerar
   - Refuerza positivamente el buen hábito

3. SIEMPRE termina con algo que genere confianza o curiosidad sobre el siguiente paso

${depthInstruction}

${clinicalContext ? `CONTEXTO CLÍNICO para esta pregunta: ${clinicalContext}` : ''}

REGLAS ADICIONALES:
- NO uses más de 1 emoji
- NO hagas preguntas adicionales al paciente
- NO menciones que eres IA`;

    const userPrompt = `El paciente ${patientName} respondió a la siguiente pregunta:

Pregunta: "${questionText}"
Respuesta seleccionada: "${answerLabel}"

Genera tu respuesta empática, educativa y constructiva. Recuerda usar su nombre de forma natural.`;

    console.log(`Generating Rio feedback for question: ${questionId}, complexity: ${questionComplexity}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Servicio temporalmente no disponible.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error en el servicio', feedback: 'Gracias por tu respuesta.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const feedback = data.choices?.[0]?.message?.content || 'Gracias por tu respuesta. Continuemos con la siguiente pregunta.';

    console.log(`Rio feedback generated successfully for ${questionId}`);

    return new Response(
      JSON.stringify({ feedback }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in rio-feedback function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        feedback: 'Gracias por tu respuesta. Esta información es valiosa para tu evaluación.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
