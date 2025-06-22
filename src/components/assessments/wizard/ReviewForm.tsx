
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DSCard, DSCardHeader, DSCardContent, DSCardTitle, DSContentGrid, DSFlexContainer } from '@/components/ui/design-system';

interface ReviewFormProps {
  form: UseFormReturn<any>;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ form }) => {
  const formData = form.watch();

  return (
    <div className="space-y-8">
      <DSCard>
        <DSCardHeader>
          <DSCardTitle>Basic Information</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <DSContentGrid cols={2}>
            <div>
              <span className="text-sm text-gray-600">Title:</span>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Subject:</span>
              <p className="font-medium">{formData.subject}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Grade Level:</span>
              <p className="font-medium">{formData.grade_level}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <p className="font-medium">{formData.assessment_type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <p className="font-medium">{formData.assessment_date}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Max Score:</span>
              <p className="font-medium">{formData.max_score}</p>
            </div>
          </DSContentGrid>
          {formData.description && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">Description:</span>
              <p className="mt-1">{formData.description}</p>
            </div>
          )}
        </DSCardContent>
      </DSCard>
      
      <DSCard>
        <DSCardHeader>
          <DSCardTitle>Assessment Items ({formData.items?.length || 0})</DSCardTitle>
        </DSCardHeader>
        <DSCardContent>
          <div className="space-y-4">
            {formData.items?.map((item: any, index: number) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <DSFlexContainer justify="between" align="start" className="mb-2">
                  <span className="font-medium">Item #{index + 1}</span>
                  <span className="text-sm font-medium text-[#2563eb]">{item.max_score} points</span>
                </DSFlexContainer>
                <p className="text-sm mb-2">{item.question_text}</p>
                <DSFlexContainer gap="md">
                  <span className="text-xs text-gray-500">Type: {item.knowledge_type}</span>
                  <span className="text-xs text-gray-500">Difficulty: {item.difficulty_level}</span>
                </DSFlexContainer>
              </div>
            ))}
          </div>
        </DSCardContent>
      </DSCard>
    </div>
  );
};

export default ReviewForm;
