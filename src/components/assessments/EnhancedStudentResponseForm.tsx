
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { assessmentAnalysisService } from '@/services/assessment-analysis-service';

const responseSchema = z.object({
  responses: z.array(z.object({
    assessment_item_id: z.string(),
    score: z.number().min(0),
    max_score: z.number().min(1),
    error_type: z.string().optional(),
    teacher_notes: z.string().optional()
  }))
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface AssessmentItem {
  id: string;
  item_number: number;
  question_text: string;
  max_score: number;
  knowledge_type: string;
  difficulty_level: string;
}

interface Assessment {
  id: string;
  title: string;
  max_score: number;
  assessment_items: AssessmentItem[];
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  grade_level: string;
}

interface EnhancedStudentResponseFormProps {
  assessment: Assessment;
  student: Student;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ERROR_TYPES = [
  { value: 'conceptual', label: 'Conceptual Error' },
  { value: 'procedural', label: 'Procedural Error' },
  { value: 'computational', label: 'Computational Error' },
  { value: 'communication', label: 'Communication Error' },
  { value: 'incomplete', label: 'Incomplete Response' },
  { value: 'off_topic', label: 'Off Topic' }
];

export const EnhancedStudentResponseForm: React.FC<EnhancedStudentResponseFormProps> = ({
  assessment,
  student,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      responses: assessment.assessment_items.map(item => ({
        assessment_item_id: item.id,
        score: 0,
        max_score: item.max_score,
        error_type: '',
        teacher_notes: ''
      }))
    }
  });

  const handleSubmit = async (data: ResponseFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting student responses:', data);

      // Save individual responses
      const responsePromises = data.responses.map(response => 
        supabase.from('student_responses').insert({
          student_id: student.id,
          assessment_id: assessment.id,
          assessment_item_id: response.assessment_item_id,
          score: response.score,
          error_type: response.error_type || null,
          teacher_notes: response.teacher_notes || null
        })
      );

      const results = await Promise.all(responsePromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        throw new Error('Failed to save some responses');
      }

      // Generate AI analysis
      setIsGeneratingAnalysis(true);
      try {
        await assessmentAnalysisService.generateAnalysis({
          assessmentId: assessment.id,
          studentId: student.id,
          responses: data.responses.map(r => ({
            itemId: r.assessment_item_id,
            score: r.score,
            maxScore: r.max_score,
            errorType: r.error_type
          }))
        });

        toast({
          title: "Success!",
          description: "Student responses saved and analysis generated successfully."
        });
      } catch (analysisError) {
        console.error('Analysis generation failed:', analysisError);
        toast({
          title: "Responses Saved",
          description: "Responses saved but analysis generation failed. You can generate it later.",
          variant: "default"
        });
      }

      onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Failed to save student responses. Please try again."
      });
    } finally {
      setIsSubmitting(false);
      setIsGeneratingAnalysis(false);
    }
  };

  const totalScore = form.watch('responses').reduce((sum, response) => sum + response.score, 0);
  const percentageScore = Math.round((totalScore / assessment.max_score) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assessment Response Form</span>
            <Badge variant={percentageScore >= 80 ? 'default' : percentageScore >= 60 ? 'secondary' : 'destructive'}>
              {totalScore}/{assessment.max_score} ({percentageScore}%)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium">Student</Label>
              <p className="text-lg font-semibold">{student.first_name} {student.last_name}</p>
              <p className="text-sm text-gray-600">Grade {student.grade_level}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Assessment</Label>
              <p className="text-lg font-semibold">{assessment.title}</p>
              <p className="text-sm text-gray-600">Max Score: {assessment.max_score}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {assessment.assessment_items.map((item, index) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">
                      Question {item.item_number}
                      <Badge variant="outline" className="ml-2">
                        {item.difficulty_level}
                      </Badge>
                      <Badge variant="secondary" className="ml-2">
                        {item.knowledge_type}
                      </Badge>
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">{item.question_text}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`score-${index}`}>
                      Score (0-{item.max_score})
                    </Label>
                    <Input
                      id={`score-${index}`}
                      type="number"
                      min="0"
                      max={item.max_score}
                      step="0.5"
                      {...form.register(`responses.${index}.score`, {
                        valueAsNumber: true
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`error-${index}`}>Error Type (Optional)</Label>
                    <Select
                      onValueChange={(value) => 
                        form.setValue(`responses.${index}.error_type`, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select error type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ERROR_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${index}`}>Teacher Notes (Optional)</Label>
                  <Textarea
                    id={`notes-${index}`}
                    placeholder="Add notes about student's response, reasoning, or areas for improvement..."
                    {...form.register(`responses.${index}.teacher_notes`)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {isGeneratingAnalysis && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI analysis is being generated. This may take a moment...
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isGeneratingAnalysis}
            className="flex items-center gap-2"
          >
            {isSubmitting || isGeneratingAnalysis ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isGeneratingAnalysis ? 'Generating Analysis...' : 'Save Responses'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedStudentResponseForm;
