
import React from 'react';
import { Users } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSCardTitle,
  DSSpacer
} from '@/components/ui/design-system';
import ProgressReportsFilters from './ProgressReportsFilters';
import BulkSelection from './BulkSelection';
import StudentReportCard from './StudentReportCard';
import { StudentWithPerformance } from '@/types/student';

interface IndividualReportsContentProps {
  filteredStudents: StudentWithPerformance[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  gradelevels: string[];
  selectedStudents: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onStudentSelect: (studentId: string, checked: boolean) => void;
  onGenerateReport: (studentId: string) => void;
  onGeneratePDF: (studentId: string) => void;
  onBulkPDFGeneration: () => void;
  isGeneratingReport: boolean;
  isGeneratingPDF: boolean;
  isBulkGenerating: boolean;
}

const IndividualReportsContent: React.FC<IndividualReportsContentProps> = ({
  filteredStudents,
  searchQuery,
  setSearchQuery,
  gradeFilter,
  setGradeFilter,
  gradelevels,
  selectedStudents,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onStudentSelect,
  onGenerateReport,
  onGeneratePDF,
  onBulkPDFGeneration,
  isGeneratingReport,
  isGeneratingPDF,
  isBulkGenerating
}) => {
  return (
    <div className="space-y-8">
      {/* Filters and Search */}
      <ProgressReportsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        gradelevels={gradelevels}
        selectedCount={selectedStudents.size}
        onBulkPDFGeneration={onBulkPDFGeneration}
        isGeneratingPDF={isBulkGenerating}
      />

      {/* Bulk Selection */}
      {filteredStudents.length > 0 && (
        <BulkSelection
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onSelectAll={onSelectAll}
          totalStudents={filteredStudents.length}
          selectedCount={selectedStudents.size}
        />
      )}

      {/* Student List */}
      <div className="space-y-6">
        {filteredStudents.length === 0 ? (
          <DSCard>
            <DSCardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <DSCardTitle className="mb-2">No students found</DSCardTitle>
              <p className="text-gray-500">
                {searchQuery || gradeFilter !== 'all' ? 'Try adjusting your filters.' : 'Add students to generate reports.'}
              </p>
            </DSCardContent>
          </DSCard>
        ) : (
          filteredStudents.map((student) => (
            <StudentReportCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.has(student.id)}
              onSelect={onStudentSelect}
              onGenerateReport={onGenerateReport}
              onGeneratePDF={onGeneratePDF}
              isGeneratingReport={isGeneratingReport}
              isGeneratingPDF={isGeneratingPDF}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default IndividualReportsContent;
