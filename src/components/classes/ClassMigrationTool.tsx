import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import { useStudentsData } from '@/hooks/useStudentsData';
import { useClassesData } from '@/hooks/useClassesData';
import { classService } from '@/services/class-service';
import { toast } from '@/hooks/use-toast';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  studentCount?: number;
  gradeLevel?: string;
}

export function ClassMigrationTool() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { students, refetch: refetchStudents } = useStudentsData();
  const { classes, refetch: refetchClasses } = useClassesData();
  const queryClient = useQueryClient();

  // Get unassigned students grouped by grade level
  const unassignedStudents = students?.filter(s => !s.class_id) || [];
  const unassignedByGrade = unassignedStudents.reduce((acc, student) => {
    if (!acc[student.grade_level]) {
      acc[student.grade_level] = [];
    }
    acc[student.grade_level].push(student);
    return acc;
  }, {} as Record<string, typeof students>);

  const totalUnassigned = unassignedStudents.length;

  const runMigration = useMutation({
    mutationFn: async () => {
      const steps: MigrationStep[] = [];
      setMigrationProgress(0);
      setIsRunning(true);

      // Create migration steps for each grade level
      for (const [gradeLevel, gradeStudents] of Object.entries(unassignedByGrade)) {
        if (gradeStudents.length === 0) continue;

        // Check if default class exists for this grade
        let defaultClass = classes?.find(c => 
          c.grade_level === gradeLevel && c.name.includes('default')
        );

        // Create default class if it doesn't exist
        if (!defaultClass) {
          defaultClass = await classService.createClass({
            name: `grade-${gradeLevel}-default`,
            display_name: `Grade ${gradeLevel} - Default Class`,
            grade_level: gradeLevel,
            description: `Auto-created default class for Grade ${gradeLevel} students`,
            is_active: true,
          });
        }

        // Assign students to the default class
        const studentIds = gradeStudents.map(s => s.id);
        await classService.assignStudentsToClass(studentIds, defaultClass.id);

        steps.push({
          id: `grade-${gradeLevel}`,
          title: `Grade ${gradeLevel}`,
          description: `Assigned ${gradeStudents.length} students to default class`,
          completed: true,
          studentCount: gradeStudents.length,
          gradeLevel
        });

        setMigrationProgress(prev => prev + (gradeStudents.length / totalUnassigned) * 100);
        setCurrentStep(steps.length);
        setMigrationSteps([...steps]);
      }

      return steps;
    },
    onSuccess: (steps) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      refetchStudents();
      refetchClasses();
      
      toast({
        title: 'Migration Completed',
        description: `Successfully assigned ${totalUnassigned} students to default classes`,
      });
      
      setIsRunning(false);
      setMigrationProgress(100);
    },
    onError: (error) => {
      console.error('Migration failed:', error);
      toast({
        title: 'Migration Failed',
        description: 'There was an error during the migration process',
        variant: 'destructive',
      });
      setIsRunning(false);
    },
  });

  const handleStartMigration = () => {
    setMigrationSteps([]);
    setMigrationProgress(0);
    setCurrentStep(0);
    runMigration.mutate();
  };

  if (totalUnassigned === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            All Students Assigned
          </CardTitle>
          <CardDescription>
            All students have been assigned to classes. No migration needed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Class Migration Tool
          </CardTitle>
          <CardDescription>
            Automatically assign unassigned students to default classes based on their grade level.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{totalUnassigned} students</strong> are not assigned to any class. 
              This tool will create default classes and assign students automatically.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Students to be migrated:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(unassignedByGrade).map(([grade, students]) => (
                <Badge key={grade} variant="outline">
                  Grade {grade}: {students.length} students
                </Badge>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full"
            disabled={isRunning}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Migration
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Class Migration</DialogTitle>
            <DialogDescription>
              This will create default classes for each grade level and assign unassigned students to them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Migration Plan:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                {Object.entries(unassignedByGrade).map(([grade, students]) => (
                  <li key={grade} className="flex items-center justify-between">
                    <span>Grade {grade}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{students.length} students</Badge>
                      <ArrowRight className="h-3 w-3" />
                      <span className="text-xs">Default Class</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {isRunning && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Migration Progress</span>
                  <span>{Math.round(migrationProgress)}%</span>
                </div>
                <Progress value={migrationProgress} />
                
                {migrationSteps.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {migrationSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{step.title}: {step.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isRunning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartMigration}
              disabled={isRunning}
            >
              {isRunning ? 'Migrating...' : 'Start Migration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}