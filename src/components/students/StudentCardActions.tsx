
import React from 'react';
import { Eye, MoreHorizontal, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DSButton, DSFlexContainer } from '@/components/ui/design-system';

interface StudentCardActionsProps {
  studentId: string;
  onStudentClick: (studentId: string) => void;
  isHovered: boolean;
}

const StudentCardActions: React.FC<StudentCardActionsProps> = ({
  studentId,
  onStudentClick,
  isHovered
}) => {
  return (
    <div className={`transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'}`}>
      <DSFlexContainer justify="end" gap="xs">
        <DSButton 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onStudentClick(studentId);
          }}
          className="text-xs bg-white shadow-sm hover:shadow-md px-3 py-1"
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </DSButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DSButton 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 bg-white shadow-sm hover:shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </DSButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-lg border">
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Email Parent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DSFlexContainer>
    </div>
  );
};

export default StudentCardActions;
