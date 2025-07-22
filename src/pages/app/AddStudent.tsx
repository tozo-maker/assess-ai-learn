
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateStudent } from '@/services/student-service';
import ValidatedStudentForm from '@/components/forms/ValidatedStudentForm';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DSPageContainer } from '@/components/ui/design-system';

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createStudent = useCreateStudent();

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: (student) => {
      toast({
        title: "Student Added Successfully",
        description: `${student.first_name} ${student.last_name} has been added to your class.`,
      });

      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-data'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-dashboard'] 
      });

      navigate('/app/students');
    },
    onError: (error) => {
      toast({
        title: "Error Adding Student",
        description: error instanceof Error ? error.message : "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <DSPageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/students')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl">
              <ValidatedStudentForm
                onSubmit={(formData) => createStudentMutation.mutate(formData)}
                isLoading={createStudentMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DSPageContainer>
  );
};

export default AddStudent;
