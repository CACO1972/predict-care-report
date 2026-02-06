import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentData {
  patient_name?: string;
  email: string;
  phone?: string;
  answers: Record<string, unknown>;
  irp_score?: number;
  risk_level?: string;
  missing_teeth_count?: number;
  treatment_type?: string;
  session_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AssessmentData = await req.json();
    console.log('Saving assessment for:', data.email);

    if (!data.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for inserting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique session ID if not provided
    const sessionId = data.session_id || crypto.randomUUID();

    // Check if there's an existing assessment for this email that's not completed
    const { data: existingAssessment } = await supabase
      .from('patient_assessments')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let assessmentId: string;

    if (existingAssessment) {
      // Update existing assessment
      const { data: updated, error: updateError } = await supabase
        .from('patient_assessments')
        .update({
          patient_name: data.patient_name,
          phone: data.phone,
          answers: data.answers,
          irp_score: data.irp_score,
          risk_level: data.risk_level,
          missing_teeth_count: data.missing_teeth_count,
          treatment_type: data.treatment_type,
          session_id: sessionId,
        })
        .eq('id', existingAssessment.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating assessment:', updateError);
        throw updateError;
      }

      assessmentId = updated.id;
      console.log('Updated existing assessment:', assessmentId);
    } else {
      // Create new assessment
      const { data: created, error: insertError } = await supabase
        .from('patient_assessments')
        .insert({
          patient_name: data.patient_name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          answers: data.answers,
          irp_score: data.irp_score,
          risk_level: data.risk_level,
          missing_teeth_count: data.missing_teeth_count,
          treatment_type: data.treatment_type,
          session_id: sessionId,
          purchase_level: 'free',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating assessment:', insertError);
        throw insertError;
      }

      assessmentId = created.id;
      console.log('Created new assessment:', assessmentId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        assessment_id: assessmentId,
        session_id: sessionId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Save assessment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
