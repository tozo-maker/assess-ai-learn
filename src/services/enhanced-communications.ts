import { supabase } from '@/integrations/supabase/client';
import { performanceMonitor } from '@/utils/performance-monitor';
import { productionLogger } from './production-logger';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'achievement' | 'grade_drop' | 'absence' | 'improvement' | 'schedule';
  conditions: Record<string, unknown>;
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

export interface NotificationPreference {
  id: string;
  teacherId: string;
  type: string;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  channels: string[];
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  quietHours?: { start: string; end: string };
}

class EnhancedCommunicationsService {
  async sendRealTimeNotification(
    teacherId: string,
    studentId: string,
    type: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    return performanceMonitor.measureAsync('send-real-time-notification', async () => {
      // notifications table doesn't exist - log instead
      productionLogger.info('Real-time notification (table not available)', {
        teacherId,
        studentId,
        type,
        message: message.substring(0, 100),
        metadata
      });
    });
  }

  async createEmailAutomation(teacherId: string, automation: Omit<AutomationRule, 'id' | 'lastTriggered'>): Promise<AutomationRule> {
    return performanceMonitor.measureAsync('create-email-automation', async () => {
      // email_automations table doesn't exist - return mock
      const result: AutomationRule = {
        id: crypto.randomUUID(),
        name: automation.name,
        trigger: automation.trigger,
        conditions: automation.conditions,
        templateId: automation.templateId,
        isActive: automation.isActive,
        lastTriggered: new Date().toISOString()
      };

      productionLogger.info('Created email automation (mock)', {
        teacherId,
        automationId: result.id,
        automationName: automation.name
      });

      return result;
    });
  }

  async getEmailAutomations(teacherId: string): Promise<AutomationRule[]> {
    // email_automations table doesn't exist - return empty
    productionLogger.info('Getting email automations (table not available)', { teacherId });
    return [];
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
            content: template.content
          })
          .select()
          .single();

        if (error) throw error;

        const result: EmailTemplate = {
          id: data.id,
          name: data.name,
          type: (data.template_type || 'general') as EmailTemplate['type'],
          subject: data.subject,
          content: data.content || '',
          variables: [],
          isDefault: false
        };

        productionLogger.info('Created email template', {
          teacherId,
          templateId: result.id,
          templateName: template.name
        });

        return result;
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        productionLogger.error('Failed to create email template', err);
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

      return (templates || []).map(t => ({
        id: t.id,
        name: t.name,
        type: (t.template_type || 'general') as EmailTemplate['type'],
        subject: t.subject,
        content: t.content || '',
        variables: [],
        isDefault: false
      }));
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      productionLogger.error('Failed to get email templates', err);
      throw error;
    }
  }

  async initializeRealtimeNotifications(teacherId: string): Promise<void> {
    // notifications table doesn't exist - log only
    productionLogger.info('Realtime notifications not available (table not implemented)', { teacherId });
  }

  private showNotificationToast(notification: { title?: string; message?: string; type?: string }): void {
    const event = new CustomEvent('show-notification', {
      detail: {
        title: notification.title,
        message: notification.message,
        type: notification.type
      }
    });
    window.dispatchEvent(event);
  }

  async getCommunicationAnalytics(teacherId: string): Promise<{
    totalSent: number;
    recentCommunications: unknown[];
    byType: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from('parent_communications')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      return {
        totalSent: data?.length || 0,
        recentCommunications: data?.slice(-5) || [],
        byType: {}
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      productionLogger.error('Failed to get communication analytics', err);
      throw error;
    }
  }

  async getNotificationPreferences(teacherId: string): Promise<NotificationPreference[]> {
    productionLogger.info('Getting notification preferences (not implemented)', { teacherId });
    return [];
  }

  async updateNotificationPreferences(teacherId: string, preferences: NotificationPreference[]): Promise<void> {
    productionLogger.info('Updated notification preferences (not implemented)', { teacherId, count: preferences.length });
  }
}

export const enhancedCommunicationsService = new EnhancedCommunicationsService();
