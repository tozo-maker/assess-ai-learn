
import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudentWithPerformance } from '@/types/student';

interface EnhancedStudentListProps {
  students: StudentWithPerformance[];
  selectedStudents: string[];
  onSelectStudent: (studentId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onStudentClick: (studentId: string) => void;
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 20;

const EnhancedStudentList: React.FC<EnhancedStudentListProps> = ({
  students,
  selectedStudents,
  onSelectStudent,
  onSelectAll,
  onStudentClick,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtered students for performance
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    
    const term = searchTerm.toLowerCase();
    return students.filter(student => 
      student.first_name.toLowerCase().includes(term) ||
      student.last_name.toLowerCase().includes(term) ||
      student.grade_level.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Performance helper function
  const getPerformanceProperty = useCallback(<T extends any>(
    student: StudentWithPerformance,
    property: string, 
    defaultValue: T
  ): T => {
    if (!student.performance || Array.isArray(student.performance)) {
      return defaultValue;
    }
    return (student.performance as any)[property] ?? defaultValue;
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

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
        {/* Search and controls */}
        <div className="p-4 border-b bg-gray-50 space-y-4">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
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
                Select All ({filteredStudents.length} students)
              </span>
            </div>
            
            {/* Pagination info */}
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length}
            </div>
          </div>
        </div>

        {/* Student list */}
        {currentStudents.length > 0 ? (
          <div className="divide-y">
            {currentStudents.map((student) => (
              <div 
                key={student.id} 
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => onSelectStudent(student.id, checked as boolean)}
                    />
                    <div 
                      className="flex items-center space-x-4 cursor-pointer flex-1"
                      onClick={() => onStudentClick(student.id)}
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-blue-600">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{student.grade_level} Grade</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Last Assessment</p>
                      <p className="text-sm font-medium">
                        {getPerformanceProperty(student, 'last_assessment_date', null) 
                          ? new Date(getPerformanceProperty(student, 'last_assessment_date', '')).toLocaleDateString()
                          : "No assessments yet"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Performance</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Above Average' ? 'default' :
                            getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Below Average' ? 'destructive' :
                            getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Average' ? 'secondary' :
                            'outline'
                          }
                        >
                          {getPerformanceProperty(student, 'performance_level', "Not assessed")}
                        </Badge>
                        {getPerformanceProperty(student, 'needs_attention', false) && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              {searchTerm ? 'No students match your search' : 'No students found'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first student'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedStudentList;
