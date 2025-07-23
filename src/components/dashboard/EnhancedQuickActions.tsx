
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Users, 
  FileText, 
  BarChart3, 
  Target,
  Zap,
  Clock,
  Keyboard,
  TrendingUp,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  shortcut?: string;
  category: 'create' | 'analyze' | 'manage' | 'communicate';
  priority: number;
  recentlyUsed?: boolean;
  suggested?: boolean;
}

interface RecentAction {
  id: string;
  title: string;
  timestamp: Date;
  count: number;
}

const EnhancedQuickActions: React.FC = () => {
  const [recentActions, setRecentActions] = useState<RecentAction[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'add-student',
      title: 'Add Student',
      description: 'Register a new student to your class',
      icon: <Users className="h-5 w-5" />,
      href: '/app/students/add',
      variant: 'primary',
      shortcut: 'S',
      category: 'create',
      priority: 1,
      suggested: true
    },
    {
      id: 'create-assessment',
      title: 'Create Assessment',
      description: 'Design a new assessment or quiz',
      icon: <FileText className="h-5 w-5" />,
      href: '/app/assessments/add',
      variant: 'secondary',
      shortcut: 'A',
      category: 'create',
      priority: 2
    },
    {
      id: 'view-insights',
      title: 'AI Insights',
      description: 'View AI-powered analytics and recommendations',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/app/insights/class',
      variant: 'success',
      shortcut: 'I',
      category: 'analyze',
      priority: 1,
      suggested: true
    },
    {
      id: 'set-goals',
      title: 'Set Learning Goals',
      description: 'Create personalized learning objectives',
      icon: <Target className="h-5 w-5" />,
      href: '/app/students',
      variant: 'warning',
      shortcut: 'G',
      category: 'manage',
      priority: 3
    },
    {
      id: 'progress-report',
      title: 'Progress Reports',
      description: 'Generate comprehensive student reports',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/app/reports',
      variant: 'info',
      shortcut: 'R',
      category: 'analyze',
      priority: 2
    },
    {
      id: 'curriculum-guide',
      title: 'Curriculum Guide',
      description: 'Access curriculum standards and guides',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/app/curriculum',
      variant: 'secondary',
      category: 'manage',
      priority: 4
    },
    {
      id: 'parent-communication',
      title: 'Parent Communication',
      description: 'Send updates and notifications to parents',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/app/communication',
      variant: 'primary',
      shortcut: 'P',
      category: 'communicate',
      priority: 3
    }
  ];

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const action = quickActions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase());
        if (action) {
          e.preventDefault();
          window.location.href = action.href;
          trackActionUsage(action.id, action.title);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const trackActionUsage = (actionId: string, actionTitle: string) => {
    const now = new Date();
    setRecentActions(prev => {
      const existing = prev.find(a => a.id === actionId);
      if (existing) {
        return prev.map(a => 
          a.id === actionId 
            ? { ...a, timestamp: now, count: a.count + 1 }
            : a
        );
      } else {
        return [...prev, { id: actionId, title: actionTitle, timestamp: now, count: 1 }]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5);
      }
    });
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:border-blue-300';
      case 'secondary':
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 hover:border-gray-300';
      case 'success':
        return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700 hover:border-green-300';
      case 'warning':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700 hover:border-orange-300';
      case 'info':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700 hover:border-purple-300';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
    }
  };

  const getIconBackgroundStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-600';
      case 'secondary':
        return 'bg-gray-100 text-gray-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      case 'info':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const suggestedActions = quickActions.filter(a => a.suggested || a.priority <= 2).slice(0, 4);
  const recentlyUsedActions = recentActions.slice(0, 3);

  return (
    <TooltipProvider>
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Quick Actions
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                  className="gap-2"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show keyboard shortcuts</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Suggested Actions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-medium text-gray-900">Suggested</h4>
              <Badge variant="secondary" className="text-xs">Smart picks</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {suggestedActions.map((action) => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <Link
                      to={action.href}
                      onClick={() => trackActionUsage(action.id, action.title)}
                      className="group block"
                    >
                      <div className={`
                        p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                        ${getVariantStyles(action.variant)}
                        ${action.suggested ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
                      `}>
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-lg transition-colors duration-200
                            ${getIconBackgroundStyles(action.variant)}
                          `}>
                            {action.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{action.title}</h4>
                              {action.shortcut && (
                                <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded text-gray-600">
                                  ⌘{action.shortcut}
                                </kbd>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm">{action.description}</p>
                      {action.shortcut && (
                        <p className="text-xs text-gray-500">
                          Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+{action.shortcut}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Recent Actions */}
          {recentlyUsedActions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">Recently Used</h4>
              </div>
              <div className="space-y-2">
                {recentlyUsedActions.map((recent) => (
                  <div key={recent.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{recent.title}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{recent.count}x</span>
                      <span>{recent.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Panel */}
          {showKeyboardShortcuts && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Keyboard Shortcuts</h4>
              <div className="space-y-2">
                {quickActions.filter(a => a.shortcut).map((action) => (
                  <div key={action.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{action.title}</span>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-gray-600">
                      {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+{action.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{recentActions.length}</div>
                <div className="text-xs text-gray-600">Actions Used</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {recentActions.reduce((sum, a) => sum + a.count, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Uses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {quickActions.filter(a => a.suggested).length}
                </div>
                <div className="text-xs text-gray-600">Suggested</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedQuickActions;
