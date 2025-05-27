
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Folder } from 'lucide-react';
import { SkillCategory, skillsService } from '@/services/skills-service';
import CreateCategoryDialog from './CreateCategoryDialog';
import { useToast } from '@/hooks/use-toast';

interface SkillCategoryManagerProps {
  categories: SkillCategory[];
  onRefresh: () => void;
}

const SkillCategoryManager: React.FC<SkillCategoryManagerProps> = ({ categories, onRefresh }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
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
                      <Button variant="ghost" size="sm">
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
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Category
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateCategoryDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={onRefresh}
      />
    </>
  );
};

export default SkillCategoryManager;
