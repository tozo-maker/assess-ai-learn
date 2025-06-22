
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const resend = new Resend(resendApiKey);
    const emailRequest: EmailRequest = await req.json();
    
    console.log('Processing email request:', {
      recipients: emailRequest.recipients?.length,
      subject: emailRequest.subject,
      template_type: emailRequest.template_type
    });

    // Validate inputs
    if (!emailRequest.recipients || emailRequest.recipients.length === 0) {
      throw new Error('No recipients specified');
    }

    if (!emailRequest.subject?.trim()) {
      throw new Error('Subject is required');
    }

    // Filter valid email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = emailRequest.recipients.filter(email => 
      email && emailRegex.test(email.trim())
    );

    if (validRecipients.length === 0) {
      throw new Error('No valid email addresses provided');
    }

    // Generate email content based on template
    const emailContent = generateEmailContent(emailRequest.template_type, emailRequest.template_data);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${emailRequest.sender_name || 'LearnSpark AI'} <noreply@learnspark.dev>`,
      to: validRecipients,
      subject: emailRequest.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('Email sent successfully:', emailResponse);

    // Update communication record if provided
    if (emailRequest.communication_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from('parent_communications')
        .update({ 
          sent_at: new Date().toISOString(),
          email_status: 'sent'
        })
        .eq('id', emailRequest.communication_id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: emailResponse.data?.id,
      recipients_count: validRecipients.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
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
      return generateCustomEmail(templateData);
    default:
      return generateCustomEmail(templateData);
  }
}

function generateProgressReportEmail(data: any): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Progress Report for ${data.student?.first_name} ${data.student?.last_name}</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Performance Summary</h3>
        <p><strong>Average Score:</strong> ${data.performance?.average_score || 'N/A'}%</p>
        <p><strong>Assessments Completed:</strong> ${data.performance?.assessment_count || 0}</p>
        <p><strong>Performance Level:</strong> ${data.performance?.performance_level || 'No data'}</p>
      </div>

      ${data.recent_assessments?.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3>Recent Assessments</h3>
          <ul>
            ${data.recent_assessments.map((assessment: any) => `
              <li>${assessment.title}: ${assessment.score}% (${assessment.date})</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      ${data.ai_insights ? `
        <div style="margin: 20px 0;">
          <h3>Key Insights</h3>
          ${data.ai_insights.strengths?.length > 0 ? `
            <div style="margin: 10px 0;">
              <strong style="color: #059669;">Strengths:</strong>
              <ul>
                ${data.ai_insights.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          ${data.ai_insights.growth_areas?.length > 0 ? `
            <div style="margin: 10px 0;">
              <strong style="color: #dc2626;">Areas for Growth:</strong>
              <ul>
                ${data.ai_insights.growth_areas.map((area: string) => `<li>${area}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        Generated by LearnSpark AI on ${new Date().toLocaleDateString()}
      </div>
    </div>
  `;

  const text = `Progress Report for ${data.student?.first_name} ${data.student?.last_name}

Performance Summary:
- Average Score: ${data.performance?.average_score || 'N/A'}%
- Assessments Completed: ${data.performance?.assessment_count || 0}
- Performance Level: ${data.performance?.performance_level || 'No data'}

Generated by LearnSpark AI on ${new Date().toLocaleDateString()}
  `;

  return { html, text };
}

function generateAchievementEmail(data: any): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">🎉 Great Achievement!</h2>
      
      <p>We're excited to share that <strong>${data.student?.first_name} ${data.student?.last_name}</strong> has achieved something wonderful!</p>
      
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
        <h3>${data.achievement?.title}</h3>
        <p>${data.achievement?.description}</p>
        ${data.achievement?.score ? `<p><strong>Score:</strong> ${data.achievement.score}%</p>` : ''}
      </div>

      ${data.next_steps?.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            ${data.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <p style="margin-top: 30px;">Keep up the great work!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        LearnSpark AI - Educational Analytics Platform
      </div>
    </div>
  `;

  const text = `Great Achievement!

${data.student?.first_name} ${data.student?.last_name} has achieved: ${data.achievement?.title}

${data.achievement?.description}

Keep up the great work!
  `;

  return { html, text };
}

function generateConcernAlertEmail(data: any): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⚠️ Attention Needed</h2>
      
      <p>We wanted to reach out regarding <strong>${data.student?.first_name} ${data.student?.last_name}</strong>.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
        <h3>${data.concern?.title}</h3>
        <p>${data.concern?.description}</p>
        <p><strong>Urgency Level:</strong> ${data.concern?.urgency}</p>
      </div>

      ${data.suggested_actions?.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3>Suggested Actions:</h3>
          <ul>
            ${data.suggested_actions.map((action: string) => `<li>${action}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <p style="margin-top: 30px;">Please don't hesitate to reach out if you'd like to discuss this further.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        LearnSpark AI - Educational Analytics Platform
      </div>
    </div>
  `;

  const text = `Attention Needed: ${data.student?.first_name} ${data.student?.last_name}

${data.concern?.title}
${data.concern?.description}

Urgency Level: ${data.concern?.urgency}

Please reach out if you'd like to discuss this further.
  `;

  return { html, text };
}

function generateBulkAnnouncementEmail(data: any): { html: string; text: string } {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${data.title}</h2>
      
      <div style="margin: 20px 0;">
        ${data.content}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        LearnSpark AI - Educational Analytics Platform
      </div>
    </div>
  `;

  const text = `${data.title}

${data.content}
  `;

  return { html, text };
}

function generateCustomEmail(data: any): { html: string; text: string } {
  const html = data.content || data.custom_content || 'No content provided';
  const text = data.custom_content || data.content || 'No content provided';
  
  return { html, text };
}
