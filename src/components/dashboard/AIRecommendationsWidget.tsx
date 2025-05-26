
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Lightbulb, 
  Target,
  BookOpen,
  Users,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIRecommendation {
  id: string;
  type: 'instruction' | 'assessment' | 'intervention' | 'grouping';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  affectedStudents: number;
  actionUrl?: string;
  estimatedImpact: string;
}

interface AIRecommendationsWidgetProps {
  recommendations: AIRecommendation[];
  className?: string;
}

const AIRecommendationsWidget: React.FC<AIRecommendationsWidgetProps> = ({ 
  recommendations, 
  className = "" 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'bg-red-100 text-red-800', label: 'High Priority' };
      case 'medium':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Medium Priority' };
      case 'low':
        return { color: 'bg-blue-100 text-blue-800', label: 'Low Priority' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Priority' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'instruction':
        return <BookOpen className="h-4 w-4" />;
      case 'assessment':
        return <Target className="h-4 w-4" />;
      case 'intervention':
        return <TrendingUp className="h-4 w-4" />;
      case 'grouping':
        return <Users className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const prioritizedRecommendations = recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Recommendations
          <Badge className="bg-purple-100 text-purple-800 ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prioritizedRecommendations.length > 0 ? (
            <>
              {prioritizedRecommendations.map((recommendation) => {
                const priorityBadge = getPriorityBadge(recommendation.priority);
                const isExpanded = expandedId === recommendation.id;

                return (
                  <div key={recommendation.id} className="border rounded-lg p-4 transition-all duration-200">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : recommendation.id)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          {getTypeIcon(recommendation.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                            <Badge className={priorityBadge.color}>
                              {priorityBadge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {recommendation.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{recommendation.affectedStudents} students affected</span>
                            <span>Impact: {recommendation.estimatedImpact}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t animate-fade-in">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Detailed Analysis</h5>
                            <p className="text-sm text-gray-600">{recommendation.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">Type:</span>
                              <span className="ml-1 capitalize">{recommendation.type}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Expected Impact:</span>
                              <span className="ml-1">{recommendation.estimatedImpact}</span>
                            </div>
                          </div>

                          {recommendation.actionUrl && (
                            <Link to={recommendation.actionUrl}>
                              <Button size="sm" className="w-full mt-3">
                                Take Action
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-3 border-t">
                <Link to="/app/insights/recommendations">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Recommendations
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-2">No Recommendations Yet</h4>
              <p className="text-sm text-gray-600 mb-4">
                Complete more assessments to receive AI-powered insights and recommendations.
              </p>
              <Link to="/app/assessments/add">
                <Button size="sm">Create Assessment</Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendationsWidget;
