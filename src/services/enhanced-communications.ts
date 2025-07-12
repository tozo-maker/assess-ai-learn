import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from './production-logger';
import { performanceMonitor } from '@/utils/performance-monitor';
import { ParentCommunication, CommunicationFormData } from '@/types/communications';

export interface NotificationPreference {
  id: string;
  teacherId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: string[];
  quietHours: { start: string; end: string };
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

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'grade_drop' | 'achievement' | 'absence' | 'improvement' | 'schedule';
  conditions: Record<string, any>;
  templateId: string;
  isActive: boolean;
  lastTriggered?: string;
}

export interface ParentPortalAccess {
  studentId: string;
  parentEmail: string;
  accessCode: string;
  lastLogin?: string;
  permissions: string[];
}

class EnhancedCommunicationsService {
  // Real-time Notifications
  async initializeRealtimeNotifications(teacherId: string) {
    return performanceMonitor.measureAsync('init-realtime-notifications', async () => {
      try {
        // Subscribe to relevant channels
        const channel = supabase
          .channel(`teacher_notifications_${teacherId}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `teacher_id=eq.${teacherId}`
          }, (payload) => {
            this.handleRealtimeNotification(payload);
          })
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'parent_communications',
            filter: `teacher_id=eq.${teacherId}`
          }, (payload) => {
            this.handleCommunicationUpdate(payload);
          });

        await channel.subscribe();
        
        productionLogger.info('Initialized realtime notifications', { teacherId });
        return channel;
      } catch (error) {
        productionLogger.error('Failed to initialize realtime notifications', { error, teacherId });
        throw error;
      }
    });
  }

  private handleRealtimeNotification(payload: any) {
    const notification = payload.new;
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }

    // Dispatch custom event for UI updates
    const event = new CustomEvent('new-notification', {
      detail: notification
    });
    document.dispatchEvent(event);

    productionLogger.info('Handled realtime notification', {
      notificationId: notification.id,
      type: notification.type
    });
  }

  private handleCommunicationUpdate(payload: any) {
    const communication = payload.new;
    
    // Update UI with communication status
    const event = new CustomEvent('communication-updated', {
      detail: communication
    });
    document.dispatchEvent(event);

    productionLogger.info('Handled communication update', {
      communicationId: communication.id,
      status: communication.email_status
    });
  }

  // Email Automation System
  async createEmailAutomation(teacherId: string, automation: Omit<AutomationRule, 'id'>): Promise<AutomationRule> {
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
          trigger: data.trigger_type,
          conditions: data.trigger_conditions,
          templateId: data.email_template_id,
          isActive: data.is_active,
          lastTriggered: data.last_triggered
        };

        productionLogger.info('Created email automation', {
          teacherId,
          automationId: result.id,
          trigger: result.trigger
        });

        return result;
      } catch (error) {
        productionLogger.error('Failed to create email automation', { error, teacherId });
        throw error;
      }
    });
  }

  async getEmailAutomations(teacherId: string): Promise<AutomationRule[]> {
    try {
      const { data, error } = await supabase
        .from('email_automations')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        trigger: item.trigger_type,
        conditions: item.trigger_conditions,
        templateId: item.email_template_id,
        isActive: item.is_active,
        lastTriggered: item.updated_at
      }));
    } catch (error) {
      productionLogger.error('Failed to get email automations', { error, teacherId });
      throw error;
    }
  }

  async triggerAutomationCheck(teacherId: string, trigger: string, context: any): Promise<void> {
    return performanceMonitor.measureAsync('trigger-automation-check', async () => {
      try {
        const { error } = await supabase.functions.invoke('check-automation-triggers', {
          body: {
            teacherId,
            trigger,
            context
          }
        });

        if (error) throw error;

        productionLogger.info('Triggered automation check', {
          teacherId,
          trigger,
          context
        });
      } catch (error) {
        productionLogger.error('Failed to trigger automation check', { error, teacherId, trigger });
        throw error;
      }
    });
  }

  // Email Templates
  async createEmailTemplate(teacherId: string, template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
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

      return {
        id: data.id,
        name: data.name,
        type: data.template_type,
        subject: data.subject,
        content: data.content,
        variables: data.variables,
        isDefault: data.is_default
      };
    } catch (error) {
      productionLogger.error('Failed to create email template', { error, teacherId });
      throw error;
    }
  }

  async getEmailTemplates(teacherId: string): Promise<EmailTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('teacher_id', teacherId);

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.template_type,
        subject: item.subject,
        content: item.content,
        variables: item.variables,
        isDefault: item.is_default
      }));
    } catch (error) {
      productionLogger.error('Failed to get email templates', { error, teacherId });
      throw error;
    }
  }

  // Parent Portal Features
  async createParentPortalAccess(studentId: string, parentEmail: string): Promise<ParentPortalAccess> {
    return performanceMonitor.measureAsync('create-parent-portal-access', async () => {
      try {
        const accessCode = this.generateAccessCode();
        
        const { error } = await supabase.functions.invoke('create-parent-access', {
          body: {
            studentId,
            parentEmail,
            accessCode
          }
        });

        if (error) throw error;

        const access: ParentPortalAccess = {
          studentId,
          parentEmail,
          accessCode,
          permissions: ['view_progress', 'view_assessments', 'view_goals']
        };

        productionLogger.info('Created parent portal access', {
          studentId,
          parentEmail
        });

        return access;
      } catch (error) {
        productionLogger.error('Failed to create parent portal access', { error, studentId });
        throw error;
      }
    });
  }

  private generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async sendParentInvitation(studentId: string, parentEmail: string): Promise<void> {
    return performanceMonitor.measureAsync('send-parent-invitation', async () => {
      try {
        const access = await this.createParentPortalAccess(studentId, parentEmail);
        
        const { error } = await supabase.functions.invoke('send-parent-invitation', {
          body: {
            studentId,
            parentEmail,
            accessCode: access.accessCode
          }
        });

        if (error) throw error;

        productionLogger.info('Sent parent invitation', {
          studentId,
          parentEmail
        });
      } catch (error) {
        productionLogger.error('Failed to send parent invitation', { error, studentId });
        throw error;
      }
    });
  }

  // Teacher Collaboration
  async shareStudentData(teacherId: string, studentId: string, recipientTeacherId: string, permissions: string[]): Promise<void> {
    return performanceMonitor.measureAsync('share-student-data', async () => {
      try {
        const { error } = await supabase.functions.invoke('share-student-data', {
          body: {
            teacherId,
            studentId,
            recipientTeacherId,
            permissions
          }
        });

        if (error) throw error;

        productionLogger.info('Shared student data', {
          teacherId,
          studentId,
          recipientTeacherId,
          permissions
        });
      } catch (error) {
        productionLogger.error('Failed to share student data', { error, teacherId, studentId });
        throw error;
      }
    });
  }

  async createTeacherNote(teacherId: string, studentId: string, note: string, isPrivate: boolean = false): Promise<void> {
    try {
      const { error } = await supabase
        .from('parent_communications')
        .insert({
          teacher_id: teacherId,
          student_id: studentId,
          communication_type: 'general',
          subject: 'Teacher Note',
          content: note,
          email_status: isPrivate ? 'draft' : 'sent'
        });

      if (error) throw error;

      productionLogger.info('Created teacher note', {
        teacherId,
        studentId,
        isPrivate
      });
    } catch (error) {
      productionLogger.error('Failed to create teacher note', { error, teacherId, studentId });
      throw error;
    }
  }

  // Bulk Communications
  async sendBulkCommunication(
    teacherId: string,
    studentIds: string[],
    template: EmailTemplate,
    customData: Record<string, any> = {}
  ): Promise<{ successful: string[]; failed: string[] }> {
    return performanceMonitor.measureAsync('send-bulk-communication', async () => {
      try {
        const { data, error } = await supabase.functions.invoke('send-bulk-communication', {
          body: {
            teacherId,
            studentIds,
            template,
            customData
          }
        });

        if (error) throw error;

        productionLogger.info('Sent bulk communication', {
          teacherId,
          studentCount: studentIds.length,
          templateId: template.id,
          successful: data.successful.length,
          failed: data.failed.length
        });

        return data;
      } catch (error) {
        productionLogger.error('Failed to send bulk communication', { error, teacherId });
        throw error;
      }
    });
  }

  // Communication Analytics
  async getCommunicationAnalytics(teacherId: string, dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('parent_communications')
        .select('*')
        .eq('teacher_id', teacherId);

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      const analytics = {
        totalCommunications: data.length,
        byType: this.groupByProperty(data, 'communication_type'),
        byStatus: this.groupByProperty(data, 'email_status'),
        responseRate: this.calculateResponseRate(data),
        averageResponseTime: this.calculateAverageResponseTime(data),
        mostActiveParents: this.findMostActiveParents(data),
        communicationTrends: this.calculateCommunicationTrends(data)
      };

      return analytics;
    } catch (error) {
      productionLogger.error('Failed to get communication analytics', { error, teacherId });
      throw error;
    }
  }

  private groupByProperty(data: any[], property: string): Record<string, number> {
    return data.reduce((acc, item) => {
      const key = item[property] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateResponseRate(data: any[]): number {
    const sent = data.filter(item => item.email_status === 'sent').length;
    const total = data.length;
    return total > 0 ? (sent / total) * 100 : 0;
  }

  private calculateAverageResponseTime(data: any[]): number {
    const responseTimes = data
      .filter(item => item.sent_at && item.created_at)
      .map(item => {
        const created = new Date(item.created_at).getTime();
        const sent = new Date(item.sent_at).getTime();
        return sent - created;
      });

    return responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;
  }

  private findMostActiveParents(data: any[]): Array<{ email: string; count: number }> {
    const parentCounts = this.groupByProperty(data, 'parent_email');
    
    return Object.entries(parentCounts)
      .filter(([email]) => email && email !== 'unknown')
      .map(([email, count]) => ({ email, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateCommunicationTrends(data: any[]) {
    const trends = data.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(trends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }

  // Notification Preferences
  async updateNotificationPreferences(teacherId: string, preferences: Partial<NotificationPreference>): Promise<void> {
    try {
      // Store preferences in localStorage for now, could be moved to database
      const existing = this.getNotificationPreferences(teacherId);
      const updated = { ...existing, ...preferences, teacherId };
      
      localStorage.setItem(`notification_prefs_${teacherId}`, JSON.stringify(updated));
      
      productionLogger.info('Updated notification preferences', { teacherId, preferences });
    } catch (error) {
      productionLogger.error('Failed to update notification preferences', { error, teacherId });
      throw error;
    }
  }

  getNotificationPreferences(teacherId: string): NotificationPreference {
    try {
      const saved = localStorage.getItem(`notification_prefs_${teacherId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      productionLogger.error('Failed to get notification preferences', { error, teacherId });
    }

    // Default preferences
    return {
      id: teacherId,
      teacherId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      frequency: 'immediate',
      types: ['achievement', 'concern', 'progress_report'],
      quietHours: { start: '22:00', end: '07:00' }
    };
  }
}

export const enhancedCommunicationsService = new EnhancedCommunicationsService();