
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import StudentsLoadingState from '@/components/students/StudentsLoadingState';
import StudentsMainContent from '@/components/students/StudentsMainContent';
import { useStudentsData } from '@/hooks/useStudentsData';

const Students: React.FC = () => {
  const {
    students,
    filteredStudents,
    isLoading,
    viewMode,
    setViewMode,
    selectedStudents,
    filters,
    setFilters,
    handleSelectStudent,
    handleSelectAll,
    handleClearSelection,
    isAllSelected,
    isIndeterminate
  } = useStudentsData();

  if (isLoading) {
    return <StudentsLoadingState />;
  }

  return (
    <AppLayout>
      <StudentsMainContent
        students={students}
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
    </AppLayout>
  );
};

export default Students;
