
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, Lightbulb, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActionsCard: React.FC = () => {
  const quickActions = [
    {
      title: "Add Assessment",
      description: "Upload or enter new assessment data",
      href: "/assessments/add",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Add Student",
      description: "Register a new student to your class",
      href: "/students/add",
      icon: <Users className="h-5 w-5" />,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Insights",
      description: "See latest AI analysis and recommendations",
      href: "/insights/class",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Class Analytics",
      description: "Comprehensive class performance analysis",
      href: "/insights/class",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                className={`w-full h-auto p-3 ${action.color}`}
                variant="default"
                size="sm"
              >
                <div className="flex flex-col items-center space-y-1">
                  {action.icon}
                  <span className="text-xs font-medium">{action.title}</span>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
