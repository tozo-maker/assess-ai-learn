
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SkillFilters } from '@/hooks/useSkillsData';

interface SkillsFiltersProps {
  filters: SkillFilters;
  onFiltersChange: (filters: SkillFilters) => void;
  totalSkills: number;
  filteredCount: number;
}

const SkillsFilters: React.FC<SkillsFiltersProps> = ({
  filters,
  onFiltersChange,
  totalSkills,
  filteredCount
}) => {
  const updateFilter = (key: keyof SkillFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filter Skills</CardTitle>
          <Badge variant="secondary">
            {filteredCount} of {totalSkills} skills
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Select value={filters.subject || "all"} onValueChange={(value) => updateFilter('subject', value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Grade Level</label>
            <Select value={filters.gradeLevel || "all-grades"} onValueChange={(value) => updateFilter('gradeLevel', value === "all-grades" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-grades">All grades</SelectItem>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={filters.difficulty_level || "all-levels"} onValueChange={(value) => updateFilter('difficulty_level', value === "all-levels" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-levels">All levels</SelectItem>
                <SelectItem value="1">Beginning</SelectItem>
                <SelectItem value="2">Basic</SelectItem>
                <SelectItem value="3">Intermediate</SelectItem>
                <SelectItem value="4">Advanced</SelectItem>
                <SelectItem value="5">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <Input
              placeholder="Search skills..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsFilters;
