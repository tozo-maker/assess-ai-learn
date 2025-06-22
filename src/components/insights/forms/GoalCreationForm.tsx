
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar } from 'lucide-react';

interface GoalCreationFormProps {
  goalTitle: string;
  setGoalTitle: (title: string) => void;
  goalDescription: string;
  setGoalDescription: (description: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  isCreating: boolean;
  studentCount: number;
  onCreateGoal: () => void;
  onClear: () => void;
}

const GoalCreationForm: React.FC<GoalCreationFormProps> = ({
  goalTitle,
  setGoalTitle,
  goalDescription,
  setGoalDescription,
  targetDate,
  setTargetDate,
  isCreating,
  studentCount,
  onCreateGoal,
  onClear
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Learning Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goal Title *</label>
            <Input
              placeholder="Enter goal title..."
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Describe the goal and action steps..."
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Target Date
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          
          <Alert>
            <AlertDescription>
              This goal will be created for {studentCount} student(s) based on the selected insights.
            </AlertDescription>
          </Alert>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={onCreateGoal}
              disabled={isCreating || !goalTitle.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Learning Goal'}
            </Button>
            <Button variant="outline" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCreationForm;
