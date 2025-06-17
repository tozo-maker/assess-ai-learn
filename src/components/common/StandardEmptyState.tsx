
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Lightbulb } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline';
}

interface FeatureHighlight {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  textColor: string;
  borderColor: string;
}

interface StandardEmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  primaryAction?: QuickAction;
  secondaryActions?: QuickAction[];
  features?: FeatureHighlight[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  entityName?: string; // e.g., "assessments", "students"
}

const StandardEmptyState: React.FC<StandardEmptyStateProps> = ({
  title,
  description,
  illustration,
  primaryAction,
  secondaryActions = [],
  features = [],
  hasActiveFilters = false,
  onClearFilters,
  entityName = 'items'
}) => {
  if (hasActiveFilters) {
    return (
      <div className="text-center py-16 px-6">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No {entityName} match your criteria
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Try adjusting your search terms or clearing some filters to see more results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            Clear All Filters
          </Button>
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              <primaryAction.icon className="mr-2 h-4 w-4" />
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20 px-6">
      {/* Illustration */}
      <div className="mx-auto w-32 h-32 relative mb-8">
        {illustration || (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse"></div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
        {description}
      </p>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        {primaryAction && (
          <Button 
            onClick={primaryAction.onClick}
            className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <primaryAction.icon className="h-5 w-5" />
            {primaryAction.label}
          </Button>
        )}
        
        {secondaryActions.map((action, index) => (
          <Button 
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
            className="gap-2 h-12 px-8 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <action.icon className="h-5 w-5" />
            {action.label}
          </Button>
        ))}
      </div>

      {/* Feature Highlights */}
      {features.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Getting Started</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-6 ${feature.bgColor} rounded-xl ${feature.borderColor} hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-12 h-12 ${feature.iconColor} rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className={`font-semibold ${feature.textColor} mb-2`}>{feature.title}</h3>
                <p className={`${feature.textColor} text-sm leading-relaxed`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardEmptyState;
