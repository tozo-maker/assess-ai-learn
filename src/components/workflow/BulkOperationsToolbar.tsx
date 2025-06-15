
import React from 'react';
import { Trash2, Download, Mail, Archive, MoreHorizontal, X } from 'lucide-react';
import {
  DSCard,
  DSCardContent,
  DSButton,
  DSFlexContainer,
  DSBodyText,
  designSystem
} from '@/components/ui/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedIds: string[]) => void;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
}

interface BulkOperationsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  selectedIds: string[];
  className?: string;
}

const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
  selectedIds,
  className = ''
}) => {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      const confirmed = window.confirm(
        `Are you sure you want to ${action.label.toLowerCase()} ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`
      );
      if (!confirmed) return;
    }
    
    action.action(selectedIds);
  };

  const primaryActions = actions.filter(action => !action.variant || action.variant === 'default').slice(0, 3);
  const secondaryActions = actions.filter(action => action.variant === 'destructive').concat(
    actions.filter(action => !action.variant || action.variant === 'default').slice(3)
  );

  if (selectedCount === 0) return null;

  return (
    <DSCard className={`${className} border-blue-200 bg-blue-50`}>
      <DSCardContent className="p-4">
        <DSFlexContainer justify="between" align="center">
          <DSFlexContainer align="center" gap="md">
            {/* Selection status */}
            <DSFlexContainer align="center" gap="sm">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <DSBodyText className="font-medium text-blue-900">
                {selectedCount} of {totalCount} selected
              </DSBodyText>
            </DSFlexContainer>

            {/* Primary actions */}
            <DSFlexContainer gap="sm">
              {primaryActions.map((action) => (
                <DSButton
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(action)}
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DSButton>
              ))}
              
              {/* More actions dropdown */}
              {secondaryActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <DSButton
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-gray-50 border-gray-300"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DSButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {secondaryActions.map((action, index) => (
                      <React.Fragment key={action.id}>
                        {index === 0 && primaryActions.length > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          onClick={() => handleAction(action)}
                          className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
                        >
                          <span className="mr-2">{action.icon}</span>
                          {action.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </DSFlexContainer>
          </DSFlexContainer>

          {/* Clear selection */}
          <DSButton
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </DSButton>
        </DSFlexContainer>
      </DSCardContent>
    </DSCard>
  );
};

export default BulkOperationsToolbar;
