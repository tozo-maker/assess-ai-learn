
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProgressReportViewer from '@/components/communications/ProgressReportViewer';
import { ProgressReportData } from '@/types/communications';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: ProgressReportData | null;
}

const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  open,
  onOpenChange,
  reportData
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Progress Report Preview</DialogTitle>
        </DialogHeader>
        {reportData && (
          <ProgressReportViewer reportData={reportData} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreviewDialog;
