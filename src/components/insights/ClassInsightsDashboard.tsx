import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertTriangle, Award, BookOpen } from 'lucide-react';
import { useStudentsData } from '@/hooks/useStudentsData';
import { useClassesData } from '@/hooks/useClassesData';

export const ClassInsightsDashboard: React.FC = () => {
  const { students, isLoading: studentsLoading } = useStudentsData();
  const { classes, isLoading: classesLoading } = useClassesData();

  const isLoading = studentsLoading || classesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate class statistics
  const totalStudents = students?.length || 0;
  const totalClasses = classes?.length || 0;
  const averageClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

  // Group students by grade level
  const gradeDistribution = students?.reduce((acc, student) => {
    const grade = student.grade_level;
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate performance insights
  const studentsWithGoals = students?.filter(s => s.learning_goals).length || 0;
  const studentsNeedingAttention = students?.filter(s => s.special_considerations).length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              across {totalClasses} classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageClassSize}</div>
            <p className="text-xs text-muted-foreground">
              students per class
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Learning Goals</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithGoals}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0 ? Math.round((studentsWithGoals / totalStudents) * 100) : 0}% of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{studentsNeedingAttention}</div>
            <p className="text-xs text-muted-foreground">
              special considerations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Grade Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(gradeDistribution).map(([grade, count]) => {
              const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
              return (
                <div key={grade} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{grade} Grade</span>
                    <Badge variant="secondary" className="text-xs">
                      {count} students ({Math.round(percentage)}%)
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Class Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Class Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes?.slice(0, 6).map((classItem) => {
                const classStudents = students?.filter(s => s.class_id === classItem.id) || [];
                const studentCount = classStudents.length;
                
                return (
                  <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{classItem.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.subject} • Grade {classItem.grade_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {studentCount} students
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {(classes?.length || 0) > 6 && (
                <p className="text-xs text-muted-foreground text-center">
                  and {classes!.length - 6} more classes...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Requiring Attention */}
      {studentsNeedingAttention > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Students Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {students
                ?.filter(s => s.special_considerations)
                .slice(0, 5)
                .map((student) => (
                  <div key={student.id} className="p-3 border rounded-lg bg-warning/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Grade {student.grade_level}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Special Considerations
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {student.special_considerations}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};