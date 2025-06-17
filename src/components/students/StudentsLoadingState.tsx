
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import { DSSection, DSPageContainer, DSBodyText } from '@/components/ui/design-system';

const StudentsLoadingState: React.FC = () => {
  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#2563eb] mx-auto mb-4"></div>
              <DSBodyText className="text-gray-600">Loading students...</DSBodyText>
            </div>
          </div>
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default StudentsLoadingState;
