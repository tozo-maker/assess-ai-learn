
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { goalCategories } from './GoalCategories';

export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedDuration: string;
  milestones: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'reading_fluency',
    title: 'Improve Reading Fluency',
    description: 'Develop smooth, accurate, and expressive reading skills',
    category: 'reading',
    estimatedDuration: '8-12 weeks',
    milestones: [
      'Read 50 words per minute accurately',
      'Read with appropriate expression',
      'Complete grade-level passages fluently',
      'Demonstrate comprehension while reading'
    ],
    priority: 'High'
  },
  {
    id: 'math_problem_solving',
    title: 'Master Multi-Step Problem Solving',
    description: 'Develop strategies for solving complex mathematical problems',
    category: 'mathematics',
    estimatedDuration: '6-10 weeks',
    milestones: [
      'Identify key information in word problems',
      'Choose appropriate problem-solving strategies',
      'Show work clearly and systematically',
      'Check answers for reasonableness'
    ],
    priority: 'High'
  },
  {
    id: 'writing_skills',
    title: 'Enhance Writing Skills',
    description: 'Improve organization, clarity, and mechanics in writing',
    category: 'reading',
    estimatedDuration: '10-14 weeks',
    milestones: [
      'Write clear topic sentences',
      'Organize ideas logically',
      'Use varied sentence structures',
      'Edit for grammar and spelling'
    ],
    priority: 'Medium'
  },
  {
    id: 'science_inquiry',
    title: 'Develop Scientific Inquiry Skills',
    description: 'Learn to ask questions, investigate, and draw conclusions',
    category: 'science',
    estimatedDuration: '8-12 weeks',
    milestones: [
      'Formulate testable questions',
      'Design simple experiments',
      'Record observations accurately',
      'Draw evidence-based conclusions'
    ],
    priority: 'Medium'
  }
];

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  selectedCategory?: string;
}

const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onSelectTemplate, selectedCategory }) => {
  const filteredTemplates = selectedCategory 
    ? goalTemplates.filter(template => template.category === selectedCategory)
    : goalTemplates;

  const getCategoryInfo = (categoryId: string) => {
    return goalCategories.find(cat => cat.id === categoryId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Goal Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const categoryInfo = getCategoryInfo(template.category);
          
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <Badge className={getPriorityColor(template.priority)}>
                    {template.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {categoryInfo && (
                    <Badge variant="outline" className="text-xs">
                      {categoryInfo.icon}
                      <span className="ml-1">{categoryInfo.name}</span>
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">{template.estimatedDuration}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{template.description}</p>
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-1">Key Milestones:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.milestones.slice(0, 2).map((milestone, index) => (
                      <li key={index}>• {milestone}</li>
                    ))}
                    {template.milestones.length > 2 && (
                      <li className="text-gray-400">+{template.milestones.length - 2} more...</li>
                    )}
                  </ul>
                </div>
                <Button 
                  size="sm" 
                  className="w-full" 
                  onClick={() => onSelectTemplate(template)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTemplates;
