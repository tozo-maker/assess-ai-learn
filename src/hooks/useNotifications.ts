
import { useState } from 'react';
import { useRealtime } from '@/components/realtime/RealtimeProvider';

interface UnifiedNotification {
  id: string;
  type: 'achievement' | 'system' | 'realtime';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export const useNotifications = () => {
  const { notifications: realtimeNotifications, markAsRead: markRealtimeAsRead } = useRealtime();

  // Static notifications (since notifications table doesn't exist yet)
  const [localNotifications] = useState<UnifiedNotification[]>([
    {
      id: 'welcome-1',
      type: 'system',
      title: 'Welcome to LearnSpark AI',
      message: 'Get started by adding students and creating assessments.',
      timestamp: new Date(),
      read: false
    }
  ]);

  // Combine notifications from realtime provider and local state
  const allNotifications: UnifiedNotification[] = [
    ...realtimeNotifications.map(n => ({
      id: n.id,
      type: 'realtime' as const,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
      actionUrl: undefined,
      metadata: n.data
    })),
    ...localNotifications
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string, type: string) => {
    if (type === 'realtime') {
      markRealtimeAsRead(notificationId);
    }
    // Local notifications would be handled with local state
  };

  return {
    notifications: allNotifications,
    unreadCount,
    isLoading: false,
    markAsRead
  };
};
