// notifications table doesn't exist in the schema
// This service provides stub implementations

export interface Notification {
  id: string;
  teacher_id: string;
  student_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateNotificationData {
  student_id?: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

class NotificationService {
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    // notifications table doesn't exist - return mock
    console.log('createNotification: table not implemented', data);
    return {
      id: crypto.randomUUID(),
      teacher_id: 'mock-teacher-id',
      student_id: data.student_id,
      type: data.type,
      title: data.title,
      message: data.message,
      is_read: false,
      action_url: data.action_url,
      metadata: data.metadata || {},
      created_at: new Date().toISOString()
    };
  }

  async getNotifications(limit: number = 50): Promise<Notification[]> {
    // notifications table doesn't exist - return empty
    console.log('getNotifications: table not implemented', { limit });
    return [];
  }

  async getUnreadCount(): Promise<number> {
    // notifications table doesn't exist
    return 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    // notifications table doesn't exist
    console.log('markAsRead: table not implemented', notificationId);
  }

  async markAllAsRead(): Promise<void> {
    // notifications table doesn't exist
    console.log('markAllAsRead: table not implemented');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    // notifications table doesn't exist
    console.log('deleteNotification: table not implemented', notificationId);
  }
}

export const notificationService = new NotificationService();
