
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, Pause, X, Edit, Trash, Plus } from 'lucide-react';
import { GoalWithMilestones } from '@/types/goals';
import { format } from 'date-fns';
import MilestonesList from './MilestonesList';
import ProgressTimeline from './ProgressTimeline';

interface EnhancedGoalsListProps {
  goals: GoalWithMilestones[];
  onEditGoal: (goal: GoalWithMilestones) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateProgress: (goalId: string, progress: number) => void;
  onAddMilestone: (goalId: string, milestone: any) => void;
  onEditMilestone: (milestoneId: string, updates: any) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onToggleMilestone: (milestoneId: string, completed: boolean) => void;
  isLoading?: boolean;
}

const statusIcons = {
  active: <Clock className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  paused: <Pause className="h-4 w-4" />,
  cancelled: <X className="h-4 w-4" />
};

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
};

const EnhancedGoalsList: React.FC<EnhancedGoalsListProps> = ({ 
  goals, 
  onEditGoal, 
  onDeleteGoal, 
  onUpdateProgress,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onToggleMilestone,
  isLoading
}) => {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No goals set yet. Create your first goal to get started!</p>
      </div>
    );
  }

  const calculateGoalProgress = (goal: GoalWithMilestones) => {
    if (goal.milestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(m => m.completed_at).length;
      return (completedMilestones / goal.milestones.length) * 100;
    }
    return goal.progress_percentage || 0;
  };

  return (
    <div className="space-y-6">
      {goals.map((goal) => {
        const calculatedProgress = calculateGoalProgress(goal);
        
        return (
          <Card key={goal.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge className={statusColors[goal.status]}>
                      {statusIcons[goal.status]}
                      <span className="ml-1 capitalize">{goal.status}</span>
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600">{goal.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Section */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span>{Math.round(calculatedProgress)}%</span>
                </div>
                <Progress value={calculatedProgress} className="h-2" />
                {goal.milestones && goal.milestones.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Based on milestone completion
                  </p>
                )}
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {goal.target_date && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Target: {format(new Date(goal.target_date), 'PPP')}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditGoal(goal)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDeleteGoal(goal.id)}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div>
                  <ProgressTimeline goal={goal} />
                </div>
              </div>

              {/* Milestones Management */}
              <div className="border-t pt-4">
                <MilestonesList
                  milestones={goal.milestones || []}
                  onAddMilestone={(milestone) => onAddMilestone(goal.id, milestone)}
                  onEditMilestone={onEditMilestone}
                  onDeleteMilestone={onDeleteMilestone}
                  onToggleComplete={(milestoneId, completed) => {
                    onToggleMilestone(milestoneId, completed);
                    // Recalculate and update goal progress
                    const updatedProgress = calculateGoalProgress({
                      ...goal,
                      milestones: goal.milestones?.map(m => 
                        m.id === milestoneId 
                          ? { ...m, completed_at: completed ? new Date().toISOString() : null }
                          : m
                      )
                    });
                    onUpdateProgress(goal.id, updatedProgress);
                  }}
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnhancedGoalsList;
