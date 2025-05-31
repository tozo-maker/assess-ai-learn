
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  className?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  title,
  message,
  className = ''
}) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-semantic-success-light border-semantic-success',
          icon: CheckCircle,
          iconColor: 'text-semantic-success',
          titleColor: 'text-semantic-success'
        };
      case 'error':
        return {
          container: 'bg-semantic-danger-light border-semantic-danger',
          icon: XCircle,
          iconColor: 'text-semantic-danger',
          titleColor: 'text-semantic-danger'
        };
      case 'warning':
        return {
          container: 'bg-semantic-warning-light border-semantic-warning',
          icon: AlertTriangle,
          iconColor: 'text-semantic-warning',
          titleColor: 'text-semantic-warning'
        };
      case 'info':
        return {
          container: 'bg-semantic-info-light border-semantic-info',
          icon: Info,
          iconColor: 'text-semantic-info',
          titleColor: 'text-semantic-info'
        };
    }
  };

  const styles = getStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`p-4 border rounded-lg ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <IconComponent className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <div className={`font-medium ${styles.titleColor}`}>{title}</div>
          {message && (
            <p className="text-body-md mt-1">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusMessage;
