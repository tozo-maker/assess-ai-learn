import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Target } from 'lucide-react';
import { Goal } from '@/types/goals';
import { GoalFilters } from '@/hooks/useGoalsData';
import GoalCard from './GoalCard';
import CreateGoalDialog from './CreateGoalDialog';
import EditGoalDialog from './EditGoalDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goal-service';
import { useToast } from '@/hooks/use-toast';

interface GoalsMainContentProps {
  goals: Goal[];
  students: any[];
}

const GoalsMainContent: React.FC<GoalsMainContentProps> = ({
  goals,
  students
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filters, setFilters] = useState<GoalFilters>({
    search: '',
    status: '',
    student_id: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleFilterChange = (key: keyof GoalFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleStatusChange = (value: string) => {
    const statusValue = value === "all" ? "" : value;
    handleFilterChange('status', statusValue);
  };

  const safeStatusValue = filters.status || "all";

  // Filter goals based on current filters
  const filteredGoals = goals.filter(goal => {
    if (filters.search && !goal.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status && goal.status !== filters.status) return false;
    if (filters.student_id && goal.student_id !== filters.student_id) return false;
    return true;
  });

  // Mutations
  const createGoalMutation = useMutation({
    mutationFn: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => 
      goalService.createGoal(goalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Goal created",
        description: "The learning goal has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      console.error('Create goal error:', error);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => 
      goalService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Goal updated",
        description: "The learning goal has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
      console.error('Update goal error:', error);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Goal deleted",
        description: "The learning goal has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      console.error('Delete goal error:', error);
    },
  });

  // Handlers
  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => {
    createGoalMutation.mutate(goalData);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    updateGoalMutation.mutate({ id, updates });
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(id);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setShowEditDialog(true);
  };

  const handleEditGoalSubmit = (updates: Partial<Goal>) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, updates });
      setShowEditDialog(false);
      setEditingGoal(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Goals</h1>
          <p className="text-gray-600 mt-1">Track and manage student learning objectives</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {goals.filter(g => g.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {goals.filter(g => g.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {goals.length > 0 
                ? Math.round(goals.reduce((acc, g) => acc + g.progress_percentage, 0) / goals.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search goals..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={safeStatusValue} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={handleUpdateGoal}
              onDelete={handleDeleteGoal}
              onEdit={handleEditGoal}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              {goals.length === 0 ? 'No goals created yet' : 'No goals match your filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {goals.length === 0 
                ? 'Create your first learning goal to get started'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {goals.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Goal Dialog */}
      <CreateGoalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateGoal={handleCreateGoal}
      />

      {/* Edit Goal Dialog */}
      <EditGoalDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdateGoal={handleEditGoalSubmit}
        goal={editingGoal}
      />
    </div>
  );
};

export default GoalsMainContent;
