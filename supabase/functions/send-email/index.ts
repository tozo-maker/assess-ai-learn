import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  communication_id?: string;
  recipients?: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement' | 'weekly_progress' | 'digest';
  template_data: Record<string, any>;
  sender_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const resend = new Resend(resendApiKey);

    const { 
      communication_id, 
      recipients, 
      subject, 
      template_type, 
      template_data,
      sender_name = 'LearnSpark AI' 
    }: EmailRequest = await req.json();

    // Validate required fields
    if (!subject) {
      throw new Error('Subject is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let emailRecipients: string[] = [];
    let studentData: any = null;

    // If communication_id is provided, fetch communication details
    if (communication_id) {
      const { data: communication, error: commError } = await supabase
        .from('parent_communications')
        .select(`
          *,
          student:student_id(
            first_name,
            last_name,
            parent_email,
            grade_level
          )
        `)
        .eq('id', communication_id)
        .single();

      if (commError || !communication) {
        throw new Error(`Communication not found: ${commError?.message}`);
      }

      const parentEmail = communication.parent_email || communication.student?.parent_email;
      if (!parentEmail) {
        throw new Error('No parent email available for this communication');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        throw new Error('Invalid parent email format');
      }

      emailRecipients = [parentEmail];
      studentData = communication.student;
      template_data.student = studentData;
    } else if (recipients) {
      // Validate all recipient emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = recipients.filter(email => emailRegex.test(email));
      
      if (validEmails.length === 0) {
        throw new Error('No valid email recipients provided');
      }
      
      emailRecipients = validEmails;
    }

    if (emailRecipients.length === 0) {
      throw new Error('No email recipients specified');
    }

    // Generate email content based on template
    const emailContent = generateEmailTemplate(template_type, template_data);

    // Send emails with improved error handling
    const emailResults = [];
    const maxRetries = 2;
    
    for (const recipient of emailRecipients) {
      let attempts = 0;
      let success = false;
      let lastError = null;

      while (attempts < maxRetries && !success) {
        try {
          attempts++;
          
          // Use a verified sending domain or the default Resend testing domain
          const fromEmail = `${sender_name} <onboarding@resend.dev>`;
          
          const emailResponse = await resend.emails.send({
            from: fromEmail,
            to: [recipient],
            subject: subject,
            html: emailContent.html,
            text: emailContent.text,
          });

          if (emailResponse.error) {
            throw new Error(`Resend API error: ${emailResponse.error.message}`);
          }

          emailResults.push({
            recipient,
            success: true,
            message_id: emailResponse.data?.id,
            attempts
          });

          success = true;
          console.log(`Email sent successfully to ${recipient} on attempt ${attempts}:`, emailResponse.data?.id);
          
        } catch (emailError) {
          lastError = emailError;
          console.error(`Failed to send email to ${recipient} on attempt ${attempts}:`, emailError);
          
          if (attempts < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }

      if (!success) {
        emailResults.push({
          recipient,
          success: false,
          error: lastError?.message || 'Unknown error',
          attempts
        });
      }
    }

    // Update communication record if applicable
    if (communication_id) {
      const allSuccessful = emailResults.every(r => r.success);
      const { error: updateError } = await supabase
        .from('parent_communications')
        .update({ 
          sent_at: new Date().toISOString(),
          email_status: allSuccessful ? 'sent' : 'partial_failure'
        })
        .eq('id', communication_id);

      if (updateError) {
        console.error('Error updating communication status:', updateError);
      }
    }

    const successCount = emailResults.filter(r => r.success).length;
    const failCount = emailResults.filter(r => !r.success).length;

    return new Response(JSON.stringify({ 
      success: successCount > 0,
      results: emailResults,
      total_sent: successCount,
      total_failed: failCount,
      summary: `${successCount}/${emailRecipients.length} emails sent successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-email function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailTemplate(template_type: string, data: Record<string, any>) {
  switch (template_type) {
    case 'progress_report':
      return generateProgressReportEmail(data);
    case 'achievement':
      return generateAchievementEmail(data);
    case 'concern_alert':
      return generateConcernAlertEmail(data);
    case 'bulk_announcement':
      return generateBulkAnnouncementEmail(data);
    case 'weekly_progress':
      return generateWeeklyProgressEmail(data);
    case 'digest':
      return generateDigestEmail(data);
    case 'custom':
    default:
      return generateCustomEmail(data);
  }
}

function generateProgressReportEmail(data: any) {
  const student = data.student || {};
  const content = data.content || data.custom_content || '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .student-info { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
        h3 { color: #2563eb; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Progress Report for ${student.first_name || 'Student'} ${student.last_name || ''}</h1>
      </div>
      <div class="content">
        <div class="student-info">
          <h3>Student Information</h3>
          <p><strong>Name:</strong> ${student.first_name || 'N/A'} ${student.last_name || ''}</p>
          <p><strong>Grade:</strong> ${student.grade_level || 'N/A'}</p>
        </div>
        <div>
          ${content}
        </div>
      </div>
      <div class="footer">
        <p>This message was sent from LearnSpark AI. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Progress Report for ${student.first_name || 'Student'} ${student.last_name || ''}
    
    Student: ${student.first_name || 'N/A'} ${student.last_name || ''}
    Grade: ${student.grade_level || 'N/A'}
    
    ${content.replace(/<[^>]*>/g, '')}
    
    This message was sent from LearnSpark AI.
  `;

  return { html, text };
}

function generateAchievementEmail(data: any) {
  const student = data.student || {};
  const achievement = data.achievement || data.custom_content || '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .achievement { background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
        h2 { color: #16a34a; }
        h3 { color: #16a34a; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Great Achievement!</h1>
      </div>
      <div class="content">
        <h2>Congratulations to ${student.first_name || 'your child'}!</h2>
        <div class="achievement">
          <h3>Achievement Details</h3>
          <p>${achievement}</p>
        </div>
        <p>We're excited to share this wonderful news with you. ${student.first_name || 'Your child'} has been working hard and it's paying off!</p>
      </div>
      <div class="footer">
        <p>This message was sent from LearnSpark AI. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Great Achievement!
    
    Congratulations to ${student.first_name || 'your child'}!
    
    Achievement: ${achievement}
    
    We're excited to share this wonderful news with you. ${student.first_name || 'Your child'} has been working hard and it's paying off!
    
    This message was sent from LearnSpark AI.
  `;

  return { html, text };
}

function generateConcernAlertEmail(data: any) {
  const student = data.student || {};
  const concern = data.concern || data.custom_content || '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .concern { background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
        h3 { color: #dc2626; margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Attention Needed: ${student.first_name || 'Student'} ${student.last_name || ''}</h1>
      </div>
      <div class="content">
        <p>Dear Parent/Guardian,</p>
        <p>I wanted to reach out regarding ${student.first_name || 'your child'}'s recent academic progress.</p>
        <div class="concern">
          <h3>Area of Concern</h3>
          <p>${concern}</p>
        </div>
        <p>Please don't hesitate to contact me if you'd like to discuss this further or if you have any questions.</p>
        <p>Best regards,<br>Your Child's Teacher</p>
      </div>
      <div class="footer">
        <p>This message was sent from LearnSpark AI. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Attention Needed: ${student.first_name || 'Student'} ${student.last_name || ''}
    
    Dear Parent/Guardian,
    
    I wanted to reach out regarding ${student.first_name || 'your child'}'s recent academic progress.
    
    Area of Concern: ${concern}
    
    Please don't hesitate to contact me if you'd like to discuss this further or if you have any questions.
    
    Best regards,
    Your Child's Teacher
    
    This message was sent from LearnSpark AI.
  `;

  return { html, text };
}

function generateBulkAnnouncementEmail(data: any) {
  const announcement = data.announcement || data.custom_content || '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .announcement { background-color: #faf5ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Class Announcement</h1>
      </div>
      <div class="content">
        <p>Dear Parents,</p>
        <div class="announcement">
          ${announcement}
        </div>
        <p>Thank you for your continued support!</p>
        <p>Best regards,<br>Your Child's Teacher</p>
      </div>
      <div class="footer">
        <p>This message was sent from LearnSpark AI. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Class Announcement
    
    Dear Parents,
    
    ${announcement.replace(/<[^>]*>/g, '')}
    
    Thank you for your continued support!
    
    Best regards,
    Your Child's Teacher
    
    This message was sent from LearnSpark AI.
  `;

  return { html, text };
}

function generateCustomEmail(data: any) {
  const content = data.content || data.custom_content || data.message || '';
  const student = data.student || {};
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Message from Your Teacher</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>This message was sent from LearnSpark AI. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const text = content.replace(/<[^>]*>/g, '');

  return { html, text };
}

function generateWeeklyProgressEmail(data: any) {
  const student = data.student || {};
  const progress = data.progress || {};
  const recent_assessments = data.recent_assessments || [];
  const improvements = data.improvements || [];
  const concerns = data.concerns || [];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .achievements { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
        .concerns { background-color: #fef2f2; border-left: 4px solid #dc2626; }
        .assessments { background-color: #f8fafc; border-left: 4px solid #3b82f6; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        ul { margin: 10px 0; padding-left: 20px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { margin: 0; font-size: 20px; }
        h3 { margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Weekly Progress Report</h1>
        <h2>${student.first_name || 'Student'} ${student.last_name || ''}</h2>
      </div>
      <div class="content">
        ${improvements.length > 0 ? `
          <div class="section achievements">
            <h3>🎉 Improvements This Week</h3>
            <ul>
              ${improvements.map(improvement => `<li>${improvement}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${recent_assessments.length > 0 ? `
          <div class="section assessments">
            <h3>📊 Recent Assessments</h3>
            ${recent_assessments.map(assessment => `
              <p>• <strong>${assessment.title}:</strong> ${assessment.score}% (${new Date(assessment.date).toLocaleDateString()})</p>
            `).join('')}
          </div>
        ` : ''}
        
        ${concerns.length > 0 ? `
          <div class="section concerns">
            <h3>⚠️ Areas for Attention</h3>
            <ul>
              ${concerns.map(concern => `<li>${concern}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="section">
          <h3>📈 Overall Performance</h3>
          <p><strong>Current Average:</strong> ${progress.average_score || 'N/A'}%</p>
          <p><strong>Assessments Completed:</strong> ${progress.assessment_count || 0}</p>
        </div>
      </div>
      <div class="footer">
        <p>This weekly progress report was sent automatically from LearnSpark AI.</p>
        <p>If you have questions, please contact your teacher directly.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Weekly Progress Report for ${student.first_name || 'Student'} ${student.last_name || ''}
    
    ${improvements.length > 0 ? `Improvements This Week:\n${improvements.map(i => `• ${i}`).join('\n')}\n\n` : ''}
    ${recent_assessments.length > 0 ? `Recent Assessments:\n${recent_assessments.map(a => `• ${a.title}: ${a.score}%`).join('\n')}\n\n` : ''}
    ${concerns.length > 0 ? `Areas for Attention:\n${concerns.map(c => `• ${c}`).join('\n')}\n\n` : ''}
    
    Overall Performance:
    Current Average: ${progress.average_score || 'N/A'}%
    Assessments Completed: ${progress.assessment_count || 0}
    
    This weekly progress report was sent automatically from LearnSpark AI.
  `;

  return { html, text };
}

function generateDigestEmail(data: any) {
  const student = data.student || {};
  const digest = data.digest || {};
  const achievements = digest.achievements || [];
  const concerns = digest.concerns || [];
  const progress = digest.progress || [];
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; max-width: 600px; margin: 0 auto; }
        .section { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .achievements { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
        .concerns { background-color: #fef2f2; border-left: 4px solid #dc2626; }
        .progress { background-color: #f8fafc; border-left: 4px solid #3b82f6; }
        .footer { background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        h1 { margin: 0; font-size: 24px; }
        h2 { margin: 0; font-size: 20px; }
        h3 { margin-top: 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Weekly Digest</h1>
        <h2>${student.first_name || 'Student'} ${student.last_name || ''}</h2>
      </div>
      <div class="content">
        ${achievements.length > 0 ? `
          <div class="section achievements">
            <h3>🎉 Achievements</h3>
            ${achievements.map(achievement => `
              <p><strong>${achievement.title}:</strong> ${achievement.description}</p>
            `).join('')}
          </div>
        ` : ''}
        
        ${progress.length > 0 ? `
          <div class="section progress">
            <h3>📊 Progress Updates</h3>
            ${progress.map(p => `
              <p>Weekly progress summary available</p>
            `).join('')}
          </div>
        ` : ''}
        
        ${concerns.length > 0 ? `
          <div class="section concerns">
            <h3>⚠️ Concerns</h3>
            ${concerns.map(concern => `
              <p><strong>${concern.title}:</strong> ${concern.description}</p>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="footer">
        <p>This digest contains all updates from this week for ${student.first_name || 'your child'}.</p>
        <p>Individual notifications have been combined to reduce email volume.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Weekly Digest for ${student.first_name || 'Student'} ${student.last_name || ''}
    
    ${achievements.length > 0 ? `Achievements:\n${achievements.map(a => `• ${a.title}: ${a.description}`).join('\n')}\n\n` : ''}
    ${progress.length > 0 ? 'Progress Updates:\nWeekly progress summary available\n\n' : ''}
    ${concerns.length > 0 ? `Concerns:\n${concerns.map(c => `• ${c.title}: ${c.description}`).join('\n')}\n\n` : ''}
    
    This digest contains all updates from this week.
  `;

  return { html, text };
}
