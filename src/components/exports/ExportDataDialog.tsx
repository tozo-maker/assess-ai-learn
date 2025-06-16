import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Calendar,
  Filter,
  FileSpreadsheet,
  FileType,
  Clock
} from 'lucide-react';
import { exportService } from '@/services/export-service';
import { useAuth } from '@/contexts/AuthContext';

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExportDataDialog: React.FC<ExportDataDialogProps> = ({ open, onOpenChange }) => {
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('last_month');
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportId, setExportId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreateExport = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to export data"
      });
      return;
    }

    setIsGenerating(true);
    setExportId(null);
    setDownloadUrl(null);

    try {
      const request = {
        type: exportType,
        format: exportFormat,
        dateRange: dateRange,
        teacherId: user.id
      };

      const exportResult = await exportService.createExport(request);
      setExportId(exportResult.id);

      // Simulate export processing (replace with actual polling)
      setTimeout(() => {
        setDownloadUrl('/sample-report.pdf'); // Replace with actual URL
        setIsGenerating(false);
        toast({
          title: "Export Ready",
          description: "Your export is ready for download"
        });
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "An error occurred during export"
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full p-6 bg-white rounded-lg shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Export Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Type */}
              <div>
                <Label htmlFor="export-type">Export Type</Label>
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select export type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">Students</SelectItem>
                    <SelectItem value="assessments">Assessments</SelectItem>
                    <SelectItem value="reports">Reports</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Format */}
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_time">All Time</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Export Button */}
              <Button
                className="w-full"
                disabled={isGenerating}
                onClick={handleCreateExport}
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Export
                  </>
                )}
              </Button>

              {/* Display Export Status */}
              {exportId && (
                <div className="mt-4">
                  {downloadUrl ? (
                    <Alert className="bg-green-100 border-green-200 text-green-800">
                      <Download className="h-4 w-4 mr-2" />
                      <AlertDescription>
                        Export ready! <a href={downloadUrl} className="underline" target="_blank">Download now</a>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-blue-100 border-blue-200 text-blue-800">
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Generating export... Please wait.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Close Button */}
              <Button variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExportDataDialog;
