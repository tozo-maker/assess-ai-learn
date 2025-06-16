
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentWithPerformance } from '@/types/student';

interface StudentInfoCardProps {
  student: StudentWithPerformance;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Student Information</CardTitle>
        <CardDescription>Details about the selected student</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${student?.email || student?.first_name}.png`} />
            <AvatarFallback>{student?.first_name[0]}{student?.last_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{student?.first_name} {student?.last_name}</h3>
            <p className="text-sm text-gray-500">Student ID: {student?.student_id}</p>
          </div>
        </div>
        <div>
          {student?.email && <p>Email: {student.email}</p>}
          <p>Grade Level: {student?.grade_level}</p>
          {student?.parent_name && <p>Parent Name: {student.parent_name}</p>}
          {student?.parent_email && <p>Parent Email: {student.parent_email}</p>}
          {student?.parent_phone && <p>Parent Phone: {student.parent_phone}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentInfoCard;
