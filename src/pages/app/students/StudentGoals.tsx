import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { CheckCircle, Plus, Lightbulb, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import GoalForm from '@/components/goals/GoalForm';
import EnhancedGoalsList from '@/components/goals/EnhancedGoalsList';
import GoalAnalyticsDashboard from '@/components/goals/GoalAnalyticsDashboard';
import GoalAchievementNotification from '@/components/goals/GoalAchievementNotification';
import GoalCelebration from '@/components/goals/GoalCelebration';
import { goalsService } from '@/services/goals-service';
import { studentService } from '@/services/student-service';
import { GoalFormData, GoalWithMilestones } from '@/types/goals';
import { useGoalAchievements } from '@/hooks/useGoalAchievements';

const StudentGoals = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithMilestones | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [insightGoalData, setInsightGoalData] = useState<string | null>(null);

  // Handle insight data from navigation state
  useEffect(() => {
    if (location.state?.fromInsight && location.state?.insightText) {
      setInsightGoalData(location.state.insightText);
      if (location.state?.autoOpenDialog) {
        setIsGoalDialogOpen(true);
      }
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Use the achievement hook
  const {
    achievements,
    celebratingAchievement,
    handleDismissAchievement,
    handleCelebrate,
    handleCloseCelebration,
    refetchAchievements
  } = useGoalAchievements(id!);

  const { data: student } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id!),
    enabled: !!id
  });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['student-goals', id],
    queryFn: () => goalsService.getStudentGoals(id!),
    enabled: !!id
  });

  const { data: aiSuggestions = [] } = useQuery({
    queryKey: ['goal-suggestions', id],
    queryFn: () => goalsService.generateAIGoalSuggestions(id!),
    enabled: showSuggestions && !!id
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => goalsService.createGoal(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
      setInsightGoalData(null);
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
      setInsightGoalData(null);
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
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
      queryClient.invalidateQueries({ queryKey: ['student-goals', id] });
      refetchAchievements();
    }
  });

  const handleCreateGoal = (data: GoalFormData) => {
    createGoalMutation.mutate(data);
  };

  const handleEditGoal = (goal: GoalWithMilestones) => {
    setEditingGoal(goal);
    setInsightGoalData(null); // Clear insight data when editing existing goal
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

  const handleNewGoal = () => {
    setEditingGoal(null);
    setInsightGoalData(null);
    setIsGoalDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsGoalDialogOpen(false);
    setEditingGoal(null);
    setInsightGoalData(null);
  };

  // Prepare initial data for goal form
  const getInitialGoalData = () => {
    if (editingGoal) {
      return editingGoal;
    }
    
    if (insightGoalData) {
      return {
        title: `Goal based on insight`,
        description: insightGoalData,
        status: 'active' as const,
        progress_percentage: 0
      };
    }

    return undefined;
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <PageShell 
      title={`${student.first_name}'s Learning Goals`}
      description="Track progress toward personalized learning objectives"
      icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
    >
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

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Learning Goals</h2>
            <p className="text-gray-600">
              Set and track personalized learning objectives for {student.first_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              AI Suggestions
            </Button>
            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewGoal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? 'Edit Goal' : insightGoalData ? 'Create Goal from Insight' : 'Create New Goal'}
                  </DialogTitle>
                </DialogHeader>
                <GoalForm
                  onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
                  initialData={getInitialGoalData()}
                  isLoading={createGoalMutation.isPending || updateGoalMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Show insight notification if coming from insights */}
        {insightGoalData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Creating goal from insight</h4>
                <p className="text-sm text-blue-700 mt-1">{insightGoalData}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInsightGoalData(null)}
                  className="mt-2"
                >
                  Clear insight data
                </Button>
              </div>
            </div>
          </div>
        )}

        {showAnalytics && (
          <GoalAnalyticsDashboard goals={goals} />
        )}

        {showSuggestions && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                AI-Generated Goal Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No AI suggestions available yet. Add some assessment data to get personalized recommendations.</p>
              )}
            </CardContent>
          </Card>
        )}

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
      </div>

      {/* Goal Celebration Modal */}
      {celebratingAchievement && (
        <GoalCelebration
          isVisible={!!celebratingAchievement}
          goalTitle={celebratingAchievement.achievement_data?.title || 'Learning Goal'}
          achievementType={celebratingAchievement.achievement_type}
          onClose={handleCloseCelebration}
        />
      )}
    </PageShell>
  );
};

export default StudentGoals;
