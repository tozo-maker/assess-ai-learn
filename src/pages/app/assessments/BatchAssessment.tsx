
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PageShell } from '@/components/ui/page-shell';
import { assessmentService } from '@/services/assessment-service';
import { studentService } from '@/services/student-service';
import { ErrorType, StudentResponseFormData } from '@/types/assessment';
import { ArrowLeft, Save, Users, FileText, AlertCircle, Check } from 'lucide-react';

const errorTypes: ErrorType[] = ['conceptual', 'procedural', 'factual', 'none'];

const BatchAssessment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedStudentId = searchParams.get('student');
  const selectedAssessmentId = searchParams.get('assessment');

  const [selectedAssessment, setSelectedAssessment] = useState(selectedAssessmentId || '');
  const [selectedStudents, setSelectedStudents] = useState<string[]>(selectedStudentId ? [selectedStudentId] : []);
  const [responses, setResponses] = useState<Record<string, StudentResponseFormData[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessments
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Fetch assessment items when assessment is selected
  const { data: assessmentItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['assessmentItems', selectedAssessment],
    queryFn: () => assessmentService.getAssessmentItems(selectedAssessment),
    enabled: !!selectedAssessment,
  });

  // Get selected assessment details
  const assessmentDetails = assessments?.find(a => a.id === selectedAssessment);

  // Initialize responses when students or assessment items change
  React.useEffect(() => {
    if (selectedStudents.length > 0 && assessmentItems) {
      const newResponses: Record<string, StudentResponseFormData[]> = {};
      
      selectedStudents.forEach(studentId => {
        if (!responses[studentId]) {
          newResponses[studentId] = assessmentItems.map(item => ({
            student_id: studentId,
            assessment_id: selectedAssessment,
            assessment_item_id: item.id,
            score: 0,
            error_type: 'none',
            teacher_notes: ''
          }));
        } else {
          newResponses[studentId] = responses[studentId];
        }
      });
      
      setResponses(newResponses);
    }
  }, [selectedStudents, assessmentItems, selectedAssessment]);

  const updateResponse = (studentId: string, itemIndex: number, field: keyof StudentResponseFormData, value: any) => {
    setResponses(prev => ({
      ...prev,
      [studentId]: prev[studentId]?.map((response, index) => 
        index === itemIndex ? { ...response, [field]: value } : response
      ) || []
    }));
  };

  const submitResponsesMutation = useMutation({
    mutationFn: async (allResponses: StudentResponseFormData[]) => {
      const result = await assessmentService.submitStudentResponses(allResponses);
      
      // Trigger AI analysis for each student
      for (const studentId of selectedStudents) {
        try {
          await assessmentService.triggerAnalysis(selectedAssessment, studentId);
        } catch (error) {
          console.error(`Failed to trigger analysis for student ${studentId}:`, error);
        }
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'Responses Submitted',
        description: `Successfully submitted responses for ${selectedStudents.length} student(s). AI analysis is being generated.`
      });
      queryClient.invalidateQueries({ queryKey: ['studentResponses'] });
      navigate('/app/assessments');
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = () => {
    if (!selectedAssessment || selectedStudents.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select an assessment and at least one student.',
        variant: 'destructive'
      });
      return;
    }

    const allResponses = selectedStudents.flatMap(studentId => responses[studentId] || []);
    
    if (allResponses.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'No responses to submit.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    submitResponsesMutation.mutate(allResponses);
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
      // Remove responses for deselected student
      setResponses(prev => {
        const newResponses = { ...prev };
        delete newResponses[studentId];
        return newResponses;
      });
    } else {
      setSelectedStudents(prev => [...prev, studentId]);
    }
  };

  const getStudentTotalScore = (studentId: string) => {
    const studentResponses = responses[studentId] || [];
    return studentResponses.reduce((total, response) => total + response.score, 0);
  };

  const getMaxPossibleScore = () => {
    return assessmentItems?.reduce((total, item) => total + item.max_score, 0) || 0;
  };

  if (isLoadingAssessments || isLoadingStudents) {
    return (
      <PageShell
        title="Batch Assessment Entry"
        description="Enter assessment data for multiple students"
        link="/app/assessments"
        linkText="Back to Assessments"
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Batch Assessment Entry"
      description="Enter assessment data for multiple students at once"
      link="/app/assessments"
      linkText="Back to Assessments"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/app/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
        </div>

        {/* Assessment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Select Assessment
            </CardTitle>
            <CardDescription>Choose the assessment to enter data for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments?.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title} ({assessment.subject})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {assessmentDetails && (
                <div className="flex flex-col justify-center">
                  <div className="text-sm text-gray-600">
                    <p><strong>Subject:</strong> {assessmentDetails.subject}</p>
                    <p><strong>Grade:</strong> {assessmentDetails.grade_level}</p>
                    <p><strong>Type:</strong> {assessmentDetails.assessment_type}</p>
                    <p><strong>Max Score:</strong> {assessmentDetails.max_score} points</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        {selectedAssessment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Students
              </CardTitle>
              <CardDescription>Choose students to enter assessment data for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {students?.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                    />
                    <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">{student.first_name} {student.last_name}</p>
                        <p className="text-sm text-gray-500">Grade {student.grade_level}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
              
              {selectedStudents.length > 0 && (
                <div className="mt-4">
                  <Badge variant="secondary">
                    {selectedStudents.length} student(s) selected
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Entry */}
        {selectedStudents.length > 0 && assessmentItems && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Assessment Data</CardTitle>
              <CardDescription>
                Enter scores and observations for each student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {selectedStudents.map(studentId => {
                  const student = students?.find(s => s.id === studentId);
                  const studentResponses = responses[studentId] || [];
                  
                  return (
                    <div key={studentId} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {student?.first_name} {student?.last_name}
                          </h3>
                          <p className="text-sm text-gray-500">Grade {student?.grade_level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {getStudentTotalScore(studentId)} / {getMaxPossibleScore()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.round((getStudentTotalScore(studentId) / getMaxPossibleScore()) * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {assessmentItems.map((item, itemIndex) => (
                          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded">
                            <div className="md:col-span-5">
                              <Label className="text-sm font-medium">Question {item.item_number}</Label>
                              <p className="text-sm text-gray-600 mt-1">{item.question_text}</p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.difficulty_level}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.knowledge_type}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label className="text-sm">Score</Label>
                              <Input
                                type="number"
                                min="0"
                                max={item.max_score}
                                value={studentResponses[itemIndex]?.score || 0}
                                onChange={(e) => updateResponse(
                                  studentId,
                                  itemIndex,
                                  'score',
                                  parseFloat(e.target.value) || 0
                                )}
                                className="text-center"
                              />
                              <p className="text-xs text-gray-500 text-center mt-1">
                                / {item.max_score}
                              </p>
                            </div>

                            <div className="md:col-span-2">
                              <Label className="text-sm">Error Type</Label>
                              <Select
                                value={studentResponses[itemIndex]?.error_type || 'none'}
                                onValueChange={(value: ErrorType) => updateResponse(
                                  studentId,
                                  itemIndex,
                                  'error_type',
                                  value
                                )}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {errorTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type === 'none' ? 'No Error' : type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="md:col-span-3">
                              <Label className="text-sm">Notes</Label>
                              <Textarea
                                value={studentResponses[itemIndex]?.teacher_notes || ''}
                                onChange={(e) => updateResponse(
                                  studentId,
                                  itemIndex,
                                  'teacher_notes',
                                  e.target.value
                                )}
                                placeholder="Observations..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {selectedStudents.length > 0 && assessmentItems && (
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/app/assessments')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || submitResponsesMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting || submitResponsesMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Submit All Responses
            </Button>
          </div>
        )}

        {!selectedAssessment && (
          <Card>
            <CardContent className="text-center p-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Select Assessment</h3>
              <p className="text-gray-500">Choose an assessment to begin entering student data.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
};

export default BatchAssessment;
