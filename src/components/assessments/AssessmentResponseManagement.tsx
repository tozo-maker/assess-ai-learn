import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment-service';
import { studentService } from '@/services/student-service';
import { useToast } from '@/hooks/use-toast';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSInput
} from '@/components/ui/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';

interface AssessmentResponseManagementProps {
  assessmentId: string;
}

const AssessmentResponseManagement: React.FC<AssessmentResponseManagementProps> = ({
  assessmentId
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [newScore, setNewScore] = useState<string>('');
  const [editingResponse, setEditingResponse] = useState<string | null>(null);

  const { data: assessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => assessmentService.getAssessmentById(assessmentId),
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const { data: responses, isLoading } = useQuery({
    queryKey: ['student-responses', assessmentId],
    queryFn: () => assessmentService.getStudentResponses(assessmentId),
  });

  const addResponseMutation = useMutation({
    mutationFn: async ({ studentId, score }: { studentId: string; score: number }) => {
      // For now, we'll create a simple response without items
      const responseData = {
        student_id: studentId,
        assessment_id: assessmentId,
        assessment_item_id: 'placeholder', // This would need proper item handling
        score: score,
      };
      
      return assessmentService.submitStudentResponses([responseData]);
    },
    onSuccess: () => {
      toast({
        title: "Response added",
        description: "Student response has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['student-responses', assessmentId] });
      setSelectedStudent('');
      setNewScore('');
    },
    onError: (error) => {
      console.error('Error adding response:', error);
      toast({
        title: "Failed to add response",
        description: "There was an error adding the student response.",
        variant: "destructive"
      });
    },
  });

  const handleAddResponse = () => {
    if (!selectedStudent || !newScore) {
      toast({
        title: "Missing information",
        description: "Please select a student and enter a score.",
        variant: "destructive"
      });
      return;
    }

    const score = parseFloat(newScore);
    if (isNaN(score) || score < 0 || (assessment && score > assessment.max_score)) {
      toast({
        title: "Invalid score",
        description: `Score must be between 0 and ${assessment?.max_score || 100}.`,
        variant: "destructive"
      });
      return;
    }

    addResponseMutation.mutate({ studentId: selectedStudent, score });
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const availableStudents = students?.filter(student => 
    !responses?.some(response => response.student_id === student.id)
  ) || [];

  if (isLoading) {
    return <div>Loading responses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Response */}
      <DSCard>
        <DSCardHeader>
          <DSCardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Student Response
          </DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <DSFlexContainer gap="md" className="items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Score (out of {assessment?.max_score || 100})
              </label>
              <DSInput
                type="number"
                placeholder="Enter score"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                min="0"
                max={assessment?.max_score || 100}
              />
            </div>
            <DSButton 
              onClick={handleAddResponse}
              disabled={addResponseMutation.isPending}
            >
              {addResponseMutation.isPending ? 'Adding...' : 'Add Response'}
            </DSButton>
          </DSFlexContainer>
        </DSCardContent>
      </DSCard>

      {/* Existing Responses */}
      <DSCard>
        <DSCardHeader>
          <DSCardTitle>Student Responses ({responses?.length || 0})</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          {!responses || responses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No student responses recorded yet. Add responses above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => {
                  const student = students?.find(s => s.id === response.student_id);
                  const percentage = assessment ? 
                    Math.round((response.score / assessment.max_score) * 100) : 0;
                  
                  return (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {student ? `${student.first_name} ${student.last_name}` : 'Unknown Student'}
                      </TableCell>
                      <TableCell>
                        <Badge className={assessment ? getScoreColor(response.score, assessment.max_score) : ''}>
                          {response.score}/{assessment?.max_score || 100}
                        </Badge>
                      </TableCell>
                      <TableCell>{percentage}%</TableCell>
                      <TableCell>
                        {new Date(response.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DSFlexContainer gap="sm">
                          <DSButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingResponse(response.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </DSButton>
                          <DSButton
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </DSButton>
                        </DSFlexContainer>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default AssessmentResponseManagement;
