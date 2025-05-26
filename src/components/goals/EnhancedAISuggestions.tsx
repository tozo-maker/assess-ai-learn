
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Lightbulb, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { goalsService } from '@/services/goals-service';
import AISuggestionCard, { AISuggestion } from './AISuggestionCard';
import { GoalFormData } from '@/types/goals';

interface EnhancedAISuggestionsProps {
  studentId: string;
  onGoalCreated: () => void;
}

const EnhancedAISuggestions: React.FC<EnhancedAISuggestionsProps> = ({
  studentId,
  onGoalCreated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Fetch AI suggestions
  const { data: rawSuggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['enhanced-goal-suggestions', studentId],
    queryFn: () => goalsService.generateEnhancedGoalSuggestions(studentId),
    enabled: !!studentId
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: GoalFormData) => goalsService.createGoal(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-goals', studentId] });
      onGoalCreated();
      toast({
        title: 'Goal created successfully',
        description: 'The learning goal has been added from the AI suggestion.'
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

  // Transform raw suggestions into enhanced suggestions
  const enhancedSuggestions: AISuggestion[] = rawSuggestions.map((suggestion: string, index: number) => ({
    id: `suggestion-${index}`,
    title: suggestion,
    description: `AI-generated learning objective based on student performance analysis`,
    category: inferCategory(suggestion),
    difficulty: inferDifficulty(suggestion),
    estimatedWeeks: inferTimeframe(suggestion),
    priority: inferPriority(suggestion),
    reasoning: `This goal was suggested based on analysis of recent assessment performance and identified learning gaps.`,
    suggestedMilestones: generateMilestones(suggestion)
  }));

  // Filter suggestions
  const filteredSuggestions = enhancedSuggestions.filter(suggestion => {
    if (dismissedSuggestions.includes(suggestion.id)) return false;
    if (categoryFilter !== 'all' && suggestion.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && suggestion.difficulty !== difficultyFilter) return false;
    return true;
  });

  const handleAddAsGoal = (suggestion: AISuggestion) => {
    const goalData: GoalFormData = {
      title: suggestion.title,
      description: suggestion.description || '',
      category: suggestion.category,
      priority: suggestion.priority,
      status: 'active',
      progress_percentage: 0,
      // Set target date based on estimated weeks
      target_date: suggestion.estimatedWeeks ? 
        new Date(Date.now() + suggestion.estimatedWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        undefined
    };

    createGoalMutation.mutate(goalData);
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  const handleRefresh = () => {
    setDismissedSuggestions([]);
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating AI suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
            AI-Generated Goal Suggestions
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Reading">Reading</SelectItem>
                <SelectItem value="Math">Math</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Study Skills">Study Skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Suggestions */}
        {filteredSuggestions.length > 0 ? (
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <AISuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onAddAsGoal={handleAddAsGoal}
                onDismiss={handleDismiss}
                isLoading={createGoalMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No AI suggestions available at this time.</p>
            <p className="text-sm mt-1">Add some assessment data to get personalized recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions to infer metadata from suggestion text
function inferCategory(suggestion: string): string {
  const lower = suggestion.toLowerCase();
  if (lower.includes('read') || lower.includes('comprehension') || lower.includes('literature')) return 'Reading';
  if (lower.includes('math') || lower.includes('number') || lower.includes('problem') || lower.includes('calculation')) return 'Math';
  if (lower.includes('writ') || lower.includes('essay') || lower.includes('composition')) return 'Writing';
  if (lower.includes('science') || lower.includes('experiment') || lower.includes('hypothesis')) return 'Science';
  if (lower.includes('study') || lower.includes('organization') || lower.includes('time management')) return 'Study Skills';
  return 'General';
}

function inferDifficulty(suggestion: string): 'Easy' | 'Medium' | 'Hard' {
  const lower = suggestion.toLowerCase();
  if (lower.includes('basic') || lower.includes('fundamental') || lower.includes('simple')) return 'Easy';
  if (lower.includes('advanced') || lower.includes('complex') || lower.includes('challenging')) return 'Hard';
  return 'Medium';
}

function inferTimeframe(suggestion: string): number {
  const lower = suggestion.toLowerCase();
  if (lower.includes('daily') || lower.includes('week')) return 4;
  if (lower.includes('month') || lower.includes('semester')) return 12;
  if (lower.includes('master') || lower.includes('develop')) return 8;
  return 6;
}

function inferPriority(suggestion: string): 'High' | 'Medium' | 'Low' {
  const lower = suggestion.toLowerCase();
  if (lower.includes('critical') || lower.includes('essential') || lower.includes('fundamental')) return 'High';
  if (lower.includes('enhance') || lower.includes('improve') || lower.includes('strengthen')) return 'Medium';
  return 'Low';
}

function generateMilestones(suggestion: string): string[] {
  const lower = suggestion.toLowerCase();
  if (lower.includes('reading')) {
    return [
      'Complete initial reading assessment',
      'Practice reading strategies weekly',
      'Demonstrate improved comprehension in guided reading',
      'Apply reading skills to independent texts'
    ];
  }
  if (lower.includes('math') || lower.includes('problem')) {
    return [
      'Review foundational concepts',
      'Practice problem-solving strategies',
      'Complete practice problems accurately',
      'Apply skills to word problems'
    ];
  }
  if (lower.includes('writ')) {
    return [
      'Plan and organize writing ideas',
      'Complete first draft with feedback',
      'Revise and edit for clarity',
      'Publish final polished piece'
    ];
  }
  return [
    'Establish baseline understanding',
    'Practice core skills regularly',
    'Demonstrate progress in assessments',
    'Apply learning independently'
  ];
}

export default EnhancedAISuggestions;
