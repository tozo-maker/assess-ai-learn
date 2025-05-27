
import { supabase } from '@/integrations/supabase/client';

export interface EmailOptions {
  recipients: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
  template_data: Record<string, any>;
  sender_name?: string;
}

export interface BulkEmailOptions {
  student_ids: string[];
  subject: string;
  template_type: 'progress_report' | 'achievement' | 'concern_alert' | 'custom' | 'bulk_announcement';
  template_data: Record<string, any>;
  sender_name?: string;
}

export const emailService = {
  async sendEmail(options: EmailOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: options
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendCommunicationEmail(communicationId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          communication_id: communicationId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending communication email:', error);
      throw error;
    }
  },

  async sendBulkEmails(options: BulkEmailOptions) {
    try {
      // Get parent emails for selected students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name')
        .in('id', options.student_ids)
        .not('parent_email', 'is', null);

      if (studentsError) throw studentsError;

      const recipients = students
        .filter(student => student.parent_email)
        .map(student => student.parent_email as string);

      if (recipients.length === 0) {
        throw new Error('No valid parent email addresses found for selected students');
      }

      const emailData = {
        recipients,
        subject: options.subject,
        template_type: options.template_type,
        template_data: {
          ...options.template_data,
          students: students
        },
        sender_name: options.sender_name
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      throw error;
    }
  },

  async sendAchievementNotification(studentId: string, achievement: string) {
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name')
        .eq('id', studentId)
        .single();

      if (studentError || !student?.parent_email) {
        throw new Error('Student not found or no parent email available');
      }

      return await this.sendEmail({
        recipients: [student.parent_email],
        subject: `Great Achievement by ${student.first_name}!`,
        template_type: 'achievement',
        template_data: {
          student,
          achievement
        }
      });
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      throw error;
    }
  },

  async sendConcernAlert(studentId: string, concern: string) {
    try {
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name')
        .eq('id', studentId)
        .single();

      if (studentError || !student?.parent_email) {
        throw new Error('Student not found or no parent email available');
      }

      return await this.sendEmail({
        recipients: [student.parent_email],
        subject: `Attention Needed: ${student.first_name} ${student.last_name}`,
        template_type: 'concern_alert',
        template_data: {
          student,
          concern
        }
      });
    } catch (error) {
      console.error('Error sending concern alert:', error);
      throw error;
    }
  }
};
