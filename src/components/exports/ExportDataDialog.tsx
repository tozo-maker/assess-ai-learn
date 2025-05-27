
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { exportsService } from '@/services/exports-service';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import DateRangeFilter from '@/components/exports/DateRangeFilter';
import { ExportRequestData } from '@/types/exports';

interface ExportDataDialogProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ExportDataDialog: React.FC<ExportDataDialogProps> = ({
  variant = "outline",
  size = "sm",
  className = ""
}) => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<'student_data' | 'assessment_results' | 'progress_reports' | 'class_summary' | 'analytics_data'>('student_data');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: (exportData: ExportRequestData) => exportsService.requestExport(exportData),
    onSuccess: () => {
      toast({
        title: 'Export Started',
        description: 'Your export is being processed. You can download it from the exports page when ready.'
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const { data: recentExports } = useQuery({
    queryKey: ['exports'],
    queryFn: exportsService.getExports
  });

  const handleExport = () => {
    const filters: Record<string, any> = {};
    
    if (startDate) filters.start_date = new Date(startDate).toISOString();
    if (endDate) filters.end_date = new Date(endDate).toISOString();
    if (selectedFields.length > 0) filters.fields = selectedFields;
    if (includeArchived) filters.include_archived = true;

    exportMutation.mutate({
      export_type: exportType,
      export_format: 'csv',
      filters
    });
  };

  const getExportDescription = (type: string) => {
    switch (type) {
      case 'student_data':
        return 'Student roster with demographics and contact information';
      case 'assessment_results':
        return 'Assessment scores with AI insights and analysis';
      case 'progress_reports':
        return 'Student progress reports and goal tracking';
      case 'class_summary':
        return 'Class-wide performance analytics and summaries';
      case 'analytics_data':
        return 'Detailed analytics data for external analysis';
      default:
        return '';
    }
  };

  const getAvailableFields = (type: string) => {
    switch (type) {
      case 'student_data':
        return ['demographics', 'contact_info', 'learning_goals', 'special_considerations'];
      case 'assessment_results':
        return ['scores', 'ai_insights', 'skill_mastery', 'trends'];
      case 'progress_reports':
        return ['goals', 'milestones', 'achievements', 'recommendations'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label>Export Type</Label>
            <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student_data">Student Data</SelectItem>
                <SelectItem value="assessment_results">Assessment Results</SelectItem>
                <SelectItem value="progress_reports">Progress Reports</SelectItem>
                <SelectItem value="class_summary">Class Summary</SelectItem>
                <SelectItem value="analytics_data">Analytics Data</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {getExportDescription(exportType)}
            </p>
          </div>

          <div>
            <Label className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range (Optional)
            </Label>
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {getAvailableFields(exportType).length > 0 && (
            <div>
              <Label className="flex items-center mb-2">
                <Filter className="h-4 w-4 mr-2" />
                Include Fields
              </Label>
              <div className="space-y-2">
                {getAvailableFields(exportType).map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFields([...selectedFields, field]);
                        } else {
                          setSelectedFields(selectedFields.filter(f => f !== field));
                        }
                      }}
                    />
                    <Label htmlFor={field} className="capitalize">
                      {field.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-archived"
              checked={includeArchived}
              onCheckedChange={(checked) => setIncludeArchived(!!checked)}
            />
            <Label htmlFor="include-archived">Include archived data</Label>
          </div>

          {recentExports && recentExports.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Recent Exports</Label>
              <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                {recentExports.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="text-sm text-gray-600 flex justify-between">
                    <span>{exp.export_type.replace(/_/g, ' ')}</span>
                    <span className={`capitalize ${exp.status === 'completed' ? 'text-green-600' : exp.status === 'failed' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {exp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? 'Processing...' : 'Start Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getExportDescription = (type: string) => {
  switch (type) {
    case 'student_data':
      return 'Student roster with demographics and contact information';
    case 'assessment_results':
      return 'Assessment scores with AI insights and analysis';
    case 'progress_reports':
      return 'Student progress reports and goal tracking';
    case 'class_summary':
      return 'Class-wide performance analytics and summaries';
    case 'analytics_data':
      return 'Detailed analytics data for external analysis';
    default:
      return '';
  }
};

const getAvailableFields = (type: string) => {
  switch (type) {
    case 'student_data':
      return ['demographics', 'contact_info', 'learning_goals', 'special_considerations'];
    case 'assessment_results':
      return ['scores', 'ai_insights', 'skill_mastery', 'trends'];
    case 'progress_reports':
      return ['goals', 'milestones', 'achievements', 'recommendations'];
    default:
      return [];
  }
};

export default ExportDataDialog;
