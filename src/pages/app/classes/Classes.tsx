import React, { useState } from 'react';
import { Plus, Users, GraduationCap, Settings, BarChart3 } from 'lucide-react';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassesData } from '@/hooks/useClassesData';
import PageLoadingState from '@/components/common/PageLoadingState';
import PageErrorState from '@/components/common/PageErrorState';
import { CreateClassDialog } from '@/components/classes/CreateClassDialog';
import { EditClassDialog } from '@/components/classes/EditClassDialog';
import { ClassMigrationTool } from '@/components/classes/ClassMigrationTool';
import { ClassOptimizationDashboard } from '@/components/classes/ClassOptimizationDashboard';
import { classService } from '@/services/class-service';
import { useQuery } from '@tanstack/react-query';
import { Class } from '@/types/student';

export default function Classes() {
  const { classes, isLoading, error, refetch } = useClassesData();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Fetch student counts for each class
  const { data: classCounts } = useQuery({
    queryKey: ['class-student-counts', classes?.map(c => c.id)],
    queryFn: async () => {
      if (!classes) return {};
      const counts: Record<string, number> = {};
      for (const classItem of classes) {
        counts[classItem.id] = await classService.getClassStudentCount(classItem.id);
      }
      return counts;
    },
    enabled: !!classes?.length,
  });

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setEditDialogOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await classService.deleteClass(classId);
      refetch();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  if (isLoading) {
    return <PageLoadingState message="Loading classes..." />;
  }

  if (error) {
    return (
      <PageErrorState 
        error={error} 
        onRetry={refetch}
        title="Failed to load classes"
      />
    );
  }

  const groupedClasses = classes?.reduce((acc, classItem) => {
    if (!acc[classItem.grade_level]) {
      acc[classItem.grade_level] = [];
    }
    acc[classItem.grade_level].push(classItem);
    return acc;
  }, {} as Record<string, Class[]>) || {};

  return (
    <StandardPageLayout
      title="Classes"
      description="Manage and organize your student classes"
      actions={
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Migration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {(!classes || classes.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-sm">
                  Create your first class to start organizing your students by grade level and subject.
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedClasses).map(([gradeLevel, gradeClasses]) => (
                <div key={gradeLevel} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Grade {gradeLevel}</h2>
                    <Badge variant="secondary">{gradeClasses.length} classes</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gradeClasses.map((classItem) => (
                      <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{classItem.display_name}</CardTitle>
                              <div className="mt-1 flex items-center gap-2">
                                {classItem.subject && (
                                  <Badge variant="outline">
                                    {classItem.subject}
                                  </Badge>
                                )}
                                <CardDescription>
                                  Grade {classItem.grade_level}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Users className="h-4 w-4" />
                            <span>
                              {classCounts?.[classItem.id] ?? 0} students
                            </span>
                          </div>
                          
                          {classItem.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {classItem.description}
                            </p>
                          )}
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClass(classItem)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClass(classItem.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization">
          <ClassOptimizationDashboard />
        </TabsContent>

        <TabsContent value="migration">
          <ClassMigrationTool />
        </TabsContent>
      </Tabs>
      <CreateClassDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          refetch();
        }}
      />

      {selectedClass && (
        <EditClassDialog 
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          classData={selectedClass}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedClass(null);
            refetch();
          }}
        />
      )}
    </StandardPageLayout>
  );
}