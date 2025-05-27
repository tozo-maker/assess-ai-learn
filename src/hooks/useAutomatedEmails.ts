
import { useMutation } from '@tanstack/react-query';
import { automatedEmailService } from '@/services/automated-email-service';
import { useToast } from '@/hooks/use-toast';

export const useAutomatedEmails = () => {
  const { toast } = useToast();

  const achievementNotification = useMutation({
    mutationFn: ({ studentId, achievement }: {
      studentId: string;
      achievement: {
        type: 'goal_completion' | 'high_score' | 'skill_mastery';
        title: string;
        description: string;
        score?: number;
        next_steps?: string[];
      };
    }) => automatedEmailService.sendAchievementNotification(studentId, achievement),
    onSuccess: () => {
      toast({
        title: 'Achievement notification sent',
        description: 'Parent has been notified of the achievement'
      });
    },
    onError: (error) => {
      console.error('Error sending achievement notification:', error);
      toast({
        title: 'Error sending notification',
        description: 'Failed to send achievement notification',
        variant: 'destructive'
      });
    }
  });

  const concernAlert = useMutation({
    mutationFn: ({ studentId, concern }: {
      studentId: string;
      concern: {
        type: 'low_performance' | 'missing_assignment' | 'attendance';
        title: string;
        description: string;
        suggested_actions: string[];
        urgency: 'low' | 'medium' | 'high';
      };
    }) => automatedEmailService.sendConcernAlert(studentId, concern),
    onSuccess: () => {
      toast({
        title: 'Concern alert sent',
        description: 'Parent has been notified of the concern'
      });
    },
    onError: (error) => {
      console.error('Error sending concern alert:', error);
      toast({
        title: 'Error sending alert',
        description: 'Failed to send concern alert',
        variant: 'destructive'
      });
    }
  });

  const scheduleWeeklyEmails = useMutation({
    mutationFn: (teacherId: string) => 
      automatedEmailService.scheduleWeeklyProgressEmails(teacherId),
    onSuccess: () => {
      toast({
        title: 'Weekly emails scheduled',
        description: 'Progress emails have been scheduled for all students'
      });
    },
    onError: (error) => {
      console.error('Error scheduling weekly emails:', error);
      toast({
        title: 'Error scheduling emails',
        description: 'Failed to schedule weekly progress emails',
        variant: 'destructive'
      });
    }
  });

  return {
    sendAchievementNotification: achievementNotification.mutate,
    sendConcernAlert: concernAlert.mutate,
    scheduleWeeklyEmails: scheduleWeeklyEmails.mutate,
    isLoading: achievementNotification.isPending || concernAlert.isPending || scheduleWeeklyEmails.isPending
  };
};
