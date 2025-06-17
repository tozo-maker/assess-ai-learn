
import React from 'react';
import { Trash2, Users, BarChart3, Archive, Copy, X } from 'lucide-react';
import { 
  DSButton,
  DSFlexContainer
} from '@/components/ui/design-system';
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

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive?: () => void;
  onBulkDuplicate?: () => void;
  isDeleting?: boolean;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkDuplicate,
  isDeleting = false
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-bottom">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/10 px-6 py-4">
        <DSFlexContainer gap="lg" align="center">
          {/* Selection Info */}
          <DSFlexContainer gap="sm" align="center">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
              {selectedCount} selected
            </Badge>
            <DSButton
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 px-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </DSButton>
          </DSFlexContainer>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Actions */}
          <DSFlexContainer gap="sm" align="center">
            <DSButton
              variant="secondary"
              size="sm"
              className="h-8 gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
            >
              <Users className="h-4 w-4" />
              Add Responses
            </DSButton>

            <DSButton
              variant="secondary"
              size="sm"
              className="h-8 gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </DSButton>

            {onBulkDuplicate && (
              <DSButton
                variant="secondary"
                size="sm"
                onClick={onBulkDuplicate}
                className="h-8 gap-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </DSButton>
            )}

            {onBulkArchive && (
              <DSButton
                variant="secondary"
                size="sm"
                onClick={onBulkArchive}
                className="h-8 gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </DSButton>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DSButton
                  variant="danger"
                  size="sm"
                  disabled={isDeleting}
                  className="h-8 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DSButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Assessments</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedCount} assessment{selectedCount > 1 ? 's' : ''}? 
                    This action cannot be undone and will also delete all associated student responses and analysis data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onBulkDelete}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DSFlexContainer>
        </DSFlexContainer>
      </div>
    </div>
  );
};

export default BulkActionBar;
