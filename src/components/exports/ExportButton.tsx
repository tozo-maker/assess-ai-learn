
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { exportsService } from '@/services/exports-service';
import { useToast } from '@/hooks/use-toast';
import { ExportRequestData } from '@/types/exports';

interface ExportButtonProps {
  exportType: 'student_data' | 'assessment_results' | 'progress_reports' | 'class_summary' | 'analytics_data';
  filters?: Record<string, any>;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  exportType,
  filters = {},
  buttonText = "Export CSV",
  variant = "outline",
  size = "sm",
  disabled = false
}) => {
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: (exportData: ExportRequestData) => exportsService.requestExport(exportData),
    onSuccess: () => {
      toast({
        title: 'Export Started',
        description: 'Your export is being processed. Check the exports page for download when ready.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleExport = () => {
    exportMutation.mutate({
      export_type: exportType,
      export_format: 'csv',
      filters
    });
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      disabled={disabled || exportMutation.isPending}
    >
      <Download className="h-4 w-4 mr-2" />
      {exportMutation.isPending ? 'Exporting...' : buttonText}
    </Button>
  );
};

export default ExportButton;
