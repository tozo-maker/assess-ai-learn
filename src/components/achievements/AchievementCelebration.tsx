
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Award, X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  type: 'goal_completion' | 'high_score' | 'skill_mastery' | 'improvement';
  title: string;
  description: string;
  student_name: string;
  score?: number;
  date: string;
}

interface AchievementCelebrationProps {
  achievement: Achievement;
  isVisible: boolean;
  onDismiss: () => void;
  onViewDetails?: () => void;
}

const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  achievement,
  isVisible,
  onDismiss,
  onViewDetails
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible && !showConfetti) {
      setShowConfetti(true);
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#2563eb', '#10b981', '#f59e0b']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#2563eb', '#10b981', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isVisible, showConfetti]);

  const getAchievementIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'goal_completion':
        return <Target className="h-8 w-8 text-green-600" />;
      case 'high_score':
        return <Trophy className="h-8 w-8 text-yellow-600" />;
      case 'skill_mastery':
        return <Award className="h-8 w-8 text-blue-600" />;
      case 'improvement':
        return <Star className="h-8 w-8 text-purple-600" />;
      default:
        return <Sparkles className="h-8 w-8 text-gray-600" />;
    }
  };

  const getAchievementColor = (type: Achievement['type']) => {
    switch (type) {
      case 'goal_completion':
        return 'bg-green-50 border-green-200';
      case 'high_score':
        return 'bg-yellow-50 border-yellow-200';
      case 'skill_mastery':
        return 'bg-blue-50 border-blue-200';
      case 'improvement':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAchievementBadgeColor = (type: Achievement['type']) => {
    switch (type) {
      case 'goal_completion':
        return 'bg-green-100 text-green-800';
      case 'high_score':
        return 'bg-yellow-100 text-yellow-800';
      case 'skill_mastery':
        return 'bg-blue-100 text-blue-800';
      case 'improvement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onDismiss}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Achievement Unlocked!
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Card className={`border-2 ${getAchievementColor(achievement.type)} transition-all duration-300 animate-pulse`}>
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              {getAchievementIcon(achievement.type)}
            </div>
            
            <div>
              <Badge className={`mb-2 ${getAchievementBadgeColor(achievement.type)}`}>
                {achievement.type.replace('_', ' ').toUpperCase()}
              </Badge>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {achievement.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {achievement.description}
              </p>
              <p className="text-lg font-medium text-gray-800">
                🎉 {achievement.student_name}
              </p>
              {achievement.score && (
                <p className="text-sm text-gray-500">
                  Score: {achievement.score}%
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-center pt-4">
              {onViewDetails && (
                <Button variant="outline" onClick={onViewDetails}>
                  View Details
                </Button>
              )}
              <Button onClick={onDismiss}>
                Celebrate! 🎊
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementCelebration;
