import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, Grid, List, Trash2, Download, Mail, Users } from 'lucide-react';

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
import BulkOperationsToolbar from '@/components/workflow/BulkOperationsToolbar';
import StandardizedEmptyState from '@/components/common/StandardizedEmptyState';
import ContextualHelpTooltip from '@/components/help/ContextualHelpTooltip';
import { studentService } from '@/services/student-service';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
  });

  const handleAddStudent = () => {
    navigate('/app/students/add');
  };

  const handleBulkImport = () => {
    navigate('/app/students/import');
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentClick = (studentId: string) => {
    navigate(`/app/students/${studentId}`);
  };

  // Bulk operations
  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      action: (ids: string[]) => {
        console.log('Delete students:', ids);
        // TODO: Implement delete functionality
        setSelectedStudents([]);
      },
      variant: 'destructive' as const,
      requiresConfirmation: true
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      action: (ids: string[]) => {
        console.log('Export students:', ids);
        // TODO: Implement export functionality
      },
      variant: 'default' as const
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: <Mail className="h-4 w-4" />,
      action: (ids: string[]) => {
        console.log('Email students:', ids);
        // TODO: Implement email functionality
      },
      variant: 'default' as const
    }
  ];

  return (
    <AppLayout>
      <DSSection>
        <DSPageContainer>
          <Breadcrumbs />
          
          {/* Page Header - Standardized with Design System Spacing */}
          <DSCard className="mb-8">
            <DSCardHeader className="p-6">
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div>
                  <DSFlexContainer align="center" gap="sm" className="mb-2">
                    <DSPageTitle className="text-3xl font-bold text-gray-900">
                      Students
                    </DSPageTitle>
                    <ContextualHelpTooltip
                      title="Student Management"
                      content="Manage your students, track their progress, and organize their learning profiles."
                      steps={[
                        "Add individual students or import from CSV",
                        "View student profiles and performance data",
                        "Use bulk operations for efficient management"
                      ]}
                      link={{
                        text: "Learn more about student management",
                        url: "/help/students"
                      }}
                    />
                  </DSFlexContainer>
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

          {/* Bulk Operations Toolbar */}
          <BulkOperationsToolbar
            selectedCount={selectedStudents.length}
            totalCount={students.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedStudents([])}
            actions={bulkActions}
            selectedIds={selectedStudents}
            className="mb-6"
          />

          {/* Filter Bar with View Toggle - Design System Card */}
          <DSCard className="mb-6">
            <DSCardContent className="p-6 bg-gray-50">
              <DSFlexContainer justify="between" align="center" className="flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <DSBodyText className="text-gray-600">
                    Filter options will be added here
                  </DSBodyText>
                </div>
                
                {/* View Toggle - Design System Colors */}
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

          {/* Student List or Empty State */}
          {students.length === 0 && !isLoading ? (
            <StandardizedEmptyState
              icon={<Users className="h-12 w-12" />}
              title="No Students Yet"
              description="Start building your class by adding students. You can add them individually or import from a CSV file."
              actions={[
                {
                  label: 'Add First Student',
                  action: handleAddStudent,
                  variant: 'primary',
                  icon: <Plus className="h-4 w-4" />
                },
                {
                  label: 'Import from CSV',
                  action: handleBulkImport,
                  variant: 'secondary',
                  icon: <Upload className="h-4 w-4" />
                }
              ]}
              suggestions={[
                'Add student basic information and learning preferences',
                'Import class rosters from your school system',
                'Set up learning goals and track progress over time'
              ]}
            />
          ) : (
            <EnhancedStudentList 
              students={students}
              selectedStudents={selectedStudents}
              onSelectStudent={handleSelectStudent}
              onSelectAll={handleSelectAll}
              onStudentClick={handleStudentClick}
              isLoading={isLoading}
            />
          )}
        </DSPageContainer>
      </DSSection>
    </AppLayout>
  );
};

export default Students;
