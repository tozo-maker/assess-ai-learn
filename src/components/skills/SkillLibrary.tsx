
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BookOpen, Target } from 'lucide-react';
import { Skill, SkillCategory } from '@/services/skills-service';
import CreateSkillDialog from './CreateSkillDialog';
import EditSkillDialog from './EditSkillDialog';
import { useToast } from '@/hooks/use-toast';
import { skillsService } from '@/services/skills-service';

interface SkillLibraryProps {
  skills: Skill[];
  categories: SkillCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const SkillLibrary: React.FC<SkillLibraryProps> = ({ skills, categories, isLoading, onRefresh }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const { toast } = useToast();

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await skillsService.deleteSkill(skillId);
      toast({
        title: "Success",
        description: "Skill deleted successfully.",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Skills Library</h3>
          <p className="text-gray-600">Manage and organize your curriculum skills</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <Card key={skill.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold mb-1">
                    {skill.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {skill.description}
                  </CardDescription>
                </div>
                <div className="flex space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSkill(skill)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSkill(skill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{skill.subject}</Badge>
                  <Badge variant="outline">Grade {skill.grade_level}</Badge>
                  <Badge className={getDifficultyColor(skill.difficulty_level)}>
                    Level {skill.difficulty_level}
                  </Badge>
                </div>

                {skill.curriculum_standard && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-1" />
                    {skill.curriculum_standard}
                  </div>
                )}

                {skill.category && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {skill.category.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Skills Found</h3>
            <p className="text-gray-600 mb-4">
              Start building your skills library by adding your first skill.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Skill
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateSkillDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        categories={categories}
        onSuccess={onRefresh}
      />

      {editingSkill && (
        <EditSkillDialog
          skill={editingSkill}
          isOpen={!!editingSkill}
          onOpenChange={(open) => !open && setEditingSkill(null)}
          categories={categories}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
};

export default SkillLibrary;
