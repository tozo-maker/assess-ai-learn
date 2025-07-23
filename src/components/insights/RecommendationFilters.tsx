
import React from 'react';
import { Filter } from 'lucide-react';
import UnifiedFilterSection from '@/components/common/filters/UnifiedFilterSection';
import { UnifiedFilterValues } from '@/components/common/filters/UnifiedFilterTypes';

export interface RecommendationFilters extends UnifiedFilterValues {
  search: string;
  student: string;
  subject: string;
  gradeLevel: string;
  priority: string;
  category: string;
  status: string;
  sortBy: string;
}

interface RecommendationFiltersProps {
  filters: RecommendationFilters;
  onFiltersChange: (filters: RecommendationFilters) => void;
  onClearFilters: () => void;
  students: Array<{ id: string; first_name: string; last_name: string; grade_level: string }>;
  totalCount: number;
  filteredCount: number;
}

const RecommendationFiltersComponent: React.FC<RecommendationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  students,
  totalCount,
  filteredCount
}) => {
  const filterConfigs = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search recommendations, students, or assessments...'
    },
    {
      key: 'student',
      label: 'Student',
      type: 'select' as const,
      options: [
        { label: 'All Students', value: '' },
        ...students.map(student => ({
          label: `${student.first_name} ${student.last_name}`,
          value: student.id
        }))
      ]
    },
    {
      key: 'subject',
      label: 'Subject',
      type: 'select' as const,
      options: [
        { label: 'All Subjects', value: '' },
        { label: 'Mathematics', value: 'Mathematics' },
        { label: 'English Language Arts', value: 'English Language Arts' },
        { label: 'Science', value: 'Science' },
        { label: 'Social Studies', value: 'Social Studies' },
        { label: 'Reading', value: 'Reading' },
        { label: 'Writing', value: 'Writing' }
      ]
    },
    {
      key: 'gradeLevel',
      label: 'Grade Level',
      type: 'select' as const,
      options: [
        { label: 'All Grades', value: '' },
        { label: 'Kindergarten', value: 'K' },
        { label: '1st Grade', value: '1st' },
        { label: '2nd Grade', value: '2nd' },
        { label: '3rd Grade', value: '3rd' },
        { label: '4th Grade', value: '4th' },
        { label: '5th Grade', value: '5th' },
        { label: '6th Grade', value: '6th' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { label: 'All Priorities', value: '' },
        { label: 'High Priority', value: 'high' },
        { label: 'Medium Priority', value: 'medium' },
        { label: 'Low Priority', value: 'low' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { label: 'All Categories', value: '' },
        { label: 'Practice & Reinforcement', value: 'practice' },
        { label: 'Additional Support', value: 'support' },
        { label: 'Enrichment', value: 'enrichment' },
        { label: 'Review & Remediation', value: 'review' }
      ]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select' as const,
      options: [
        { label: 'Most Recent', value: 'date_desc' },
        { label: 'Oldest First', value: 'date_asc' },
        { label: 'Student Name A-Z', value: 'student_asc' },
        { label: 'Student Name Z-A', value: 'student_desc' },
        { label: 'Priority (High First)', value: 'priority_desc' },
        { label: 'Subject', value: 'subject' }
      ]
    }
  ];

  return (
    <UnifiedFilterSection
      title="Filter Recommendations"
      icon={<Filter className="h-5 w-5" />}
      filterConfigs={filterConfigs}
      values={filters}
      onFiltersChange={onFiltersChange}
      onClearFilters={onClearFilters}
      layout="inline"
      showResultsCount={true}
      totalCount={totalCount}
      filteredCount={filteredCount}
      collapsible={true}
      defaultExpanded={false}
    />
  );
};

export default RecommendationFiltersComponent;
