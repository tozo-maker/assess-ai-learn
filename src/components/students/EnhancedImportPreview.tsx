import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, XCircle, User } from 'lucide-react';

interface PreviewStudent {
  first_name?: string;
  last_name?: string;
  student_id?: string;
  grade_level?: string;
  learning_goals?: string;
  special_considerations?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  preview_status?: 'valid' | 'warning' | 'error';
  preview_issues?: string[];
  [key: string]: string | string[] | undefined;
}

interface EnhancedImportPreviewProps {
  students: PreviewStudent[];
  mapping: Record<string, string>;
  validationResults: {
    valid: number;
    warnings: number;
    errors: number;
    issues: string[];
  };
}

const EnhancedImportPreview: React.FC<EnhancedImportPreviewProps> = ({
  students,
  mapping,
  validationResults
}) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Show only mapped fields in preview
  const mappedFields = Object.entries(mapping).filter(([_, csvHeader]) => csvHeader !== 'skip');

  return (
    <div className="space-y-4">
      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import Validation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{validationResults.valid}</div>
              <div className="text-sm text-green-700">Valid Records</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{validationResults.warnings}</div>
              <div className="text-sm text-yellow-700">Warnings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{validationResults.errors}</div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>
          
          {validationResults.issues.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Validation Issues:</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {validationResults.issues.slice(0, 5).map((issue, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {issue}
                  </div>
                ))}
                {validationResults.issues.length > 5 && (
                  <div className="text-sm text-gray-500">
                    +{validationResults.issues.length - 5} more issues...
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student Data Preview</CardTitle>
          <p className="text-sm text-gray-600">
            Showing {Math.min(students.length, 10)} of {students.length} students
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80 w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Status</TableHead>
                  {mappedFields.map(([fieldKey, csvHeader]) => (
                    <TableHead key={fieldKey} className="min-w-32">
                      {fieldKey.replace('_', ' ').toUpperCase()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.slice(0, 10).map((student, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(student.preview_status)}
                        {getStatusBadge(student.preview_status)}
                      </div>
                    </TableCell>
                    {mappedFields.map(([fieldKey, csvHeader]) => (
                      <TableCell key={fieldKey} className="max-w-32 truncate">
                        {student[csvHeader] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          
          {students.length > 10 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Only showing first 10 records. All {students.length} records will be processed.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedImportPreview;
