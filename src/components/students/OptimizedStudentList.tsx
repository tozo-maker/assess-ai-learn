import React, { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import { useVirtualizedList, useDebounce, usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';
import { logger } from '@/services/logger';

interface OptimizedStudentListProps {
  students: StudentWithPerformance[];
  selectedStudents: string[];
  onSelectStudent: (studentId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onStudentClick: (studentId: string) => void;
  isLoading?: boolean;
}

// Memoized student row component to prevent unnecessary re-renders
const StudentRow = memo<{
  student: StudentWithPerformance;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  onClick: (studentId: string) => void;
}>(({ student, isSelected, onSelect, onClick }) => {
  const { logPerformance } = usePerformanceMonitor('StudentRow');

  const handleSelect = useCallback((checked: boolean) => {
    logPerformance('select', Date.now());
    onSelect(student.id, checked);
  }, [student.id, onSelect, logPerformance]);

  const handleClick = useCallback(() => {
    logPerformance('click', Date.now());
    onClick(student.id);
  }, [student.id, onClick, logPerformance]);

  // Memoized performance calculations
  const performanceData = useMemo(() => {
    if (!student.performance || Array.isArray(student.performance)) {
      return { averageScore: 0, trend: 'stable', riskLevel: 'low' };
    }

    const perf = student.performance as any;
    return {
      averageScore: perf.average_score || 0,
      trend: perf.trend || 'stable',
      riskLevel: perf.risk_level || 'low'
    };
  }, [student.performance]);

  const getRiskBadge = useCallback((riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Risk</Badge>;
      case 'low':
        return <Badge variant="outline">Low Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }, []);

  return (
    <div className="flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleSelect}
        onClick={(e) => e.stopPropagation()}
      />
      
      <div 
        className="flex-1 flex items-center gap-4 cursor-pointer"
        onClick={handleClick}
      >
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {student.first_name[0]}{student.last_name[0]}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {student.first_name} {student.last_name}
            </h3>
            {performanceData.riskLevel === 'high' && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Grade {student.grade_level} • ID: {student.student_id || 'N/A'}
          </p>
        </div>

        {/* Performance Info */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium">
              {performanceData.averageScore.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          {getRiskBadge(performanceData.riskLevel)}
        </div>
      </div>
    </div>
  );
});

StudentRow.displayName = 'StudentRow';

// Memoized search component
const SearchControls = memo<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  totalCount: number;
  filteredCount: number;
}>(({ 
  searchTerm, 
  onSearchChange, 
  isAllSelected, 
  isIndeterminate, 
  onSelectAll, 
  totalCount, 
  filteredCount 
}) => {
  return (
    <div className="p-4 border-b bg-gray-50 space-y-4">
      <Input
        placeholder="Search students by name or grade..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isAllSelected}
            ref={(checkbox) => {
              if (checkbox) {
                (checkbox as any).indeterminate = isIndeterminate;
              }
            }}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm font-medium text-gray-600">
            Select All ({filteredCount} of {totalCount} students)
          </span>
        </div>
      </div>
    </div>
  );
});

SearchControls.displayName = 'SearchControls';

// Memoized pagination component
const Pagination = memo<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}>(({ currentPage, totalPages, onPageChange, startIndex, endIndex, totalItems }) => {
  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
      <div className="text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

const ITEMS_PER_PAGE = 25;

const OptimizedStudentList: React.FC<OptimizedStudentListProps> = ({
  students,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onStudentClick,
  isLoading = false
}) => {
  const { logPerformance } = usePerformanceMonitor('OptimizedStudentList');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized filtered students for performance
  const filteredStudents = useMemo(() => {
    const startTime = Date.now();
    
    if (!debouncedSearchTerm) {
      logPerformance('filter-no-search', Date.now() - startTime);
      return students;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    const filtered = students.filter(student => 
      student.first_name.toLowerCase().includes(term) ||
      student.last_name.toLowerCase().includes(term) ||
      student.grade_level.toLowerCase().includes(term) ||
      (student.student_id && student.student_id.toLowerCase().includes(term))
    );
    
    logPerformance('filter-with-search', Date.now() - startTime);
    logger.debug(`Filtered ${students.length} students to ${filtered.length}`, {
      searchTerm: debouncedSearchTerm,
      originalCount: students.length,
      filteredCount: filtered.length
    }, 'OptimizedStudentList');
    
    return filtered;
  }, [students, debouncedSearchTerm, logPerformance]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logPerformance('page-change', Date.now());
  }, [logPerformance]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Memoized selection state
  const selectionState = useMemo(() => {
    const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
    const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;
    return { isAllSelected, isIndeterminate };
  }, [selectedStudents.length, filteredStudents.length]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <SearchControls
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          isAllSelected={selectionState.isAllSelected}
          isIndeterminate={selectionState.isIndeterminate}
          onSelectAll={onSelectAll}
          totalCount={students.length}
          filteredCount={filteredStudents.length}
        />

        {/* Student List */}
        <div className="min-h-96">
          {currentStudents.length > 0 ? (
            currentStudents.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                isSelected={selectedStudents.includes(student.id)}
                onSelect={onSelectStudent}
                onClick={onStudentClick}
              />
            ))
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No students found</p>
                {debouncedSearchTerm && (
                  <p className="text-sm text-gray-400">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredStudents.length}
        />
      </CardContent>
    </Card>
  );
};

export default memo(OptimizedStudentList); 