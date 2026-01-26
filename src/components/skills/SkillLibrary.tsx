
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { skillsService } from '@/services/skills-service';
import { SkillForm } from './SkillForm';
import type { Skill, SkillCategory } from '@/services/skills-service';

interface SkillLibraryProps {
  skills: Skill[];
  categories: SkillCategory[];
  isLoading: boolean;
  onRefresh: () => void;
}

const SkillLibrary: React.FC<SkillLibraryProps> = ({ skills, categories, isLoading, onRefresh }) => {
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSkillMutation = useMutation({
    mutationFn: skillsService.createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({
        title: 'Success',
        description: 'Skill created successfully',
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create skill',
        variant: 'destructive',
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Skill> }) =>
      skillsService.updateSkill(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({
        title: 'Success',
        description: 'Skill updated successfully',
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update skill',
        variant: 'destructive',
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: skillsService.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({
        title: 'Success',
        description: 'Skill deleted successfully',
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete skill',
        variant: 'destructive',
      });
    },
  });

  const handleCreateSkill = async (data: any) => {
    await createSkillMutation.mutateAsync(data);
  };

  const handleUpdateSkill = async (data: any) => {
    if (editingSkill) {
      await updateSkillMutation.mutateAsync({
        id: editingSkill.id,
        updates: data,
      });
      setEditingSkill(undefined);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      await deleteSkillMutation.mutateAsync(skillId);
    }
  };

  const openEditForm = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillFormOpen(true);
  };

  const closeSkillForm = () => {
    setSkillFormOpen(false);
    setEditingSkill(undefined);
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
        <Button onClick={() => setSkillFormOpen(true)}>
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
                    onClick={() => openEditForm(skill)}
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
                  {skill.subject && <Badge variant="outline">{skill.subject}</Badge>}
                  {skill.grade_levels && skill.grade_levels.length > 0 && (
                    <Badge variant="outline">
                      Grades: {skill.grade_levels.join(', ')}
                    </Badge>
                  )}
                </div>

                {skill.category && (
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {skill.category}
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
            <Button onClick={() => setSkillFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Skill
            </Button>
          </CardContent>
        </Card>
      )}

      <SkillForm
        open={skillFormOpen}
        onClose={closeSkillForm}
        onSubmit={editingSkill ? handleUpdateSkill : handleCreateSkill}
        skill={editingSkill}
        categories={categories}
        isLoading={createSkillMutation.isPending || updateSkillMutation.isPending}
      />
    </>
  );
};

export default SkillLibrary;
