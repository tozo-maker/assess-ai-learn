
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';

interface ProgressReportsFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  gradelevels: string[];
  selectedCount: number;
  onBulkPDFGeneration: () => void;
  isGeneratingPDF: boolean;
}

const ProgressReportsFilters: React.FC<ProgressReportsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  gradeFilter,
  setGradeFilter,
  gradelevels,
  selectedCount,
  onBulkPDFGeneration,
  isGeneratingPDF
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search students..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select value={gradeFilter} onValueChange={setGradeFilter}>
        <SelectTrigger className="w-48">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by grade" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
          {gradelevels.map((grade) => (
            <SelectItem key={grade} value={grade}>
              Grade {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCount > 0 && (
        <Button
          onClick={onBulkPDFGeneration}
          disabled={isGeneratingPDF}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate PDFs ({selectedCount})
        </Button>
      )}
    </div>
  );
};

export default ProgressReportsFilters;
