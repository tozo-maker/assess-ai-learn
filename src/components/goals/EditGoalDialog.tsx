import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/services/student-service';
import { Goal } from '@/types/goals';

interface EditGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateGoal: (goalData: Partial<Goal>) => void;
  goal: Goal | null;
}

const EditGoalDialog: React.FC<EditGoalDialogProps> = ({
  open,
  onOpenChange,
  onUpdateGoal,
  goal
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    student_id: '',
    target_date: '',
    status: 'active' as Goal['status'],
    progress_percentage: 0
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Update form data when goal changes
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        student_id: goal.student_id || '',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        status: goal.status || 'active',
        progress_percentage: goal.progress_percentage || 0
      });
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.student_id) return;

    onUpdateGoal(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form data to goal's original values
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        student_id: goal.student_id || '',
        target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
        status: goal.status || 'active',
        progress_percentage: goal.progress_percentage || 0
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Learning Goal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter goal title"
              required
            />
          </div>

          <div>
            <Label htmlFor="student">Student</Label>
            <Select 
              value={formData.student_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the learning goal"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="target_date">Target Date (Optional)</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Goal['status']) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress_percentage}
              onChange={(e) => setFormData(prev => ({ ...prev, progress_percentage: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.student_id}>
              Update Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalDialog;