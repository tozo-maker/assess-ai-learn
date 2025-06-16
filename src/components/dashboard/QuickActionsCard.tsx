
import React from 'react';
import { Plus, FileText, Users, Lightbulb, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSContentGrid,
  DSFlexContainer,
  DSBodyText,
  DSSpacer,
  designSystem
} from '@/components/ui/design-system';

const QuickActionsCard: React.FC = () => {
  const quickActions = [
    {
      title: "Add Assessment",
      description: "Upload or enter new assessment data",
      href: "/app/assessments/add",
      icon: <FileText className="h-5 w-5" />,
      variant: 'info' as const
    },
    {
      title: "Add Student",
      description: "Register a new student to your class",
      href: "/app/students/add",
      icon: <Users className="h-5 w-5" />,
      variant: 'success' as const
    },
    {
      title: "View Insights",
      description: "See latest AI analysis and recommendations",
      href: "/app/insights/class",
      icon: <Lightbulb className="h-5 w-5" />,
      variant: 'warning' as const
    },
    {
      title: "Class Analytics",
      description: "Comprehensive class performance analysis",
      href: "/app/insights/class",
      icon: <BarChart3 className="h-5 w-5" />,
      variant: 'danger' as const
    }
  ];

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'info':
        return `${designSystem.colors.info.bg} ${designSystem.colors.info.hover}`;
      case 'success':
        return `${designSystem.colors.success.bg} ${designSystem.colors.success.hover}`;
      case 'warning':
        return `${designSystem.colors.warning.bg} ${designSystem.colors.warning.hover}`;
      case 'danger':
        return `${designSystem.colors.danger.bg} ${designSystem.colors.danger.hover}`;
      default:
        return `${designSystem.colors.primary.bg} ${designSystem.colors.primary.hover}`;
    }
  };

  return (
    <DSCard>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <Plus className="h-5 w-5" />
            <span>Quick Actions</span>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <DSContentGrid cols={2}>
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <DSButton 
                className={`w-full h-auto p-3 ${getVariantStyles(action.variant)} text-white`}
                size="sm"
              >
                <DSFlexContainer direction="col" align="center" gap="xs">
                  {action.icon}
                  <DSBodyText className="text-xs font-medium text-white">{action.title}</DSBodyText>
                </DSFlexContainer>
              </DSButton>
            </Link>
          ))}
        </DSContentGrid>
      </DSCardContent>
    </DSCard>
  );
};

export default QuickActionsCard;
