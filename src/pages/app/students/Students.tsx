
import React from 'react';
import StudentsMainContent from '@/components/students/StudentsMainContent';
import { useStudentsData } from '@/hooks/useStudentsData';

const Students: React.FC = () => {
  const {
    students,
    filteredStudents,
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

  return (
    <div className="p-6">
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
    </div>
  );
};

export default Students;
