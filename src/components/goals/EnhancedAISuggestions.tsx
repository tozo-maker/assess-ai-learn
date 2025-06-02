
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Lightbulb, Filter, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { optimizedAIService } from '@/services/optimized-ai-service';
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
  const [isGenerating, setIsGenerating] = useState(false);

  // Enhanced AI suggestions with context
  const { data: rawSuggestions, isLoading, refetch } = useQuery({
    queryKey: ['enhanced-goal-suggestions', studentId],
    queryFn: () => optimizedAIService.generateContextAwareGoals(studentId),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000 // 2 minutes
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
  // Handle both array response and object response with suggestions property
  const suggestionsList = Array.isArray(rawSuggestions) 
    ? rawSuggestions 
    : rawSuggestions?.suggestions || [];

  const enhancedSuggestions: AISuggestion[] = suggestionsList.map((suggestion: string, index: number) => ({
    id: `suggestion-${index}`,
    title: suggestion,
    description: `AI-generated learning objective based on comprehensive performance analysis`,
    category: inferCategory(suggestion),
    difficulty: inferDifficulty(suggestion),
    estimatedWeeks: inferTimeframe(suggestion),
    priority: inferPriority(suggestion),
    reasoning: `This goal was suggested based on analysis of recent assessment performance, learning patterns, and identified growth opportunities.`,
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
      target_date: suggestion.estimatedWeeks ? 
        new Date(Date.now() + suggestion.estimatedWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        undefined
    };

    createGoalMutation.mutate(goalData);
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(prev => [...prev, suggestionId]);
  };

  const handleRefresh = async () => {
    setIsGenerating(true);
    setDismissedSuggestions([]);
    
    try {
      await refetch();
      toast({
        title: 'Suggestions refreshed',
        description: 'Generated new AI-powered goal suggestions based on latest performance data.'
      });
    } catch (error) {
      toast({
        title: 'Error refreshing suggestions',
        description: 'Unable to generate new suggestions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Use high priority for immediate generation
      const quickSuggestions = await optimizedAIService.generateGoalSuggestions({
        studentId,
        count: 3,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined
      });

      // Update the query cache
      queryClient.setQueryData(['enhanced-goal-suggestions', studentId], quickSuggestions);
      
      toast({
        title: 'Quick suggestions generated',
        description: 'Generated focused suggestions for immediate use.'
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Unable to generate quick suggestions. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isGenerating ? 'Generating enhanced AI suggestions...' : 'Loading AI suggestions...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analyzing performance data and learning patterns
          </p>
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
            Enhanced AI Goal Suggestions
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleQuickGenerate} disabled={isGenerating}>
              <Zap className="h-4 w-4 mr-2" />
              Quick Generate
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isGenerating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Enhanced Filters */}
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
                <SelectItem value="General">General</SelectItem>
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

        {/* AI Performance Indicator */}
        {filteredSuggestions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  AI Analysis Complete
                </span>
              </div>
              <span className="text-xs text-blue-600">
                {filteredSuggestions.length} personalized suggestions
              </span>
            </div>
          </div>
        )}

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
            <p>No AI suggestions available with current filters.</p>
            <p className="text-sm mt-1">Try adjusting filters or refreshing suggestions.</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={() => {
                setCategoryFilter('all');
                setDifficultyFilter('all');
              }}>
                Clear Filters
              </Button>
              <Button onClick={handleRefresh}>
                Generate New Suggestions
              </Button>
            </div>
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
