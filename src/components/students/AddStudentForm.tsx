
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/student-service';
import { gradeLevelOptions, type Student } from '@/types/student';
import { User, Users, Phone, Mail } from 'lucide-react';

const AddStudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at' | 'updated_at' | 'teacher_id'>>({
    first_name: '',
    last_name: '',
    student_id: '',
    grade_level: '',
    learning_goals: '',
    special_considerations: '',
    email: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  });

  const createStudentMutation = useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      navigate('/app/students');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add student"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.grade_level) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    createStudentMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id || ''}
                    onChange={(e) => handleInputChange('student_id', e.target.value)}
                    placeholder="Enter student ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="grade_level">Grade Level *</Label>
                  <Select value={formData.grade_level} onValueChange={(value) => handleInputChange('grade_level', value)}>
                    <SelectTrigger id="grade_level">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevelOptions.map(grade => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Student Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="student@school.edu"
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parent/Guardian Information
              </h3>
              
              <div>
                <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name || ''}
                  onChange={(e) => handleInputChange('parent_name', e.target.value)}
                  placeholder="Enter parent/guardian name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parent_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Parent Email
                  </Label>
                  <Input
                    id="parent_email"
                    type="email"
                    value={formData.parent_email || ''}
                    onChange={(e) => handleInputChange('parent_email', e.target.value)}
                    placeholder="parent@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parent_phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Parent Phone
                  </Label>
                  <Input
                    id="parent_phone"
                    type="tel"
                    value={formData.parent_phone || ''}
                    onChange={(e) => handleInputChange('parent_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Learning Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="learning_goals">Learning Goals</Label>
                <Textarea
                  id="learning_goals"
                  value={formData.learning_goals || ''}
                  onChange={(e) => handleInputChange('learning_goals', e.target.value)}
                  placeholder="Enter specific learning goals for this student"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="special_considerations">Special Considerations</Label>
                <Textarea
                  id="special_considerations"
                  value={formData.special_considerations || ''}
                  onChange={(e) => handleInputChange('special_considerations', e.target.value)}
                  placeholder="Any special needs, accommodations, or considerations"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createStudentMutation.isPending}
                className="flex-1"
              >
                {createStudentMutation.isPending ? 'Adding Student...' : 'Add Student'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/students')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddStudentForm;
