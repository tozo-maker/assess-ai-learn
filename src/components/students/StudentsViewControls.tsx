
import React from 'react';
import { Grid, List, Filter } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSButton,
  DSFlexContainer,
  DSBodyText,
  DSHelpText
} from '@/components/ui/design-system';

interface StudentsViewControlsProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  filteredCount: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const StudentsViewControls: React.FC<StudentsViewControlsProps> = ({
  viewMode,
  setViewMode,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  filteredCount,
  showFilters,
  setShowFilters
}) => {
  return (
    <DSCard className="mb-6">
      <DSCardContent className="p-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <DSFlexContainer justify="between" align="center">
          <DSFlexContainer align="center" gap="md">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(checkbox) => {
                if (checkbox) {
                  (checkbox as any).indeterminate = isIndeterminate;
                }
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="h-4 w-4 text-[#2563eb] border-gray-300 rounded focus:ring-[#2563eb]"
            />
            <DSBodyText className="font-medium text-gray-700">
              Select All
            </DSBodyText>
            <DSHelpText className="hidden sm:block">
              ({filteredCount} students)
            </DSHelpText>
          </DSFlexContainer>
          
          <DSFlexContainer gap="md" align="center">
            <DSButton
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </DSButton>

            {/* View Toggle */}
            <DSFlexContainer gap="xs" className="border border-gray-300 rounded-lg p-1 bg-white shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2
                  ${viewMode === 'list'
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-2 rounded-md text-sm transition-all duration-200 flex items-center gap-2
                  ${viewMode === 'grid'
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </DSFlexContainer>
          </DSFlexContainer>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default StudentsViewControls;
