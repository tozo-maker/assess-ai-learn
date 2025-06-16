
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  UserPlus, 
  FileText, 
  BarChart3, 
  Target, 
  Mail,
  Upload,
  Download
} from 'lucide-react';

const QuickActionsCard = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Register a new student',
      icon: UserPlus,
      action: () => navigate('/app/students/new'),
      variant: 'default' as const
    },
    {
      title: 'Create Assessment',
      description: 'Design a new assessment',
      icon: Plus,
      action: () => navigate('/app/assessments/new'),
      variant: 'default' as const
    },
    {
      title: 'Generate Report',
      description: 'Create student reports',
      icon: FileText,
      action: () => navigate('/app/reports'),
      variant: 'outline' as const
    },
    {
      title: 'View Analytics',
      description: 'Check performance data',
      icon: BarChart3,
      action: () => navigate('/app/analytics'),
      variant: 'outline' as const
    },
    {
      title: 'Set Goals',
      description: 'Create learning objectives',
      icon: Target,
      action: () => navigate('/app/goals'),
      variant: 'outline' as const
    },
    {
      title: 'Send Communication',
      description: 'Contact parents/guardians',
      icon: Mail,
      action: () => navigate('/app/communications'),
      variant: 'outline' as const
    },
    {
      title: 'Import Data',
      description: 'Upload student information',
      icon: Upload,
      action: () => navigate('/app/import'),
      variant: 'outline' as const
    },
    {
      title: 'Export Data',
      description: 'Download reports and data',
      icon: Download,
      action: () => navigate('/app/export'),
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.title}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={action.action}
              >
                <IconComponent className="h-6 w-6" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-70">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
