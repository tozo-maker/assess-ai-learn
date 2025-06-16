
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvHeaders: string[];
  onMappingConfirm: (mapping: Record<string, string>) => void;
}

const STUDENT_FIELDS = [
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: true },
  { key: 'student_id', label: 'Student ID', required: false },
  { key: 'grade_level', label: 'Grade Level', required: false },
  { key: 'learning_goals', label: 'Learning Goals', required: false },
  { key: 'special_considerations', label: 'Special Considerations', required: false },
  { key: 'parent_name', label: 'Parent Name', required: false },
  { key: 'parent_email', label: 'Parent Email', required: false },
  { key: 'parent_phone', label: 'Parent Phone', required: false },
];

const ColumnMappingDialog: React.FC<ColumnMappingDialogProps> = ({
  open,
  onOpenChange,
  csvHeaders,
  onMappingConfirm
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleMappingChange = (fieldKey: string, csvHeader: string) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: csvHeader
    }));
  };

  const getRequiredFieldsMapped = () => {
    const requiredFields = STUDENT_FIELDS.filter(field => field.required);
    return requiredFields.filter(field => mapping[field.key] && mapping[field.key] !== 'skip');
  };

  const canProceed = () => {
    const requiredFields = STUDENT_FIELDS.filter(field => field.required);
    return requiredFields.every(field => mapping[field.key] && mapping[field.key] !== 'skip');
  };

  const handleConfirm = () => {
    onMappingConfirm(mapping);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map CSV Columns to Student Fields</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Map your CSV columns to the student database fields. Required fields must be mapped.
          </div>
          
          <div className="space-y-3">
            {STUDENT_FIELDS.map(field => (
              <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {field.required ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <div>
                    <Label className="font-medium">{field.label}</Label>
                    {field.required && (
                      <div className="text-xs text-red-600">Required</div>
                    )}
                  </div>
                </div>
                
                <Select 
                  value={mapping[field.key] || ''} 
                  onValueChange={(value) => handleMappingChange(field.key, value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select CSV column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip this field</SelectItem>
                    {csvHeaders.map(header => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Required fields mapped: {getRequiredFieldsMapped().length} / {STUDENT_FIELDS.filter(f => f.required).length}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!canProceed()}>
                Continue Import
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnMappingDialog;
