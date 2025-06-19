
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeNotification {
  id: string;
  type: 'student_added' | 'assessment_completed' | 'goal_achieved' | 'export_ready' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

interface RealtimeContextType {
  notifications: RealtimeNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time updates for various tables
    const channels = [
      // Students updates
      supabase
        .channel('students-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'students'
          },
          (payload) => {
            const newNotification: RealtimeNotification = {
              id: `student-${payload.new.id}-${Date.now()}`,
              type: 'student_added',
              title: 'New Student Added',
              message: `${payload.new.first_name} ${payload.new.last_name} has been added to your class`,
              data: payload.new,
              timestamp: new Date(),
              read: false
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .subscribe(),

      // Assessment responses updates
      supabase
        .channel('assessment-responses-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'student_responses'
          },
          (payload) => {
            const newNotification: RealtimeNotification = {
              id: `assessment-${payload.new.id}-${Date.now()}`,
              type: 'assessment_completed',
              title: 'Assessment Completed',
              message: 'A student has completed an assessment',
              data: payload.new,
              timestamp: new Date(),
              read: false
            };
            
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe(),

      // Goal achievements updates
      supabase
        .channel('goal-achievements-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'goal_achievements'
          },
          (payload) => {
            const newNotification: RealtimeNotification = {
              id: `goal-${payload.new.id}-${Date.now()}`,
              type: 'goal_achieved',
              title: 'Goal Achievement',
              message: 'A student has achieved a learning goal!',
              data: payload.new,
              timestamp: new Date(),
              read: false
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .subscribe(),

      // Export updates
      supabase
        .channel('exports-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'data_exports'
          },
          (payload) => {
            if (payload.new.status === 'completed') {
              const newNotification: RealtimeNotification = {
                id: `export-${payload.new.id}-${Date.now()}`,
                type: 'export_ready',
                title: 'Export Ready',
                message: `Your ${payload.new.export_type.replace(/_/g, ' ')} export is ready for download`,
                data: payload.new,
                timestamp: new Date(),
                read: false
              };
              
              setNotifications(prev => [newNotification, ...prev]);
              
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          }
        )
        .subscribe(),

      // Notification system updates
      supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            const newNotification: RealtimeNotification = {
              id: `notification-${payload.new.id}-${Date.now()}`,
              type: 'system_alert',
              title: payload.new.title,
              message: payload.new.message,
              data: payload.new,
              timestamp: new Date(payload.new.created_at),
              read: false
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            if (payload.new.type === 'urgent' || payload.new.type === 'alert') {
              toast({
                title: newNotification.title,
                description: newNotification.message,
                variant: payload.new.type === 'urgent' ? 'destructive' : 'default'
              });
            }
          }
        )
        .subscribe()
    ];

    // Check connection status
    channels.forEach(channel => {
      channel.on('system', {}, (status) => {
        setIsConnected(status.state === 'joined');
      });
    });

    // Cleanup subscriptions
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [toast]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
