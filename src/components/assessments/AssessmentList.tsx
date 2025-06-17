
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import { Assessment } from '@/types/assessment';

import EnhancedAssessmentCard from './EnhancedAssessmentCard';
import EnhancedAssessmentFilters from './EnhancedAssessmentFilters';
import BulkActionBar from './BulkActionBar';
import EnhancedEmptyState from './EnhancedEmptyState';

interface FilterValues {
  search: string;
  subject: string;
  type: string;
  status: string;
  gradeLevel: string;
}

const AssessmentList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    subject: '',
    type: '',
    status: '',
    gradeLevel: ''
  });
  
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = filters.search === '' || 
      assessment.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      assessment.assessment_type.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesSubject = !filters.subject || assessment.subject === filters.subject;
    const matchesType = !filters.type || assessment.assessment_type === filters.type;
    const matchesGrade = !filters.gradeLevel || assessment.grade_level === filters.gradeLevel;
    
    const matchesStatus = !filters.status || (() => {
      const isActive = assessment.assessment_date && new Date(assessment.assessment_date) <= new Date();
      const isDraft = assessment.is_draft;
      
      if (filters.status === 'Draft') return isDraft;
      if (filters.status === 'Active') return !isDraft && isActive;
      if (filters.status === 'Completed') return !isDraft && !isActive;
      return true;
    })();
    
    return matchesSearch && matchesSubject && matchesType && matchesGrade && matchesStatus;
  });

  const handleSelectAssessment = (assessmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssessments);
    if (checked) {
      newSelected.add(assessmentId);
    } else {
      newSelected.delete(assessmentId);
    }
    setSelectedAssessments(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedAssessments(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedAssessments.size === 0) return;
    
    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedAssessments).map(id => 
        assessmentService.deleteAssessment(id)
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: "Assessments deleted",
        description: `Successfully deleted ${selectedAssessments.size} assessment${selectedAssessments.size > 1 ? 's' : ''}`,
      });
      
      setSelectedAssessments(new Set());
      refetch();
    } catch (error) {
      console.error('Error deleting assessments:', error);
      toast({
        title: "Error",
        description: "Failed to delete some assessments",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assessmentService.deleteAssessment(id);
      toast({
        title: "Assessment deleted",
        description: "The assessment has been successfully deleted",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const clearAllFilters = () => {
    setFilters({
      search: '',
      subject: '',
      type: '',
      status: '',
      gradeLevel: ''
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filter Skeleton */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="animate-pulse">
            <div className="h-11 bg-gray-200 rounded-lg w-full max-w-md mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Assessments</h3>
        <p className="text-gray-600 mb-4">There was a problem loading your assessments.</p>
        <button 
          onClick={() => refetch()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <EnhancedAssessmentFilters
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={assessments?.length || 0}
        filteredCount={filteredAssessments?.length || 0}
      />

      {/* Assessment Grid or Empty State */}
      {!filteredAssessments?.length ? (
        <EnhancedEmptyState 
          hasActiveFilters={hasActiveFilters} 
          onClearFilters={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <EnhancedAssessmentCard
              key={assessment.id}
              assessment={assessment}
              isSelected={selectedAssessments.has(assessment.id)}
              onSelect={(checked) => handleSelectAssessment(assessment.id, checked)}
              onEdit={() => navigate(`/app/assessments/edit/${assessment.id}`)}
              onDelete={() => handleDelete(assessment.id)}
            />
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedAssessments.size}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AssessmentList;
