
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from '@/components/realtime/RealtimeProvider';

interface UnifiedNotification {
  id: string;
  type: 'achievement' | 'system' | 'realtime';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifications: realtimeNotifications, markAsRead: markRealtimeAsRead } = useRealtime();

  // Fetch database notifications
  const { data: dbNotifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark database notification as read
  const markDbAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  });

  // Combine notifications from both sources
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
    ...dbNotifications.map(n => ({
      id: n.id,
      type: n.type as 'achievement' | 'system',
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at),
      read: n.is_read,
      actionUrl: n.action_url,
      metadata: n.metadata as Record<string, any>
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const markAsRead = async (notificationId: string, type: string) => {
    if (type === 'realtime') {
      markRealtimeAsRead(notificationId);
    } else {
      markDbAsReadMutation.mutate(notificationId);
    }
  };

  return {
    notifications: allNotifications,
    unreadCount,
    isLoading,
    markAsRead
  };
};
