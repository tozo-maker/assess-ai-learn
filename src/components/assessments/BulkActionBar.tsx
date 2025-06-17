
import React from 'react';
import { Trash2, Users, BarChart3, Archive, Copy, X } from 'lucide-react';
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
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
            >
              <Users className="h-4 w-4" />
              Add Responses
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>

            {onBulkDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDuplicate}
                className="h-8 gap-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
            )}

            {onBulkArchive && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkArchive}
                className="h-8 gap-2 hover:bg-gray-50 hover:border-gray-300"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
