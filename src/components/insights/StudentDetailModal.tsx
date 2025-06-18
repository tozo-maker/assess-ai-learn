
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DSButton,
  DSFlexContainer
} from '@/components/ui/design-system';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentWithPerformance } from '@/types/student';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  students: StudentWithPerformance[];
  title: string;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onOpenChange,
  students,
  title
}) => {
  const navigate = useNavigate();

  const getPerformanceColor = (level?: string) => {
    switch (level) {
      case 'Above Average': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-blue-100 text-blue-800';
      case 'Below Average': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {students.length} student{students.length !== 1 ? 's' : ''} requiring attention
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Performance Level</TableHead>
                <TableHead>Average Score</TableHead>
                <TableHead>Assessments</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const performance = Array.isArray(student.performance) 
                  ? student.performance[0] 
                  : student.performance;
                
                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <DSFlexContainer gap="sm" align="center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar_url} />
                          <AvatarFallback>
                            {getInitials(student.first_name, student.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {student.first_name} {student.last_name}
                          </div>
                          {student.student_id && (
                            <div className="text-sm text-gray-500">
                              ID: {student.student_id}
                            </div>
                          )}
                        </div>
                      </DSFlexContainer>
                    </TableCell>
                    <TableCell>{student.grade_level}</TableCell>
                    <TableCell>
                      <Badge className={getPerformanceColor(performance?.performance_level)}>
                        {performance?.performance_level || 'No Data'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {performance?.average_score 
                        ? `${Math.round(performance.average_score)}%`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {performance?.assessment_count || 0}
                    </TableCell>
                    <TableCell>
                      <DSFlexContainer direction="column" gap="xs">
                        {student.parent_email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-24">
                              {student.parent_email}
                            </span>
                          </div>
                        )}
                        {student.parent_phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <span>{student.parent_phone}</span>
                          </div>
                        )}
                      </DSFlexContainer>
                    </TableCell>
                    <TableCell>
                      <DSFlexContainer gap="xs">
                        <DSButton 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            navigate(`/app/students/${student.id}`);
                            onOpenChange(false);
                          }}
                        >
                          <User className="h-3 w-3 mr-1" />
                          View
                        </DSButton>
                      </DSFlexContainer>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          <DSFlexContainer justify="end" gap="sm" className="pt-4 border-t">
            <DSButton 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </DSButton>
            <DSButton 
              onClick={() => {
                navigate('/app/communications/progress-reports');
                onOpenChange(false);
              }}
            >
              Generate Reports for All
            </DSButton>
          </DSFlexContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailModal;
