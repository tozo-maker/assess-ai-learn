import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import { useClassesData } from '@/hooks/useClassesData';
import { classService } from '@/services/class-service';
import { toast } from '@/hooks/use-toast';
import { StudentWithPerformance } from '@/types/student';

interface AssignStudentsToClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStudents: StudentWithPerformance[];
  onSuccess: () => void;
}

export function AssignStudentsToClassDialog({
  open,
  onOpenChange,
  selectedStudents,
  onSuccess
}: AssignStudentsToClassDialogProps) {
  const [selectedClassId, setSelectedClassId] = React.useState<string>('');
  const { classes } = useClassesData();
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: async (classId: string) => {
      const studentIds = selectedStudents.map(s => s.id);
      if (classId === 'unassign') {
        await classService.removeStudentsFromClass(studentIds);
      } else {
        await classService.assignStudentsToClass(studentIds, classId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({
        title: 'Success',
        description: `${selectedStudents.length} student(s) ${selectedClassId === 'unassign' ? 'removed from class' : 'assigned to class'}`,
      });
      setSelectedClassId('');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error assigning students:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign students. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAssign = () => {
    if (!selectedClassId) return;
    assignMutation.mutate(selectedClassId);
  };

  const selectedClass = classes?.find(c => c.id === selectedClassId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Students to Class
          </DialogTitle>
          <DialogDescription>
            Assign {selectedStudents.length} selected student(s) to a class or remove them from their current class.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Students Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Selected Students ({selectedStudents.length})
            </div>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedStudents.map((student) => (
                <Badge key={student.id} variant="secondary" className="text-xs">
                  {student.first_name} {student.last_name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Target Class
            </label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class or unassign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">
                  <span className="text-red-600">Remove from class (Unassign)</span>
                </SelectItem>
                {classes?.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{classItem.display_name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        Grade {classItem.grade_level}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Preview */}
          {selectedClass && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Users className="h-4 w-4" />
                <span className="font-medium">{selectedStudents.length} students</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{selectedClass.display_name}</span>
                <Badge variant="outline" className="text-xs">
                  Grade {selectedClass.grade_level}
                </Badge>
              </div>
            </div>
          )}

          {selectedClassId === 'unassign' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <Users className="h-4 w-4" />
                <span className="font-medium">{selectedStudents.length} students will be unassigned</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!selectedClassId || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Students'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}