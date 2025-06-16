
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Users, UserPlus } from 'lucide-react';

interface ImportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOptionsConfirm: (options: ImportOptions) => void;
  duplicateCount?: number;
}

export interface ImportOptions {
  duplicateHandling: 'skip' | 'update' | 'create_new';
  validateEmails: boolean;
  createBackup: boolean;
}

const ImportOptionsDialog: React.FC<ImportOptionsDialogProps> = ({
  open,
  onOpenChange,
  onOptionsConfirm,
  duplicateCount = 0
}) => {
  const [options, setOptions] = useState<ImportOptions>({
    duplicateHandling: 'skip',
    validateEmails: true,
    createBackup: true
  });

  const handleConfirm = () => {
    onOptionsConfirm(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Options</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {duplicateCount > 0 && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">
                  {duplicateCount} potential duplicate{duplicateCount !== 1 ? 's' : ''} detected
                </div>
                <div className="text-yellow-700">
                  Students with matching names or IDs found in your existing data.
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Label className="text-base font-medium">Handle Duplicate Students</Label>
            <RadioGroup 
              value={options.duplicateHandling} 
              onValueChange={(value: 'skip' | 'update' | 'create_new') => 
                setOptions(prev => ({ ...prev, duplicateHandling: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="skip" id="skip" />
                <Label htmlFor="skip" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Skip duplicates (recommended)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="update" id="update" />
                <Label htmlFor="update" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Update existing students</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="create_new" id="create_new" />
                <Label htmlFor="create_new" className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create new records anyway</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-medium">Additional Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="validate-emails"
                  checked={options.validateEmails}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, validateEmails: !!checked }))
                  }
                />
                <Label htmlFor="validate-emails">Validate email formats</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="create-backup"
                  checked={options.createBackup}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, createBackup: !!checked }))
                  }
                />
                <Label htmlFor="create-backup">Create backup before import</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Start Import
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportOptionsDialog;
