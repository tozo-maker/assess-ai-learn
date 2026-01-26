
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Award } from 'lucide-react';
import { Skill, SkillFilters } from '@/hooks/useSkillsData';

interface SkillsMainContentProps {
  skills: Skill[];
  filteredSkills: Skill[];
  filters: SkillFilters;
  onFiltersChange: (filters: SkillFilters) => void;
}

const SkillsMainContent: React.FC<SkillsMainContentProps> = ({
  skills,
  filteredSkills,
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof SkillFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleGradeLevelChange = (value: string) => {
    const gradeLevelValue = value === "all" ? "" : value;
    handleFilterChange('gradeLevel', gradeLevelValue);
  };

  const handleSubjectChange = (value: string) => {
    const subjectValue = value === "all" ? "" : value;
    handleFilterChange('subject', subjectValue);
  };

  // Ensure safe values for Select components
  const safeGradeLevel = filters.gradeLevel || "all";
  const safeSubject = filters.subject || "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skills Catalog</h1>
        <p className="text-gray-600 mt-1">Browse and manage learning skills and competencies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(skills.map(s => s.subject).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Set(skills.map(s => s.category).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={safeGradeLevel} onValueChange={handleGradeLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
              </SelectContent>
            </Select>
            <Select value={safeSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <Card key={skill.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{skill.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {skill.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{skill.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {skill.subject && <Badge variant="outline">{skill.subject}</Badge>}
                  {skill.grade_levels && skill.grade_levels.length > 0 && (
                    <Badge variant="outline">
                      Grades: {skill.grade_levels.join(', ')}
                    </Badge>
                  )}
                  {skill.category && (
                    <Badge variant="secondary">{skill.category}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              {skills.length === 0 ? 'No skills available' : 'No skills match your filters'}
            </h3>
            <p className="text-gray-500">
              {skills.length === 0 
                ? 'Skills will appear here when they are added to the system'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillsMainContent;
