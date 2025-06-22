
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface EmailRequest {
  recipients: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
  template_data: Record<string, any>;
  sender_name?: string;
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
