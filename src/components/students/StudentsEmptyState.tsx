
import React from 'react';
import { Plus, Users } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSButton,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

interface StudentsEmptyStateProps {
  totalStudents: number;
  onAddStudent: () => void;
}

const StudentsEmptyState: React.FC<StudentsEmptyStateProps> = ({
  totalStudents,
  onAddStudent
}) => {
  return (
    <DSCard className="border-2 border-dashed border-gray-300">
      <DSCardContent>
        <div className="text-center py-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-blue-600" />
          </div>
          <DSPageTitle className="text-2xl text-gray-900 mb-3">
            {totalStudents === 0 ? 'No students found' : 'No students match your filters'}
          </DSPageTitle>
          <DSBodyText className="text-gray-600 mb-8 max-w-md mx-auto">
            {totalStudents === 0 
              ? 'Get started by adding your first student to begin tracking their learning journey' 
              : 'Try adjusting your search terms or filters to find the students you\'re looking for'
            }
          </DSBodyText>
          {totalStudents === 0 && (
            <DSButton onClick={onAddStudent} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Student
            </DSButton>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default StudentsEmptyState;
