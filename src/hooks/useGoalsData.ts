
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goal-service';
import { useToast } from '@/hooks/use-toast';

export interface Goal {
  id: string;
  student_id: string;
  teacher_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface GoalFilters {
  search: string;
  status: string;
  student: string;
}

export const useGoalsData = () => {
  const [filters, setFilters] = useState<GoalFilters>({
    search: '',
    status: '',
    student: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalService.getGoals,
  });

  const filteredGoals = useMemo(() => {
    let filtered = goals;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) ||
        (goal.description && goal.description.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    if (filters.student) {
      filtered = filtered.filter(goal => goal.student_id === filters.student);
    }

    return filtered;
  }, [goals, filters]);

  const createGoalMutation = useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Success',
        description: 'Goal created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive'
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) => 
      goalService.updateGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Success',
        description: 'Goal updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update goal',
        variant: 'destructive'
      });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Success',
        description: 'Goal deleted successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      });
    }
  });

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => {
    createGoalMutation.mutate(goalData);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    updateGoalMutation.mutate({ id, updates });
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoalMutation.mutate(id);
  };

  return {
    goals,
    filteredGoals,
    isLoading,
    filters,
    setFilters,
    handleCreateGoal,
    handleUpdateGoal,
    handleDeleteGoal
  };
};
