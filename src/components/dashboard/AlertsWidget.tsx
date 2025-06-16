
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span>Priority Alerts</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getAlertIcon(alert.type)}
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {alert.studentCount} student{alert.studentCount > 1 ? 's' : ''} affected
                </span>
                <Button size="sm" variant="outline" asChild>
                  <Link to={alert.actionUrl}>Take Action</Link>
                </Button>
              </div>
            </div>
          ))}
          {alerts.length > 3 && (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/insights/recommendations">View All Alerts</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
