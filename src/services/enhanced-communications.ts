import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from '@/utils/performance-monitor';
import { productionLogger } from './production-logger';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'achievement' | 'grade_drop' | 'absence' | 'improvement' | 'schedule';
  conditions: Record<string, any>;
  templateId: string;
  isActive: boolean;
  lastTriggered?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'progress_report' | 'reminder' | 'achievement' | 'concern' | 'general';
  subject: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

export interface ParentPortalAccess {
  studentId: string;
  accessCode: string;
  expiresAt: string;
  permissions: string[];
}

class EnhancedCommunicationsService {
  async sendRealTimeNotification(
    teacherId: string,
    studentId: string,
    type: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return performanceMonitor.measureAsync('send-real-time-notification', async () => {
      try {
        const { error } = await supabase
          .from('notifications')
          .insert({
            teacher_id: teacherId,
            student_id: studentId,
            type,
            title: type.replace('_', ' ').toUpperCase(),
            message,
            metadata: metadata || {},
            is_read: false
          });

        if (error) throw error;

        productionLogger.info('Sent real-time notification', {
          teacherId,
          studentId,
          type,
          messageLength: message.length
        });
      } catch (error: any) {
        productionLogger.error('Failed to send real-time notification', {
          error: error.message
        });
        throw error;
      }
    });
  }

  async createEmailAutomation(teacherId: string, automation: Omit<AutomationRule, 'id' | 'lastTriggered'>): Promise<AutomationRule> {
    return performanceMonitor.measureAsync('create-email-automation', async () => {
      try {
        const { data, error } = await supabase
          .from('email_automations')
          .insert({
            teacher_id: teacherId,
            name: automation.name,
            trigger_type: automation.trigger,
            trigger_conditions: automation.conditions,
            email_template_id: automation.templateId,
            is_active: automation.isActive
          })
          .select()
          .single();

        if (error) throw error;

        const result: AutomationRule = {
          id: data.id,
          name: data.name,
          trigger: data.trigger_type as AutomationRule['trigger'],
          conditions: (data.trigger_conditions as Record<string, any>) || {},
          templateId: data.email_template_id || '',
          isActive: data.is_active || false,
          lastTriggered: data.updated_at
        };

        productionLogger.info('Created email automation', {
          teacherId,
          automationId: result.id,
          automationName: automation.name
        });

        return result;
      } catch (error: any) {
        productionLogger.error('Failed to create email automation', {
          error: error.message
        });
        throw error;
      }
    });
  }

  async getEmailAutomations(teacherId: string): Promise<AutomationRule[]> {
    try {
      const { data: automations, error } = await supabase
        .from('email_automations')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      return automations.map(a => ({
        id: a.id,
        name: a.name,
        trigger: a.trigger_type as AutomationRule['trigger'],
        conditions: (a.trigger_conditions as Record<string, any>) || {},
        templateId: a.email_template_id || '',
        isActive: a.is_active || false,
        lastTriggered: a.updated_at
      }));
    } catch (error: any) {
      productionLogger.error('Failed to get email automations', {
        error: error.message
      });
      throw error;
    }
  }

  async createEmailTemplate(teacherId: string, template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    return performanceMonitor.measureAsync('create-email-template', async () => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .insert({
            teacher_id: teacherId,
            name: template.name,
            template_type: template.type,
            subject: template.subject,
            content: template.content,
            variables: template.variables,
            is_default: template.isDefault
          })
          .select()
          .single();

        if (error) throw error;

        const result: EmailTemplate = {
          id: data.id,
          name: data.name,
          type: data.template_type as EmailTemplate['type'],
          subject: data.subject,
          content: data.content,
          variables: Array.isArray(data.variables) ? (data.variables as string[]) : [],
          isDefault: data.is_default || false
        };

        productionLogger.info('Created email template', {
          teacherId,
          templateId: result.id,
          templateName: template.name
        });

        return result;
      } catch (error: any) {
        productionLogger.error('Failed to create email template', {
          error: error.message
        });
        throw error;
      }
    });
  }

  async getEmailTemplates(teacherId: string): Promise<EmailTemplate[]> {
    try {
      const { data: templates, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      return templates.map(t => ({
        id: t.id,
        name: t.name,
        type: t.template_type as EmailTemplate['type'],
        subject: t.subject,
        content: t.content,
        variables: Array.isArray(t.variables) ? (t.variables as string[]) : [],
        isDefault: t.is_default || false
      }));
    } catch (error: any) {
      productionLogger.error('Failed to get email templates', {
        error: error.message
      });
      throw error;
    }
  }

  async initializeRealtimeNotifications(teacherId: string): Promise<void> {
    // Initialize real-time subscription for notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `teacher_id=eq.${teacherId}`
        },
        (payload) => {
          // Handle real-time notification
          const notification = payload.new;
          this.showNotificationToast(notification);
        }
      )
      .subscribe();

    productionLogger.info('Initialized real-time notifications', { teacherId });
  }

  private showNotificationToast(notification: any): void {
    // Show toast notification in UI
    const event = new CustomEvent('show-notification', {
      detail: {
        title: notification.title,
        message: notification.message,
        type: notification.type
      }
    });
    window.dispatchEvent(event);
  }
}

export const enhancedCommunicationsService = new EnhancedCommunicationsService();