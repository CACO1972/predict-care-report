import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security constants
const MAX_TEXT_LENGTH = 2000;
const MIN_TEXT_LENGTH = 1;

// Rio's voice ID from ElevenLabs Voice Library
const RIO_VOICE_ID = "0cheeVA5B3Cv6DGq65cT";

/**
 * Validates and sanitizes the input text
 */
function validateAndSanitizeText(text: unknown): { valid: boolean; sanitized: string; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, sanitized: '', error: 'Text is required and must be a string' };
  }

  const trimmed = text.trim();

  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { valid: false, sanitized: '', error: 'Text cannot be empty' };
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed, received ${trimmed.length}` 
    };
  }

  // Sanitize: remove potentially dangerous characters while preserving Spanish text
  const sanitized = trimmed
    .replace(/[<>{}[\]\\]/g, '')
    .replace(/\s+/g, ' ');

  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { text, voiceId } = body as { text?: unknown; voiceId?: string };
    
    // Validate and sanitize input
    const validation = validateAndSanitizeText(text);
    if (!validation.valid) {
      console.warn('TTS validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sanitizedText = validation.sanitized;
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Use provided voiceId or default to Rio's voice
    const selectedVoiceId = voiceId || RIO_VOICE_ID;

    console.log("Generating TTS with ElevenLabs for text:", sanitizedText.substring(0, 50) + (sanitizedText.length > 50 ? "..." : ""), `(${sanitizedText.length} chars)`);

    // Using ElevenLabs TTS API with Rio's cloned voice
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs TTS API error:", response.status, errorText);
      throw new Error(`ElevenLabs TTS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log("TTS audio generated successfully, size:", audioBuffer.byteLength);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
