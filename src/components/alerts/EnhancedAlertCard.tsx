
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  ChevronDown, 
  ChevronRight,
  Clock,
  User,
  Zap
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

interface EnhancedAlertCardProps {
  alert: EnhancedAlert;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onDismiss?: (alertId: string) => void;
  onAction?: (alertId: string, action: string) => void;
  showBulkActions?: boolean;
}

const EnhancedAlertCard: React.FC<EnhancedAlertCardProps> = ({
  alert,
  isSelected = false,
  onSelect,
  onDismiss,
  onAction,
  showBulkActions = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 border-red-200',
          borderColor: 'border-l-red-600',
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          Icon: AlertTriangle,
          badge: 'bg-red-100 text-red-800 border-red-200',
          urgencyPulse: 'animate-pulse'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          borderColor: 'border-l-orange-500',
          iconColor: 'text-orange-600',
          iconBg: 'bg-orange-100',
          Icon: AlertTriangle,
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          urgencyPulse: ''
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          borderColor: 'border-l-yellow-500',
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          Icon: Info,
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          urgencyPulse: ''
        };
      case 'low':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          Icon: Info,
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          urgencyPulse: ''
        };
      default:
        return {
          bgColor: 'bg-green-50 border-green-200',
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          Icon: CheckCircle,
          badge: 'bg-green-100 text-green-800 border-green-200',
          urgencyPulse: ''
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const { Icon } = config;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-l-4 transition-all duration-200 hover:shadow-md ${config.urgencyPulse}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Bulk Selection Checkbox */}
            {showBulkActions && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            )}

            {/* Alert Icon with Urgency Indicator */}
            <div className="relative">
              <div className={`p-2 rounded-lg ${config.iconBg}`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              {alert.type === 'critical' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </div>

            {/* Alert Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                  <Badge className={`text-xs px-2 py-0 ${config.badge}`}>
                    {alert.type.toUpperCase()}
                  </Badge>
                  {alert.actionRequired && (
                    <Badge variant="destructive" className="text-xs px-2 py-0">
                      <Zap className="h-3 w-3 mr-1" />
                      Action Required
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(alert.timestamp)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

              {alert.studentName && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <User className="h-3 w-3" />
                  <span>{alert.studentName}</span>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                {alert.actionRequired && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onAction?.(alert.id, 'take_action')}
                    className="text-xs h-7"
                  >
                    Take Action
                  </Button>
                )}
                
                {alert.expandable && alert.details && (
                  <CollapsibleTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 px-2"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Details
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}

                {alert.dismissible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismiss?.(alert.id)}
                    className="text-xs h-7 px-2 ml-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          {alert.expandable && alert.details && (
            <CollapsibleContent className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="pl-12">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {alert.details}
                </p>
                {alert.metadata && (
                  <div className="mt-2 text-xs text-gray-600">
                    <strong>Additional Info:</strong> {JSON.stringify(alert.metadata, null, 2)}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
};

export default EnhancedAlertCard;
