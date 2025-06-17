import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, Grid, List, Users, Filter } from 'lucide-react';

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
  DSBodyText,
  DSHelpText
} from '@/components/ui/design-system';

// Enhanced Components
import EnhancedStudentCardRedesigned from '@/components/students/EnhancedStudentCardRedesigned';
import StudentFilters, { StudentFilterValues } from '@/components/students/StudentFilters';
import BulkActionsToolbar from '@/components/students/BulkActionsToolbar';
import StudentsOverviewMetrics from '@/components/students/StudentsOverviewMetrics';
import StudentsAlertSystem from '@/components/students/StudentsAlertSystem';
import { studentService } from '@/services/student-service';
import { StudentWithPerformance } from '@/types/student';

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
          
          {/* Enhanced Page Header */}
          <DSCard className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
            <DSCardHeader className="p-8">
              <DSFlexContainer justify="between" align="center" className="flex-col lg:flex-row gap-6">
                <div className="text-center lg:text-left">
                  <DSPageTitle className="text-4xl font-bold text-gray-900 mb-3">
                    Students
                  </DSPageTitle>
                  <DSBodyText className="text-lg text-gray-600 max-w-2xl">
                    Manage your students and track their learning progress with comprehensive insights and analytics
                  </DSBodyText>
                  <DSHelpText className="mt-2 text-sm">
                    {students.length} total students • {filteredStudents.length} currently shown
                  </DSHelpText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton 
                    variant="secondary" 
                    onClick={handleBulkImport}
                    className="whitespace-nowrap"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students
                  </DSButton>
                  <DSButton 
                    variant="primary"
                    onClick={handleAddStudent}
                    className="whitespace-nowrap"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Overview Metrics */}
          <StudentsOverviewMetrics />

          {/* Alert System */}
          <StudentsAlertSystem />

          {/* Enhanced Filters */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <DSFlexContainer justify="between" align="center" className="mb-4">
                <DSBodyText className="font-medium text-gray-700">
                  Filter & Search Students
                </DSBodyText>
                <DSButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </DSButton>
              </DSFlexContainer>
              
              {(showFilters || filters.search || filters.gradeLevel || filters.performanceLevel) && (
                <StudentFilters
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

          {/* Enhanced View Controls */}
          <DSCard className="mb-6">
            <DSCardContent className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
              <DSFlexContainer justify="between" align="center">
                <DSFlexContainer align="center" gap="md">
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
                  <DSBodyText className="font-medium text-gray-700">
                    Select All
                  </DSBodyText>
                  <DSHelpText className="hidden sm:block">
                    ({filteredStudents.length} students)
                  </DSHelpText>
                </DSFlexContainer>
                
                {/* Enhanced View Toggle */}
                <DSFlexContainer gap="xs" className="border border-gray-300 rounded-lg p-1 bg-white shadow-sm">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2
                      ${viewMode === 'list'
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      p-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2
                      ${viewMode === 'grid'
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          <DSSpacer size="lg" />

          {/* Enhanced Student Grid/List with 4-column grid layout */}
          {filteredStudents.length > 0 ? (
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
                : 'space-y-6'
              }
            `}>
              {filteredStudents.map((student) => (
                <EnhancedStudentCardRedesigned
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
            <DSCard className="border-2 border-dashed border-gray-300">
              <DSCardContent>
                <div className="text-center py-16">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <DSPageTitle className="text-2xl text-gray-900 mb-3">
                    {students.length === 0 ? 'No students found' : 'No students match your filters'}
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600 mb-8 max-w-md mx-auto">
                    {students.length === 0 
                      ? 'Get started by adding your first student to begin tracking their learning journey' 
                      : 'Try adjusting your search terms or filters to find the students you\'re looking for'
                    }
                  </DSBodyText>
                  {students.length === 0 && (
                    <DSButton onClick={handleAddStudent} size="lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Add Your First Student
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
