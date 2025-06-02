
import React from 'react';
import { AlertCircle, TrendingDown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DSCard,
  DSCardContent,
  DSCardHeader,
  DSCardTitle,
  DSButton,
  DSStatusBadge,
  DSFlexContainer,
  DSBodyText,
  DSHelpText,
  DSSpacer,
  designSystem
} from '@/components/ui/design-system';

interface Alert {
  id: string;
  type: 'performance' | 'attendance' | 'behavior';
  title: string;
  description: string;
  studentCount: number;
  severity: 'high' | 'medium' | 'low';
  actionUrl: string;
}

interface AlertsWidgetProps {
  alerts: Alert[];
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingDown className="h-4 w-4" />;
      case 'attendance':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string): 'danger' | 'warning' | 'neutral' => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <DSCard>
      <DSCardHeader>
        <DSCardTitle>
          <DSFlexContainer align="center" gap="sm">
            <AlertCircle className={`h-5 w-5 ${designSystem.colors.danger.text}`} />
            <span>Priority Alerts</span>
          </DSFlexContainer>
        </DSCardTitle>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {alerts.slice(0, 3).map((alert) => (
            <DSCard key={alert.id} className="border rounded-lg">
              <DSCardContent className="p-3">
                <DSFlexContainer justify="between" align="start" className="mb-2">
                  <DSFlexContainer align="center" gap="sm">
                    {getAlertIcon(alert.type)}
                    <DSBodyText className="font-medium text-sm">{alert.title}</DSBodyText>
                  </DSFlexContainer>
                  <DSStatusBadge variant={getSeverityVariant(alert.severity)} size="sm">
                    {alert.severity}
                  </DSStatusBadge>
                </DSFlexContainer>
                <DSHelpText className="mb-2">{alert.description}</DSHelpText>
                <DSFlexContainer justify="between" align="center">
                  <DSHelpText>
                    {alert.studentCount} student{alert.studentCount > 1 ? 's' : ''} affected
                  </DSHelpText>
                  <DSButton size="sm" variant="secondary" asChild>
                    <Link to={alert.actionUrl}>Take Action</Link>
                  </DSButton>
                </DSFlexContainer>
              </DSCardContent>
            </DSCard>
          ))}
          {alerts.length > 3 && (
            <>
              <DSSpacer size="md" />
              <DSButton variant="secondary" className="w-full" asChild>
                <Link to="/app/insights/recommendations">View All Alerts</Link>
              </DSButton>
            </>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default AlertsWidget;
