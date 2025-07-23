
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckSquare, 
  Trash2, 
  Archive,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EnhancedAlertCard from './EnhancedAlertCard';

interface EnhancedAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  details?: string;
  studentName?: string;
  timestamp: Date;
  dismissible?: boolean;
  expandable?: boolean;
  actionRequired?: boolean;
  metadata?: Record<string, any>;
}

interface EnhancedAlertsCenterProps {
  alerts: EnhancedAlert[];
  onDismissAlert?: (alertId: string) => void;
  onBulkDismiss?: (alertIds: string[]) => void;
  onTakeAction?: (alertId: string, action: string) => void;
  onRefresh?: () => void;
}

const EnhancedAlertsCenter: React.FC<EnhancedAlertsCenterProps> = ({
  alerts,
  onDismissAlert,
  onBulkDismiss,
  onTakeAction,
  onRefresh
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');

  // Filter and sort alerts
  const filteredAlerts = alerts
    .filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (alert.studentName && alert.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
          return priorityOrder[b.type] - priorityOrder[a.type];
        case 'timestamp':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(new Set(filteredAlerts.map(alert => alert.id)));
    } else {
      setSelectedAlerts(new Set());
    }
  };

  const handleSelectAlert = (alertId: string, selected: boolean) => {
    const newSelected = new Set(selectedAlerts);
    if (selected) {
      newSelected.add(alertId);
    } else {
      newSelected.delete(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const handleBulkAction = (action: string) => {
    const selectedIds = Array.from(selectedAlerts);
    switch (action) {
      case 'dismiss':
        onBulkDismiss?.(selectedIds);
        setSelectedAlerts(new Set());
        break;
      case 'archive':
        // Handle archive action
        console.log('Archive alerts:', selectedIds);
        setSelectedAlerts(new Set());
        break;
    }
  };

  const getAlertCounts = () => {
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      high: alerts.filter(a => a.type === 'high').length,
      actionRequired: alerts.filter(a => a.actionRequired).length
    };
  };

  const counts = getAlertCounts();
  const hasSelection = selectedAlerts.size > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl font-semibold">Enhanced Alerts Center</CardTitle>
            <div className="flex gap-2">
              {counts.critical > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {counts.critical} Critical
                </Badge>
              )}
              {counts.high > 0 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {counts.high} High
                </Badge>
              )}
              <Badge variant="outline">
                {counts.total} Total
              </Badge>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortDesc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Recent First</SelectItem>
              <SelectItem value="priority">By Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Bar */}
        {filteredAlerts.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedAlerts.size === filteredAlerts.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {hasSelection ? `${selectedAlerts.size} selected` : 'Select all'}
              </span>
            </div>

            {hasSelection && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('dismiss')}
                  className="gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  Dismiss ({selectedAlerts.size})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <EnhancedAlertCard
                key={alert.id}
                alert={alert}
                isSelected={selectedAlerts.has(alert.id)}
                onSelect={(selected) => handleSelectAlert(alert.id, selected)}
                onDismiss={onDismissAlert}
                onAction={onTakeAction}
                showBulkActions={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No alerts found</p>
              <p className="text-sm text-gray-500">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'All caught up! No active alerts.'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredAlerts.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-600">
            <span>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
            <span>
              {counts.actionRequired} require immediate action
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAlertsCenter;
