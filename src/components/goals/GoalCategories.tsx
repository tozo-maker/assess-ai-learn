
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Book, Calculator, Palette, Globe, Beaker, Users } from 'lucide-react';

export interface GoalCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export const goalCategories: GoalCategory[] = [
  { id: 'reading', name: 'Reading & Language', icon: <Book className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'mathematics', name: 'Mathematics', icon: <Calculator className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  { id: 'science', name: 'Science', icon: <Beaker className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
  { id: 'social_studies', name: 'Social Studies', icon: <Globe className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
  { id: 'arts', name: 'Arts & Creativity', icon: <Palette className="h-4 w-4" />, color: 'bg-pink-100 text-pink-800' },
  { id: 'social_skills', name: 'Social Skills', icon: <Users className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' }
];

interface GoalCategoriesProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  mode?: 'filter' | 'select';
}

const GoalCategories: React.FC<GoalCategoriesProps> = ({ 
  selectedCategories, 
  onCategoryChange, 
  mode = 'select' 
}) => {
  const handleCategoryToggle = (categoryId: string) => {
    if (mode === 'select') {
      // Single selection for goal creation
      onCategoryChange([categoryId]);
    } else {
      // Multiple selection for filtering
      const newCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategoryChange(newCategories);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {mode === 'filter' ? 'Filter by Categories' : 'Goal Category'}
      </label>
      <div className="flex flex-wrap gap-2">
        {goalCategories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              selectedCategories.includes(category.id) ? category.color : 'hover:bg-gray-100'
            }`}
            onClick={() => handleCategoryToggle(category.id)}
          >
            {category.icon}
            <span className="ml-1">{category.name}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default GoalCategories;
