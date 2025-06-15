
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Users, FileText, BarChart3, Upload, Download, Settings, Zap } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSButton,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  designSystem
} from '@/components/ui/design-system';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  shortcut?: string;
  context: string[];
}

const ContextualQuickActions: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const allActions: QuickAction[] = [
    {
      id: 'add-student',
      title: 'Add Student',
      description: 'Register a new student',
      icon: <Users className="h-4 w-4" />,
      action: () => navigate('/app/students/add'),
      variant: 'primary',
      shortcut: 'Alt+S',
      context: ['dashboard', 'students']
    },
    {
      id: 'create-assessment',
      title: 'Create Assessment',
      description: 'Design new assessment',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/app/assessments/add'),
      variant: 'secondary',
      shortcut: 'Alt+A',
      context: ['dashboard', 'assessments']
    },
    {
      id: 'view-insights',
      title: 'View Insights',
      description: 'AI-powered analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate('/app/insights/class'),
      variant: 'success',
      shortcut: 'Alt+I',
      context: ['dashboard', 'insights']
    },
    {
      id: 'import-students',
      title: 'Import Students',
      description: 'Bulk import from CSV',
      icon: <Upload className="h-4 w-4" />,
      action: () => navigate('/app/students/import'),
      variant: 'secondary',
      context: ['students']
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports',
      icon: <Download className="h-4 w-4" />,
      action: () => navigate('/app/reports/export'),
      variant: 'secondary',
      context: ['reports', 'students', 'assessments']
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage preferences',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/app/settings/profile'),
      variant: 'secondary',
      context: ['dashboard']
    }
  ];

  // Determine current context from pathname
  const getCurrentContext = () => {
    const path = location.pathname;
    if (path.includes('/students')) return 'students';
    if (path.includes('/assessments')) return 'assessments';
    if (path.includes('/insights')) return 'insights';
    if (path.includes('/reports')) return 'reports';
    return 'dashboard';
  };

  const currentContext = getCurrentContext();
  
  // Filter actions based on current context
  const contextualActions = allActions.filter(action => 
    action.context.includes(currentContext)
  );

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          bg: designSystem.colors.primary.bg,
          hover: designSystem.colors.primary.hover,
          text: 'text-white'
        };
      case 'success':
        return {
          bg: designSystem.colors.success.bg,
          hover: designSystem.colors.success.hover,
          text: 'text-white'
        };
      case 'warning':
        return {
          bg: designSystem.colors.warning.bg,
          hover: designSystem.colors.warning.hover,
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-100',
          hover: 'hover:bg-gray-200',
          text: 'text-gray-900'
        };
    }
  };

  if (contextualActions.length === 0) return null;

  return (
    <DSCard>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Quick Actions</span>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {contextualActions.map((action) => {
            const styles = getVariantStyles(action.variant);
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`
                  p-4 rounded-lg border-2 border-transparent
                  ${styles.bg} ${styles.hover} ${styles.text}
                  transition-all duration-200 text-left
                  hover:border-gray-300 hover:shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  group
                `}
              >
                <DSFlexContainer direction="col" gap="sm" align="start">
                  <DSFlexContainer justify="between" align="center" className="w-full">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {action.icon}
                    </div>
                    {action.shortcut && (
                      <kbd className="px-2 py-1 text-xs bg-black/10 border border-white/20 rounded text-white/80">
                        {action.shortcut}
                      </kbd>
                    )}
                  </DSFlexContainer>
                  <div>
                    <DSBodyText className={`font-medium ${styles.text} mb-1`}>
                      {action.title}
                    </DSBodyText>
                    <DSHelpText className="text-white/80">
                      {action.description}
                    </DSHelpText>
                  </div>
                </DSFlexContainer>
              </button>
            );
          })}
        </div>
        
        {/* Help text */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <DSHelpText className="text-center">
            Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">⌘K</kbd> to open command palette
          </DSHelpText>
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default ContextualQuickActions;
