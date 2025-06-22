
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InsightSelection from './forms/InsightSelection';
import GoalCreationForm from './forms/GoalCreationForm';

interface Insight {
  id: string;
  student_id: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  overall_summary: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface InsightToActionConverterProps {
  insights: Insight[];
  students: Student[];
  onGoalCreated?: (goalId: string) => void;
}

const InsightToActionConverter: React.FC<InsightToActionConverterProps> = ({
  insights,
  students,
  onGoalCreated
}) => {
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set());
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleInsightSelection = (insightId: string, checked: boolean) => {
    const newSelected = new Set(selectedInsights);
    if (checked) {
      newSelected.add(insightId);
    } else {
      newSelected.delete(insightId);
    }
    setSelectedInsights(newSelected);
    
    // Auto-generate goal content based on selected insights
    if (newSelected.size > 0) {
      const selectedInsightObjects = insights.filter(i => newSelected.has(i.id));
      const allGrowthAreas = selectedInsightObjects.flatMap(i => i.growth_areas);
      const allRecommendations = selectedInsightObjects.flatMap(i => i.recommendations);
      
      if (!goalTitle) {
        setGoalTitle(`Improve ${allGrowthAreas[0] || 'Performance'}`);
      }
      
      if (!goalDescription) {
        const description = `Based on assessment insights:\n\nFocus Areas:\n${allGrowthAreas.slice(0, 3).map(area => `• ${area}`).join('\n')}\n\nRecommended Actions:\n${allRecommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}`;
        setGoalDescription(description);
      }
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Goal Title Required",
        description: "Please enter a title for the learning goal."
      });
      return;
    }

    if (selectedInsights.size === 0) {
      toast({
        variant: "destructive",
        title: "Select Insights",
        description: "Please select at least one insight to base the goal on."
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get current user for teacher_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create goals for each student associated with selected insights
      const selectedInsightObjects = insights.filter(i => selectedInsights.has(i.id));
      const studentIds = [...new Set(selectedInsightObjects.map(i => i.student_id))];

      const goalPromises = studentIds.map(studentId => 
        supabase.from('goals').insert({
          student_id: studentId,
          teacher_id: user.id,
          title: goalTitle,
          description: goalDescription,
          target_date: targetDate || null,
          status: 'active',
          progress_percentage: 0
        }).select().single()
      );

      const results = await Promise.all(goalPromises);
      const successfulGoals = results.filter(r => !r.error);

      if (successfulGoals.length > 0) {
        toast({
          title: "Goals Created Successfully",
          description: `Created ${successfulGoals.length} learning goal(s) based on insights.`
        });

        // Call callback with first created goal ID
        if (onGoalCreated && successfulGoals[0]?.data?.id) {
          onGoalCreated(successfulGoals[0].data.id);
        }

        handleClear();
      } else {
        throw new Error('Failed to create any goals');
      }
    } catch (error) {
      console.error('Goal creation error:', error);
      toast({
        variant: "destructive",
        title: "Goal Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create learning goals"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClear = () => {
    setSelectedInsights(new Set());
    setGoalTitle('');
    setGoalDescription('');
    setTargetDate('');
  };

  const selectedInsightObjects = insights.filter(i => selectedInsights.has(i.id));
  const studentCount = [...new Set(selectedInsightObjects.map(i => i.student_id))].length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Convert Insights to Learning Goals
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select insights to automatically create targeted learning goals
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <InsightSelection
              insights={insights}
              students={students}
              selectedInsights={selectedInsights}
              onInsightSelection={handleInsightSelection}
            />

            {selectedInsights.size > 0 && (
              <GoalCreationForm
                goalTitle={goalTitle}
                setGoalTitle={setGoalTitle}
                goalDescription={goalDescription}
                setGoalDescription={setGoalDescription}
                targetDate={targetDate}
                setTargetDate={setTargetDate}
                isCreating={isCreating}
                studentCount={studentCount}
                onCreateGoal={handleCreateGoal}
                onClear={handleClear}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightToActionConverter;
