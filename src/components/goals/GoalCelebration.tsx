
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';

interface GoalCelebrationProps {
  isVisible: boolean;
  goalTitle: string;
  achievementType: 'goal_completed' | 'milestone_completed' | 'progress_milestone';
  onClose: () => void;
}

const GoalCelebration: React.FC<GoalCelebrationProps> = ({
  isVisible,
  goalTitle,
  achievementType,
  onClose
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('enter');
      const timer1 = setTimeout(() => setAnimationPhase('celebrate'), 200);
      const timer2 = setTimeout(() => setAnimationPhase('exit'), 3000);
      const timer3 = setTimeout(() => onClose(), 3300);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getCelebrationConfig = () => {
    switch (achievementType) {
      case 'goal_completed':
        return {
          icon: <Trophy className="h-12 w-12 text-yellow-500" />,
          title: '🎉 Goal Completed!',
          message: 'Outstanding achievement!',
          bgColor: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          borderColor: 'border-yellow-300'
        };
      case 'milestone_completed':
        return {
          icon: <Star className="h-12 w-12 text-green-500" />,
          title: '✨ Milestone Achieved!',
          message: 'Great progress!',
          bgColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
          borderColor: 'border-green-300'
        };
      case 'progress_milestone':
        return {
          icon: <Sparkles className="h-12 w-12 text-blue-500" />,
          title: '📈 Progress Made!',
          message: 'Keep up the momentum!',
          bgColor: 'bg-gradient-to-br from-blue-100 to-indigo-100',
          borderColor: 'border-blue-300'
        };
      default:
        return {
          icon: <PartyPopper className="h-12 w-12 text-purple-500" />,
          title: '🎊 Achievement Unlocked!',
          message: 'Well done!',
          bgColor: 'bg-gradient-to-br from-purple-100 to-pink-100',
          borderColor: 'border-purple-300'
        };
    }
  };

  const config = getCelebrationConfig();

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'enter':
        return 'scale-95 opacity-0';
      case 'celebrate':
        return 'scale-100 opacity-100';
      case 'exit':
        return 'scale-95 opacity-80';
      default:
        return 'scale-100 opacity-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative">
        <Card className={`
          ${config.bgColor} ${config.borderColor} border-2 shadow-2xl max-w-md w-full mx-4
          transform-gpu transition-all duration-300 ease-out origin-center ${getAnimationClasses()}
        `}>
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center transform transition-transform duration-500">
              {config.icon}
            </div>
            
            <h2 className="text-2xl font-bold mb-2 transform transition-all duration-300">
              {config.title}
            </h2>
            <p className="text-lg text-gray-700 mb-2">{config.message}</p>
            <p className="text-base font-medium text-gray-800 mb-6">"{goalTitle}"</p>
            
            <div className="flex justify-center space-x-4 mb-4">
              <div className="animate-pulse">🌟</div>
              <div className="animate-pulse delay-100">🎉</div>
              <div className="animate-pulse delay-200">🌟</div>
            </div>
            
            <Button 
              onClick={onClose}
              className="mt-2 transition-all duration-200 hover:scale-105"
              variant="outline"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoalCelebration;
