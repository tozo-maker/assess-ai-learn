
import { supabase } from '@/integrations/supabase/client';

export interface EmailRequest {
  recipients: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
  template_data: Record<string, any>;
  sender_name?: string;
}

export interface EmailOptions {
  recipients: string[];
  subject: string;
  content: string;
  template_type?: string;
}

export interface BulkEmailOptions {
  student_ids: string[];
  subject: string;
  template_type: string;
  template_data: Record<string, any>;
}

export const emailService = {
  async sendEmail(emailData: EmailRequest) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async sendBulkEmails(bulkData: BulkEmailOptions) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        ...bulkData,
        recipients: [], // Will be populated by the edge function based on student_ids
        bulk_mode: true
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      total_sent: data?.success_count || 0,
      total_failed: data?.error_count || 0,
      ...data
    };
  },

  async testEmailDelivery() {
    // Test email functionality
    return await this.sendEmail({
      recipients: ['test@example.com'],
      subject: 'Test Email',
      template_type: 'custom',
      template_data: {
        content: 'This is a test email from LearnSpark AI'
      }
    });
  }
};
