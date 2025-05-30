
import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Users } from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AssessmentAnalysisDisplay from '@/components/assessments/AssessmentAnalysisDisplay';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

const AssessmentAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStudentId = searchParams.get('student') || '';
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId);

  // Fetch assessment details
  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentService.getAssessmentById(id as string),
    enabled: !!id,
  });

  // Fetch students for the teacher
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const handleStudentChange = (studentId: string) => {
    if (studentId === 'no-students') return; // Ignore placeholder selection
    
    setSelectedStudentId(studentId);
    setSearchParams({ student: studentId });
  };

  const renderContent = () => {
    if (isLoadingAssessment || isLoadingStudents) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading assessment data...</p>
          </div>
        </div>
      );
    }

    if (!assessment) {
      return (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold">Assessment not found</h2>
          <p className="mt-2">The requested assessment could not be loaded.</p>
          <Button asChild className="mt-4">
            <Link to="/app/assessments">Back to Assessments</Link>
          </Button>
        </div>
      );
    }

    if (!selectedStudentId) {
      return (
        <div className="text-center p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold">Select a Student</h2>
          <p className="mt-2 text-gray-500">Please select a student to view their assessment analysis.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to={`/app/assessments/${id}/add-responses`}>Record Student Responses</Link>
          </Button>
        </div>
      );
    }

    return <AssessmentAnalysisDisplay assessmentId={id as string} studentId={selectedStudentId} />;
  };

  // Enhanced filtering with strict empty string validation
  const validStudents = React.useMemo(() => {
    if (!students || !Array.isArray(students)) {
      console.log('No students data or invalid array:', students);
      return [];
    }
    
    const filtered = students.filter(student => {
      // Basic existence check
      if (!student || typeof student !== 'object') {
        console.log('Invalid student object:', student);
        return false;
      }
      
      // Check for id property and validate it thoroughly
      if (!('id' in student)) {
        console.log('Student missing id property:', student);
        return false;
      }
      
      const studentId = student.id;
      
      // Comprehensive ID validation - MUST be a non-empty string
      if (studentId === null || studentId === undefined) {
        console.log('Student has null/undefined id:', student);
        return false;
      }
      
      if (typeof studentId !== 'string') {
        console.log('Student id is not a string:', studentId, typeof studentId);
        return false;
      }
      
      // CRITICAL: Check for empty string specifically
      if (studentId === '' || studentId.trim() === '') {
        console.log('Student has empty string id:', student);
        return false;
      }
      
      // Check for required name fields
      if (!student.first_name || typeof student.first_name !== 'string' || student.first_name.trim() === '') {
        console.log('Student missing valid first_name:', student);
        return false;
      }
      
      if (!student.last_name || typeof student.last_name !== 'string' || student.last_name.trim() === '') {
        console.log('Student missing valid last_name:', student);
        return false;
      }
      
      return true;
    });
    
    console.log('Valid students after filtering:', filtered.length, 'out of', students.length);
    return filtered;
  }, [students]);

  return (
    <PageShell
      title="Assessment Analysis"
      description={assessment ? `${assessment.title} | ${assessment.subject}` : 'Loading...'}
      link={`/app/assessments/${id}`}
      linkText="Back to Assessment Details"
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button variant="ghost" className="pl-0 mb-2" asChild>
              <Link to={`/app/assessments/${id}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Assessment
              </Link>
            </Button>
          </div>
          
          <div className="w-full sm:w-64">
            {validStudents.length > 0 ? (
              <Select 
                value={selectedStudentId || undefined} 
                onValueChange={handleStudentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {validStudents.map(student => {
                    // Double-check student.id is valid before using it
                    const studentId = student.id;
                    if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
                      console.warn('Skipping student with invalid id in render:', student);
                      return null;
                    }
                    
                    return (
                      <SelectItem 
                        key={studentId} 
                        value={studentId}
                      >
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Select disabled value="no-students">
                <SelectTrigger>
                  <SelectValue placeholder="No students available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-students">No students available</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
      
      {renderContent()}
    </PageShell>
  );
};

export default AssessmentAnalysis;
