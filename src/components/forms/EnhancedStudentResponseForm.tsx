
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
}

interface AssessmentItem {
  id: string;
  item_number: number;
  question_text: string;
  max_score: number;
  knowledge_type: string;
  difficulty_level: string;
}

interface StudentResponse {
  id?: string;
  student_id: string;
  assessment_id: string;
  assessment_item_id: string;
  score: number;
  error_type?: string;
  teacher_notes?: string;
}

interface EnhancedStudentResponseFormProps {
  assessmentId: string;
  students: Student[];
  assessmentItems: AssessmentItem[];
  existingResponses?: StudentResponse[];
  onSave: (responses: StudentResponse[]) => void;
  onCancel: () => void;
}

const ERROR_TYPES = [
  'Computational Error',
  'Conceptual Misunderstanding',
  'Reading Comprehension',
  'Careless Mistake',
  'Incomplete Response',
  'Wrong Method',
  'Other'
];

const EnhancedStudentResponseForm: React.FC<EnhancedStudentResponseFormProps> = ({
  assessmentId,
  students,
  assessmentItems,
  existingResponses = [],
  onSave,
  onCancel
}) => {
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize responses for all students and items
    const initialResponses: StudentResponse[] = [];
    
    students.forEach(student => {
      assessmentItems.forEach(item => {
        const existingResponse = existingResponses.find(
          r => r.student_id === student.id && r.assessment_item_id === item.id
        );
        
        initialResponses.push(
          existingResponse || {
            student_id: student.id,
            assessment_id: assessmentId,
            assessment_item_id: item.id,
            score: 0,
            error_type: '',
            teacher_notes: ''
          }
        );
      });
    });
    
    setResponses(initialResponses);
  }, [students, assessmentItems, existingResponses, assessmentId]);

  const updateResponse = (studentId: string, itemId: string, field: keyof StudentResponse, value: any) => {
    const key = `${studentId}-${itemId}`;
    
    setResponses(prev => prev.map(response => {
      if (response.student_id === studentId && response.assessment_item_id === itemId) {
        return { ...response, [field]: value };
      }
      return response;
    }));

    // Clear validation error when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateResponses = () => {
    const errors: Record<string, string> = {};
    
    responses.forEach(response => {
      const item = assessmentItems.find(i => i.id === response.assessment_item_id);
      const key = `${response.student_id}-${response.assessment_item_id}`;
      
      if (!item) return;
      
      // Validate score
      if (response.score < 0) {
        errors[key] = 'Score cannot be negative';
      } else if (response.score > item.max_score) {
        errors[key] = `Score cannot exceed ${item.max_score}`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateResponses()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the validation errors before saving."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(responses);
      toast({
        title: "Success",
        description: "Student responses saved successfully."
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save responses. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponseForStudent = (studentId: string, itemId: string) => {
    return responses.find(r => r.student_id === studentId && r.assessment_item_id === itemId);
  };

  const currentStudent = students[currentStudentIndex];
  const totalErrors = Object.keys(validationErrors).length;

  if (!currentStudent) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No students available for this assessment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Student Responses Entry
              {totalErrors > 0 && (
                <Badge variant="destructive">
                  {totalErrors} error{totalErrors !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Student {currentStudentIndex + 1} of {students.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentStudentIndex === 0}
                onClick={() => setCurrentStudentIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentStudentIndex === students.length - 1}
                onClick={() => setCurrentStudentIndex(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Student Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStudent.first_name} {currentStudent.last_name}
            <Badge variant="outline" className="ml-2">
              Grade {currentStudent.grade_level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessmentItems.map(item => {
            const response = getResponseForStudent(currentStudent.id, item.id);
            const errorKey = `${currentStudent.id}-${item.id}`;
            const hasError = validationErrors[errorKey];

            if (!response) return null;

            return (
              <div key={item.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      Question {item.item_number}
                      <Badge variant="outline" className="ml-2">
                        {item.knowledge_type}
                      </Badge>
                      <Badge variant="outline" className="ml-1">
                        {item.difficulty_level}
                      </Badge>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{item.question_text}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {item.max_score} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`score-${item.id}`}>Score *</Label>
                    <Input
                      id={`score-${item.id}`}
                      type="number"
                      min="0"
                      max={item.max_score}
                      step="0.5"
                      value={response.score}
                      onChange={(e) => updateResponse(
                        currentStudent.id,
                        item.id,
                        'score',
                        parseFloat(e.target.value) || 0
                      )}
                      className={hasError ? 'border-red-500' : ''}
                    />
                    {hasError && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors[errorKey]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`error-${item.id}`}>Error Type</Label>
                    <Select
                      value={response.error_type || ''}
                      onValueChange={(value) => updateResponse(
                        currentStudent.id,
                        item.id,
                        'error_type',
                        value === 'none' ? '' : value
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select error type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Error</SelectItem>
                        {ERROR_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`notes-${item.id}`}>Teacher Notes</Label>
                    <Textarea
                      id={`notes-${item.id}`}
                      value={response.teacher_notes || ''}
                      onChange={(e) => updateResponse(
                        currentStudent.id,
                        item.id,
                        'teacher_notes',
                        e.target.value
                      )}
                      placeholder="Optional notes about this response..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        
        <div className="flex items-center gap-2">
          {totalErrors === 0 && responses.length > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Ready to save</span>
            </div>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={isSubmitting || totalErrors > 0}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All Responses
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentResponseForm;
