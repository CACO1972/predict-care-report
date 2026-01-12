import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, Play, CheckCircle, XCircle, Volume2, AlertTriangle, FileAudio } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AudioScript {
  id: string;
  filename: string;
  text: string;
  description: string;
  category: string;
}

// All audio scripts that need to be generated
const audioScripts: AudioScript[] = [
  // Welcome & Profile
  { id: "hola-soy-rio", filename: "hola-soy-rio.mp3", text: "Hola, soy Río, tu asistente virtual de ImplantX. Voy a guiarte en esta evaluación para ayudarte a entender mejor tus posibilidades con los implantes dentales.", description: "Saludo inicial", category: "Bienvenida" },
  { id: "rio-nombre", filename: "rio-nombre.mp3", text: "Para empezar, por favor dime tu nombre.", description: "Pregunta nombre", category: "Perfil" },
  { id: "rio-edad", filename: "rio-edad.mp3", text: "¡Un gusto conocerte! Ahora necesito algunos datos básicos para personalizar tu evaluación.", description: "Pregunta edad", category: "Perfil" },
  
  // Smoking
  { id: "rio-fuma", filename: "rio-fuma.mp3", text: "Perfecto. Hablemos ahora de algunos hábitos. Tu honestidad es clave para darte el mejor tratamiento posible.", description: "Pregunta tabaco", category: "Hábitos" },
  { id: "rio-nofuma", filename: "rio-nofuma.mp3", text: "¡Excelente! No fumar es uno de los factores más importantes para el éxito del implante. La cicatrización será más rápida y el riesgo de complicaciones mucho menor.", description: "Feedback no fuma", category: "Hábitos" },
  { id: "rio-menosde10", filename: "rio-menosde10.mp3", text: "Fumar reduce el flujo sanguíneo y dificulta la cicatrización. La buena noticia: dejar de fumar incluso dos a tres semanas antes del implante puede mejorar significativamente tus probabilidades de éxito.", description: "Feedback menos de 10", category: "Hábitos" },
  { id: "rio-masde10", filename: "rio-masde10.mp3", text: "El tabaco es uno de los principales enemigos del implante. Sin embargo, muchos fumadores logran excelentes resultados. Te recomendaríamos reducir o dejar de fumar antes del procedimiento para multiplicar tus posibilidades de éxito.", description: "Feedback más de 10", category: "Hábitos" },
  
  // Bruxism
  { id: "rio-brux-pregunta", filename: "rio-brux-pregunta.mp3", text: "Algunas personas aprietan los dientes, a menudo sin darse cuenta. Es más común de lo que piensas.", description: "Pregunta bruxismo", category: "Hábitos" },
  { id: "rio-nobruxa", filename: "rio-nobruxa.mp3", text: "Perfecto. No apretar los dientes reduce el estrés sobre el implante y prolonga su vida útil.", description: "Feedback no bruxismo", category: "Hábitos" },
  { id: "rio-brux-ferula", filename: "rio-brux-ferula.mp3", text: "El bruxismo puede manejarse muy bien. Una férula de descarga protege tanto tus dientes naturales como los implantes.", description: "Pregunta férula bruxismo", category: "Hábitos" },
  { id: "rio-sibruxa", filename: "rio-sibruxa.mp3", text: "El bruxismo genera fuerzas excesivas, pero tiene solución simple: una férula de descarga protege el implante eficazmente. Te haré una pregunta más sobre esto.", description: "Feedback sí bruxismo", category: "Hábitos" },
  
  // Diabetes
  { id: "rio-diabetes-pregunta", filename: "rio-diabetes-pregunta.mp3", text: "Tu salud general influye mucho en el éxito del tratamiento.", description: "Pregunta diabetes", category: "Salud" },
  { id: "rio-nodiabetes", filename: "rio-nodiabetes.mp3", text: "Excelente. No tener diabetes facilita la cicatrización y reduce el riesgo de infecciones.", description: "Feedback no diabetes", category: "Salud" },
  { id: "rio-diabetes-controlada", filename: "rio-diabetes-controlada.mp3", text: "La diabetes controlada no es impedimento para un implante exitoso. Con un buen control glucémico, los resultados son similares a pacientes sin diabetes.", description: "Feedback diabetes controlada", category: "Salud" },
  { id: "rio-diabetes-nocontrolada", filename: "rio-diabetes-nocontrolada.mp3", text: "La diabetes no controlada puede retrasar la cicatrización. Lo importante es trabajar con tu médico para mejorar el control antes del implante. Una vez controlada, las tasas de éxito son excelentes.", description: "Feedback diabetes no controlada", category: "Salud" },
  
  // Gum Health
  { id: "rio-pregunta-encias", filename: "rio-pregunta-encias.mp3", text: "Veamos ahora la salud de tus encías.", description: "Pregunta encías", category: "Encías" },
  { id: "rio-feedback-encias", filename: "rio-feedback-encias.mp3", text: "Gracias por tu honestidad. La salud de las encías es fundamental para el éxito del implante. Si hay algún problema, lo trataremos primero.", description: "Feedback encías", category: "Encías" },
  
  // Implant History
  { id: "rio-implante-pregunta", filename: "rio-implante-pregunta.mp3", text: "Saber tu experiencia previa nos ayuda a entender mejor tu caso.", description: "Pregunta implantes previos", category: "Historial" },
  { id: "rio-primer-implante", filename: "rio-primer-implante.mp3", text: "Ser tu primer implante es completamente normal. La mayoría de los implantes son exitosos en el primer intento.", description: "Feedback primer implante", category: "Historial" },
  { id: "rio-implante-bien", filename: "rio-implante-bien.mp3", text: "¡Perfecto! Tener implantes exitosos previos es el mejor predictor de éxito futuro. Tu cuerpo ya demostró que integra bien los implantes.", description: "Feedback implante exitoso", category: "Historial" },
  { id: "rio-implante-fallaron", filename: "rio-implante-fallaron.mp3", text: "Un fracaso previo requiere investigar la causa, pero NO significa que volverá a pasar. Muchas veces se debió a factores controlables. Con el diagnóstico correcto, las probabilidades de éxito en un segundo intento son altas.", description: "Feedback implante fracasó", category: "Historial" },
  
  // Tooth Loss Cause
  { id: "rio-causa-pregunta", filename: "rio-causa-pregunta.mp3", text: "Entender por qué perdiste tus dientes nos da pistas importantes.", description: "Pregunta causa pérdida", category: "Historial" },
  { id: "rio-causa-caries", filename: "rio-causa-caries.mp3", text: "Perder el diente por caries generalmente significa que el hueso y las encías alrededor están sanos, lo cual es ideal para el implante.", description: "Feedback causa caries", category: "Historial" },
  { id: "rio-causa-periodontitis", filename: "rio-causa-periodontitis.mp3", text: "La periodontitis puede haber afectado el hueso, pero esto NO impide el implante. Con tratamiento periodontal previo y buenos cuidados posteriores, los resultados son muy buenos.", description: "Feedback causa periodontitis", category: "Historial" },
  { id: "rio-causa-trauma", filename: "rio-causa-trauma.mp3", text: "Perder el diente por un golpe o trauma generalmente significa que el hueso y las encías alrededor están sanos, lo cual es ideal para el implante.", description: "Feedback causa trauma", category: "Historial" },
  
  // Tooth Loss Time
  { id: "rio-tiempo-pregunta", filename: "rio-tiempo-pregunta.mp3", text: "Saber cuánto tiempo ha pasado nos ayuda a evaluar el hueso disponible.", description: "Pregunta tiempo pérdida", category: "Historial" },
  { id: "rio-tiempo-menos1", filename: "rio-tiempo-menos1.mp3", text: "Menos de un año es un tiempo ideal. Generalmente hay muy buen volumen óseo disponible, lo que facilita el tratamiento.", description: "Feedback menos de 1 año", category: "Historial" },
  { id: "rio-tiempo-1a3", filename: "rio-tiempo-1a3.mp3", text: "Entre uno y tres años puede haber algo de reabsorción ósea, pero en la mayoría de los casos aún hay buen hueso disponible para el implante.", description: "Feedback 1 a 3 años", category: "Historial" },
  { id: "rio-tiempo-masde3", filename: "rio-tiempo-masde3.mp3", text: "Después de tres años suele haber mayor reabsorción del hueso, pero hay técnicas como injertos óseos que pueden solucionarlo. Tu especialista evaluará las mejores opciones.", description: "Feedback más de 3 años", category: "Historial" },
  
  // Teeth Count
  { id: "rio-cuantos-dientes", filename: "rio-cuantos-dientes.mp3", text: "¿Cuántos dientes necesitas reemplazar? Esto nos ayuda a orientar el tipo de tratamiento más adecuado para ti.", description: "Pregunta cantidad dientes", category: "Tratamiento" },
  { id: "rio-1a2-dientes", filename: "rio-1a2-dientes.mp3", text: "Para uno o dos dientes, los implantes unitarios son la solución ideal. Cada implante actúa como una raíz individual.", description: "Feedback 1 a 2 dientes", category: "Tratamiento" },
  { id: "rio-feedback-1a2", filename: "rio-feedback-1a2.mp3", text: "Para uno o dos dientes, los implantes unitarios son la solución ideal. Cada implante actúa como una raíz individual.", description: "Feedback 1 a 2 dientes alt", category: "Tratamiento" },
  { id: "rio-feedback-puente", filename: "rio-feedback-puente.mp3", text: "Para tres a ocho dientes, un puente sobre implantes es una excelente opción. Se colocan varios implantes que sostienen una prótesis fija, más estable y cómoda que las prótesis removibles.", description: "Feedback puente", category: "Tratamiento" },
  { id: "rio-feedback-todos", filename: "rio-feedback-todos.mp3", text: "Para reemplazar todos los dientes, tratamientos como All-on-4 o All-on-6 son los más recomendados. Con solo cuatro a seis implantes puedes tener una dentadura completa y fija.", description: "Feedback todos dientes", category: "Tratamiento" },
  { id: "rio-todos-dientes", filename: "rio-todos-dientes.mp3", text: "Para reemplazar todos los dientes, tratamientos como All-on-4 o All-on-6 son los más recomendados. Con solo cuatro a seis implantes puedes tener una dentadura completa y fija.", description: "Feedback todos dientes alt", category: "Tratamiento" },
  { id: "rio-puente-allonfor", filename: "rio-puente-allonfor.mp3", text: "Para rehabilitaciones extensas, existen diferentes técnicas como puentes sobre implantes o el sistema All-on-4 que permiten resultados excelentes con menos implantes.", description: "Feedback puente all-on-4", category: "Tratamiento" },

  // ========== SALUD ÓSEA (DensityPro) ==========
  { id: "rio-density-intro", filename: "rio-density-intro.mp3", text: "He notado por tu edad y género que es importante evaluar tu salud ósea. Estas preguntas nos ayudarán a entender la calidad de tus huesos, lo cual es fundamental para el éxito de tu implante.", description: "Introducción evaluación ósea", category: "Salud Ósea" },
  { id: "rio-density-q1", filename: "rio-density-q1.mp3", text: "Comencemos con tu historial médico. Las fracturas previas nos dan información importante sobre la resistencia de tus huesos.", description: "Pregunta fracturas", category: "Salud Ósea" },
  { id: "rio-density-q2", filename: "rio-density-q2.mp3", text: "Ahora, sobre algunos cambios que quizás hayas notado. La estatura puede darnos pistas sobre la salud ósea.", description: "Pregunta pérdida altura", category: "Salud Ósea" },
  { id: "rio-density-q3", filename: "rio-density-q3.mp3", text: "La genética también juega un papel importante en la salud de nuestros huesos.", description: "Pregunta historial familiar", category: "Salud Ósea" },
  { id: "rio-density-q4", filename: "rio-density-q4.mp3", text: "Ciertos medicamentos pueden afectar la salud de los huesos. Es importante conocer tu historial.", description: "Pregunta corticoides", category: "Salud Ósea" },
  { id: "rio-density-q5", filename: "rio-density-q5.mp3", text: "Finalmente, algunos hábitos de vida que pueden influir en tus huesos.", description: "Pregunta alcohol", category: "Salud Ósea" },
  { id: "rio-density-complete", filename: "rio-density-complete.mp3", text: "¡Gracias! He analizado tus respuestas sobre salud ósea. Esta información nos ayudará a personalizar tu plan de tratamiento. Continuemos con el cuestionario principal.", description: "Evaluación ósea completada", category: "Salud Ósea" },

  // Feedback Salud Ósea
  { id: "rio-fractura-no", filename: "rio-fractura-no.mp3", text: "No tener fracturas previas es un excelente indicador. Tu hueso tiene buena resistencia, lo que favorece la integración del implante.", description: "Feedback sin fracturas", category: "Salud Ósea" },
  { id: "rio-fractura-si", filename: "rio-fractura-si.mp3", text: "Las fracturas previas pueden indicar menor densidad ósea. Esto es importante evaluarlo, pero no impide el tratamiento. Con las precauciones adecuadas, podemos lograr excelentes resultados.", description: "Feedback con fracturas", category: "Salud Ósea" },
  { id: "rio-altura-no", filename: "rio-altura-no.mp3", text: "Mantener tu estatura es un buen signo de salud ósea en tu columna vertebral.", description: "Feedback sin pérdida altura", category: "Salud Ósea" },
  { id: "rio-altura-si", filename: "rio-altura-si.mp3", text: "La pérdida de estatura puede relacionarse con la salud ósea. Lo importante es que ahora lo estamos evaluando para tomar las mejores decisiones.", description: "Feedback con pérdida altura", category: "Salud Ósea" },
  { id: "rio-familia-no", filename: "rio-familia-no.mp3", text: "La ausencia de historial familiar reduce tu riesgo de problemas óseos. Es un factor positivo para tu tratamiento.", description: "Feedback sin historial familiar", category: "Salud Ósea" },
  { id: "rio-familia-si", filename: "rio-familia-si.mp3", text: "Los antecedentes familiares nos ayudan a estar más atentos, pero no determinan tu resultado. La prevención es nuestra mejor herramienta.", description: "Feedback con historial familiar", category: "Salud Ósea" },
  { id: "rio-corticoides-no", filename: "rio-corticoides-no.mp3", text: "Excelente. No tomar corticoides protege tu densidad ósea y favorece la cicatrización.", description: "Feedback sin corticoides", category: "Salud Ósea" },
  { id: "rio-corticoides-si", filename: "rio-corticoides-si.mp3", text: "Los corticoides pueden afectar el hueso, pero con monitoreo y cuidados especiales podemos compensarlo. Muchos pacientes con este historial tienen implantes exitosos.", description: "Feedback con corticoides", category: "Salud Ósea" },
  { id: "rio-alcohol-no", filename: "rio-alcohol-no.mp3", text: "Perfecto. El consumo moderado o nulo de alcohol favorece la absorción de calcio y la salud ósea.", description: "Feedback consumo bajo alcohol", category: "Salud Ósea" },
  { id: "rio-alcohol-si", filename: "rio-alcohol-si.mp3", text: "El consumo elevado puede afectar el metabolismo del calcio. Reducirlo, incluso gradualmente, puede mejorar significativamente tu salud ósea y el éxito del implante.", description: "Feedback consumo alto alcohol", category: "Salud Ósea" },

  // ========== RESULTADOS Y PLANES ==========
  { id: "rio-resultados-intro", filename: "rio-resultados-intro.mp3", text: "¡Listo! He analizado todas tus respuestas y aquí tienes tu Índice de Riesgo Personalizado. Este número representa tu probabilidad de éxito con implantes dentales basándose en tus factores específicos.", description: "Introducción resultados", category: "Resultados" },
  { id: "rio-plan-gratis", filename: "rio-plan-gratis.mp3", text: "Con el informe gratuito puedes ver tu puntuación general y los factores principales que influyen en tu caso. Es un buen punto de partida para entender tu situación.", description: "Explicación plan gratis", category: "Resultados" },
  { id: "rio-plan-accion", filename: "rio-plan-accion.mp3", text: "El Plan de Acción incluye un análisis más detallado con recomendaciones personalizadas, factores de riesgo específicos y un PDF descargable que puedes compartir con tu dentista.", description: "Explicación plan acción", category: "Resultados" },
  { id: "rio-plan-premium", filename: "rio-plan-premium.mp3", text: "El Informe Premium es nuestra evaluación más completa. Incluye análisis de radiografía o foto dental con inteligencia artificial, simulación de tu nueva sonrisa, y un plan de tratamiento detallado con costos estimados.", description: "Explicación plan premium", category: "Resultados" },
  { id: "rio-felicitaciones", filename: "rio-felicitaciones.mp3", text: "¡Felicitaciones! Has dado el primer paso hacia recuperar tu sonrisa. Recuerda que estos resultados son orientativos y tu dentista tendrá la última palabra. ¡Mucho éxito!", description: "Mensaje de despedida", category: "Resultados" },
];

// List of audio files that already exist in public/audio (68 files) - COMPLETE!
const EXISTING_AUDIO_FILES = [
  "hola-soy-rio.mp3",
  "rio-1a2-dientes.mp3",
  "rio-alcohol-no-3.mp3",
  "rio-alcohol-no.mp3",
  "rio-alcohol-si-3.mp3",
  "rio-alcohol-si.mp3",
  "rio-altura-no.mp3",
  "rio-altura-si.mp3",
  "rio-brux-ferula.mp3",
  "rio-brux-no.mp3",
  "rio-brux-pregunta.mp3",
  "rio-brux-si.mp3",
  "rio-causa-caries.mp3",
  "rio-causa-periodontitis.mp3",
  "rio-causa-pregunta.mp3",
  "rio-causa-trauma.mp3",
  "rio-corticoides-no-3.mp3",
  "rio-corticoides-no.mp3",
  "rio-corticoides-si-3.mp3",
  "rio-corticoides-si.mp3",
  "rio-cuantos-dientes.mp3",
  "rio-density-complete-2.mp3",
  "rio-density-complete.mp3",
  "rio-density-intro-2.mp3",
  "rio-density-intro.mp3",
  "rio-density-q1.mp3",
  "rio-density-q2.mp3",
  "rio-density-q3-2.mp3",
  "rio-density-q3.mp3",
  "rio-density-q4.mp3",
  "rio-density-q5.mp3",
  "rio-diabetes-controlada.mp3",
  "rio-diabetes-nocontrolada.mp3",
  "rio-diabetes-pregunta.mp3",
  "rio-edad.mp3",
  "rio-familia-no.mp3",
  "rio-familia-si-3.mp3",
  "rio-feedback-1a2.mp3",
  "rio-feedback-encias.mp3",
  "rio-feedback-puente.mp3",
  "rio-feedback-todos.mp3",
  "rio-felicitaciones-2.mp3",
  "rio-fractura-no-2.mp3",
  "rio-fractura-no.mp3",
  "rio-fractura-si.mp3",
  "rio-fuma.mp3",
  "rio-implante-bien.mp3",
  "rio-implante-fallaron.mp3",
  "rio-implante-pregunta.mp3",
  "rio-masde10.mp3",
  "rio-menosde10.mp3",
  "rio-nobruxa.mp3",
  "rio-nodiabetes.mp3",
  "rio-nofuma.mp3",
  "rio-nombre.mp3",
  "rio-plan-accion.mp3",
  "rio-plan-gratis.mp3",
  "rio-plan-premium.mp3",
  "rio-pregunta-encias.mp3",
  "rio-primer-implante.mp3",
  "rio-puente-allonfor.mp3",
  "rio-resultados-intro.mp3",
  "rio-sibruxa.mp3",
  "rio-tiempo-1a3.mp3",
  "rio-tiempo-masde3.mp3",
  "rio-tiempo-menos1.mp3",
  "rio-tiempo-pregunta.mp3",
  "rio-todos-dientes.mp3",
];

const AudioGenerator = () => {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Calculate missing audios
  const missingAudios = audioScripts.filter(s => !EXISTING_AUDIO_FILES.includes(s.filename));

  const generateAudio = async (script: AudioScript) => {
    setGenerating(script.id);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: script.text }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setAudioUrls(prev => ({ ...prev, [script.id]: audioUrl }));
      setGenerated(prev => new Set([...prev, script.id]));
      setFailed(prev => {
        const newSet = new Set(prev);
        newSet.delete(script.id);
        return newSet;
      });
      
      toast.success(`Audio "${script.filename}" generado correctamente`);
    } catch (error) {
      console.error("Error generating audio:", error);
      setFailed(prev => new Set([...prev, script.id]));
      toast.error(`Error generando "${script.filename}": ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateAll = async () => {
    setGeneratingAll(true);
    for (const script of audioScripts) {
      if (!generated.has(script.id)) {
        await generateAudio(script);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    setGeneratingAll(false);
    toast.success("¡Generación completada!");
  };

  const generateMissing = async () => {
    setGeneratingAll(true);
    toast.info(`Generando ${missingAudios.length} audios faltantes...`);
    
    for (const script of missingAudios) {
      if (!generated.has(script.id)) {
        await generateAudio(script);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    setGeneratingAll(false);
    toast.success(`¡${missingAudios.length} audios generados! Descárgalos para subirlos al proyecto.`);
  };

  const downloadMissing = () => {
    missingAudios.forEach((script, index) => {
      if (generated.has(script.id)) {
        // Stagger downloads to avoid browser blocking
        setTimeout(() => {
          downloadAudio(script.id, script.filename);
        }, index * 500);
      }
    });
  };

  const playAudio = (id: string) => {
    const url = audioUrls[id];
    if (!url) return;
    
    const audio = new Audio(url);
    audio.onplay = () => setPlayingId(id);
    audio.onended = () => setPlayingId(null);
    audio.play();
  };

  const downloadAudio = (id: string, filename: string) => {
    const url = audioUrls[id];
    if (!url) return;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const downloadAll = () => {
    generated.forEach(id => {
      const script = audioScripts.find(s => s.id === id);
      if (script) {
        downloadAudio(id, script.filename);
      }
    });
  };

  const categories = [...new Set(audioScripts.map(s => s.category))];
  const missingCount = missingAudios.length;
  const missingGenerated = missingAudios.filter(s => generated.has(s.id)).length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Generador de Audios - Río</h1>
            <p className="text-muted-foreground mt-1">
              Genera todos los audios para el asistente Río usando la voz clonada de ElevenLabs
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Voice ID: nNS8uylvF9GBWVSiIt5h | Model: eleven_multilingual_v2
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={generateAll} 
              disabled={generatingAll || generating !== null}
              className="gap-2"
              variant="outline"
            >
              {generatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  Generar Todos
                </>
              )}
            </Button>
            
            {generated.size > 0 && (
              <Button variant="outline" onClick={downloadAll} className="gap-2">
                <Download className="w-4 h-4" />
                Descargar Todos ({generated.size})
              </Button>
            )}
          </div>
        </div>

        {/* Missing Audios Section */}
        {missingCount > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg text-amber-500">Audios Faltantes en el Proyecto</CardTitle>
              </div>
              <CardDescription>
                Estos {missingCount} audios no existen en <code className="text-xs bg-muted px-1 rounded">/public/audio/</code>. 
                Genera y descarga para agregarlos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {missingAudios.map(script => (
                  <Badge 
                    key={script.id} 
                    variant={generated.has(script.id) ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {generated.has(script.id) && <CheckCircle className="w-3 h-3" />}
                    {script.filename}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={generateMissing} 
                  disabled={generatingAll || generating !== null}
                  className="gap-2"
                >
                  {generatingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando {missingGenerated}/{missingCount}...
                    </>
                  ) : (
                    <>
                      <FileAudio className="w-4 h-4" />
                      Generar Solo Faltantes ({missingCount})
                    </>
                  )}
                </Button>
                
                {missingGenerated > 0 && (
                  <Button variant="secondary" onClick={downloadMissing} className="gap-2">
                    <Download className="w-4 h-4" />
                    Descargar Faltantes ({missingGenerated})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {audioScripts.length}</span>
            <span className="text-green-500">✓ Generados: {generated.size}</span>
            <span className="text-red-500">✗ Fallidos: {failed.size}</span>
          </div>

          {categories.map(category => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  {audioScripts.filter(s => s.category === category).length} audios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {audioScripts
                  .filter(s => s.category === category)
                  .map(script => (
                    <div 
                      key={script.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-primary">{script.filename}</span>
                          {generated.has(script.id) && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {failed.has(script.id) && (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{script.description}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        {generated.has(script.id) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => playAudio(script.id)}
                              className="gap-1"
                            >
                              <Play className={`w-3 h-3 ${playingId === script.id ? 'text-primary' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadAudio(script.id, script.filename)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant={generated.has(script.id) ? "outline" : "default"}
                          size="sm"
                          onClick={() => generateAudio(script)}
                          disabled={generating !== null}
                        >
                          {generating === script.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : generated.has(script.id) ? (
                            "Regenerar"
                          ) : (
                            "Generar"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioGenerator;
