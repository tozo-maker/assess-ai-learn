
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types/goals';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
}

interface Insight {
  id: string;
  type: 'strength' | 'growth_area' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  student_id: string;
  priority: 'low' | 'medium' | 'high';
  suggested_actions?: string[];
}

interface InsightToActionConverterProps {
  insights: Insight[];
  students: Student[];
  teacherId: string;
  onGoalCreated: (goal: Goal) => void;
  onClose: () => void;
}

const InsightToActionConverter: React.FC<InsightToActionConverterProps> = ({
  insights,
  students,
  teacherId,
  onGoalCreated,
  onClose
}) => {
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [goalData, setGoalData] = useState<Partial<Goal>>({
    title: '',
    description: '',
    target_date: '',
    status: 'active',
    progress_percentage: 0
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const actionableInsights = insights.filter(
    insight => insight.type === 'growth_area' || insight.type === 'recommendation'
  );

  const handleInsightSelect = (insightId: string) => {
    setSelectedInsights(prev => {
      if (prev.includes(insightId)) {
        return prev.filter(id => id !== insightId);
      } else {
        return [...prev, insightId];
      }
    });
  };

  const generateGoalFromInsights = () => {
    const selected = actionableInsights.filter(insight => 
      selectedInsights.includes(insight.id)
    );
    
    if (selected.length === 0) return;

    // Generate title based on selected insights
    const titles = selected.map(insight => insight.title);
    const generatedTitle = titles.length === 1 
      ? `Improve ${titles[0]}`
      : `Multi-area Development Plan`;

    // Generate description with action items
    const descriptions = selected.map(insight => insight.description);
    const actions = selected.flatMap(insight => insight.suggested_actions || []);
    
    const generatedDescription = `
Goal based on assessment insights:

Key Areas:
${descriptions.map(desc => `• ${desc}`).join('\n')}

Suggested Actions:
${actions.map(action => `• ${action}`).join('\n')}
    `.trim();

    setGoalData(prev => ({
      ...prev,
      title: generatedTitle,
      description: generatedDescription
    }));
  };

  const handleCreateGoal = async () => {
    if (!selectedStudentId || !goalData.title || !goalData.description || !goalData.target_date) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    setIsCreating(true);

    try {
      const goalInsertData = {
        student_id: selectedStudentId,
        teacher_id: teacherId,
        title: goalData.title!,
        description: goalData.description!,
        target_date: goalData.target_date!,
        status: goalData.status || 'active',
        progress_percentage: goalData.progress_percentage || 0
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(goalInsertData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Cast the database response to match our Goal type
      const createdGoal: Goal = {
        ...data,
        status: data.status as 'active' | 'completed' | 'paused' | 'cancelled'
      };

      toast({
        title: "Goal Created",
        description: "Successfully created goal from insights."
      });

      onGoalCreated(createdGoal);
      onClose();
    } catch (error) {
      console.error('Goal creation error:', error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Failed to create goal. Please try again."
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
            <Lightbulb className="h-5 w-5" />
            Convert Insights to Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Select assessment insights to convert into actionable learning goals for your students.
          </p>

          {actionableInsights.length === 0 ? (
            <Alert>
              <AlertDescription>
                No actionable insights available. Generate assessment analysis first to create goals.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Available Insights</h3>
              <div className="space-y-2">
                {actionableInsights.map(insight => {
                  const student = students.find(s => s.id === insight.student_id);
                  const isSelected = selectedInsights.includes(insight.id);

                  return (
                    <div
                      key={insight.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleInsightSelect(insight.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={insight.priority === 'high' ? 'destructive' : 'outline'}>
                              {insight.priority}
                            </Badge>
                            <Badge variant="outline">
                              {insight.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                          {student && (
                            <p className="text-xs text-gray-500 mt-1">
                              Student: {student.first_name} {student.last_name}
                            </p>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleInsightSelect(insight.id)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedInsights.length > 0 && (
                <Button onClick={generateGoalFromInsights} variant="outline">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Generate Goal Template
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {(goalData.title || goalData.description) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="student">Select Student *</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} (Grade {student.grade_level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={goalData.title || ''}
                onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter goal title"
              />
            </div>

            <div>
              <Label htmlFor="description">Goal Description *</Label>
              <Textarea
                id="description"
                value={goalData.description || ''}
                onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal and action steps"
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_date">Target Date *</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={goalData.target_date || ''}
                  onChange={(e) => setGoalData(prev => ({ ...prev, target_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={goalData.status || 'active'} 
                  onValueChange={(value) => setGoalData(prev => ({ 
                    ...prev, 
                    status: value as 'active' | 'completed' | 'paused' | 'cancelled'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        
        <Button 
          onClick={handleCreateGoal}
          disabled={isCreating || !selectedStudentId || !goalData.title}
          className="flex items-center gap-2"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          Create Goal
        </Button>
      </div>
    </div>
  );
};

export default InsightToActionConverter;
