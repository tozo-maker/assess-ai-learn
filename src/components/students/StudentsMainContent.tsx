
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DSSection, DSPageContainer, DSSpacer } from '@/components/ui/design-system';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import StudentsPageHeader from '@/components/students/StudentsPageHeader';
import StudentsGrid from '@/components/students/StudentsGrid';
import StudentsEmptyState from '@/components/students/StudentsEmptyState';
import BulkActionsToolbar from '@/components/students/BulkActionsToolbar';
import StudentsOverviewMetrics from '@/components/students/StudentsOverviewMetrics';
import StudentsAlertSystem from '@/components/students/StudentsAlertSystem';
import UnifiedStudentFilterBar from '@/components/students/UnifiedStudentFilterBar';
import { StudentFilterValues } from '@/components/students/filters/StudentFilterTypes';
import { StudentWithPerformance } from '@/types/student';

interface StudentsMainContentProps {
  students: StudentWithPerformance[];
  filteredStudents: StudentWithPerformance[];
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  selectedStudents: string[];
  filters: StudentFilterValues;
  onFiltersChange: (filters: StudentFilterValues) => void;
  onSelectStudent: (studentId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

const StudentsMainContent: React.FC<StudentsMainContentProps> = ({
  students,
  filteredStudents,
  viewMode,
  onViewModeChange,
  selectedStudents,
  filters,
  onFiltersChange,
  onSelectStudent,
  onSelectAll,
  onClearSelection,
  isAllSelected,
  isIndeterminate
}) => {
  const navigate = useNavigate();

  const handleAddStudent = () => {
    navigate('/app/students/add');
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/app/students/${studentId}`);
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

  return (
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

        {/* Unified Filter Bar */}
        <div className="mb-6">
          <UnifiedStudentFilterBar
            filters={filters}
            onFiltersChange={onFiltersChange}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={onSelectAll}
            selectedCount={selectedStudents.length}
            totalStudents={students.length}
            filteredCount={filteredStudents.length}
          />
        </div>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <div className="mb-6">
            <BulkActionsToolbar
              selectedCount={selectedStudents.length}
              onClearSelection={onClearSelection}
              onBulkEmail={handleBulkEmail}
              onBulkReport={handleBulkReport}
              onBulkDelete={handleBulkDelete}
            />
          </div>
        )}

        <DSSpacer size="lg" />

        {/* Students Grid/List */}
        {filteredStudents.length > 0 ? (
          <StudentsGrid
            students={filteredStudents}
            viewMode={viewMode}
            selectedStudents={selectedStudents}
            onStudentClick={handleStudentClick}
            onSelectStudent={onSelectStudent}
          />
        ) : (
          <StudentsEmptyState
            totalStudents={students.length}
            onAddStudent={handleAddStudent}
          />
        )}
      </DSPageContainer>
    </DSSection>
  );
};

export default StudentsMainContent;
