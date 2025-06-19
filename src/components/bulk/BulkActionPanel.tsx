
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trash2, 
  Mail, 
  Download, 
  FileText, 
  UserPlus, 
  X,
  CheckSquare
} from 'lucide-react';
import { useBulkOperations } from './BulkOperationsProvider';

interface BulkActionPanelProps {
  onBulkDelete?: () => void;
  onBulkEmail?: () => void;
  onBulkExport?: () => void;
  onBulkReport?: () => void;
  onBulkAssign?: () => void;
  isProcessing?: boolean;
  entityType?: string;
}

const BulkActionPanel: React.FC<BulkActionPanelProps> = ({
  onBulkDelete,
  onBulkEmail,
  onBulkExport,
  onBulkReport,
  onBulkAssign,
  isProcessing = false,
  entityType = 'items'
}) => {
  const { selectionCount, clearSelection } = useBulkOperations();

  if (selectionCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-in-bottom">
      <Card className="shadow-lg border-2 border-blue-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Info */}
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-blue-600 text-white">
                <CheckSquare className="h-3 w-3 mr-1" />
                {selectionCount} selected
              </Badge>
              <span className="text-sm font-medium text-gray-700">
                {selectionCount} {entityType} selected
              </span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onBulkEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkEmail}
                  disabled={isProcessing}
                  className="h-8 gap-2 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}

              {onBulkReport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkReport}
                  disabled={isProcessing}
                  className="h-8 gap-2 hover:bg-green-50 hover:border-green-200"
                >
                  <FileText className="h-4 w-4" />
                  Reports
                </Button>
              )}

              {onBulkExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkExport}
                  disabled={isProcessing}
                  className="h-8 gap-2 hover:bg-purple-50 hover:border-purple-200"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}

              {onBulkAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkAssign}
                  disabled={isProcessing}
                  className="h-8 gap-2 hover:bg-orange-50 hover:border-orange-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign
                </Button>
              )}

              {onBulkDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkDelete}
                  disabled={isProcessing}
                  className="h-8 gap-2 hover:bg-red-50 hover:border-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-8 px-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkActionPanel;
