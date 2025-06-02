
import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Users, ArrowLeft } from 'lucide-react';

import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import AssessmentAnalysisDisplay from '@/components/assessments/AssessmentAnalysisDisplay';
import { studentService } from '@/services/student-service';
import { assessmentService } from '@/services/assessment-service';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSButton,
  DSFlexContainer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <DSBodyText className="mt-4">Loading assessment data...</DSBodyText>
          </div>
        </div>
      );
    }

    if (!assessment) {
      return (
        <DSCard>
          <DSCardContent>
            <div className="text-center p-8">
              <DSPageTitle className="text-xl font-semibold">Assessment not found</DSPageTitle>
              <DSBodyText className="mt-2">The requested assessment could not be loaded.</DSBodyText>
              <DSButton asChild className="mt-4">
                <Link to="/app/assessments">Back to Assessments</Link>
              </DSButton>
            </div>
          </DSCardContent>
        </DSCard>
      );
    }

    if (!selectedStudentId) {
      return (
        <DSCard>
          <DSCardContent>
            <div className="text-center p-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-500" />
              </div>
              <DSPageTitle className="text-xl font-semibold">Select a Student</DSPageTitle>
              <DSBodyText className="mt-2 text-gray-500">Please select a student to view their assessment analysis.</DSBodyText>
              <DSButton asChild className="mt-4" variant="secondary">
                <Link to={`/app/assessments/${id}/add-responses`}>Record Student Responses</Link>
              </DSButton>
            </div>
          </DSCardContent>
        </DSCard>
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
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header - Standardized */}
          <DSCard className="mb-8">
            <DSCardHeader>
              <div>
                <DSButton variant="ghost" className="mb-4 pl-0" asChild>
                  <Link to={`/app/assessments/${id}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Assessment Details
                  </Link>
                </DSButton>
                <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Assessment Analysis
                </DSPageTitle>
                <DSBodyText className="text-gray-600">
                  {assessment ? `${assessment.title} | ${assessment.subject}` : 'Loading...'}
                </DSBodyText>
              </div>
            </DSCardHeader>
          </DSCard>

          {/* Student Selection */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <DSFlexContainer justify="between" align="center" className="flex-col sm:flex-row gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Select Student</h3>
                  <DSBodyText className="text-sm text-gray-600">Choose a student to view their AI-powered assessment analysis</DSBodyText>
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
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>
          
          {/* Analysis Content */}
          {renderContent()}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default AssessmentAnalysis;
