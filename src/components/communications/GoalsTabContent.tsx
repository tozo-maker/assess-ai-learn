import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { GoalWithMilestones, GoalFormData } from '@/types/goals';
import { useToast } from '@/hooks/use-toast';
import { goalsService } from '@/services/goals-service';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';
import GoalForm from '@/components/goals/GoalForm';
import EnhancedGoalsList from '@/components/goals/EnhancedGoalsList';
import GoalAnalyticsDashboard from '@/components/goals/GoalAnalyticsDashboard';
import GoalAchievementNotification from '@/components/goals/GoalAchievementNotification';
import GoalCelebration from '@/components/goals/GoalCelebration';
import EnhancedAISuggestions from '@/components/goals/EnhancedAISuggestions';

interface GoalsTabContentProps {
  goals: GoalWithMilestones[];
  studentId: string;
  studentName?: string;
}

const GoalsTabContent: React.FC<GoalsTabContentProps> = ({ goals: initialGoals, studentId, studentName }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithMilestones | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Use the achievement hook
  const {
    achievements,
    celebratingAchievement,
    handleDismissAchievement,
    handleCelebrate,
    handleCloseCelebration,
    refetchAchievements
  } = useGoalAchievements(studentId);

  // Fetch fresh goals data
  const { data: goals = initialGoals, isLoading } = useQuery({
    queryKey: ['student-goals', studentId],
    queryFn: () => goalsService.getStudentGoals(studentId),
    enabled: !!studentId,
    initialData: initialGoals
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => goalsService.createGoal(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
      refetchAchievements();
      toast({
        title: 'Goal created successfully',
        description: 'The learning goal has been added to the student\'s profile.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating goal',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: Partial<GoalFormData> }) =>
      goalsService.updateGoal(goalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
      refetchAchievements();
      toast({
        title: 'Goal updated successfully',
        description: 'The learning goal has been updated.'
      });
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: goalsService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      toast({
        title: 'Goal deleted',
        description: 'The learning goal has been removed.'
      });
    }
  });

  const addMilestoneMutation = useMutation({
    mutationFn: ({ goalId, milestone }: { goalId: string; milestone: any }) =>
      goalsService.addMilestone(goalId, milestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      refetchAchievements();
      toast({
        title: 'Milestone added',
        description: 'A new milestone has been added to the goal.'
      });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, updates }: { milestoneId: string; updates: any }) =>
      goalsService.updateMilestone(milestoneId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      refetchAchievements();
      toast({
        title: 'Milestone updated',
        description: 'The milestone has been updated.'
      });
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: goalsService.deleteMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      toast({
        title: 'Milestone deleted',
        description: 'The milestone has been removed.'
      });
    }
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, completed }: { milestoneId: string; completed: boolean }) =>
      goalsService.toggleMilestoneCompletion(milestoneId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      refetchAchievements();
    }
  });

  const handleCreateGoal = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  const handleEditGoal = (goal: GoalWithMilestones) => {
    setEditingGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const handleUpdateGoal = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ goalId: editingGoal.id, data });
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const handleUpdateProgress = (goalId: string, progress: number) => {
    updateGoalMutation.mutate({ 
      goalId, 
      data: { progress_percentage: progress } 
    });
  };

  const calculateProgress = (goal: GoalWithMilestones) => {
    if (goal.milestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter(m => m.completed_at).length;
      return (completedMilestones / goal.milestones.length) * 100;
    }
    return goal.progress_percentage || 0;
  };

  const handleGoalCreatedFromSuggestion = () => {
    refetchAchievements();
  };

  return (
    <div className="space-y-6">
      {/* Achievement Notifications */}
      {achievements.length > 0 && (
        <div className="space-y-2">
          {achievements.slice(0, 3).map((achievement) => (
            <GoalAchievementNotification
              key={achievement.id}
              achievement={achievement}
              onDismiss={handleDismissAchievement}
              onViewGoal={(goalId) => {
                const goal = goals.find(g => g.id === goalId);
                if (goal) handleEditGoal(goal);
              }}
            />
          ))}
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Learning Goals</h3>
          <p className="text-sm text-gray-600">
            Manage personalized learning objectives for {studentName || 'this student'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingGoal(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                </DialogTitle>
              </DialogHeader>
              <GoalForm
                onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
                initialData={editingGoal || undefined}
                isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <Collapsible open={showAnalytics} onOpenChange={setShowAnalytics}>
          <CollapsibleContent>
            <GoalAnalyticsDashboard goals={goals} />
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Enhanced AI Suggestions */}
      <Collapsible open={showSuggestions} onOpenChange={setShowSuggestions}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto font-normal hover:bg-transparent"
          >
            <span className="text-base font-medium">AI Goal Suggestions</span>
            {showSuggestions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <EnhancedAISuggestions
            studentId={studentId}
            onGoalCreated={handleGoalCreatedFromSuggestion}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Goals List */}
      {goals.length > 0 ? (
        <EnhancedGoalsList
          goals={goals}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onUpdateProgress={handleUpdateProgress}
          onAddMilestone={(goalId, milestone) => addMilestoneMutation.mutate({ goalId, milestone })}
          onEditMilestone={(milestoneId, updates) => updateMilestoneMutation.mutate({ milestoneId, updates })}
          onDeleteMilestone={(milestoneId) => {
            if (confirm('Are you sure you want to delete this milestone?')) {
              deleteMilestoneMutation.mutate(milestoneId);
            }
          }}
          onToggleMilestone={(milestoneId, completed) => toggleMilestoneMutation.mutate({ milestoneId, completed })}
          isLoading={isLoading}
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No learning goals have been set yet.</p>
            <p className="text-sm mt-1">Click "Add Goal" or use AI suggestions to create personalized learning objectives.</p>
          </CardContent>
        </Card>
      )}

      {/* Goal Celebration Modal */}
      {celebratingAchievement && (
        <GoalCelebration
          isVisible={!!celebratingAchievement}
          goalTitle={celebratingAchievement.achievement_data?.title || 'Learning Goal'}
          achievementType={celebratingAchievement.achievement_type}
          onClose={handleCloseCelebration}
        />
      )}
    </div>
  );
};

export default GoalsTabContent;
