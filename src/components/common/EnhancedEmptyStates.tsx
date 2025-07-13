import React from 'react';
import { Plus, Search, FileText, Users, BookOpen, Target, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'error' | 'permission';
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EnhancedEmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  icon,
  title,
  description,
  action,
  secondaryAction,
  className
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return <Search className="h-12 w-12 text-muted-foreground/60" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-semantic-danger/60" />;
      case 'permission':
        return <AlertCircle className="h-12 w-12 text-semantic-warning/60" />;
      default:
        return <FileText className="h-12 w-12 text-muted-foreground/60" />;
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'error':
        return 'text-semantic-danger';
      case 'permission':
        return 'text-semantic-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className={cn('text-center border-dashed', className)}>
      <CardHeader className="pb-4">
        <div className="flex justify-center mb-4">
          {icon || getDefaultIcon()}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </CardHeader>
      <CardContent className="pb-4">
        <p className={cn('text-sm max-w-md mx-auto', getColors())}>
          {description}
        </p>
      </CardContent>
      {(action || secondaryAction) && (
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="w-full sm:w-auto"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

// Specific empty state components for common scenarios
export const EmptyStudentsState: React.FC<{
  onAddStudent: () => void;
  onImportStudents?: () => void;
}> = ({ onAddStudent, onImportStudents }) => (
  <EnhancedEmptyState
    icon={<Users className="h-12 w-12 text-muted-foreground/60" />}
    title="No students yet"
    description="Get started by adding your first student to begin tracking their learning progress and assessments."
    action={{
      label: "Add Student",
      onClick: onAddStudent,
    }}
    secondaryAction={onImportStudents ? {
      label: "Import Students",
      onClick: onImportStudents,
    } : undefined}
  />
);

export const EmptyAssessmentsState: React.FC<{
  onCreateAssessment: () => void;
}> = ({ onCreateAssessment }) => (
  <EnhancedEmptyState
    icon={<BookOpen className="h-12 w-12 text-muted-foreground/60" />}
    title="No assessments found"
    description="Create your first assessment to start evaluating student performance and generating insights."
    action={{
      label: "Create Assessment",
      onClick: onCreateAssessment,
    }}
  />
);

export const EmptyGoalsState: React.FC<{
  onCreateGoal: () => void;
}> = ({ onCreateGoal }) => (
  <EnhancedEmptyState
    icon={<Target className="h-12 w-12 text-muted-foreground/60" />}
    title="No learning goals set"
    description="Set personalized learning goals for your students to track their progress and achievement milestones."
    action={{
      label: "Create Goal",
      onClick: onCreateGoal,
    }}
  />
);

export const EmptySearchState: React.FC<{
  searchTerm: string;
  onClearSearch: () => void;
}> = ({ searchTerm, onClearSearch }) => (
  <EnhancedEmptyState
    variant="search"
    title={`No results for "${searchTerm}"`}
    description="Try adjusting your search terms or filters to find what you're looking for."
    action={{
      label: "Clear Search",
      onClick: onClearSearch,
      variant: "outline",
    }}
  />
);

export const EmptyCommunicationsState: React.FC<{
  onCreateTemplate: () => void;
}> = ({ onCreateTemplate }) => (
  <EnhancedEmptyState
    icon={<Mail className="h-12 w-12 text-muted-foreground/60" />}
    title="No communications sent"
    description="Start engaging with parents by creating and sending personalized progress reports and updates."
    action={{
      label: "Create Template",
      onClick: onCreateTemplate,
    }}
  />
);

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}> = ({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content. Please try again or contact support if the problem persists.",
  onRetry,
  onGoBack
}) => (
  <EnhancedEmptyState
    variant="error"
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry,
    } : undefined}
    secondaryAction={onGoBack ? {
      label: "Go Back",
      onClick: onGoBack,
    } : undefined}
  />
);

export const PermissionDeniedState: React.FC<{
  resource: string;
  onContactAdmin?: () => void;
}> = ({ resource, onContactAdmin }) => (
  <EnhancedEmptyState
    variant="permission"
    title="Access Restricted"
    description={`You don't have permission to access ${resource}. Contact your administrator if you believe this is an error.`}
    action={onContactAdmin ? {
      label: "Contact Admin",
      onClick: onContactAdmin,
      variant: "outline",
    } : undefined}
  />
);