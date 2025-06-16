
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';
import { useDebounce, usePerformanceMonitor } from '@/hooks/usePerformanceOptimization';
import { logger } from '@/services/logger';
import { 
  ScreenReaderAnnouncer, 
  useFocusManagement, 
  useKeyboardNavigation,
  useReducedMotion 
} from '@/utils/accessibility';

interface AccessibleStudentListProps {
  students: StudentWithPerformance[];
  selectedStudents: string[];
  onSelectStudent: (studentId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onStudentClick: (studentId: string) => void;
  isLoading?: boolean;
}

// Accessible student row component
const AccessibleStudentRow = memo<{
  student: StudentWithPerformance;
  isSelected: boolean;
  onSelect: (studentId: string, checked: boolean) => void;
  onClick: (studentId: string) => void;
  isActive: boolean;
  onKeyDown: (e: React.KeyboardEvent) => void;
  setRef: (ref: HTMLElement | null) => void;
}>(({ student, isSelected, onSelect, onClick, isActive, onKeyDown, setRef }) => {
  const { logPerformance } = usePerformanceMonitor('AccessibleStudentRow');
  const announcer = ScreenReaderAnnouncer.getInstance();

  const handleSelect = useCallback((checked: boolean) => {
    logPerformance('select', Date.now());
    onSelect(student.id, checked);
    
    // Announce selection change
    const action = checked ? 'selected' : 'deselected';
    announcer.announce(`${student.first_name} ${student.last_name} ${action}`);
  }, [student.id, student.first_name, student.last_name, onSelect, logPerformance, announcer]);

  const handleClick = useCallback(() => {
    logPerformance('click', Date.now());
    onClick(student.id);
    announcer.announce(`Opening details for ${student.first_name} ${student.last_name}`);
  }, [student.id, student.first_name, student.last_name, onClick, logPerformance, announcer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle space for selection
    if (e.key === ' ') {
      e.preventDefault();
      handleSelect(!isSelected);
      return;
    }
    
    // Handle enter for opening details
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClick();
      return;
    }

    // Pass other keys to navigation handler
    onKeyDown(e);
  }, [handleSelect, handleClick, isSelected, onKeyDown]);

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
    const riskLabels = {
      high: 'High Risk',
      medium: 'Medium Risk', 
      low: 'Low Risk',
      unknown: 'Unknown Risk'
    };

    const label = riskLabels[riskLevel as keyof typeof riskLabels] || riskLabels.unknown;

    switch (riskLevel) {
      case 'high':
        return <Badge variant="destructive" aria-label={label}>{label}</Badge>;
      case 'medium':
        return <Badge variant="secondary" aria-label={label}>{label}</Badge>;
      case 'low':
        return <Badge variant="outline" aria-label={label}>{label}</Badge>;
      default:
        return <Badge variant="outline" aria-label={label}>{label}</Badge>;
    }
  }, []);

  // Create list item attributes manually
  const studentName = `${student.first_name} ${student.last_name}`;
  const studentInfo = `Grade ${student.grade_level}, ID: ${student.student_id || 'N/A'}`;
  const performanceInfo = `Average score: ${performanceData.averageScore.toFixed(1)}%, Risk level: ${performanceData.riskLevel}`;
  
  return (
    <div 
      ref={setRef}
      className={`
        flex items-center gap-4 p-4 border-b transition-colors
        ${isActive ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-gray-50'}
        focus:outline-none focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:ring-inset
      `}
      onKeyDown={handleKeyDown}
      aria-label={`Student: ${studentName}. ${studentInfo}. ${performanceInfo}. ${isSelected ? 'Selected' : 'Not selected'}`}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={handleSelect}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${studentName}`}
        tabIndex={-1} // Managed by parent navigation
      />
      
      <div 
        className="flex-1 flex items-center gap-4 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={-1} // Managed by parent navigation
        aria-label={`View details for ${studentName}`}
      >
        {/* Avatar */}
        <div 
          className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-sm font-medium text-blue-600">
            {student.first_name[0]}{student.last_name[0]}
          </span>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">
              {studentName}
            </h3>
            {performanceData.riskLevel === 'high' && (
              <AlertCircle 
                className="h-4 w-4 text-red-500" 
                aria-label="High risk student"
              />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {studentInfo}
          </p>
        </div>

        {/* Performance Info */}
        <div className="hidden md:flex items-center gap-4" aria-label={performanceInfo}>
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

AccessibleStudentRow.displayName = 'AccessibleStudentRow';

// Accessible search controls
const AccessibleSearchControls = memo<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  totalCount: number;
  filteredCount: number;
  searchId: string;
}>(({ 
  searchTerm, 
  onSearchChange, 
  isAllSelected, 
  isIndeterminate, 
  onSelectAll, 
  totalCount, 
  filteredCount,
  searchId
}) => {
  const announcer = ScreenReaderAnnouncer.getInstance();

  const handleSelectAll = useCallback((checked: boolean) => {
    onSelectAll(checked);
    const action = checked ? 'selected' : 'deselected';
    announcer.announce(`All ${filteredCount} students ${action}`);
  }, [onSelectAll, filteredCount, announcer]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  return (
    <div className="p-4 border-b bg-gray-50 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <Input
          id={searchId}
          placeholder="Search students by name, grade, or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 max-w-sm"
          aria-label="Search students"
          aria-describedby={`${searchId}-description`}
        />
        <div id={`${searchId}-description`} className="sr-only">
          Search through {totalCount} students by name, grade level, or student ID
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={isAllSelected}
            ref={(checkbox) => {
              if (checkbox) {
                (checkbox as any).indeterminate = isIndeterminate;
              }
            }}
            onCheckedChange={handleSelectAll}
            aria-label={`Select all ${filteredCount} students`}
            aria-describedby="select-all-description"
          />
          <span 
            id="select-all-description"
            className="text-sm font-medium text-gray-600"
          >
            Select All ({filteredCount} of {totalCount} students)
          </span>
        </div>
      </div>
    </div>
  );
});

AccessibleSearchControls.displayName = 'AccessibleSearchControls';

// Accessible pagination component
const AccessiblePagination = memo<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}>(({ currentPage, totalPages, onPageChange, startIndex, endIndex, totalItems }) => {
  const announcer = ScreenReaderAnnouncer.getInstance();

  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
    announcer.announce(`Navigated to page ${page} of ${totalPages}`);
  }, [onPageChange, totalPages, announcer]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  if (totalPages <= 1) return null;

  return (
    <nav 
      className="flex items-center justify-between p-4 border-t bg-gray-50"
      aria-label="Student list pagination"
    >
      <div className="text-sm text-gray-500" aria-live="polite">
        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} students
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label={`Go to previous page, page ${currentPage - 1}`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        
        <span className="text-sm text-gray-600" aria-current="page">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label={`Go to next page, page ${currentPage + 1}`}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
});

AccessiblePagination.displayName = 'AccessiblePagination';

const ITEMS_PER_PAGE = 25;

const AccessibleStudentList: React.FC<AccessibleStudentListProps> = ({
  students,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onStudentClick,
  isLoading = false
}) => {
  const { logPerformance } = usePerformanceMonitor('AccessibleStudentList');
  const { focusRef } = useFocusManagement();
  const prefersReducedMotion = useReducedMotion();
  const announcer = ScreenReaderAnnouncer.getInstance();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate unique IDs for accessibility
  const searchId = useMemo(() => `student-search-${Math.random().toString(36).substr(2, 9)}`, []);
  const listId = useMemo(() => `student-list-${Math.random().toString(36).substr(2, 9)}`, []);

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
    }, 'AccessibleStudentList');
    
    return filtered;
  }, [students, debouncedSearchTerm, logPerformance]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Keyboard navigation for student list
  const {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    setItemRef
  } = useKeyboardNavigation(
    currentStudents,
    (index) => {
      const student = currentStudents[index];
      if (student) {
        onStudentClick(student.id);
      }
    }
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
    setActiveIndex(-1);
  }, [debouncedSearchTerm, setActiveIndex]);

  // Announce search results
  useEffect(() => {
    if (debouncedSearchTerm) {
      const message = filteredStudents.length === 0 
        ? `No students found for "${debouncedSearchTerm}"`
        : `Found ${filteredStudents.length} students matching "${debouncedSearchTerm}"`;
      announcer.announce(message);
    }
  }, [debouncedSearchTerm, filteredStudents.length, announcer]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setActiveIndex(-1);
    
    // Smooth scroll with reduced motion consideration
    window.scrollTo({ 
      top: 0, 
      behavior: prefersReducedMotion ? 'auto' : 'smooth' 
    });
    
    logPerformance('page-change', Date.now());
  }, [logPerformance, prefersReducedMotion, setActiveIndex]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Memoized selection state
  const selectionState = useMemo(() => {
    const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
    const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;
    return { isAllSelected, isIndeterminate };
  }, [selectedStudents.length, filteredStudents.length]);

  // Loading state with proper accessibility
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div 
            className="space-y-4"
            role="status"
            aria-label="Loading students"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4" aria-hidden="true">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
          <span className="sr-only">Loading student list...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <AccessibleSearchControls
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          isAllSelected={selectionState.isAllSelected}
          isIndeterminate={selectionState.isIndeterminate}
          onSelectAll={onSelectAll}
          totalCount={students.length}
          filteredCount={filteredStudents.length}
          searchId={searchId}
        />

        {/* Student List */}
        <div 
          id={listId}
          className="min-h-96"
          role="listbox"
          aria-multiselectable="true"
          aria-activedescendant={activeIndex >= 0 ? `student-${activeIndex}` : undefined}
          onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
          tabIndex={0}
          ref={focusRef as React.RefObject<HTMLDivElement>}
          aria-label={`Student list with ${currentStudents.length} students on page ${currentPage} of ${totalPages}`}
        >
          {currentStudents.length > 0 ? (
            currentStudents.map((student, index) => (
              <AccessibleStudentRow
                key={student.id}
                student={student}
                isSelected={selectedStudents.includes(student.id)}
                onSelect={onSelectStudent}
                onClick={onStudentClick}
                isActive={index === activeIndex}
                onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
                setRef={setItemRef(index)}
              />
            ))
          ) : (
            <div 
              className="flex items-center justify-center py-12"
              role="status"
              aria-live="polite"
            >
              <div className="text-center">
                <p className="text-gray-500 mb-2">No students found</p>
                {debouncedSearchTerm && (
                  <p className="text-sm text-gray-400">
                    Try adjusting your search criteria for "{debouncedSearchTerm}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <AccessiblePagination
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

export default memo(AccessibleStudentList);
