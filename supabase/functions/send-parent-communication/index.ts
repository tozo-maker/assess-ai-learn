
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { EmailRequest } from '../_shared/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { communication_id }: EmailRequest = await req.json();
    
    if (!communication_id) {
      throw new Error('Communication ID is required');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch communication details
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
      .single();
    
    if (communicationError || !communication) {
      throw new Error(`Communication not found: ${communicationError?.message || 'Unknown error'}`);
    }
    
    if (!communication.parent_email) {
      throw new Error('Parent email is not available for this student');
    }
    
    // In a real app, we would use a service like SendGrid, Mailgun, or AWS SES to send emails
    console.log(`Sending email to: ${communication.parent_email}`);
    console.log(`Subject: ${communication.subject}`);
    console.log(`Content: ${communication.content}`);
    
    // If there's a PDF URL, we would attach it to the email
    if (communication.pdf_url) {
      console.log(`Attaching PDF: ${communication.pdf_url}`);
    }
    
    // For this example, we'll simulate successful email sending
    // In a production app, replace this with actual email sending code
    
    // Update the communication record to mark it as sent
    const { error: updateError } = await supabase
      .from('parent_communications')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', communication_id);
    
    if (updateError) {
      throw new Error(`Error updating communication status: ${updateError.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Email sent to ${communication.parent_email}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in send-parent-communication function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
