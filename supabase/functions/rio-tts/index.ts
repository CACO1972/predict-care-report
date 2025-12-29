import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security constants
const MAX_TEXT_LENGTH = 1000; // Maximum characters allowed
const MIN_TEXT_LENGTH = 1;

/**
 * Validates and sanitizes the input text
 * @param text - The text to validate
 * @returns Sanitized text or null if invalid
 */
function validateAndSanitizeText(text: unknown): { valid: boolean; sanitized: string; error?: string } {
  // Check if text exists and is a string
  if (!text || typeof text !== 'string') {
    return { valid: false, sanitized: '', error: 'Text is required and must be a string' };
  }

  // Trim whitespace
  const trimmed = text.trim();

  // Check minimum length
  if (trimmed.length < MIN_TEXT_LENGTH) {
    return { valid: false, sanitized: '', error: 'Text cannot be empty' };
  }

  // Check maximum length
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `Text too long. Maximum ${MAX_TEXT_LENGTH} characters allowed, received ${trimmed.length}` 
    };
  }

  // Sanitize: remove potentially dangerous characters while preserving Spanish text
  // Allow letters (including accented), numbers, common punctuation, and whitespace
  const sanitized = trimmed
    .replace(/[<>{}[\]\\]/g, '') // Remove potentially dangerous chars
    .replace(/\s+/g, ' '); // Normalize whitespace

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

    const { text } = body as { text?: unknown };
    
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
    const OPENAI_API_KEY = Deno.env.get("OPENAI");

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI API key is not configured");
    }

    console.log("Generating TTS for text:", sanitizedText.substring(0, 50) + (sanitizedText.length > 50 ? "..." : ""), `(${sanitizedText.length} chars)`);

    // Using OpenAI TTS with "onyx" voice - deep male voice, professional and warm
    // Works well for Spanish with neutral accent
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: sanitizedText,
        voice: "onyx", // Deep male voice - professional, empathetic
        response_format: "mp3",
        speed: 0.95, // Slightly slower for clarity in Spanish
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS API error:", response.status, errorText);
      throw new Error(`OpenAI TTS API error: ${response.status}`);
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
