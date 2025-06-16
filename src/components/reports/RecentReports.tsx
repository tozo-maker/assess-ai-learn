
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ParentCommunication } from '@/types/communications';

interface RecentReportsProps {
  reports: ParentCommunication[];
}

const RecentReports: React.FC<RecentReportsProps> = ({ reports }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No reports generated yet. Create your first progress report above.
            </p>
          ) : (
            reports.slice(0, 10).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{report.subject}</div>
                  <div className="text-sm text-gray-600">
                    Generated on {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.pdf_url && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(report.pdf_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReports;
