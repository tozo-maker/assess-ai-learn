
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Grid, List } from 'lucide-react';

// Layout Components
import AppLayout from '@/components/layout/AppLayout';
import Breadcrumbs from '@/components/navigation/Breadcrumbs';

// Design System Components
import {
  DSPageContainer,
  DSSection,
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSButton,
  DSFlexContainer,
  DSSpacer,
  DSPageTitle,
  DSBodyText
} from '@/components/ui/design-system';

import EnhancedStudentList from '@/components/students/EnhancedStudentList';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleAddStudent = () => {
    navigate('/app/students/add');
  };

  const handleBulkImport = () => {
    navigate('/app/students/import');
  };

  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header - Standardized */}
          <DSCard className="mb-8">
            <DSCardHeader>
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                  <DSPageTitle className="text-3xl font-bold text-gray-900 mb-2">
                    Students
                  </DSPageTitle>
                  <DSBodyText className="text-gray-600">
                    Manage your students and track their learning progress
                  </DSBodyText>
                </div>
                <DSFlexContainer gap="sm" className="flex-col sm:flex-row">
                  <DSButton 
                    variant="secondary" 
                    onClick={handleBulkImport}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students
                  </DSButton>
                  <DSButton 
                    variant="primary"
                    onClick={handleAddStudent}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </DSButton>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardHeader>
          </DSCard>

          {/* Filter Bar with View Toggle */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6 bg-gray-50">
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div className="flex-1">
                  {/* Filters would go here */}
                  <DSBodyText className="text-gray-600">
                    Filter options will be added here
                  </DSBodyText>
                </div>
                
                {/* View Toggle */}
                <DSFlexContainer gap="xs" className="border border-gray-300 rounded-md p-1 bg-white">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      p-2 rounded text-sm transition-colors duration-200
                      ${viewMode === 'list'
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`
                      p-2 rounded text-sm transition-colors duration-200
                      ${viewMode === 'grid'
                        ? 'bg-[#2563eb] text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                </DSFlexContainer>
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>

          <DSSpacer size="lg" />

          {/* Student List */}
          <EnhancedStudentList viewMode={viewMode} />
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Students;
