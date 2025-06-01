
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Upload, 
  User, 
  TrendingUp, 
  AlertCircle,
  Trash2,
  X
} from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSFlexContainer,
  DSButton,
  DSCard,
  DSCardContent,
  DSSpacer,
  DSContentGrid
} from '@/components/ui/design-system';

// Original Components
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { studentService } from '@/services/student-service';
import { gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import { useToast } from '@/hooks/use-toast';
import ExportButton from '@/components/exports/ExportButton';
import EnhancedStudentList from '@/components/students/EnhancedStudentList';
import { withPerformanceTracking } from '@/services/performance-service';

const Students = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | undefined>(undefined);
  const [performanceFilter, setPerformanceFilter] = useState<string | undefined>(undefined);
  const [attentionFilter, setAttentionFilter] = useState<boolean | undefined>(undefined);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const selectAllRef = useRef<HTMLButtonElement>(null);
  
  // Enhanced fetch with performance tracking
  const fetchStudentsWithTracking = withPerformanceTracking(
    studentService.getStudents,
    '/api/students',
    'GET'
  );
  
  const fetchMetricsWithTracking = withPerformanceTracking(
    studentService.getStudentMetrics,
    '/api/student-metrics',
    'GET'
  );
  
  // Fetch students data
  const { 
    data: students, 
    isLoading: isStudentsLoading, 
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudentsWithTracking,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
  
  // Fetch metrics data
  const { 
    data: metrics, 
    isLoading: isMetricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['studentMetrics'],
    queryFn: fetchMetricsWithTracking,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Handle bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked && students) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  // Handle student navigation
  const handleStudentClick = (studentId: string) => {
    console.log('Students: Navigating to student details:', studentId);
    console.log('Students: Using navigation path:', `/app/students/${studentId}`);
    navigate(`/app/students/${studentId}`);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsDeleting(true);
    try {
      // Delete students one by one
      await Promise.all(
        selectedStudents.map(studentId => studentService.deleteStudent(studentId))
      );
      
      toast({
        title: "Students deleted",
        description: `${selectedStudents.length} student(s) have been successfully deleted.`,
      });
      
      setSelectedStudents([]);
      refetchStudents();
    } catch (error) {
      console.error("Error deleting students:", error);
      toast({
        title: "Error deleting students",
        description: "There was an error deleting the selected students.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle search submit
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      refetchStudents();
      return;
    }
    
    try {
      const searchResults = await studentService.searchStudents(searchQuery);
      console.log(searchResults);
    } catch (error) {
      console.error("Error searching:", error);
      toast({
        title: "Search failed",
        description: "There was an error searching for students.",
        variant: "destructive"
      });
    }
  };
  
  // Handle filter change
  const handleFilterChange = async () => {
    try {
      const filters = {
        grade_level: gradeFilter === 'all' ? undefined : gradeFilter,
        performance_level: performanceFilter === 'all' ? undefined : performanceFilter,
        needs_attention: attentionFilter
      };
      
      const filteredStudents = await studentService.getStudentsByFilter(filters);
      console.log(filteredStudents);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast({
        title: "Filter failed",
        description: "There was an error applying the filters.",
        variant: "destructive"
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setGradeFilter(undefined);
    setPerformanceFilter(undefined);
    setAttentionFilter(undefined);
    refetchStudents();
  };

  const hasActiveFilters = searchQuery || gradeFilter || performanceFilter || attentionFilter !== undefined;
  
  // Error handling
  useEffect(() => {
    if (studentsError || metricsError) {
      toast({
        title: "Error loading data",
        description: "There was a problem loading the student data.",
        variant: "destructive"
      });
    }
  }, [studentsError, metricsError, toast]);

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current;
      const isIndeterminate = selectedStudents.length > 0 && (!students || selectedStudents.length < students.length);
      (checkbox as any).indeterminate = isIndeterminate;
    }
  }, [selectedStudents.length, students]);

  const isAllSelected = students && selectedStudents.length === students.length && students.length > 0;

  return (
    <AppLayout>
      <Breadcrumbs />
      <DSSection>
        <DSPageContainer>
          {/* Page Header - Following Design System */}
          <DSFlexContainer justify="between" align="center" className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
              {isStudentsLoading ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <p className="text-base text-gray-600">
                  {students?.length || 0} students in your class
                </p>
              )}
            </div>
            <DSFlexContainer gap="sm">
              <DSButton variant="secondary">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </DSButton>
              <Link to="/app/students/add">
                <DSButton variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </DSButton>
              </Link>
            </DSFlexContainer>
          </DSFlexContainer>

          {/* Filter Bar - Consistent Input Styling */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6">
              <DSFlexContainer direction="col" gap="md">
                {/* Search and Main Filters */}
                <DSContentGrid cols={4}>
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search students..." 
                      className="pl-10 h-10" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Select value={gradeFilter || undefined} onValueChange={(value) => setGradeFilter(value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Grade Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {gradeLevelOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={performanceFilter || undefined} onValueChange={(value) => setPerformanceFilter(value === 'all' ? undefined : value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Performance</SelectItem>
                      {performanceLevelOptions.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DSContentGrid>

                {/* Filter Chips and Clear */}
                {hasActiveFilters && (
                  <DSFlexContainer align="center" gap="sm" className="flex-wrap">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchQuery && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        Search: "{searchQuery}"
                        <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-gray-900">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {gradeFilter && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        Grade: {gradeFilter}
                        <button onClick={() => setGradeFilter(undefined)} className="ml-1 hover:text-gray-900">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {performanceFilter && (
                      <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        Performance: {performanceFilter}
                        <button onClick={() => setPerformanceFilter(undefined)} className="ml-1 hover:text-gray-900">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  </DSFlexContainer>
                )}
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          {/* Bulk Actions Bar */}
          {selectedStudents.length > 0 && (
            <DSCard className="border-blue-200 bg-blue-50 mb-6">
              <DSCardContent className="p-4">
                <DSFlexContainer justify="between" align="center">
                  <p className="font-medium text-blue-900">
                    {selectedStudents.length} student(s) selected
                  </p>
                  <DSFlexContainer gap="sm">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DSButton 
                          variant="danger" 
                          size="sm"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </DSButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Students</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedStudents.length} student(s)? 
                            This action cannot be undone and will remove all associated data including assessments and performance records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Students
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <DSButton 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                    >
                      Clear Selection
                    </DSButton>
                  </DSFlexContainer>
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          )}

          {/* Quick Stats - Standardized Cards */}
          <DSContentGrid cols={4} className="mb-8">
            <DSCard>
              <DSCardContent className="p-6">
                <DSFlexContainer justify="between" align="center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Students</p>
                    {isMetricsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">{metrics?.totalStudents || 0}</div>
                    )}
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
            <DSCard>
              <DSCardContent className="p-6">
                <DSFlexContainer justify="between" align="center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Need Attention</p>
                    {isMetricsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold text-red-600">
                        {metrics?.studentsNeedingAttention || 0}
                      </div>
                    )}
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
            <DSCard>
              <DSCardContent className="p-6">
                <DSFlexContainer justify="between" align="center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Above Average</p>
                    {isMetricsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold text-green-600">
                        {metrics?.aboveAverageCount || 0}
                      </div>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
            <DSCard>
              <DSCardContent className="p-6">
                <DSFlexContainer justify="between" align="center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Performance</p>
                    {isMetricsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">{metrics?.averagePerformance || "N/A"}</div>
                    )}
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          </DSContentGrid>

          {/* Enhanced Students List */}
          <EnhancedStudentList
            students={students || []}
            selectedStudents={selectedStudents}
            onSelectStudent={handleSelectStudent}
            onSelectAll={handleSelectAll}
            onStudentClick={handleStudentClick}
            isLoading={isStudentsLoading}
          />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Students;
