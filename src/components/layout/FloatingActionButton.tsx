
import React, { useState } from 'react';
import { Plus, Users, FileText, BarChart3, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DSButton,
  DSFlexContainer,
  DSBodyText,
  designSystem
} from '@/components/ui/design-system';
import { cn } from '@/lib/utils';

interface FloatingAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  context: string[];
}

const FloatingActionButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const actions: FloatingAction[] = [
    {
      id: 'add-student',
      label: 'Add Student',
      icon: <Users className="h-4 w-4" />,
      action: () => {
        navigate('/app/students/add');
        setIsExpanded(false);
      },
      context: ['dashboard', 'students']
    },
    {
      id: 'create-assessment',
      label: 'Create Assessment',
      icon: <FileText className="h-4 w-4" />,
      action: () => {
        navigate('/app/assessments/add');
        setIsExpanded(false);
      },
      context: ['dashboard', 'assessments']
    },
    {
      id: 'view-insights',
      label: 'View Insights',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => {
        navigate('/app/insights/class');
        setIsExpanded(false);
      },
      context: ['dashboard', 'insights']
    }
  ];

  // Determine current context
  const getCurrentContext = () => {
    const path = location.pathname;
    if (path.includes('/students')) return 'students';
    if (path.includes('/assessments')) return 'assessments';
    if (path.includes('/insights')) return 'insights';
    return 'dashboard';
  };

  const currentContext = getCurrentContext();
  const contextualActions = actions.filter(action => 
    action.context.includes(currentContext)
  );

  // Only show on mobile/tablet
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Action buttons */}
      {isExpanded && (
        <div className="mb-4 space-y-3">
          {contextualActions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                "transform transition-all duration-200 ease-out",
                isExpanded 
                  ? "translate-y-0 opacity-100 scale-100" 
                  : "translate-y-4 opacity-0 scale-95"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <DSFlexContainer align="center" gap="sm" className="justify-end">
                <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                  <DSBodyText className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {action.label}
                  </DSBodyText>
                </div>
                <DSButton
                  onClick={action.action}
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg",
                    designSystem.colors.primary.bg,
                    designSystem.colors.primary.hover,
                    "text-white border-0"
                  )}
                >
                  {action.icon}
                </DSButton>
              </DSFlexContainer>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <DSButton
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl",
          designSystem.colors.primary.bg,
          designSystem.colors.primary.hover,
          "text-white border-0",
          "transform transition-transform duration-200",
          isExpanded && "rotate-45"
        )}
        size="lg"
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </DSButton>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FloatingActionButton;
