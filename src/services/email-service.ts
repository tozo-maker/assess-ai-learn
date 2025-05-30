
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
      // Validate inputs
      if (!options.recipients || options.recipients.length === 0) {
        throw new Error('No recipients specified');
      }

      if (!options.subject?.trim()) {
        throw new Error('Subject is required');
      }

      // Filter out invalid email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validRecipients = options.recipients.filter(email => 
        email && emailRegex.test(email.trim())
      );

      if (validRecipients.length === 0) {
        throw new Error('No valid email addresses provided');
      }

      console.log(`Sending email to ${validRecipients.length} recipients:`, validRecipients);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          ...options,
          recipients: validRecipients
        }
      });

      if (error) {
        console.error('Email service error:', error);
        throw new Error(`Email service error: ${error.message}`);
      }

      console.log('Email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendCommunicationEmail(communicationId: string) {
    try {
      if (!communicationId) {
        throw new Error('Communication ID is required');
      }

      console.log(`Sending communication email for ID: ${communicationId}`);

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          communication_id: communicationId
        }
      });

      if (error) {
        console.error('Communication email error:', error);
        throw new Error(`Communication email error: ${error.message}`);
      }

      console.log('Communication email sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending communication email:', error);
      throw error;
    }
  },

  async sendBulkEmails(options: BulkEmailOptions) {
    try {
      // Validate inputs
      if (!options.student_ids || options.student_ids.length === 0) {
        throw new Error('No student IDs provided');
      }

      if (!options.subject?.trim()) {
        throw new Error('Subject is required');
      }

      console.log(`Preparing bulk email for ${options.student_ids.length} students`);

      // Get parent emails for selected students
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name, id')
        .in('id', options.student_ids)
        .not('parent_email', 'is', null);

      if (studentsError) {
        console.error('Error fetching students for bulk email:', studentsError);
        throw new Error(`Failed to fetch student data: ${studentsError.message}`);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validStudents = students?.filter(student => 
        student.parent_email && emailRegex.test(student.parent_email.trim())
      ) || [];

      if (validStudents.length === 0) {
        throw new Error('No valid parent email addresses found for selected students');
      }

      console.log(`Found ${validStudents.length} valid parent emails out of ${students?.length || 0} students`);

      const recipients = validStudents.map(student => student.parent_email as string);

      const emailData = {
        recipients,
        subject: options.subject,
        template_type: options.template_type,
        template_data: {
          ...options.template_data,
          students: validStudents
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
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      if (!achievement?.trim()) {
        throw new Error('Achievement description is required');
      }

      console.log(`Sending achievement notification for student: ${studentId}`);

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Error fetching student for achievement notification:', studentError);
        throw new Error(`Student not found: ${studentError.message}`);
      }

      if (!student?.parent_email) {
        throw new Error('Parent email is not available for this student');
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
      if (!studentId) {
        throw new Error('Student ID is required');
      }

      if (!concern?.trim()) {
        throw new Error('Concern description is required');
      }

      console.log(`Sending concern alert for student: ${studentId}`);

      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('parent_email, first_name, last_name')
        .eq('id', studentId)
        .single();

      if (studentError) {
        console.error('Error fetching student for concern alert:', studentError);
        throw new Error(`Student not found: ${studentError.message}`);
      }

      if (!student?.parent_email) {
        throw new Error('Parent email is not available for this student');
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
  },

  async testEmailDelivery() {
    try {
      console.log('Testing email delivery system...');
      
      // Test with a safe test email
      const testResult = await this.sendEmail({
        recipients: ['test@resend.dev'], // Resend's test email
        subject: 'LearnSpark AI - Email System Test',
        template_type: 'custom',
        template_data: {
          content: '<p>This is a test email to verify the email delivery system is working correctly.</p>',
          custom_content: 'This is a test email to verify the email delivery system is working correctly.'
        }
      });

      console.log('Email test completed:', testResult);
      return testResult;
    } catch (error) {
      console.error('Email delivery test failed:', error);
      throw error;
    }
  }
};
