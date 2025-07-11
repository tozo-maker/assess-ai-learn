import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentsData } from '@/hooks/useStudentsData';
import { Loader2 } from 'lucide-react';

interface StudentSelectorProps {
  onStudentSelect: (studentId: string) => void;
  selectedStudentId?: string;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  onStudentSelect,
  selectedStudentId
}) => {
  const { students, isLoading } = useStudentsData();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading students...</span>
      </div>
    );
  }

  return (
    <Select value={selectedStudentId} onValueChange={onStudentSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a student to analyze" />
      </SelectTrigger>
      <SelectContent>
        {students?.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.first_name} {student.last_name}
            {student.class_id && (
              <span className="text-xs text-muted-foreground ml-2">
                (Grade {student.grade_level})
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};