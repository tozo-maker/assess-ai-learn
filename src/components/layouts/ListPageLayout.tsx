
import React from 'react';
import { Grid, List, Plus } from 'lucide-react';
import {
  DSPageContainer,
  DSSection,
  DSSpacer,
  DSPageTitle,
  DSBodyText,
  DSFlexContainer,
  DSCard,
  DSCardContent
} from '@/components/ui/design-system';
import { DSButton } from '@/components/ui/design-system';

interface ListPageLayoutProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: React.ReactNode;
  filters?: React.ReactNode;
  viewToggle?: {
    currentView: 'list' | 'grid';
    onViewChange: (view: 'list' | 'grid') => void;
  };
  children: React.ReactNode;
  emptyState?: {
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  pagination?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  title,
  description,
  primaryAction,
  secondaryActions,
  filters,
  viewToggle,
  children,
  emptyState,
  pagination,
  isLoading = false,
  isEmpty = false,
  className = ''
}) => {
  return (
    <DSSection className={className}>
      <DSPageContainer>
        {/* Header */}
        <DSFlexContainer justify="between" align="start" className="mb-6">
          <div>
            <DSPageTitle>{title}</DSPageTitle>
            {description && (
              <DSBodyText className="mt-2 text-gray-600">
                {description}
              </DSBodyText>
            )}
          </div>
          
          <DSFlexContainer gap="md">
            {secondaryActions}
            {primaryAction && (
              <DSButton 
                variant="primary" 
                onClick={primaryAction.onClick}
                className="bg-[#2563eb] hover:bg-[#1d4ed8]"
              >
                {primaryAction.icon || <Plus className="h-4 w-4" />}
                {primaryAction.label}
              </DSButton>
            )}
          </DSFlexContainer>
        </DSFlexContainer>

        {/* Filter Bar */}
        {filters && (
          <DSCard className="mb-6">
            <DSCardContent>
              <DSFlexContainer justify="between" align="center">
                <div className="flex-1">
                  {filters}
                </div>
                
                {/* View Toggle */}
                {viewToggle && (
                  <DSFlexContainer gap="xs" className="border border-gray-300 rounded-md p-1">
                    <button
                      onClick={() => viewToggle.onViewChange('list')}
                      className={`
                        p-2 rounded text-sm transition-colors duration-200
                        ${viewToggle.currentView === 'list'
                          ? 'bg-[#2563eb] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => viewToggle.onViewChange('grid')}
                      className={`
                        p-2 rounded text-sm transition-colors duration-200
                        ${viewToggle.currentView === 'grid'
                          ? 'bg-[#2563eb] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </DSFlexContainer>
                )}
              </DSFlexContainer>
            </DSCardContent>
          </DSCard>
        )}

        <DSSpacer size="lg" />

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : isEmpty && emptyState ? (
          <DSCard>
            <DSCardContent>
              <div className="text-center py-12">
                <DSPageTitle className="text-xl text-gray-900 mb-2">
                  {emptyState.title}
                </DSPageTitle>
                <DSBodyText className="text-gray-600 mb-6">
                  {emptyState.description}
                </DSBodyText>
                {emptyState.action}
              </div>
            </DSCardContent>
          </DSCard>
        ) : (
          <div className="space-y-6">
            {children}
          </div>
        )}

        {/* Pagination */}
        {pagination && !isEmpty && (
          <div className="mt-8 flex justify-center">
            {pagination}
          </div>
        )}
      </DSPageContainer>
    </DSSection>
  );
};

export default ListPageLayout;
