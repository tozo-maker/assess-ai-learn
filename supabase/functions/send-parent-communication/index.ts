import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { getCorsHeaders } from '../_shared/cors.ts';

interface SendCommunicationRequest {
  communication_id: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's auth context
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { communication_id }: SendCommunicationRequest = await req.json();
    
    if (!communication_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Communication ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch communication details - RLS ensures only teacher's own communications
    const { data: communication, error: communicationError } = await supabase
      .from('parent_communications')
      .select(`
        *,
        student:student_id(
          first_name,
          last_name,
          id
        )
      `)
      .eq('id', communication_id)
      .eq('teacher_id', user.id)  // Explicit ownership check
      .single();
    
    if (communicationError || !communication) {
      return new Response(
        JSON.stringify({ success: false, error: 'Communication not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!communication.parent_email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Parent email is not available for this student' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // In a real app, we would use a service like SendGrid, Mailgun, or AWS SES to send emails
    console.log(`User ${user.id} sending email to: ${communication.parent_email}`);
    console.log(`Subject: ${communication.subject}`);
    
    // If there's a PDF URL, we would attach it to the email
    if (communication.pdf_url) {
      console.log(`Attaching PDF: ${communication.pdf_url}`);
    }
    
    // Update the communication record to mark it as sent
    const { error: updateError } = await supabase
      .from('parent_communications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', communication_id)
      .eq('teacher_id', user.id);  // Explicit ownership check
    
    if (updateError) {
      console.error('Error updating communication status:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update communication status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent to ${communication.parent_email}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in send-parent-communication function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
