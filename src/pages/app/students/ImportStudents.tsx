
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Users, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageShell from '@/components/ui/page-shell';
import ColumnMappingDialog from '@/components/students/ColumnMappingDialog';
import ImportOptionsDialog, { ImportOptions } from '@/components/students/ImportOptionsDialog';
import EnhancedImportPreview from '@/components/students/EnhancedImportPreview';
import { enhancedImportService, ImportValidationResult, ImportProgress } from '@/services/enhanced-import-service';

interface ImportResult {
  success: number;
  updated: number;
  skipped: number;
  errors: string[];
  total: number;
}

const ImportStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
      setImportResult(null);
      setShowPreview(false);
      await parseCSVFile(selectedFile);
    }
  }, [toast]);

  const parseCSVFile = async (file: File) => {
    try {
      const csvText = await file.text();
      const { headers, data, errors } = enhancedImportService.parseEnhancedCSV(csvText);
      
      if (errors.length > 0) {
        toast({
          title: "CSV parsing issues",
          description: `Found ${errors.length} issues: ${errors[0]}`,
          variant: "destructive"
        });
      }
      
      setCsvHeaders(headers);
      setParsedData(data);
      
      if (headers.length === 0 || data.length === 0) {
        toast({
          title: "Empty CSV file",
          description: "The CSV file appears to be empty or invalid",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not parse CSV file",
        variant: "destructive"
      });
    }
  };

  const handleColumnMappingConfirm = async (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setShowColumnMapping(false);

    // Validate the mapped data
    const validation = await enhancedImportService.validateImportData(parsedData, mapping);
    setValidationResult(validation);
    setShowPreview(true);
  };

  const handlePreviewContinue = () => {
    setShowPreview(false);
    setShowImportOptions(true);
  };

  const handleImportOptionsConfirm = async (options: ImportOptions) => {
    setShowImportOptions(false);
    await performEnhancedImport(options);
  };

  const performEnhancedImport = async (options: ImportOptions) => {
    if (!validationResult) return;

    setIsImporting(true);
    setProgress(0);
    setImportProgress({ current: 0, total: validationResult.students.length, status: 'processing', message: 'Starting import...' });

    try {
      const results = await enhancedImportService.performBulkImport(
        validationResult.students,
        {
          duplicateHandling: options.duplicateHandling,
          batchSize: 25,
          onProgress: (progress) => {
            setImportProgress(progress);
            const percentage = (progress.current / progress.total) * 100;
            setProgress(Math.min(percentage, 95));
          }
        }
      );

      setProgress(100);
      setImportResult({
        ...results,
        total: validationResult.students.length
      });

      if (results.success > 0 || results.updated > 0) {
        toast({
          title: "Import completed successfully",
          description: `${results.success} students created, ${results.updated} updated`,
        });
      }

      if (results.errors.length > 0) {
        toast({
          title: "Import completed with errors",
          description: `${results.errors.length} students failed to import`,
          variant: "destructive"
        });
      }

    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive"
      });
      return;
    }

    if (csvHeaders.length === 0) {
      toast({
        title: "Invalid CSV",
        description: "Could not read CSV headers",
        variant: "destructive"
      });
      return;
    }

    setShowColumnMapping(true);
  };

  const downloadSampleCSV = () => {
    const sampleData = `first_name,last_name,student_id,grade_level,learning_goals,special_considerations,parent_name,parent_email,parent_phone
John,Doe,12345,3rd,Reading fluency,None,Jane Doe,jane.doe@email.com,555-0123
Jane,Smith,12346,3rd,Math problem solving,Extra time for tests,Bob Smith,bob.smith@email.com,555-0124
Mike,Johnson,12347,3rd,Writing skills,None,Sue Johnson,sue.johnson@email.com,555-0125`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <PageShell 
      title="Enhanced Student Import" 
      description="Upload a CSV file with validation and preview capabilities"
      icon={<Upload className="h-6 w-6 text-blue-600" />}
      link="/app/students"
      linkText="Back to Students"
    >
      <div className="space-y-6">
        {/* Requirements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              CSV File Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Supported Columns:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• <strong>first_name</strong> - Student's first name (required)</div>
                <div>• <strong>last_name</strong> - Student's last name (required)</div>
                <div>• <strong>grade_level</strong> - Grade level (K, 1st, 2nd, etc.)</div>
                <div>• <strong>student_id</strong> - Unique student identifier</div>
                <div>• <strong>learning_goals</strong> - Learning objectives</div>
                <div>• <strong>special_considerations</strong> - Special needs or notes</div>
                <div>• <strong>parent_name</strong> - Parent or guardian name</div>
                <div>• <strong>parent_email</strong> - Parent email address</div>
                <div>• <strong>parent_phone</strong> - Parent phone number</div>
              </div>
            </div>
            
            <Button variant="outline" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
              />
            </div>

            {file && csvHeaders.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to import: {file.name} ({parsedData.length} students detected)
                  <br />
                  Columns found: {csvHeaders.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Progress Display */}
            {isImporting && importProgress && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{importProgress.message}</span>
                  <span>{importProgress.current}/{importProgress.total}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                disabled={!file || isImporting || csvHeaders.length === 0}
                className="flex-1"
              >
                {isImporting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Students
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/app/students')}
                disabled={isImporting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Display */}
        {showPreview && validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Import Preview
                </span>
                <Button onClick={handlePreviewContinue}>
                  Continue with Import
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImportPreview
                students={validationResult.students}
                mapping={columnMapping}
                validationResults={validationResult}
              />
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {importResult.success + importResult.updated === importResult.total ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-sm text-green-700">Created</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated}</div>
                  <div className="text-sm text-blue-700">Updated</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.skipped}</div>
                  <div className="text-sm text-yellow-700">Skipped</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-red-700">Import Errors:</h4>
                  <div className="bg-red-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        {error}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <div className="text-sm text-red-600 font-medium">
                        +{importResult.errors.length - 10} more errors...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(importResult.success > 0 || importResult.updated > 0) && (
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/app/students')}>
                    <Users className="h-4 w-4 mr-2" />
                    View All Students
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <ColumnMappingDialog
        open={showColumnMapping}
        onOpenChange={setShowColumnMapping}
        csvHeaders={csvHeaders}
        onMappingConfirm={handleColumnMappingConfirm}
      />

      <ImportOptionsDialog
        open={showImportOptions}
        onOpenChange={setShowImportOptions}
        onOptionsConfirm={handleImportOptionsConfirm}
        duplicateCount={validationResult?.warnings || 0}
      />
    </PageShell>
  );
};

export default ImportStudents;
