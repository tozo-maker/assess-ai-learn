
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingDown, 
  Calendar, 
  User, 
  Bell,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'performance_drop' | 'goal_overdue' | 'missing_assessment' | 'low_engagement' | 'milestone_achieved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  student_id: string;
  student_name: string;
  title: string;
  description: string;
  created_at: string;
  is_dismissed: boolean;
  action_required: boolean;
  metadata?: Record<string, any>;
}

interface AlertsCenterProps {
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
  onTakeAction: (alert: Alert) => void;
}

const AlertsCenter: React.FC<AlertsCenterProps> = ({
  alerts,
  onDismissAlert,
  onTakeAction
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const { toast } = useToast();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'performance_drop':
        return <TrendingDown className="h-4 w-4" />;
      case 'goal_overdue':
        return <Calendar className="h-4 w-4" />;
      case 'missing_assessment':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low_engagement':
        return <User className="h-4 w-4" />;
      case 'milestone_achieved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'performance_drop':
        return 'Performance Drop';
      case 'goal_overdue':
        return 'Overdue Goal';
      case 'missing_assessment':
        return 'Missing Assessment';
      case 'low_engagement':
        return 'Low Engagement';
      case 'milestone_achieved':
        return 'Milestone Achieved';
      default:
        return type.replace('_', ' ');
    }
  };

  const filterAlerts = (alerts: Alert[]) => {
    let filtered = alerts;

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'action_required') {
        filtered = filtered.filter(alert => alert.action_required && !alert.is_dismissed);
      } else if (activeTab === 'dismissed') {
        filtered = filtered.filter(alert => alert.is_dismissed);
      } else {
        filtered = filtered.filter(alert => alert.type === activeTab && !alert.is_dismissed);
      }
    } else {
      filtered = filtered.filter(alert => !alert.is_dismissed);
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    return filtered;
  };

  const filteredAlerts = filterAlerts(alerts);

  const getAlertCounts = () => {
    const counts = {
      all: alerts.filter(a => !a.is_dismissed).length,
      critical: alerts.filter(a => a.severity === 'critical' && !a.is_dismissed).length,
      action_required: alerts.filter(a => a.action_required && !a.is_dismissed).length,
      performance_drop: alerts.filter(a => a.type === 'performance_drop' && !a.is_dismissed).length,
      goal_overdue: alerts.filter(a => a.type === 'goal_overdue' && !a.is_dismissed).length
    };
    return counts;
  };

  const counts = getAlertCounts();

  const handleDismiss = (alertId: string) => {
    onDismissAlert(alertId);
    toast({
      title: 'Alert Dismissed',
      description: 'The alert has been dismissed successfully.'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Alerts Center
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              {counts.critical} Critical
            </Badge>
            <Badge variant="outline">
              {counts.all} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="relative">
              All
              {counts.all > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action_required">
              Action Required
              {counts.action_required > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {counts.action_required}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="performance_drop">
              Performance
              {counts.performance_drop > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {counts.performance_drop}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="goal_overdue">
              Goals
              {counts.goal_overdue > 0 && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {counts.goal_overdue}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              Dismissed
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(alert.type)}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs capitalize ${getSeverityColor(alert.severity)}`}
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{alert.description}</p>
                        <div className="flex items-center text-xs text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {alert.student_name}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(alert.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {alert.action_required && (
                        <Button
                          size="sm"
                          onClick={() => onTakeAction(alert)}
                        >
                          Take Action
                        </Button>
                      )}
                      {!alert.is_dismissed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {activeTab === 'dismissed' 
                    ? 'No dismissed alerts' 
                    : 'No active alerts'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AlertsCenter;
