
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Plus, Calendar, Target, TrendingUp } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date: string;
  max_score: number;
  assessment_type: string;
  description?: string;
}

interface StudentResponse {
  id: string;
  score: number;
  assessment: Assessment;
  created_at: string;
  teacher_notes?: string;
}

interface StudentAssessmentsTabProps {
  studentId: string;
}

const StudentAssessmentsTab: React.FC<StudentAssessmentsTabProps> = ({ studentId }) => {
  const [showAddResponse, setShowAddResponse] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [score, setScore] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student responses
  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['student-responses', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_responses')
        .select(`
          *,
          assessment:assessments(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudentResponse[];
    }
  });

  // Fetch available assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Assessment[];
    }
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async (responseData: { assessment_id: string; score: number; teacher_notes?: string }) => {
      const { data, error } = await supabase
        .from('student_responses')
        .insert({
          student_id: studentId,
          assessment_id: responseData.assessment_id,
          assessment_item_id: null, // We'll handle this later for detailed responses
          score: responseData.score,
          teacher_notes: responseData.teacher_notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment response added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['student-responses', studentId] });
      setShowAddResponse(false);
      setSelectedAssessment('');
      setScore('');
      setTeacherNotes('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add assessment response"
      });
    }
  });

  const handleAddResponse = () => {
    if (!selectedAssessment || !score) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select an assessment and enter a score"
      });
      return;
    }

    const assessment = assessments.find(a => a.id === selectedAssessment);
    const scoreNum = parseFloat(score);
    
    if (isNaN(scoreNum) || scoreNum < 0 || (assessment && scoreNum > assessment.max_score)) {
      toast({
        variant: "destructive",
        title: "Invalid Score",
        description: `Score must be between 0 and ${assessment?.max_score || 100}`
      });
      return;
    }

    addResponseMutation.mutate({
      assessment_id: selectedAssessment,
      score: scoreNum,
      teacher_notes: teacherNotes || undefined
    });
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  if (responsesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Response Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assessment Results
          </h3>
          <p className="text-gray-600">Track student performance across assessments</p>
        </div>
        
        <Dialog open={showAddResponse} onOpenChange={setShowAddResponse}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Response
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Assessment Response</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assessment">Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger id="assessment">
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map(assessment => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title} - {assessment.subject} (Max: {assessment.max_score})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                  min="0"
                  max={assessments.find(a => a.id === selectedAssessment)?.max_score || 100}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Teacher Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Add any notes about this assessment..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddResponse}
                  disabled={addResponseMutation.isPending}
                  className="flex-1"
                >
                  {addResponseMutation.isPending ? 'Adding...' : 'Add Response'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddResponse(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assessment Results */}
      {responses.length > 0 ? (
        <div className="grid gap-4">
          {responses.map((response) => (
            <Card key={response.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{response.assessment.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(response.assessment.assessment_date || response.created_at).toLocaleDateString()}
                      </span>
                      <span>{response.assessment.subject}</span>
                      <span className="capitalize">{response.assessment.assessment_type}</span>
                    </div>
                  </div>
                  <Badge className={getScoreColor(response.score, response.assessment.max_score)}>
                    {response.score}/{response.assessment.max_score} 
                    ({Math.round((response.score / response.assessment.max_score) * 100)}%)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {response.assessment.description && (
                  <p className="text-gray-600 mb-3">{response.assessment.description}</p>
                )}
                {response.teacher_notes && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-1">Teacher Notes</h4>
                    <p className="text-blue-800 text-sm">{response.teacher_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Assessment Results</h3>
            <p className="text-gray-600 mb-4">
              No assessment results have been recorded for this student yet.
            </p>
            <Button onClick={() => setShowAddResponse(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add First Assessment Result
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAssessmentsTab;
