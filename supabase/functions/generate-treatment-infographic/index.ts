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
const InfographicRequestSchema = z.object({
  synergies: z.array(z.string().max(200))
    .max(20, 'Demasiados factores sinérgicos')
    .optional()
    .default([]),
  successProbability: z.number()
    .min(0, 'Probabilidad debe ser >= 0')
    .max(100, 'Probabilidad debe ser <= 100')
    .optional()
    .default(85),
  pronosticoLabel: z.string()
    .max(100, 'pronosticoLabel demasiado largo')
    .transform(val => val?.replace(/[<>{}]/g, ''))
    .optional(),
  patientContext: z.object({
    nTeeth: z.number()
      .int()
      .min(0, 'nTeeth debe ser >= 0')
      .max(32, 'nTeeth debe ser <= 32')
      .optional()
      .default(1),
    imageAnalysis: z.string()
      .max(2000, 'imageAnalysis demasiado largo')
      .transform(val => val?.replace(/[<>{}]/g, ''))
      .optional()
      .default('')
  }).optional().default({ nTeeth: 1, imageAnalysis: '' })
});

serve(async (req) => {
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

    const validated = InfographicRequestSchema.safeParse(body);
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

    const { synergies, successProbability, pronosticoLabel, patientContext } = validated.data;

    const openAIApiKey = Deno.env.get('OPENAI');
    if (!openAIApiKey) {
      console.error('OPENAI API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Servicio no disponible' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine case type based on patient context
    const nTeeth = patientContext.nTeeth;
    const imageAnalysis = patientContext.imageAnalysis;
    
    // Detect edentulism type from context
    let caseType = 'unitario'; // default
    if (nTeeth >= 14 || imageAnalysis.toLowerCase().includes('edentulismo total') || imageAnalysis.toLowerCase().includes('sin dientes')) {
      caseType = 'edentulo-total';
    } else if (nTeeth >= 6 || imageAnalysis.toLowerCase().includes('edentulismo extenso') || imageAnalysis.toLowerCase().includes('múltiples')) {
      caseType = 'edentulo-parcial-extenso';
    } else if (nTeeth >= 3) {
      caseType = 'edentulo-parcial-moderado';
    }

    console.log(`Generando infografía para caso tipo: ${caseType}, nTeeth: ${nTeeth}`);

    const systemPrompt = `Eres un experto en implantología dental de Clínica Miró. Generas contenido educativo personalizado.

IMPORTANTE: 
- Responde SIEMPRE en formato JSON válido, sin markdown ni código.
- Las recomendaciones de tratamiento DEBEN ser apropiadas para el tipo de caso del paciente.

TIPOS DE CASO Y ALTERNATIVAS APROPIADAS:

1. EDENTULISMO TOTAL (sin dientes o casi ninguno):
   - Alternativa RECOMENDADA: All-on-4 o All-on-6 (prótesis fija completa sobre 4-6 implantes)
   - Alternativa secundaria: Sobredentadura sobre implantes (prótesis removible estabilizada)
   - Alternativa básica: Prótesis completa convencional (sin implantes)
   - NO recomendar implantes unitarios

2. EDENTULISMO EXTENSO (6-13 dientes ausentes):
   - Alternativa RECOMENDADA: Puente sobre múltiples implantes
   - Alternativa secundaria: All-on-4 parcial o prótesis híbrida
   - Alternativa básica: Prótesis parcial removible
   - NO recomendar implante unitario como opción principal

3. EDENTULISMO PARCIAL MODERADO (3-5 dientes ausentes):
   - Alternativa RECOMENDADA: Puente sobre implantes
   - Alternativa secundaria: Implantes múltiples individuales
   - Alternativa básica: Prótesis parcial removible o puente convencional

4. EDENTULISMO UNITARIO O MÍNIMO (1-2 dientes ausentes):
   - Alternativa RECOMENDADA: Implante unitario
   - Alternativa secundaria: Puente dental convencional
   - Alternativa básica: Prótesis parcial removible

Genera una respuesta con esta estructura exacta:
{
  "treatmentSteps": [
    {
      "id": 1,
      "title": "Título corto",
      "description": "Descripción de 2-3 oraciones adaptada al tipo de caso",
      "duration": "Ej: 1-2 semanas",
      "icon": "calendar|stethoscope|bone|heart|shield|check"
    }
  ],
  "alternatives": [
    {
      "id": 1,
      "name": "Nombre del tratamiento",
      "description": "Descripción breve",
      "pros": ["ventaja1", "ventaja2"],
      "cons": ["desventaja1"],
      "suitability": "alto|medio|bajo"
    }
  ],
  "synergyExplanation": "Explicación de cómo los factores sinérgicos afectan el pronóstico",
  "personalizedAdvice": "Consejo personalizado basado en el tipo de caso y pronóstico"
}`;

    const userPrompt = `Genera contenido educativo para un paciente con:
- TIPO DE CASO: ${caseType}
- Número de dientes a rehabilitar: ${nTeeth}
- Pronóstico: ${pronosticoLabel || 'Favorable'}
- Probabilidad de éxito: ${successProbability}%
- Factores sinérgicos: ${synergies.length > 0 ? synergies.join(', ') : 'Ninguno'}
${imageAnalysis ? `- Análisis de imagen: ${imageAnalysis.substring(0, 500)}` : ''}

IMPORTANTE:
1. Las etapas del tratamiento deben ser apropiadas para un caso de tipo "${caseType}"
2. Las alternativas de tratamiento DEBEN ser las apropiadas para este tipo de caso (ver instrucciones)
3. Si es edentulismo total o extenso, la alternativa principal debe ser All-on-4/6 o puente sobre implantes, NO implante unitario
4. Incluye 3-4 alternativas ordenadas de más a menos recomendada
5. Sé específico sobre por qué cada alternativa es o no apropiada para este caso

Responde SOLO con JSON válido.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
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
        JSON.stringify({ success: false, error: 'Error en el servicio de generación' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('Contenido generado:', content);

    // Parse JSON response
    let parsedContent;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Fallback content based on case type
      parsedContent = getFallbackContent(caseType, nTeeth);
    }

    console.log('Infografía generada exitosamente para caso:', caseType);

    return new Response(
      JSON.stringify({ 
        success: true,
        caseType,
        ...parsedContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en generate-treatment-infographic:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Error interno del servidor'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fallback content based on case type
function getFallbackContent(caseType: string, nTeeth: number) {
  const baseSteps = [
    { id: 1, title: "Evaluación Inicial", description: "Consulta con el especialista para evaluar tu caso específico con tomografía 3D.", duration: "1 sesión", icon: "stethoscope" },
    { id: 2, title: "Planificación Digital", description: "Diseño 3D del tratamiento personalizado para tu caso.", duration: "1-2 semanas", icon: "calendar" },
    { id: 3, title: "Preparación", description: "Tratamientos previos si son necesarios.", duration: "Variable", icon: "shield" },
    { id: 4, title: "Cirugía de Implantes", description: "Colocación de los implantes de titanio.", duration: "1-3 horas", icon: "bone" },
    { id: 5, title: "Osteointegración", description: "Período de cicatrización donde los implantes se fusionan con el hueso.", duration: "3-6 meses", icon: "heart" },
    { id: 6, title: "Prótesis Definitiva", description: "Colocación de la rehabilitación final.", duration: "2-4 semanas", icon: "check" }
  ];

  let alternatives;
  let personalizedAdvice;

  if (caseType === 'edentulo-total') {
    alternatives = [
      { id: 1, name: "All-on-4 / All-on-6", description: "Prótesis fija completa sobre 4-6 implantes estratégicamente ubicados", pros: ["Dientes fijos el mismo día", "No requiere injertos", "Máxima estabilidad"], cons: ["Inversión inicial mayor"], suitability: "alto" },
      { id: 2, name: "Sobredentadura sobre Implantes", description: "Prótesis removible estabilizada con 2-4 implantes", pros: ["Excelente estabilidad", "Costo moderado", "Fácil higiene"], cons: ["Es removible", "Requiere mantención"], suitability: "medio" },
      { id: 3, name: "Prótesis Completa Convencional", description: "Dentadura completa sin implantes", pros: ["Económico", "Sin cirugía"], cons: ["Menor estabilidad", "Puede causar molestias", "Reabsorción ósea"], suitability: "bajo" }
    ];
    personalizedAdvice = "Tu caso requiere una rehabilitación oral completa. El tratamiento All-on-4/6 te permitirá recuperar una dentadura fija y funcional. Agenda tu consulta para evaluar la mejor opción.";
  } else if (caseType === 'edentulo-parcial-extenso') {
    alternatives = [
      { id: 1, name: "Puente sobre Implantes", description: "Prótesis fija sobre múltiples implantes", pros: ["Dientes fijos", "Distribuye la carga", "Excelente estética"], cons: ["Requiere varios implantes"], suitability: "alto" },
      { id: 2, name: "Prótesis Híbrida", description: "Combinación de implantes con prótesis parcial", pros: ["Menor número de implantes", "Buena función"], cons: ["Planificación compleja"], suitability: "medio" },
      { id: 3, name: "Prótesis Parcial Removible", description: "Dentadura parcial sin implantes", pros: ["Sin cirugía", "Económico"], cons: ["Removible", "Menor comodidad"], suitability: "bajo" }
    ];
    personalizedAdvice = "Con varios dientes ausentes, un puente sobre implantes te dará la mejor función y estética. Tu especialista evaluará cuántos implantes necesitas.";
  } else if (caseType === 'edentulo-parcial-moderado') {
    alternatives = [
      { id: 1, name: "Puente sobre Implantes", description: "Prótesis fija sobre 2-3 implantes", pros: ["Dientes fijos", "Preserva hueso", "Natural"], cons: ["Requiere 2+ implantes"], suitability: "alto" },
      { id: 2, name: "Implantes Individuales", description: "Un implante por cada diente perdido", pros: ["Ideal anatomía", "Fácil higiene"], cons: ["Mayor número de cirugías"], suitability: "alto" },
      { id: 3, name: "Puente Convencional", description: "Puente sobre dientes naturales tallados", pros: ["Sin cirugía", "Rápido"], cons: ["Desgasta dientes sanos"], suitability: "medio" },
      { id: 4, name: "Prótesis Removible", description: "Prótesis parcial extraíble", pros: ["Económico"], cons: ["Removible", "Menos cómodo"], suitability: "bajo" }
    ];
    personalizedAdvice = "Para tu caso, un puente sobre implantes o implantes individuales son las mejores opciones para recuperar función y estética.";
  } else {
    alternatives = [
      { id: 1, name: "Implante Unitario", description: "Reemplazo individual del diente perdido", pros: ["Preserva dientes vecinos", "Máxima durabilidad", "Resultado natural"], cons: ["Requiere cirugía"], suitability: "alto" },
      { id: 2, name: "Puente Dental Fijo", description: "Prótesis fija apoyada en dientes adyacentes", pros: ["Sin cirugía", "Resultado rápido"], cons: ["Desgasta dientes sanos"], suitability: "medio" },
      { id: 3, name: "Prótesis Removible", description: "Diente removible parcial", pros: ["Económico", "Sin procedimientos invasivos"], cons: ["Menos cómodo", "Menor estabilidad"], suitability: "bajo" }
    ];
    personalizedAdvice = "Para reemplazar uno o dos dientes, el implante unitario es la opción que mejor imita un diente natural y preserva tu hueso.";
  }

  return {
    treatmentSteps: baseSteps,
    alternatives,
    synergyExplanation: "Tu evaluación será revisada por el especialista para confirmar el mejor tratamiento.",
    personalizedAdvice
  };
}
