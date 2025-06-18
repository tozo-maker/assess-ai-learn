
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  details?: string;
  dismissible?: boolean;
  expandable?: boolean;
  count?: number;
}

const AssessmentsAlertSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'info',
      title: 'Assessment Analytics Ready',
      message: 'New performance insights are available for your recent assessments.',
      details: 'AI analysis has identified learning patterns across 5 recent assessments. View detailed recommendations to help students improve their performance.',
      dismissible: true,
      expandable: true,
      count: 5
    },
    {
      id: '2',
      type: 'warning',
      title: 'Pending Assessments',
      message: '3 assessments are in draft status and need to be completed.',
      details: 'These assessments have been in draft mode for more than 7 days. Consider finalizing them or converting them to active assessments.',
      dismissible: true,
      expandable: true,
      count: 3
    },
    {
      id: '3',
      type: 'success',
      title: 'Weekly Goals Achieved',
      message: 'Your class has completed all planned assessments for this week.',
      dismissible: true,
      expandable: false
    }
  ]);

  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAlerts(newExpanded);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => {
        const getAlertStyles = () => {
          switch (alert.type) {
            case 'warning':
              return {
                card: 'border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50',
                icon: 'text-amber-600 bg-amber-100',
                IconComponent: AlertTriangle,
                badge: 'bg-amber-50 text-amber-700 border-amber-200'
              };
            case 'success':
              return {
                card: 'border-green-200 bg-gradient-to-r from-green-50 to-green-100/50',
                icon: 'text-green-600 bg-green-100',
                IconComponent: CheckCircle,
                badge: 'bg-green-50 text-green-700 border-green-200'
              };
            default:
              return {
                card: 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50',
                icon: 'text-blue-600 bg-blue-100',
                IconComponent: Info,
                badge: 'bg-blue-50 text-blue-700 border-blue-200'
              };
          }
        };

        const styles = getAlertStyles();
        const { IconComponent } = styles;
        const isExpanded = expandedAlerts.has(alert.id);

        return (
          <Card key={alert.id} className={`${styles.card} border-l-4 hover:shadow-md transition-all duration-200`}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(alert.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${styles.icon}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        {alert.count && (
                          <Badge variant="outline" className={`text-xs ${styles.badge}`}>
                            {alert.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.expandable && alert.details && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white/50"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                    {alert.dismissible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-8 w-8 p-0 hover:bg-white/50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {alert.expandable && alert.details && (
                  <CollapsibleContent className="mt-3 pt-3 border-t border-gray-200/50">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {alert.details}
                    </p>
                  </CollapsibleContent>
                )}
              </CardContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
};

export default AssessmentsAlertSystem;
