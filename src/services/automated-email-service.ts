
import { supabase } from '@/integrations/supabase/client';
import { emailService } from './email-service';
import { studentService } from './student-service';
import { assessmentService } from './assessment-service';
import { goalsService } from './goals-service';

export interface AutomationSettings {
  weekly_progress: boolean;
  achievement_notifications: boolean;
  concern_alerts: boolean;
  send_day: string; // 'friday', 'monday', etc.
  send_time: string; // '15:00'
  quiet_hours_start: string;
  quiet_hours_end: string;
  digest_mode: boolean;
  teacher_id: string;
}

export interface EmailSchedule {
  id: string;
  teacher_id: string;
  email_type: 'weekly_progress' | 'achievement' | 'concern' | 'digest';
  student_id?: string;
  scheduled_for: string;
  content_data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export const automatedEmailService = {
  async getAutomationSettings(teacherId: string): Promise<AutomationSettings | null> {
    const { data, error } = await supabase
      .from('email_automation_settings')
      .select('*')
      .eq('teacher_id', teacherId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateAutomationSettings(settings: Partial<AutomationSettings> & { teacher_id: string }): Promise<void> {
    const { error } = await supabase
      .from('email_automation_settings')
      .upsert(settings, { onConflict: 'teacher_id' });

    if (error) throw error;
  },

  async scheduleWeeklyProgressEmails(teacherId: string): Promise<void> {
    try {
      const settings = await this.getAutomationSettings(teacherId);
      if (!settings?.weekly_progress) return;

      const students = await studentService.getStudents();
      const scheduledFor = this.getNextSendDate(settings.send_day, settings.send_time);

      for (const student of students) {
        const progressData = await this.generateProgressSummary(student.id);
        
        const emailData = {
          teacher_id: teacherId,
          email_type: 'weekly_progress' as const,
          student_id: student.id,
          scheduled_for: scheduledFor,
          content_data: progressData,
          status: 'pending' as const
        };

        await this.scheduleEmail(emailData);
      }
    } catch (error) {
      console.error('Error scheduling weekly progress emails:', error);
      throw error;
    }
  },

  async sendAchievementNotification(studentId: string, achievement: {
    type: 'goal_completion' | 'high_score' | 'skill_mastery';
    title: string;
    description: string;
    score?: number;
    next_steps?: string[];
  }): Promise<void> {
    try {
      const student = await studentService.getStudentById(studentId);
      if (!student?.parent_email) return;

      const settings = await this.getAutomationSettings(student.teacher_id);
      if (!settings?.achievement_notifications) return;

      const emailData = {
        recipients: [student.parent_email],
        subject: `🎉 Great Achievement: ${achievement.title}`,
        template_type: 'achievement' as const,
        template_data: {
          student,
          achievement,
          next_steps: achievement.next_steps || []
        }
      };

      await emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      throw error;
    }
  },

  async sendConcernAlert(studentId: string, concern: {
    type: 'low_performance' | 'missing_assignment' | 'attendance';
    title: string;
    description: string;
    suggested_actions: string[];
    urgency: 'low' | 'medium' | 'high';
  }): Promise<void> {
    try {
      const student = await studentService.getStudentById(studentId);
      if (!student?.parent_email) return;

      const settings = await this.getAutomationSettings(student.teacher_id);
      if (!settings?.concern_alerts) return;

      // Check if this is within quiet hours
      if (this.isQuietHours(settings)) {
        await this.scheduleEmail({
          teacher_id: student.teacher_id,
          email_type: 'concern',
          student_id: studentId,
          scheduled_for: this.getNextSendTime(settings),
          content_data: concern,
          status: 'pending'
        });
        return;
      }

      const emailData = {
        recipients: [student.parent_email],
        subject: `⚠️ ${concern.urgency === 'high' ? 'Urgent: ' : ''}${concern.title}`,
        template_type: 'concern_alert' as const,
        template_data: {
          student,
          concern,
          suggested_actions: concern.suggested_actions
        }
      };

      await emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending concern alert:', error);
      throw error;
    }
  },

  async generateDigestEmails(teacherId: string): Promise<void> {
    try {
      const settings = await this.getAutomationSettings(teacherId);
      if (!settings?.digest_mode) return;

      const pendingEmails = await this.getPendingEmails(teacherId);
      const emailsByStudent = this.groupEmailsByStudent(pendingEmails);

      for (const [studentId, emails] of Object.entries(emailsByStudent)) {
        const student = await studentService.getStudentById(studentId);
        if (!student?.parent_email) continue;

        const digestContent = this.createDigestContent(emails);
        
        const emailData = {
          recipients: [student.parent_email],
          subject: `Weekly Update: ${student.first_name} ${student.last_name}`,
          template_type: 'custom' as const,
          template_data: {
            student,
            digest: digestContent
          }
        };

        await emailService.sendEmail(emailData);
        await this.markEmailsAsSent(emails.map(e => e.id));
      }
    } catch (error) {
      console.error('Error generating digest emails:', error);
      throw error;
    }
  },

  async scheduleEmail(emailData: Omit<EmailSchedule, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('email_schedule')
      .insert(emailData);

    if (error) throw error;
  },

  async getPendingEmails(teacherId: string): Promise<EmailSchedule[]> {
    const { data, error } = await supabase
      .from('email_schedule')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (error) throw error;
    return data || [];
  },

  async markEmailsAsSent(emailIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('email_schedule')
      .update({ status: 'sent' })
      .in('id', emailIds);

    if (error) throw error;
  },

  private async generateProgressSummary(studentId: string) {
    const [assessments, goals, performance] = await Promise.all([
      assessmentService.getStudentResponses('recent', studentId),
      goalsService.getStudentGoals(studentId),
      studentService.getStudentPerformance(studentId)
    ]);

    return {
      recent_assessments: assessments.slice(0, 5),
      goals_progress: goals,
      performance_summary: performance,
      improvements: this.identifyImprovements(assessments),
      concerns: this.identifyConcerns(performance)
    };
  },

  private getNextSendDate(day: string, time: string): string {
    const now = new Date();
    const targetDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day.toLowerCase());
    
    const daysUntilTarget = (targetDay - now.getDay() + 7) % 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + (daysUntilTarget || 7));
    
    const [hours, minutes] = time.split(':');
    targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return targetDate.toISOString();
  },

  private isQuietHours(settings: AutomationSettings): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;
    
    if (quietStart < quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  },

  private getNextSendTime(settings: AutomationSettings): string {
    const now = new Date();
    const [endHour, endMin] = settings.quiet_hours_end.split(':').map(Number);
    
    const nextSend = new Date(now);
    nextSend.setHours(endHour, endMin, 0, 0);
    
    if (nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1);
    }
    
    return nextSend.toISOString();
  },

  private groupEmailsByStudent(emails: EmailSchedule[]): Record<string, EmailSchedule[]> {
    return emails.reduce((acc, email) => {
      if (!email.student_id) return acc;
      if (!acc[email.student_id]) acc[email.student_id] = [];
      acc[email.student_id].push(email);
      return acc;
    }, {} as Record<string, EmailSchedule[]>);
  },

  private createDigestContent(emails: EmailSchedule[]): any {
    return {
      achievements: emails.filter(e => e.email_type === 'achievement').map(e => e.content_data),
      concerns: emails.filter(e => e.email_type === 'concern').map(e => e.content_data),
      progress: emails.filter(e => e.email_type === 'weekly_progress').map(e => e.content_data)
    };
  },

  private identifyImprovements(assessments: any[]): string[] {
    // Logic to identify improvements from recent assessments
    return ['Improved reading comprehension scores', 'Better participation in class'];
  },

  private identifyConcerns(performance: any): string[] {
    // Logic to identify concerns from performance data
    return performance?.needs_attention ? ['Below grade level in math'] : [];
  }
};
