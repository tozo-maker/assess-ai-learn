
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle, ExternalLink } from 'lucide-react';
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardTitle,
  DSFlexContainer,
  DSBodyText,
  DSButton,
  DSStatusBadge
} from '@/components/ui/design-system';

interface Alert {
  id: string;
  type: 'performance' | 'attendance' | 'system';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionUrl: string;
  studentCount?: number;
  timestamp?: string;
}

interface EnhancedAlertCardProps {
  alerts: Alert[];
  className?: string;
}

const EnhancedAlertCard: React.FC<EnhancedAlertCardProps> = ({ alerts, className = '' }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Info className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          card: 'border-red-200 bg-red-50 border-l-4 border-l-red-500',
          icon: 'text-red-600',
          badge: 'danger' as const
        };
      case 'medium':
        return {
          card: 'border-amber-200 bg-amber-50 border-l-4 border-l-amber-500',
          icon: 'text-amber-600',
          badge: 'warning' as const
        };
      default:
        return {
          card: 'border-blue-200 bg-blue-50 border-l-4 border-l-blue-500',
          icon: 'text-blue-600',
          badge: 'info' as const
        };
    }
  };

  const primaryAlert = alerts[0];
  const styles = getAlertStyles(primaryAlert.severity);

  return (
    <DSCard className={`${styles.card} ${className}`}>
      <DSCardHeader className="pb-4">
        <DSFlexContainer justify="between" align="center">
          <DSCardTitle className="text-lg font-semibold">Priority Alerts</DSCardTitle>
          <DSStatusBadge variant={styles.badge} size="sm">
            {alerts.length} Alert{alerts.length > 1 ? 's' : ''}
          </DSStatusBadge>
        </DSFlexContainer>
      </DSCardHeader>
      <DSCardContent>
        <div className="space-y-4">
          {alerts.slice(0, 2).map((alert) => {
            const alertStyles = getAlertStyles(alert.severity);
            return (
              <div key={alert.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <DSFlexContainer align="start" gap="md">
                  <div className={alertStyles.icon}>
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <DSFlexContainer justify="between" align="start" className="mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <DSStatusBadge variant={alertStyles.badge} size="sm">
                        {alert.severity}
                      </DSStatusBadge>
                    </DSFlexContainer>
                    <DSBodyText className="text-gray-600 mb-3 text-sm">
                      {alert.description}
                    </DSBodyText>
                    {alert.studentCount && (
                      <DSBodyText className="text-xs text-gray-500 mb-3">
                        Affects {alert.studentCount} student{alert.studentCount > 1 ? 's' : ''}
                      </DSBodyText>
                    )}
                    <Link to={alert.actionUrl}>
                      <DSButton variant="primary" size="sm" className="gap-1">
                        Take Action
                        <ExternalLink className="h-3 w-3" />
                      </DSButton>
                    </Link>
                  </div>
                </DSFlexContainer>
              </div>
            );
          })}
          {alerts.length > 2 && (
            <DSFlexContainer justify="center" className="pt-2">
              <Link to="/app/insights/recommendations">
                <DSButton variant="secondary" size="sm">
                  View All {alerts.length} Alerts
                </DSButton>
              </Link>
            </DSFlexContainer>
          )}
        </div>
      </DSCardContent>
    </DSCard>
  );
};

export default EnhancedAlertCard;
