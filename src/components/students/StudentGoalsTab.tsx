
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { goalService } from '@/services/goal-service';
import { Goal } from '@/types/goals';
import { Target, Plus, Calendar, Flag, CheckCircle } from 'lucide-react';

interface StudentGoalsTabProps {
  studentId: string;
}

const StudentGoalsTab: React.FC<StudentGoalsTabProps> = ({ studentId }) => {
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: () => goalService.getGoalsByStudentId(studentId)
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => {
      return goalService.createGoal({
        ...goalData,
        student_id: studentId,
        progress_percentage: 0,
        status: 'active'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Goal created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      setShowCreateGoal(false);
      setFormData({ title: '', description: '', target_date: '', priority: 'Medium' });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create goal"
      });
    }
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      return goalService.updateGoal(id, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Goal updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update goal"
      });
    }
  });

  const handleCreateGoal = () => {
    if (!formData.title) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a goal title"
      });
      return;
    }

    createGoalMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      target_date: formData.target_date || undefined,
      priority: formData.priority,
      student_id: studentId,
      progress_percentage: 0,
      status: 'active'
    });
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    updateGoalMutation.mutate({
      id: goalId,
      updates: { 
        progress_percentage: progress,
        status: progress >= 100 ? 'completed' : 'active'
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Goal Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Learning Goals
          </h3>
          <p className="text-gray-600">Track progress toward specific learning objectives</p>
        </div>
        
        <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Learning Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter goal title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the learning goal..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'Low' | 'Medium' | 'High') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateGoal}
                  disabled={createGoalMutation.isPending}
                  className="flex-1"
                >
                  {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateGoal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    {goal.description && (
                      <p className="text-gray-600 mt-1">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      {goal.target_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      )}
                      <Badge className={getPriorityColor(goal.priority)} variant="secondary">
                        <Flag className="h-3 w-3 mr-1" />
                        {goal.priority || 'medium'} priority
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(goal.status)} variant="secondary">
                    {goal.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {goal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, Math.min(100, (goal.progress_percentage || 0) + 25))}
                      disabled={goal.status === 'completed' || updateGoalMutation.isPending}
                    >
                      +25% Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProgress(goal.id, 100)}
                      disabled={goal.status === 'completed' || updateGoalMutation.isPending}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Learning Goals</h3>
            <p className="text-gray-600 mb-4">
              No learning goals have been set for this student yet.
            </p>
            <Button onClick={() => setShowCreateGoal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  function handleUpdateProgress(goalId: string, progress: number) {
    updateGoalMutation.mutate({
      id: goalId,
      updates: { 
        progress_percentage: progress,
        status: progress >= 100 ? 'completed' : 'active'
      }
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getPriorityColor(priority?: string) {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
};

export default StudentGoalsTab;
