
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Clock, Target, BookOpen } from 'lucide-react';

export interface AISuggestion {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  estimatedWeeks?: number;
  priority?: 'High' | 'Medium' | 'Low';
  reasoning?: string;
  suggestedMilestones?: string[];
}

interface AISuggestionCardProps {
  suggestion: AISuggestion;
  onAddAsGoal: (suggestion: AISuggestion) => void;
  onDismiss?: (suggestionId: string) => void;
  isLoading?: boolean;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  suggestion,
  onAddAsGoal,
  onDismiss,
  isLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border border-blue-200 bg-blue-50/30 hover:bg-blue-50/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">{suggestion.title}</h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.category && (
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {suggestion.category}
                </Badge>
              )}
              {suggestion.difficulty && (
                <Badge className={`text-xs ${getDifficultyColor(suggestion.difficulty)}`}>
                  <Target className="h-3 w-3 mr-1" />
                  {suggestion.difficulty}
                </Badge>
              )}
              {suggestion.estimatedWeeks && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {suggestion.estimatedWeeks} weeks
                </Badge>
              )}
              {suggestion.priority && (
                <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                  {suggestion.priority} Priority
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onAddAsGoal(suggestion)}
            disabled={isLoading}
            className="ml-3"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add as Goal
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {suggestion.description && (
          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
        )}

        {(suggestion.reasoning || suggestion.suggestedMilestones) && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {suggestion.reasoning && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Why this goal?</h5>
                  <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                </div>
              )}
              {suggestion.suggestedMilestones && suggestion.suggestedMilestones.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Milestones:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestion.suggestedMilestones.map((milestone, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {onDismiss && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(suggestion.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              Not interested
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestionCard;
