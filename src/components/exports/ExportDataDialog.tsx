
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3, 
  Users, 
  BookOpen, 
  Target,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { exportService } from '@/services/export-service';
import { useAuth } from '@/contexts/AuthContext';

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  format: 'csv' | 'pdf' | 'xlsx';
  category: 'students' | 'assessments' | 'reports' | 'analytics';
}

const ExportDataDialog: React.FC<ExportDataDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [dateRange, setDateRange] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportOptions: ExportOption[] = [
    {
      id: 'students',
      label: 'Student List',
      description: 'Basic student information and contact details',
      icon: Users,
      format: 'csv',
      category: 'students'
    },
    {
      id: 'student-performance',
      label: 'Student Performance',
      description: 'Grades, scores, and assessment results',
      icon: BarChart3,
      format: 'csv',
      category: 'students'
    },
    {
      id: 'assessments',
      label: 'Assessment Data',
      description: 'Assessment details and configurations',
      icon: BookOpen,
      format: 'csv',
      category: 'assessments'
    },
    {
      id: 'assessment-responses',
      label: 'Assessment Responses',
      description: 'Individual student responses and scores',
      icon: FileText,
      format: 'csv',
      category: 'assessments'
    },
    {
      id: 'goals',
      label: 'Learning Goals',
      description: 'Student goals and progress tracking',
      icon: Target,
      format: 'csv',
      category: 'reports'
    },
    {
      id: 'analytics-summary',
      label: 'Analytics Summary',
      description: 'Performance trends and insights',
      icon: Table,
      format: 'pdf',
      category: 'analytics'
    }
  ];

  const handleExportSelection = (exportId: string, checked: boolean) => {
    if (checked) {
      setSelectedExports(prev => [...prev, exportId]);
    } else {
      setSelectedExports(prev => prev.filter(id => id !== exportId));
    }
  };

  const handleExport = async () => {
    if (!user || selectedExports.length === 0) {
      toast({
        title: "No selections made",
        description: "Please select at least one export option.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const exportRequests = selectedExports.map(exportId => ({
        type: exportId,
        format: exportFormat,
        dateRange,
        teacherId: user.id
      }));

      let completed = 0;
      const total = exportRequests.length;

      for (const request of exportRequests) {
        try {
          await exportService.createExport(request);
          completed++;
          setExportProgress((completed / total) * 100);
        } catch (error) {
          console.error(`Failed to export ${request.type}:`, error);
        }
      }

      if (completed > 0) {
        toast({
          title: "Export Started",
          description: `${completed} export${completed > 1 ? 's' : ''} initiated. You'll receive an email when ready.`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Export Failed",
          description: "Failed to start any exports. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export Error",
        description: "An error occurred while starting the export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setSelectedExports([]);
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Spreadsheet)', description: 'Best for data analysis' },
    { value: 'xlsx', label: 'Excel (XLSX)', description: 'Best for Microsoft Excel' },
    { value: 'pdf', label: 'PDF Report', description: 'Best for sharing and printing' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  const groupedOptions = exportOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, ExportOption[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>Choose how you want your data exported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formatOptions.map((format) => (
                  <div
                    key={format.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === format.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat(format.value as any)}
                  >
                    <div className="font-medium">{format.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{format.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Options by Category */}
          <div className="space-y-6">
            {Object.entries(groupedOptions).map(([category, options]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category} Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {options.map((option) => {
                      const IconComponent = option.icon;
                      const isSelected = selectedExports.includes(option.id);
                      
                      return (
                        <div key={option.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={option.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleExportSelection(option.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              <Label 
                                htmlFor={option.id} 
                                className="font-medium cursor-pointer"
                              >
                                {option.label}
                              </Label>
                              <Badge variant="outline">{option.format.toUpperCase()}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exporting data...</span>
                    <span className="text-sm text-gray-600">{Math.round(exportProgress)}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={selectedExports.length === 0 || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Selected ({selectedExports.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataDialog;
