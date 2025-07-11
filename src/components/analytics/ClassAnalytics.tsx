import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, GraduationCap, TrendingUp } from 'lucide-react';
import { useClassesData } from '@/hooks/useClassesData';
import { useStudentsData } from '@/hooks/useStudentsData';
import { useQuery } from '@tanstack/react-query';
import { classService } from '@/services/class-service';

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ea580c', '#9333ea', '#0891b2'];

export function ClassAnalytics() {
  const { classes } = useClassesData();
  const { students } = useStudentsData();

  // Calculate class student counts
  const { data: classStats } = useQuery({
    queryKey: ['class-analytics', classes?.map(c => c.id)],
    queryFn: async () => {
      if (!classes) return [];
      
      const stats = await Promise.all(
        classes.map(async (classItem) => {
          const studentCount = await classService.getClassStudentCount(classItem.id);
          return {
            ...classItem,
            studentCount
          };
        })
      );
      
      return stats;
    },
    enabled: !!classes?.length,
  });

  // Prepare data for charts
  const gradeDistribution = classStats?.reduce((acc, classItem) => {
    const existing = acc.find(item => item.grade === classItem.grade_level);
    if (existing) {
      existing.students += classItem.studentCount;
      existing.classes += 1;
    } else {
      acc.push({
        grade: classItem.grade_level,
        students: classItem.studentCount,
        classes: 1
      });
    }
    return acc;
  }, [] as Array<{ grade: string; students: number; classes: number }>) || [];

  const classData = classStats?.map(classItem => ({
    name: classItem.display_name,
    students: classItem.studentCount,
    grade: classItem.grade_level,
    subject: classItem.subject || 'General'
  })) || [];

  const totalStudents = students?.length || 0;
  const totalClasses = classes?.length || 0;
  const assignedStudents = students?.filter(s => s.class_id)?.length || 0;
  const unassignedStudents = totalStudents - assignedStudents;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Across {gradeDistribution.length} grade levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedStudents}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0 ? Math.round((assignedStudents / totalStudents) * 100) : 0}% of total students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClasses > 0 ? Math.round(assignedStudents / totalClasses) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {unassignedStudents > 0 && `${unassignedStudents} unassigned`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Students by Grade Level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Class Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, students }) => `${name}: ${students}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {classStats?.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">{classItem.display_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">Grade {classItem.grade_level}</Badge>
                      {classItem.subject && (
                        <Badge variant="secondary">{classItem.subject}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{classItem.studentCount}</div>
                  <div className="text-sm text-muted-foreground">students</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}