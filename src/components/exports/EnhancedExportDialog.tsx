
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Calendar, Filter, Settings } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { exportsService } from '@/services/exports-service';
import { useToast } from '@/hooks/use-toast';
import { ExportRequestData } from '@/types/exports';
import DateRangeFilter from './DateRangeFilter';

interface EnhancedExportDialogProps {
  trigger?: React.ReactNode;
  selectedItems?: string[];
  entityType?: 'students' | 'assessments' | 'reports' | 'analytics';
  onExportComplete?: () => void;
}

const EnhancedExportDialog: React.FC<EnhancedExportDialogProps> = ({
  trigger,
  selectedItems = [],
  entityType = 'students',
  onExportComplete
}) => {
  const [open, setOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: 'csv' as 'csv' | 'pdf',
    includeArchived: false,
    includePersonalInfo: true,
    includePerformanceData: true,
    includeGoals: false,
    includeAssessments: true,
    startDate: '',
    endDate: '',
    customFields: [] as string[]
  });

  const { toast } = useToast();

  const { data: recentExports } = useQuery({
    queryKey: ['recent-exports'],
    queryFn: () => exportsService.getExports()
  });

  const exportMutation = useMutation({
    mutationFn: (data: ExportRequestData) => exportsService.requestExport(data),
    onSuccess: () => {
      toast({
        title: 'Export Started',
        description: 'Your export is being processed. You\'ll be notified when it\'s ready.',
      });
      setOpen(false);
      onExportComplete?.();
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const getExportTypeFromEntity = (entity: string): ExportRequestData['export_type'] => {
    switch (entity) {
      case 'students': return 'student_data';
      case 'assessments': return 'assessment_results';
      case 'reports': return 'progress_reports';
      case 'analytics': return 'analytics_data';
      default: return 'student_data';
    }
  };

  const handleExport = () => {
    const filters: Record<string, any> = {};
    
    if (selectedItems.length > 0) {
      filters.selected_ids = selectedItems;
    }
    
    if (exportConfig.startDate) {
      filters.start_date = exportConfig.startDate;
    }
    
    if (exportConfig.endDate) {
      filters.end_date = exportConfig.endDate;
    }

    if (exportConfig.includeArchived) {
      filters.include_archived = true;
    }

    const fields = [];
    if (exportConfig.includePersonalInfo) fields.push('personal_info');
    if (exportConfig.includePerformanceData) fields.push('performance_data');
    if (exportConfig.includeGoals) fields.push('goals');
    if (exportConfig.includeAssessments) fields.push('assessments');
    
    if (fields.length > 0) {
      filters.included_fields = fields;
    }

    exportMutation.mutate({
      export_type: getExportTypeFromEntity(entityType),
      export_format: exportConfig.format,
      filters
    });
  };

  const getEntityDisplayName = (entity: string) => {
    switch (entity) {
      case 'students': return 'Student Data';
      case 'assessments': return 'Assessment Results';
      case 'reports': return 'Progress Reports';
      case 'analytics': return 'Analytics Data';
      default: return 'Data';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export {getEntityDisplayName(entityType)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="filters">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="history">
              <Calendar className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Export Format</Label>
                  <Select 
                    value={exportConfig.format} 
                    onValueChange={(value: 'csv' | 'pdf') => 
                      setExportConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Include Data Types</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personal-info"
                        checked={exportConfig.includePersonalInfo}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includePersonalInfo: !!checked }))
                        }
                      />
                      <Label htmlFor="personal-info">Personal Information</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="performance-data"
                        checked={exportConfig.includePerformanceData}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includePerformanceData: !!checked }))
                        }
                      />
                      <Label htmlFor="performance-data">Performance Data</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="assessments"
                        checked={exportConfig.includeAssessments}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includeAssessments: !!checked }))
                        }
                      />
                      <Label htmlFor="assessments">Assessment Results</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="goals"
                        checked={exportConfig.includeGoals}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includeGoals: !!checked }))
                        }
                      />
                      <Label htmlFor="goals">Learning Goals</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="archived"
                    checked={exportConfig.includeArchived}
                    onCheckedChange={(checked) => 
                      setExportConfig(prev => ({ ...prev, includeArchived: !!checked }))
                    }
                  />
                  <Label htmlFor="archived">Include archived data</Label>
                </div>

                {selectedItems.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Exporting {selectedItems.length} selected {entityType}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Date Range Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <DateRangeFilter
                  startDate={exportConfig.startDate}
                  endDate={exportConfig.endDate}
                  onStartDateChange={(date) => 
                    setExportConfig(prev => ({ ...prev, startDate: date }))
                  }
                  onEndDateChange={(date) => 
                    setExportConfig(prev => ({ ...prev, endDate: date }))
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Exports</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExports && recentExports.length > 0 ? (
                  <div className="space-y-2">
                    {recentExports.slice(0, 5).map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium capitalize">
                            {exportItem.export_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(exportItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded capitalize ${
                            exportItem.status === 'completed' ? 'bg-green-100 text-green-700' :
                            exportItem.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {exportItem.status}
                          </span>
                          {exportItem.status === 'completed' && exportItem.file_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportsService.downloadExport(exportItem)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent exports found
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Processing...' : 'Start Export'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedExportDialog;
