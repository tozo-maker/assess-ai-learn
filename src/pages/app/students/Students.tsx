import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardContent,
  DSSpacer,
  DSBodyText
} from '@/components/ui/design-system';

// Page Components
import StudentsPageHeader from '@/components/students/StudentsPageHeader';
import StudentsViewControls from '@/components/students/StudentsViewControls';
import StudentsGrid from '@/components/students/StudentsGrid';
import StudentsEmptyState from '@/components/students/StudentsEmptyState';

// Enhanced Components
import StudentFilters, { StudentFilterValues } from '@/components/students/StudentFilters';
import BulkActionsToolbar from '@/components/students/BulkActionsToolbar';
import StudentsOverviewMetrics from '@/components/students/StudentsOverviewMetrics';
import StudentsAlertSystem from '@/components/students/StudentsAlertSystem';
import { studentService } from '@/services/student-service';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<StudentFilterValues>({
    search: '',
    gradeLevel: '',
    performanceLevel: '',
    needsAttention: null,
    hasParentContact: null
  });

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  // Filter students based on current filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        student.grade_level.toLowerCase().includes(searchTerm) ||
        student.student_id?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.gradeLevel) {
      filtered = filtered.filter(student => student.grade_level === filters.gradeLevel);
    }

    if (filters.performanceLevel) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return false;
        }
        return student.performance.performance_level === filters.performanceLevel;
      });
    }

    if (filters.needsAttention !== null) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return !filters.needsAttention;
        }
        return student.performance.needs_attention === filters.needsAttention;
      });
    }

    if (filters.hasParentContact !== null) {
      filtered = filtered.filter(student => {
        const hasContact = !!(student.parent_email || student.parent_phone);
        return hasContact === filters.hasParentContact;
      });
    }

    return filtered;
  }, [students, filters]);

  const handleAddStudent = () => {
    navigate('/app/students/add');
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/app/students/${studentId}`);
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
  };

  const handleBulkEmail = () => {
    console.log('Bulk email for students:', selectedStudents);
  };

  const handleBulkReport = () => {
    console.log('Bulk report for students:', selectedStudents);
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete for students:', selectedStudents);
  };

  const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  if (isLoading) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#2563eb] mx-auto mb-4"></div>
                <DSBodyText className="text-gray-600">Loading students...</DSBodyText>
              </div>
            </div>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DSSection className="py-8">
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header */}
          <StudentsPageHeader 
            totalStudents={students.length}
            filteredCount={filteredStudents.length}
          />

          {/* Overview Metrics */}
          <StudentsOverviewMetrics />

          {/* Alert System */}
          <StudentsAlertSystem />

          {/* Filters */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              {(showFilters || filters.search || filters.gradeLevel || filters.performanceLevel) && (
                <StudentFilters
                  values={filters}
                  onFiltersChange={setFilters}
                  totalStudents={students.length}
                  filteredCount={filteredStudents.length}
                />
              )}
            </DSCardContent>
          </DSCard>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="mb-6">
              <BulkActionsToolbar
                selectedCount={selectedStudents.length}
                onClearSelection={handleClearSelection}
                onBulkEmail={handleBulkEmail}
                onBulkReport={handleBulkReport}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          )}

          {/* View Controls */}
          <StudentsViewControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
            filteredCount={filteredStudents.length}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          <DSSpacer size="lg" />

          {/* Students Grid/List */}
          {filteredStudents.length > 0 ? (
            <StudentsGrid
              students={filteredStudents}
              viewMode={viewMode}
              selectedStudents={selectedStudents}
              onStudentClick={handleStudentClick}
              onSelectStudent={handleSelectStudent}
            />
          ) : (
            <StudentsEmptyState
              totalStudents={students.length}
              onAddStudent={handleAddStudent}
            />
          )}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Students;
