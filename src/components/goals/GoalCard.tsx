import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Edit, Trash2, User } from 'lucide-react';
import { Goal } from '@/types/goals';

interface GoalCardProps {
  goal: Goal;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate, onDelete, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: Goal['status']) => {
    onUpdate(goal.id, { status: newStatus });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-2">{goal.title}</h3>
          <Badge className={getStatusColor(goal.status)}>
            {goal.status}
          </Badge>
        </div>
        {goal.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-medium">{goal.progress_percentage}%</span>
          </div>
          <Progress value={goal.progress_percentage} className="h-2" />
        </div>

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Target: {new Date(goal.target_date).toLocaleDateString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-2">
            {goal.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('completed')}
                className="text-green-600 hover:text-green-700"
              >
                Mark Complete
              </Button>
            )}
            {goal.status === 'completed' && (
              <Button
                size="sm"  
                variant="outline"
                onClick={() => handleStatusChange('active')}
                className="text-blue-600 hover:text-blue-700"
              >
                Reactivate
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(goal.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
