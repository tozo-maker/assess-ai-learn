import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skill } from '@/hooks/useSkillsData';

interface SkillsTableProps {
  skills: Skill[];
  isLoading: boolean;
}

const SkillsTable: React.FC<SkillsTableProps> = ({ skills, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (skills.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No skills found matching your filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Basic';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Database</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Skill Name</th>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Grade Level</th>
                <th className="text-left p-4 font-medium">Difficulty</th>
                <th className="text-left p-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{skill.name}</td>
                  <td className="p-4">
                    <Badge variant="outline">{skill.subject}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary">{skill.grade_level}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge className={getDifficultyColor(skill.difficulty_level)}>
                      {getDifficultyLabel(skill.difficulty_level)}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                    {skill.description || 'No description available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsTable;