
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Target,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  badge?: string;
}

const EnhancedQuickActionsCard: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      title: "Add Student",
      description: "Register a new student",
      icon: <Users className="h-5 w-5" />,
      href: "/app/students/add",
      variant: "primary"
    },
    {
      title: "Create Assessment", 
      description: "Design a new assessment",
      icon: <FileText className="h-5 w-5" />,
      href: "/app/assessments/add",
      variant: "secondary"
    },
    {
      title: "View Insights",
      description: "AI-powered analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/app/insights/class",
      variant: "success",
      badge: "AI"
    },
    {
      title: "Set Goals",
      description: "Create learning objectives",
      icon: <Target className="h-5 w-5" />,
      href: "/app/students",
      variant: "warning"
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 group-hover:border-blue-300';
      case 'secondary':
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 group-hover:border-gray-300';
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100 group-hover:border-green-300';
      case 'warning':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 group-hover:border-orange-300';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getIconStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'text-blue-600 bg-blue-100';
      case 'secondary':
        return 'text-gray-600 bg-gray-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href} className="group block">
              <div className={`
                p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                ${getVariantStyles(action.variant)}
              `}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      p-2 rounded-lg transition-colors duration-200
                      ${getIconStyles(action.variant)}
                    `}>
                      {action.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Quick Stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-xs text-gray-600">Actions This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-xs text-gray-600">New Insights</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuickActionsCard;
