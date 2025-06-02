
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSButton,
  designSystem
} from '@/components/ui/design-system';

interface Alert {
  id: string;
  type: 'performance' | 'attendance' | 'system';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionUrl: string;
  studentCount?: number;
}

interface DashboardAlertsProps {
  alerts: Alert[];
}

const DashboardAlerts: React.FC<DashboardAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className={`h-5 w-5 ${designSystem.colors.danger.text}`} />;
      case 'medium':
        return <Info className={`h-5 w-5 ${designSystem.colors.warning.text}`} />;
      default:
        return <CheckCircle className={`h-5 w-5 ${designSystem.colors.info.text}`} />;
    }
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return `border-l-4 ${designSystem.colors.danger.border} ${designSystem.colors.danger.light}`;
      case 'medium':
        return `border-l-4 ${designSystem.colors.warning.border} ${designSystem.colors.warning.light}`;
      default:
        return `border-l-4 ${designSystem.colors.info.border} ${designSystem.colors.info.light}`;
    }
  };

  return (
    <DSCard className={getAlertStyles(alerts[0].severity)}>
      <DSCardHeader>
        <DSCardTitle>Priority Alerts</DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {alerts.slice(0, 3).map((alert) => (
            <DSFlexContainer key={alert.id} align="start" gap="md">
              {getAlertIcon(alert.severity)}
              <div className="flex-1">
                <DSBodyText className="font-medium text-gray-900 mb-1">
                  {alert.title}
                </DSBodyText>
                <DSBodyText className="text-gray-600 mb-3">
                  {alert.description}
                </DSBodyText>
                <Link to={alert.actionUrl}>
                  <DSButton variant="primary" size="sm">
                    Take Action
                  </DSButton>
                </Link>
              </div>
            </DSFlexContainer>
          ))}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default DashboardAlerts;
