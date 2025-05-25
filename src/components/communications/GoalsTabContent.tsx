
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Goal } from '@/types/goals';

interface GoalsTabContentProps {
  goals: Goal[];
}

const GoalsTabContent: React.FC<GoalsTabContentProps> = ({ goals }) => {
  return (
    <div className="space-y-4">
      {goals.length > 0 ? (
        goals.map((goal, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-md">{goal.title}</CardTitle>
                <Badge className={goal.status === 'active' ? 'bg-blue-500' : 'bg-green-500'}>
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {goal.description && <p className="mb-2 text-sm text-gray-600">{goal.description}</p>}
              <div className="flex items-center space-x-4">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${goal.progress_percentage}%` }} 
                  />
                </div>
                <span className="text-sm font-medium">{goal.progress_percentage}%</span>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No learning goals have been set yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalsTabContent;
