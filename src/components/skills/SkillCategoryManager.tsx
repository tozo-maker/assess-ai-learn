
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Folder } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { skillsService } from '@/services/skills-service';
import { CategoryForm } from './CategoryForm';
import type { SkillCategory } from '@/services/skills-service';

interface SkillCategoryManagerProps {
  categories: SkillCategory[];
  onRefresh: () => void;
}

const SkillCategoryManager: React.FC<SkillCategoryManagerProps> = ({ categories, onRefresh }) => {
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: skillsService.createSkillCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = async (data: any) => {
    await createCategoryMutation.mutateAsync(data);
  };

  const openEditForm = (category: SkillCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    setCategoryFormOpen(false);
    setEditingCategory(undefined);
  };

  // Group categories by subject
  const categoriesBySubject = categories.reduce((acc, category) => {
    if (!acc[category.subject]) {
      acc[category.subject] = [];
    }
    acc[category.subject].push(category);
    return acc;
  }, {} as Record<string, SkillCategory[]>);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Skill Categories</h3>
          <p className="text-gray-600">Organize skills into logical categories</p>
        </div>
        <Button onClick={() => setCategoryFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(categoriesBySubject).map(([subject, subjectCategories]) => (
          <div key={subject}>
            <h4 className="text-lg font-medium mb-4 text-gray-900">{subject}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Folder className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <CardDescription className="text-sm mt-1">
                              {category.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditForm(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {category.grade_levels.map((grade) => (
                          <Badge key={grade} variant="outline" className="text-xs">
                            {grade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-4">
              Create your first skill category to organize your curriculum.
            </p>
            <Button onClick={() => setCategoryFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Category
            </Button>
          </CardContent>
        </Card>
      )}

      <CategoryForm
        open={categoryFormOpen}
        onClose={closeCategoryForm}
        onSubmit={handleCreateCategory}
        category={editingCategory}
        isLoading={createCategoryMutation.isPending}
      />
    </>
  );
};

export default SkillCategoryManager;
