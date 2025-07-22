import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Target, 
  FileText, 
  Users, 
  BookOpen, 
  Calendar,
  MessageSquare,
  Download,
  Plus
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  variant: 'default' | 'secondary' | 'outline' | 'ghost';
  badge?: string;
  onClick: () => void;
}

interface QuickActionsProps {
  recentStudents?: Array<{ id: string; name: string }>;
  onAction: (actionId: string, data?: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  recentStudents = [],
  onAction
}) => {
  const primaryActions: QuickAction[] = [
    {
      id: 'send-email',
      title: 'Send Email',
      description: 'Quick communication to parents/students',
      icon: Mail,
      variant: 'default',
      onClick: () => onAction('send-email')
    },
    {
      id: 'create-goal',
      title: 'Create Goal',
      description: 'Set new learning objectives',
      icon: Target,
      variant: 'default',
      onClick: () => onAction('create-goal')
    },
    {
      id: 'add-assessment',
      title: 'Add Assessment',
      description: 'Input new assessment data',
      icon: FileText,
      variant: 'secondary',
      onClick: () => onAction('add-assessment')
    }
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'view-class',
      title: 'Class Overview',
      description: 'View all students in class',
      icon: Users,
      variant: 'outline',
      onClick: () => onAction('view-class')
    },
    {
      id: 'lesson-plan',
      title: 'Lesson Planning',
      description: 'Plan based on insights',
      icon: BookOpen,
      variant: 'outline',
      onClick: () => onAction('lesson-plan')
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Parent-teacher conference',
      icon: Calendar,
      variant: 'outline',
      badge: 'New',
      onClick: () => onAction('schedule-meeting')
    },
    {
      id: 'send-feedback',
      title: 'Send Feedback',
      description: 'Provide student feedback',
      icon: MessageSquare,
      variant: 'outline',
      onClick: () => onAction('send-feedback')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports and data',
      icon: Download,
      variant: 'outline',
      onClick: () => onAction('export-data')
    }
  ];

  const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => (
    <Button
      variant={action.variant}
      onClick={action.onClick}
      className="h-auto p-4 flex flex-col items-start space-y-2 hover-scale"
    >
      <div className="flex items-center justify-between w-full">
        <action.icon className="h-5 w-5" />
        {action.badge && (
          <Badge variant="secondary" className="text-xs">
            {action.badge}
          </Badge>
        )}
      </div>
      <div className="text-left">
        <div className="font-medium text-sm">{action.title}</div>
        <div className="text-xs opacity-70 font-normal">
          {action.description}
        </div>
      </div>
    </Button>
  );

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {primaryActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {secondaryActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Students Quick Access */}
      {recentStudents.length > 0 && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recentStudents.slice(0, 8).map((student) => (
                <Button
                  key={student.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onAction('view-student', { studentId: student.id })}
                  className="hover-scale"
                >
                  {student.name}
                </Button>
              ))}
              {recentStudents.length > 8 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAction('view-all-students')}
                >
                  +{recentStudents.length - 8} more
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickActions;