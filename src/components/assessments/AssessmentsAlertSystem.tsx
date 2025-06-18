
import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  dismissible?: boolean;
}

const AssessmentsAlertSystem: React.FC = () => {
  const [alerts, setAlerts] = React.useState<Alert[]>([
    {
      id: '1',
      type: 'info',
      title: 'Assessment Analytics Ready',
      message: 'New performance insights are available for your recent assessments.',
      dismissible: true
    },
    {
      id: '2',
      type: 'warning',
      title: 'Pending Assessments',
      message: '3 assessments are in draft status and need to be completed.',
      dismissible: true
    }
  ]);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
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
                icon: 'text-amber-600',
                IconComponent: AlertTriangle
              };
            case 'success':
              return {
                card: 'border-green-200 bg-gradient-to-r from-green-50 to-green-100/50',
                icon: 'text-green-600',
                IconComponent: CheckCircle
              };
            default:
              return {
                card: 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50',
                icon: 'text-blue-600',
                IconComponent: Info
              };
          }
        };

        const styles = getAlertStyles();
        const { IconComponent } = styles;

        return (
          <Card key={alert.id} className={`${styles.card} border-l-4`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-5 w-5 ${styles.icon}`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                </div>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssessmentsAlertSystem;
