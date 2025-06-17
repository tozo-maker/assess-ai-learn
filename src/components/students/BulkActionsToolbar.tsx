
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, FileText, Trash2, UserPlus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEmail: () => void;
  onBulkReport: () => void;
  onBulkDelete: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkEmail,
  onBulkReport,
  onBulkDelete
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-[#2563eb] text-white p-4 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-white text-[#2563eb]">
          {selectedCount} selected
        </Badge>
        <span className="text-sm">
          {selectedCount === 1 ? '1 student selected' : `${selectedCount} students selected`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkEmail}
          className="bg-white text-[#2563eb] hover:bg-gray-100"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Parents
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkReport}
          className="bg-white text-[#2563eb] hover:bg-gray-100"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Reports
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-[#2563eb] hover:bg-gray-100"
            >
              More Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Group
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onBulkDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Students
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
