
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';
import ListPageLayout from '@/components/layouts/ListPageLayout';

// Design System Components
import { DSButton } from '@/components/ui/design-system';

import AssessmentList from '@/components/assessments/AssessmentList';

const Assessments: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Breadcrumbs />
      <ListPageLayout
        title="Assessments"
        description="Manage and analyze student assessments"
        primaryAction={{
          label: "New Assessment",
          onClick: () => navigate('/app/assessments/add'),
          icon: <Plus className="mr-2 h-4 w-4" />
        }}
        secondaryActions={
          <DSButton 
            variant="secondary" 
            onClick={() => navigate('/app/assessments/batch')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Batch Import
          </DSButton>
        }
      >
        <AssessmentList />
      </ListPageLayout>
    </AppLayout>
  );
};

export default Assessments;
