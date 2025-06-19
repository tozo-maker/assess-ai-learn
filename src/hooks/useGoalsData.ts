
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
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage?: number;
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface GoalFilters {
  search: string;
  status: string;
  priority: string;
}

export const useGoalsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<GoalFilters>({
    search: '',
    status: '',
    priority: ''
  });

  // Fetch all goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getGoals()
  });

  // Filter goals based on current filters
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const matchesSearch = !filters.search || 
        goal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (goal.description && goal.description.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = !filters.status || goal.status === filters.status;
      const matchesPriority = !filters.priority || goal.priority === filters.priority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [goals, filters]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>) => {
      return goalService.createGoal(goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Success",
        description: "Goal created successfully"
      });
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
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Success",
        description: "Goal updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update goal"
      });
    }
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: "Success",
        description: "Goal deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete goal"
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
