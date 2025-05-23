
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, Pause, X } from 'lucide-react';
import { GoalWithMilestones } from '@/types/goals';
import { format } from 'date-fns';

interface GoalsListProps {
  goals: GoalWithMilestones[];
  onEditGoal: (goal: GoalWithMilestones) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateProgress: (goalId: string, progress: number) => void;
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

const GoalsList: React.FC<GoalsListProps> = ({ 
  goals, 
  onEditGoal, 
  onDeleteGoal, 
  onUpdateProgress 
}) => {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No goals set yet. Create your first goal to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                {goal.description && (
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                )}
              </div>
              <Badge className={statusColors[goal.status]}>
                {statusIcons[goal.status]}
                <span className="ml-1 capitalize">{goal.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{goal.progress_percentage}%</span>
                </div>
                <Progress value={goal.progress_percentage} className="h-2" />
              </div>

              {goal.target_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Target: {format(new Date(goal.target_date), 'PPP')}
                </div>
              )}

              {goal.milestones && goal.milestones.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Milestones</h4>
                  <div className="space-y-1">
                    {goal.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center text-sm">
                        <CheckCircle 
                          className={`h-4 w-4 mr-2 ${
                            milestone.completed_at ? 'text-green-500' : 'text-gray-300'
                          }`} 
                        />
                        <span className={milestone.completed_at ? 'line-through text-gray-500' : ''}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditGoal(goal)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDeleteGoal(goal.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GoalsList;
