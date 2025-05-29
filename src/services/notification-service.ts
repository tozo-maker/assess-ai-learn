
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  teacher_id: string;
  student_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateNotificationData {
  student_id?: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

class NotificationService {
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: result, error } = await supabase
      .from('notifications')
      .insert({
        ...data,
        teacher_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getNotifications(limit: number = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
