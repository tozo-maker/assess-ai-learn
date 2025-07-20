
import React, { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { Users } from 'lucide-react';
import StudentsMainContent from '@/components/students/StudentsMainContent';
import { useStudentsData } from '@/hooks/useStudentsData';
import { StudentFilterValues } from '@/components/students/filters/StudentFilterTypes';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';

const Students: React.FC = () => {
  const {
    students,
    isLoading,
    error,
    refetch
  } = useStudentsData();

  // Local state for students page
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filters, setFilters] = useState<StudentFilterValues>({
    search: '',
    gradeLevel: '',
    classId: '',
    performanceLevel: '',
    needsAttention: null,
    hasParentContact: null
  });

  // Filter students based on current filters
  const filteredStudents = (students || []).filter(student => {
    if (filters.search && !student.first_name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !student.last_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.gradeLevel && student.grade_level !== filters.gradeLevel) return false;
    
    // Handle class filter
    if (filters.classId) {
      if (filters.classId === 'unassigned') {
        if (student.class_id) return false; // Student has a class assigned
      } else {
        if (student.class_id !== filters.classId) return false;
      }
    }
    
    // Handle needs_attention filter - check the performance data
    if (filters.needsAttention !== null) {
      const needsAttention = Array.isArray(student.performance) 
        ? false // If it's an empty array, assume no attention needed
        : student.performance?.needs_attention || false;
      if (needsAttention !== filters.needsAttention) return false;
    }
    
    // Handle hasParentContact filter - check if parent contact info exists
    if (filters.hasParentContact !== null) {
      const hasParentContact = !!(student.parent_email || student.parent_phone);
      if (hasParentContact !== filters.hasParentContact) return false;
    }
    
    return true;
  });

  // Selection handlers
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  const actions = (
    <Users className="h-5 w-5 text-primary" />
  );

  if (isLoading) {
    return (
      <StandardPageLayout 
        title="Students"
        actions={actions}
      >
        <PageLoadingState message="Loading students..." />
      </StandardPageLayout>
    );
  }

  if (error) {
    return (
      <StandardPageLayout 
        title="Students"
        actions={actions}
      >
        <PageErrorState 
          error={error}
          onRetry={refetch}
          title="Students Loading Error"
          description="Failed to load student data. Please try again."
        />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout 
      title="Students"
      description="Manage your students and track their progress"
      actions={actions}
    >
      <StudentsMainContent 
        students={students || []}
        filteredStudents={filteredStudents}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedStudents={selectedStudents}
        filters={filters}
        onFiltersChange={setFilters}
        onSelectStudent={handleSelectStudent}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
      />
    </StandardPageLayout>
  );
};

export default Students;
