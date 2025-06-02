
import React from 'react';
import { Download, Mail } from 'lucide-react';
import {
  DSButton,
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSBodyText,
  DSSpacer
} from '@/components/ui/design-system';

interface ReportGenerationActionsProps {
  selectedCount: number;
  isGenerating: boolean;
  onGeneratePDF: () => void;
  onEmailToParents: () => void;
}

const ReportGenerationActions: React.FC<ReportGenerationActionsProps> = ({
  selectedCount,
  isGenerating,
  onGeneratePDF,
  onEmailToParents
}) => {
  return (
    <DSCard>
      <DSCardContent className="p-6">
        <DSFlexContainer gap="md" className="flex-col sm:flex-row">
          <DSButton 
            onClick={onGeneratePDF}
            disabled={isGenerating || selectedCount === 0}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate PDF Reports'}
          </DSButton>
          
          <DSButton 
            onClick={onEmailToParents}
            disabled={isGenerating || selectedCount === 0}
            variant="secondary"
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isGenerating ? 'Sending...' : 'Email to Parents'}
          </DSButton>
        </DSFlexContainer>

        {selectedCount > 0 && (
          <>
            <DSSpacer size="sm" />
            <DSBodyText className="text-center text-gray-600">
              {selectedCount} student{selectedCount > 1 ? 's' : ''} selected
            </DSBodyText>
          </>
        )}
      </DSCardContent>
    </DSCard>
  );
};

export default ReportGenerationActions;
