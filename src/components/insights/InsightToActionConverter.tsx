
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, Plus, Calendar, Lightbulb, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const navigate = useNavigate();

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

        // Reset form
        setSelectedInsights(new Set());
        setGoalTitle('');
        setGoalDescription('');
        setTargetDate('');
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
          <div className="space-y-4">
            {/* Insight Selection */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Available Insights ({insights.length})
              </h3>
              
              {insights.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No insights available. Complete some assessments to generate AI insights.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {insights.map(insight => {
                    const student = students.find(s => s.id === insight.student_id);
                    const isSelected = selectedInsights.has(insight.id);
                    
                    return (
                      <div 
                        key={insight.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleInsightSelection(insight.id, !isSelected)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{insight.overall_summary}</p>
                          </div>
                          {isSelected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                        </div>
                        
                        {insight.growth_areas.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Growth Areas:</p>
                            <div className="flex flex-wrap gap-1">
                              {insight.growth_areas.slice(0, 2).map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Goal Creation Form */}
            {selectedInsights.size > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Learning Goal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Goal Title *</label>
                    <Input
                      placeholder="Enter goal title..."
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      placeholder="Describe the goal and action steps..."
                      value={goalDescription}
                      onChange={(e) => setGoalDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Target Date
                    </label>
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                  
                  <Alert>
                    <AlertDescription>
                      This goal will be created for {[...new Set(insights.filter(i => selectedInsights.has(i.id)).map(i => i.student_id))].length} student(s) based on the selected insights.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleCreateGoal}
                      disabled={isCreating || !goalTitle.trim()}
                    >
                      {isCreating ? 'Creating...' : 'Create Learning Goal'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedInsights(new Set());
                        setGoalTitle('');
                        setGoalDescription('');
                        setTargetDate('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightToActionConverter;
