
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/services/data-service';
import ValidatedStudentForm from '@/components/forms/ValidatedStudentForm';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StudentsErrorBoundary from '@/components/students/StudentsErrorBoundary';

const AddStudent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createStudentMutation = useMutation({
    mutationFn: dataService.createStudent,
    onSuccess: (student) => {
      toast({
        title: "Student Added Successfully",
        description: `${student.first_name} ${student.last_name} has been added to your class.`,
      });
      
      // Invalidate and refetch students data
      queryClient.invalidateQueries({ queryKey: ['students'] });
      
      // Navigate to the new student's profile
      navigate(`/app/students/${student.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Add Student",
        description: error.message || "There was an error adding the student. Please try again.",
      });
    }
  });

  return (
    <StudentsErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/app/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Add New Student</h1>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <ValidatedStudentForm
            onSubmit={(data) => createStudentMutation.mutate(data)}
            isLoading={createStudentMutation.isPending}
          />
        </div>
      </div>
    </StudentsErrorBoundary>
  );
};

export default AddStudent;
