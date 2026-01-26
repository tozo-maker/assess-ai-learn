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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Database ({skills.length} skills)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Skill Name</th>
                <th className="text-left p-4 font-medium">Subject</th>
                <th className="text-left p-4 font-medium">Grade Levels</th>
                <th className="text-left p-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{skill.name}</td>
                  <td className="p-4">
                    <Badge variant="outline">{skill.subject || 'N/A'}</Badge>
                  </td>
                  <td className="p-4">
                    {skill.grade_levels?.map(level => (
                      <Badge key={level} variant="secondary" className="mr-1">
                        {level === 'K' ? 'K' : level}
                      </Badge>
                    )) || <span className="text-muted-foreground">N/A</span>}
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
