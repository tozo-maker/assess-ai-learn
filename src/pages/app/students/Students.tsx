import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, Grid, List } from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSButton,
  DSFlexContainer,
  DSSpacer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

// Enhanced Components
import EnhancedStudentCard from '@/components/students/EnhancedStudentCard';
import StudentFilters, { StudentFilterValues } from '@/components/students/StudentFilters';
import BulkActionsToolbar from '@/components/students/BulkActionsToolbar';
import { studentService } from '@/services/student-service';
import { StudentWithPerformance } from '@/types/student';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
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

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        student.grade_level.toLowerCase().includes(searchTerm) ||
        student.student_id?.toLowerCase().includes(searchTerm)
      );
    }

    // Grade level filter
    if (filters.gradeLevel) {
      filtered = filtered.filter(student => student.grade_level === filters.gradeLevel);
    }

    // Performance level filter
    if (filters.performanceLevel) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return false;
        }
        return student.performance.performance_level === filters.performanceLevel;
      });
    }

    // Needs attention filter
    if (filters.needsAttention !== null) {
      filtered = filtered.filter(student => {
        if (!student.performance || Array.isArray(student.performance)) {
          return !filters.needsAttention;
        }
        return student.performance.needs_attention === filters.needsAttention;
      });
    }

    // Parent contact filter
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

  const handleBulkImport = () => {
    navigate('/app/students/import');
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
    // TODO: Implement bulk email functionality
  };

  const handleBulkReport = () => {
    console.log('Bulk report for students:', selectedStudents);
    // TODO: Implement bulk report functionality
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete for students:', selectedStudents);
    // TODO: Implement bulk delete functionality
  };

  const isAllSelected = selectedStudents.length === filteredStudents.length && filteredStudents.length > 0;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  if (isLoading) {
    return (
      <AppLayout>
        <DSSection>
          <DSPageContainer>
            <Breadcrumbs />
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
              <span className="ml-3 text-gray-600">Loading students...</span>
            </div>
          </DSPageContainer>
        </DSSection>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header */}
          <DSCard className="mb-8">
            <DSCardHeader className="p-6">
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Students
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Manage your students and track their learning progress
                  </DSBodyText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton 
                    variant="secondary" 
                    onClick={handleBulkImport}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students
                  </DSButton>
                  <DSButton 
                    variant="primary"
                    onClick={handleAddStudent}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Filters */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <StudentFilters
                onFiltersChange={setFilters}
                totalStudents={students.length}
                filteredCount={filteredStudents.length}
              />
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
          <DSCard className="mb-6">
            <DSCardContent className="p-4 bg-gray-50">
              <DSFlexContainer justify="between" align="center">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(checkbox) => {
                      if (checkbox) {
                        (checkbox as any).indeterminate = isIndeterminate;
                      }
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
                  />
                  <span className="text-sm font-medium text-gray-600">
                    Select All ({filteredStudents.length} students)
                  </span>
                </div>
                
                {/* View Toggle */}
                <DSFlexContainer gap="xs" className="border border-gray-300 rounded-md p-1 bg-white">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 rounded text-sm transition-colors duration-200
                      ${viewMode === 'list'
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      p-2 rounded text-sm transition-colors duration-200
                      ${viewMode === 'grid'
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          <DSSpacer size="lg" />

          {/* Student List/Grid */}
          {filteredStudents.length > 0 ? (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'space-y-4'
              }
            `}>
              {filteredStudents.map((student) => (
                <EnhancedStudentCard
                  key={student.id}
                  student={student}
                  onStudentClick={handleStudentClick}
                  onSelect={handleSelectStudent}
                  isSelected={selectedStudents.includes(student.id)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          ) : (
            <DSCard>
              <DSCardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <DSPageTitle className="text-xl text-gray-900 mb-2">
                    {students.length === 0 ? 'No students found' : 'No students match your filters'}
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600 mb-6">
                    {students.length === 0 
                      ? 'Get started by adding your first student' 
                      : 'Try adjusting your search terms or filters'
                    }
                  </DSBodyText>
                  {students.length === 0 && (
                    <DSButton onClick={handleAddStudent}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Student
                    </DSButton>
                  )}
                </div>
              </DSCardContent>
            </DSCard>
          )}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Students;
