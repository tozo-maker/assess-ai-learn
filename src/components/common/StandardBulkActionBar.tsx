
import React from 'react';
import { Trash2, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  hoverColor?: string;
}

interface StandardBulkActionBarProps {
  selectedCount: number;
  entityName: string; // e.g., "assessment", "student"
  onClearSelection: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  customActions?: BulkAction[];
  className?: string;
}

const StandardBulkActionBar: React.FC<StandardBulkActionBarProps> = ({
  selectedCount,
  entityName,
  onClearSelection,
  onDelete,
  isDeleting = false,
  customActions = [],
  className = ''
}) => {
  if (selectedCount === 0) return null;

  const hasCustomActions = customActions.length > 0;
  const showMoreMenu = hasCustomActions && customActions.length > 3;
  const visibleActions = showMoreMenu ? customActions.slice(0, 2) : customActions;
  const menuActions = showMoreMenu ? customActions.slice(2) : [];

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-bottom ${className}`}>
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/10 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Custom Actions */}
            {visibleActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                className={`h-8 gap-2 ${action.hoverColor || ''}`}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}

            {/* More Menu */}
            {showMoreMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {menuActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.onClick}
                      className="flex items-center cursor-pointer"
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Delete Action */}
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    className="h-8 gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 border-red-200 text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {entityName}s</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedCount} {entityName}{selectedCount > 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardBulkActionBar;
