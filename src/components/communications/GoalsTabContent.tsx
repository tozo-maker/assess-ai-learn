
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { GoalWithMilestones } from '@/types/goals';
import { format } from 'date-fns';

interface GoalsTabContentProps {
  goals: GoalWithMilestones[];
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
};

const GoalsTabContent: React.FC<GoalsTabContentProps> = ({ goals }) => {
  const calculateProgress = (goal: GoalWithMilestones) => {
    if (goal.milestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(m => m.completed_at).length;
      return (completedMilestones / goal.milestones.length) * 100;
    }
    return goal.progress_percentage || 0;
  };

  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal) => {
          const progress = calculateProgress(goal);
          
          return (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-md flex items-center gap-2">
                      {goal.title}
                      <Badge className={statusColors[goal.status]}>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </Badge>
                    </CardTitle>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-2 space-y-3">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {goal.milestones && goal.milestones.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {goal.milestones.filter(m => m.completed_at).length} of {goal.milestones.length} milestones completed
                    </p>
                  )}
                </div>

                {/* Target Date */}
                {goal.target_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Target: {format(new Date(goal.target_date), 'PPP')}
                  </div>
                )}

                {/* Recent Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recent Milestones</h4>
                    <div className="space-y-1">
                      {goal.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="flex items-center text-sm">
                          <CheckCircle 
                            className={`h-4 w-4 mr-2 ${
                              milestone.completed_at ? 'text-green-500' : 'text-gray-300'
                            }`} 
                          />
                          <span className={milestone.completed_at ? 'line-through text-gray-500' : ''}>
                            {milestone.title}
                          </span>
                          {milestone.completed_at && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              ✓
                            </Badge>
                          )}
                        </div>
                      ))}
                      {goal.milestones.length > 3 && (
                        <p className="text-xs text-gray-500 pl-6">
                          +{goal.milestones.length - 3} more milestones
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No learning goals have been set yet.</p>
            <p className="text-sm mt-1">Visit the Goals page to create personalized learning objectives.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsTabContent;
