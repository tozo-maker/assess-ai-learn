
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, BarChart3, Target, Calendar, Zap } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSFlexContainer,
  DSButton,
  DSBodyText
} from '@/components/ui/design-system';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  variant: 'primary' | 'secondary' | 'ghost';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface QuickActionsPanelProps {
  metrics?: {
    totalStudents: number;
    recentAssessments: number;
    pendingGoals: number;
  };
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ metrics }) => {
  const quickActions: QuickAction[] = [
    {
      label: 'Add Student',
      href: '/app/students/add',
      icon: <Plus className="h-4 w-4" />,
      variant: 'primary',
      description: 'Quickly add a new student',
      priority: 'high'
    },
    {
      label: 'Create Assessment',
      href: '/app/assessments/add',
      icon: <FileText className="h-4 w-4" />,
      variant: 'primary',
      description: 'Record assessment results',
      priority: 'high'
    },
    {
      label: 'Set Goal',
      href: '/app/students',
      icon: <Target className="h-4 w-4" />,
      variant: 'secondary',
      description: 'Create student goals',
      priority: 'medium'
    },
    {
      label: 'View Analytics',
      href: '/app/insights',
      icon: <BarChart3 className="h-4 w-4" />,
      variant: 'secondary',
      description: 'Review AI insights',
      priority: 'medium'
    },
    {
      label: 'Generate Report',
      href: '/app/reports',
      icon: <Calendar className="h-4 w-4" />,
      variant: 'ghost',
      description: 'Create progress reports',
      priority: 'low'
    },
    {
      label: 'AI Recommendations',
      href: '/app/insights/recommendations',
      icon: <Zap className="h-4 w-4" />,
      variant: 'ghost',
      description: 'Get personalized suggestions',
      priority: 'low'
    }
  ];

  const getPriorityActions = () => {
    return quickActions.filter(action => action.priority === 'high').slice(0, 2);
  };

  const getSecondaryActions = () => {
    return quickActions.filter(action => action.priority !== 'high').slice(0, 4);
  };

  return (
    <DSCard className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <DSCardContent className="p-6">
        {/* Priority Actions */}
        <div className="mb-6">
          <DSBodyText className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Quick Start
          </DSBodyText>
          <DSFlexContainer gap="sm">
            {getPriorityActions().map((action, index) => (
              <Link key={index} to={action.href} className="flex-1">
                <DSButton 
                  variant={action.variant} 
                  size="md" 
                  className="w-full group hover:scale-105 transition-transform duration-200"
                >
                  <DSFlexContainer align="center" gap="sm" className="w-full">
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </DSFlexContainer>
                </DSButton>
              </Link>
            ))}
          </DSFlexContainer>
        </div>

        {/* Secondary Actions Grid */}
        <div>
          <DSBodyText className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            More Actions
          </DSBodyText>
          <div className="grid grid-cols-2 gap-3">
            {getSecondaryActions().map((action, index) => (
              <Link key={index} to={action.href}>
                <DSCard className="h-full hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300 group">
                  <DSCardContent className="p-4">
                    <DSFlexContainer align="center" gap="sm">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors duration-200">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {action.label}
                        </h4>
                        <DSBodyText className="text-xs text-gray-500 truncate">
                          {action.description}
                        </DSBodyText>
                      </div>
                    </DSFlexContainer>
                  </DSCardContent>
                </DSCard>
              </Link>
            ))}
          </div>
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default QuickActionsPanel;
