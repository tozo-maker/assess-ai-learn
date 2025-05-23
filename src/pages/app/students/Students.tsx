
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Clock
} from 'lucide-react';
import { studentService } from '@/services/student-service';
import { StudentWithPerformance, gradeLevelOptions, performanceLevelOptions } from '@/types/student';
import { useToast } from '@/hooks/use-toast';

const Students = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | undefined>(undefined);
  const [performanceFilter, setPerformanceFilter] = useState<string | undefined>(undefined);
  const [attentionFilter, setAttentionFilter] = useState<boolean | undefined>(undefined);
  
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
  
  // Handle search submit
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      refetchStudents();
      return;
    }
    
    try {
      const searchResults = await studentService.searchStudents(searchQuery);
      // We'll handle this in a more elegant way in a real app
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
      // We'll handle this in a more elegant way in a real app
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

  const actions = (
    <>
      <Link to="/students/import">
        <Button variant="outline" className="flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Import Students</span>
        </Button>
      </Link>
      <Link to="/students/add">
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
    
    // If performance is an array, we don't have proper data yet
    if (Array.isArray(student.performance)) {
      return defaultValue;
    }
    
    // Now TypeScript knows student.performance is an object
    return (student.performance as any)[property] ?? defaultValue;
  };

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
              <div className="divide-y">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/students/${student.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
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
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">No students found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first student</p>
                <Button 
                  onClick={() => navigate('/students/add')}
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
