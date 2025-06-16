
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Calendar, Plus, Edit, Trash } from 'lucide-react';
import { GoalMilestone } from '@/types/goals';
import { format } from 'date-fns';
import MilestoneForm from './MilestoneForm';

interface MilestonesListProps {
  milestones: GoalMilestone[];
  onAddMilestone: (milestone: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at' | 'completed_at'>) => void;
  onEditMilestone: (milestoneId: string, updates: Partial<GoalMilestone>) => void;
  onDeleteMilestone: (milestoneId: string) => void;
  onToggleComplete: (milestoneId: string, completed: boolean) => void;
  isLoading?: boolean;
}

const MilestonesList: React.FC<MilestonesListProps> = ({
  milestones,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onToggleComplete,
  isLoading
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);

  const completedCount = milestones.filter(m => m.completed_at).length;
  const progressPercentage = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  const handleAddMilestone = (data: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at' | 'completed_at'>) => {
    onAddMilestone(data);
    setIsDialogOpen(false);
  };

  const handleEditMilestone = (data: Omit<GoalMilestone, 'id' | 'goal_id' | 'created_at' | 'completed_at'>) => {
    if (editingMilestone) {
      onEditMilestone(editingMilestone.id, data);
      setEditingMilestone(null);
      setIsDialogOpen(false);
    }
  };

  const openEditDialog = (milestone: GoalMilestone) => {
    setEditingMilestone(milestone);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMilestone(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Milestones</h4>
          <p className="text-xs text-gray-600">
            {completedCount} of {milestones.length} completed ({Math.round(progressPercentage)}%)
          </p>
        </div>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" />
          Add Milestone
        </Button>
      </div>

      {milestones.length > 0 ? (
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => onToggleComplete(milestone.id, !milestone.completed_at)}
                  >
                    <CheckCircle 
                      className={`h-5 w-5 ${
                        milestone.completed_at ? 'text-green-500' : 'text-gray-300'
                      }`} 
                    />
                  </Button>
                  <div className="flex-1">
                    <h5 className={`text-sm font-medium ${
                      milestone.completed_at ? 'line-through text-gray-500' : ''
                    }`}>
                      {milestone.title}
                    </h5>
                    {milestone.description && (
                      <p className={`text-xs text-gray-600 mt-1 ${
                        milestone.completed_at ? 'line-through' : ''
                      }`}>
                        {milestone.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {milestone.target_date && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                        </div>
                      )}
                      {milestone.completed_at && (
                        <Badge variant="secondary" className="text-xs">
                          Completed {format(new Date(milestone.completed_at), 'MMM d')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(milestone)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDeleteMilestone(milestone.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No milestones added yet. Break down this goal into smaller steps.
        </p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
          </DialogHeader>
          <MilestoneForm
            onSubmit={editingMilestone ? handleEditMilestone : handleAddMilestone}
            onCancel={() => setIsDialogOpen(false)}
            initialData={editingMilestone || undefined}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MilestonesList;
