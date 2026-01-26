
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  AlertTriangle, 
  Trophy, 
  TrendingUp,
  X,
  CheckCheck,
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'alert' | 'goal_completed' | 'performance_update' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  student_id?: string;
}

// Static notifications for demo purposes
// In production, this would come from a notifications table
const getStaticNotifications = (): Notification[] => [
  {
    id: '1',
    type: 'system',
    title: 'Welcome to LearnSpark AI',
    message: 'Get started by adding students and creating assessments.',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

const NotificationCenter: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(getStaticNotifications());
  const [isLoading] = useState(false);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-warning" />;
      case 'goal_completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'performance_update':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationStyle = (type: string, isRead: boolean) => {
    const baseStyle = isRead ? 'opacity-60' : '';
    
    switch (type) {
      case 'achievement':
        return `${baseStyle} border-l-4 border-warning bg-warning/10`;
      case 'goal_completed':
        return `${baseStyle} border-l-4 border-success bg-success/10`;
      case 'alert':
        return `${baseStyle} border-l-4 border-destructive bg-destructive/10`;
      case 'performance_update':
        return `${baseStyle} border-l-4 border-primary bg-primary/10`;
      default:
        return `${baseStyle} border-l-4 border-muted bg-muted/10`;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isExpanded && (
        <Card className="absolute right-0 top-full mt-2 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                  Loading notifications...
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${getNotificationStyle(notification.type, notification.is_read)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${notification.is_read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-sm">You're all caught up! New notifications will appear here.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationCenter;
