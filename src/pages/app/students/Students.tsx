
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  MoreVertical
} from 'lucide-react';
import { studentService } from '@/services/student-service';
import { StudentWithPerformance, gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import { useToast } from '@/hooks/use-toast';
import ExportButton from '@/components/exports/ExportButton';

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
  
  // Fetch students data
  const { 
    data: students, 
    isLoading: isStudentsLoading, 
    error: studentsError,
    refetch: refetchStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentService.getStudents(),
  });
  
  // Fetch metrics data
  const { 
    data: metrics, 
    isLoading: isMetricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['studentMetrics'],
    queryFn: () => studentService.getStudentMetrics(),
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

  const actions = (
    <>
      <ExportButton
        exportType="student_data"
        buttonText="Export Students"
        variant="outline"
      />
      <Link to="/app/students/import">
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Import Students</span>
        </Button>
      </Link>
      <Link to="/app/students/add">
        <Button className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </Button>
      </Link>
    </>
  );

  // Helper function to safely access performance properties
  const getPerformanceProperty = <T extends any>(
    student: StudentWithPerformance,
    property: string, 
    defaultValue: T
  ): T => {
    if (!student.performance) {
      return defaultValue;
    }
    
    if (Array.isArray(student.performance)) {
      return defaultValue;
    }
    
    return (student.performance as any)[property] ?? defaultValue;
  };

  const isAllSelected = students && selectedStudents.length === students.length && students.length > 0;

  return (
    <PageShell 
      title="Students" 
      description="Manage your students and track their progress"
      icon={<Users className="h-6 w-6 text-blue-600" />}
      actions={actions}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search students..." 
              className="pl-10" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={gradeFilter || undefined} onValueChange={(value) => setGradeFilter(value === 'all' ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Grade Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {gradeLevelOptions.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex space-x-2">
            <Select value={performanceFilter || undefined} onValueChange={(value) => setPerformanceFilter(value === 'all' ? undefined : value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                {performanceLevelOptions.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleFilterChange}>Apply</Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedStudents.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedStudents.length} student(s) selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedStudents([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  {isMetricsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{metrics?.totalStudents || 0}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Need Attention</p>
                  {isMetricsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold text-red-600">
                      {metrics?.studentsNeedingAttention || 0}
                    </p>
                  )}
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Above Average</p>
                  {isMetricsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold text-green-600">
                      {metrics?.aboveAverageCount || 0}
                    </p>
                  )}
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Performance</p>
                  {isMetricsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{metrics?.averagePerformance || "N/A"}</p>
                  )}
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <Card>
          <CardContent className="p-0">
            {isStudentsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <div>
                {/* Header with Select All */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      ref={selectAllRef}
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Select All Students
                    </span>
                  </div>
                </div>
                
                {/* Students List */}
                <div className="divide-y">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                          />
                          <div 
                            className="flex items-center space-x-4 cursor-pointer flex-1"
                            onClick={() => handleStudentClick(student.id)}
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
                              <span className={`text-sm font-medium ${
                                getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Above Average' ? 'text-green-600' :
                                getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Below Average' ? 'text-red-600' :
                                getPerformanceProperty<string | null>(student, 'performance_level', null) === 'Average' ? 'text-yellow-600' :
                                'text-gray-500'
                              }`}>
                                {getPerformanceProperty(student, 'performance_level', "Not assessed")}
                              </span>
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
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">No students found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first student</p>
                <Button 
                  onClick={() => navigate('/app/students/add')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Student
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
};

export default Students;
