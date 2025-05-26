
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Calendar,
  BookOpen,
  X
} from 'lucide-react';

interface InsightFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedSubjects: string[];
  onSubjectToggle: (subject: string) => void;
  availableSubjects: string[];
  sortBy: 'date' | 'subject' | 'type';
  onSortChange: (sort: 'date' | 'subject' | 'type') => void;
  onClearFilters: () => void;
}

const InsightFilters: React.FC<InsightFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedSubjects,
  onSubjectToggle,
  availableSubjects,
  sortBy,
  onSortChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || selectedSubjects.length > 0 || sortBy !== 'date';

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex flex-col gap-4">
        {/* Search and Sort */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search insights, strengths, or recommendations..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('date')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Date
            </Button>
            <Button
              variant={sortBy === 'subject' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('subject')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Subject
            </Button>
            <Button
              variant={sortBy === 'type' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('type')}
            >
              <SortAsc className="h-4 w-4 mr-2" />
              Type
            </Button>
          </div>
        </div>

        {/* Subject Filters */}
        {availableSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Subjects:
            </span>
            {availableSubjects.map((subject) => (
              <Badge
                key={subject}
                variant={selectedSubjects.includes(subject) ? 'default' : 'outline'}
                className="cursor-pointer transition-colors"
                onClick={() => onSubjectToggle(subject)}
              >
                {subject}
              </Badge>
            ))}
          </div>
        )}

        {/* Active Filters and Clear */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedSubjects.map((subject) => (
                <Badge key={subject} variant="secondary">
                  {subject}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onSubjectToggle(subject)}
                  />
                </Badge>
              ))}
              {sortBy !== 'date' && (
                <Badge variant="secondary">
                  Sort: {sortBy}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightFilters;
