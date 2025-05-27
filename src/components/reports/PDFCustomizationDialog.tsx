
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { PDFGenerationOptions } from '@/services/pdf-service';

interface PDFCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (options: PDFGenerationOptions) => void;
  studentName?: string;
  isGenerating?: boolean;
}

const PDFCustomizationDialog: React.FC<PDFCustomizationDialogProps> = ({
  open,
  onOpenChange,
  onGenerate,
  studentName,
  isGenerating = false
}) => {
  const [options, setOptions] = useState<PDFGenerationOptions>({
    includeCharts: true,
    includeGoals: true,
    includeInsights: true,
    customNotes: ''
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleGenerate = () => {
    const finalOptions: PDFGenerationOptions = {
      ...options,
      dateRange: startDate && endDate ? {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      } : undefined
    };
    
    onGenerate(finalOptions);
  };

  const updateOption = (key: keyof PDFGenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Progress Report PDF</DialogTitle>
          {studentName && (
            <p className="text-sm text-muted-foreground">
              Generating report for {studentName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Sections */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Include Sections</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => updateOption('includeCharts', checked)}
                />
                <Label htmlFor="charts">Performance Charts & Visualizations</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goals"
                  checked={options.includeGoals}
                  onCheckedChange={(checked) => updateOption('includeGoals', checked)}
                />
                <Label htmlFor="goals">Learning Goals Progress</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insights"
                  checked={options.includeInsights}
                  onCheckedChange={(checked) => updateOption('includeInsights', checked)}
                />
                <Label htmlFor="insights">AI Insights & Recommendations</Label>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Date Range (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
              Custom Teacher Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional comments or observations for parents..."
              value={options.customNotes}
              onChange={(e) => updateOption('customNotes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PDFCustomizationDialog;
