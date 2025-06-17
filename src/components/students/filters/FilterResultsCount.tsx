
import React from 'react';

interface FilterResultsCountProps {
  filteredCount: number;
  totalStudents: number;
}

const FilterResultsCount: React.FC<FilterResultsCountProps> = ({
  filteredCount,
  totalStudents
}) => {
  return (
    <div className="text-sm text-gray-600">
      Showing {filteredCount} of {totalStudents} students
    </div>
  );
};

export default FilterResultsCount;
