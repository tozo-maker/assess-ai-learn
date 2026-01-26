import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  recipients: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
  template_data: Record<string, any>;
  sender_name?: string;
  communication_id?: string;
}

serve(async (req) => {
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
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);
    const emailRequest: EmailRequest = await req.json();
    
    // Validate inputs
    if (!emailRequest.recipients || emailRequest.recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No recipients specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!emailRequest.subject?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subject is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter valid email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = emailRequest.recipients.filter(email => 
      email && emailRegex.test(email.trim())
    );

    if (validRecipients.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No valid email addresses provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email content
    const emailContent = generateEmailContent(emailRequest.template_type, emailRequest.template_data);
    
    // Send email
    const emailResponse = await resend.emails.send({
      from: `${emailRequest.sender_name || 'LearnSpark AI'} <noreply@learnspark.dev>`,
      to: validRecipients,
      subject: emailRequest.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('Email sent successfully');

    // Update communication record if provided - use service role with teacher_id filter
    if (emailRequest.communication_id) {
      const supabaseService = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

      await supabaseService
        .from('parent_communications')
        .update({ 
          sent_at: new Date().toISOString(),
          email_status: 'sent'
        })
        .eq('id', emailRequest.communication_id)
        .eq('teacher_id', user.id); // Ensure ownership
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: emailResponse.data?.id,
      recipients_count: validRecipients.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailContent(templateType: string, templateData: any): { html: string; text: string } {
  switch (templateType) {
    case 'progress_report':
      return generateProgressReportEmail(templateData);
    case 'achievement':
      return generateAchievementEmail(templateData);
    case 'concern_alert':
      return generateConcernAlertEmail(templateData);
    case 'bulk_announcement':
      return generateBulkAnnouncementEmail(templateData);
    case 'custom':
    default:
      return generateCustomEmail(templateData);
  }
}

function generateProgressReportEmail(data: any): { html: string; text: string } {
  const studentName = `${data.student?.first_name || ''} ${data.student?.last_name || ''}`.trim() || 'Student';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Progress Report for ${studentName}</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Performance Summary</h3>
        <p><strong>Average Score:</strong> ${data.performance?.average_score || 'N/A'}%</p>
        <p><strong>Assessments Completed:</strong> ${data.performance?.assessment_count || 0}</p>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        Generated by LearnSpark AI on ${new Date().toLocaleDateString()}
      </div>
    </div>
  `;
  const text = `Progress Report for ${studentName}\nAverage Score: ${data.performance?.average_score || 'N/A'}%`;
  return { html, text };
}

function generateAchievementEmail(data: any): { html: string; text: string } {
  const studentName = `${data.student?.first_name || ''} ${data.student?.last_name || ''}`.trim() || 'Student';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🎉 Great Achievement!</h2>
      <p><strong>${studentName}</strong> has achieved something wonderful!</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
        <h3>${data.achievement?.title || 'Achievement'}</h3>
        <p>${data.achievement?.description || ''}</p>
      </div>
    </div>
  `;
  const text = `Great Achievement! ${studentName} has achieved: ${data.achievement?.title || 'Achievement'}`;
  return { html, text };
}

function generateConcernAlertEmail(data: any): { html: string; text: string } {
  const studentName = `${data.student?.first_name || ''} ${data.student?.last_name || ''}`.trim() || 'Student';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Attention Needed</h2>
      <p>We wanted to reach out regarding <strong>${studentName}</strong>.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h3>${data.concern?.title || 'Concern'}</h3>
        <p>${data.concern?.description || ''}</p>
      </div>
    </div>
  `;
  const text = `Attention Needed: ${studentName} - ${data.concern?.title || 'Concern'}`;
  return { html, text };
}

function generateBulkAnnouncementEmail(data: any): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${data.title || 'Announcement'}</h2>
      <div style="margin: 20px 0;">${data.content || ''}</div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        LearnSpark AI - Educational Analytics Platform
      </div>
    </div>
  `;
  const text = `${data.title || 'Announcement'}\n\n${data.content || ''}`;
  return { html, text };
}

function generateCustomEmail(data: any): { html: string; text: string } {
  const html = data.content || data.custom_content || 'No content provided';
  const text = data.custom_content || data.content || 'No content provided';
  return { html, text };
}
