
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, CheckCircle, X } from 'lucide-react';
import { GoalAchievement } from '@/types/goals';
import { format } from 'date-fns';

interface GoalAchievementNotificationProps {
  achievement: GoalAchievement;
  onDismiss: (achievementId: string) => void;
  onViewGoal?: (goalId: string) => void;
}

const GoalAchievementNotification: React.FC<GoalAchievementNotificationProps> = ({
  achievement,
  onDismiss,
  onViewGoal
}) => {
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'goal_completed':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'milestone_completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'progress_milestone':
        return <Star className="h-6 w-6 text-blue-500" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
  };

  const getAchievementMessage = (type: string) => {
    switch (type) {
      case 'goal_completed':
        return 'Goal Completed! 🎉';
      case 'milestone_completed':
        return 'Milestone Achieved! ✨';
      case 'progress_milestone':
        return 'Progress Milestone! 📈';
      default:
        return 'Achievement Unlocked!';
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'goal_completed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'milestone_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'progress_milestone':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`border-2 ${getAchievementColor(achievement.achievement_type)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getAchievementIcon(achievement.achievement_type)}
            <div>
              <h4 className="font-semibold text-base">
                {getAchievementMessage(achievement.achievement_type)}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {achievement.achievement_data?.title || 'Learning objective achieved'}
              </p>
              {achievement.achievement_data?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {achievement.achievement_data.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {format(new Date(achievement.created_at), 'MMM d, yyyy')}
                </Badge>
                {achievement.achievement_data?.assessment_score && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {achievement.achievement_data.assessment_score}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {onViewGoal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewGoal(achievement.goal_id)}
              >
                View Goal
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(achievement.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalAchievementNotification;
