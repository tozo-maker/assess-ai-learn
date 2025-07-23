
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Recommendation {
  id: string;
  text: string;
  assessment: {
    title: string;
    subject: string;
  };
  priority: 'high' | 'medium' | 'low';
  category: string;
  growthAreas: string[];
  created_at: string;
  status?: 'new' | 'in_progress' | 'completed';
}

interface StudentRecommendationCardProps {
  student: {
    id: string;
    first_name: string;
    last_name: string;
    grade_level: string;
  };
  recommendations: Recommendation[];
  onRecommendationAction: (recommendationId: string, action: string) => void;
  onViewStudentDetails: (studentId: string) => void;
}

const StudentRecommendationCard: React.FC<StudentRecommendationCardProps> = ({
  student,
  recommendations,
  onRecommendationAction,
  onViewStudentDetails
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
  const completedCount = recommendations.filter(r => r.status === 'completed').length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {student.first_name} {student.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Grade {student.grade_level}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {highPriorityCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {highPriorityCount} High Priority
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''}
              </Badge>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {completedCount}/{recommendations.length} completed
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {new Set(recommendations.map(r => r.assessment.subject)).size} subjects
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(rec.status || 'new')}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {rec.assessment.subject}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{rec.text}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        From: {rec.assessment.title}
                      </p>
                      
                      {rec.growthAreas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rec.growthAreas.slice(0, 3).map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {rec.growthAreas.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{rec.growthAreas.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onRecommendationAction(rec.id, 'view')}
                      >
                        View Details
                      </Button>
                      {rec.status !== 'completed' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => onRecommendationAction(rec.id, 'implement')}
                        >
                          Implement
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4 pt-3 border-t">
              <Button 
                variant="ghost" 
                onClick={() => onViewStudentDetails(student.id)}
                className="w-full"
              >
                View All Student Details
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default StudentRecommendationCard;
