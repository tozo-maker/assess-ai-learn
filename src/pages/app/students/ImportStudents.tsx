import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { studentService } from '@/services/student-service';
import { supabase } from '@/integrations/supabase/client';
import PageShell from '@/components/ui/page-shell';
import ColumnMappingDialog from '@/components/students/ColumnMappingDialog';
import ImportOptionsDialog, { ImportOptions } from '@/components/students/ImportOptionsDialog';

interface ImportResult {
  success: number;
  updated: number;
  skipped: number;
  errors: string[];
  total: number;
}

interface ParsedStudent {
  [key: string]: string;
}

const ImportStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicateCount, setDuplicateCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
      parseCSVHeaders(selectedFile);
    }
  }, [toast]);

  const parseCSVHeaders = async (file: File) => {
    try {
      const csvText = await file.text();
      const lines = csvText.trim().split('\n');
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      setCsvHeaders(headers);

      // Parse all data for preview
      const data = parseCSVData(csvText);
      setParsedData(data);
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "Could not parse CSV file",
        variant: "destructive"
      });
    }
  };

  const parseCSVData = (csvText: string): ParsedStudent[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: ParsedStudent = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const checkForDuplicates = async (mappedData: any[]): Promise<number> => {
    try {
      const { data: existingStudents } = await supabase
        .from('students')
        .select('first_name, last_name, student_id');

      if (!existingStudents) return 0;

      let duplicates = 0;
      mappedData.forEach(student => {
        const isDuplicate = existingStudents.some(existing => 
          (existing.first_name?.toLowerCase() === student.first_name?.toLowerCase() &&
           existing.last_name?.toLowerCase() === student.last_name?.toLowerCase()) ||
          (student.student_id && existing.student_id === student.student_id)
        );
        if (isDuplicate) duplicates++;
      });

      return duplicates;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return 0;
    }
  };

  const handleColumnMappingConfirm = async (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setShowColumnMapping(false);

    // Map the data according to the column mapping
    const mappedData = parsedData.map(row => {
      const mappedRow: any = {};
      Object.entries(mapping).forEach(([fieldKey, csvHeader]) => {
        if (csvHeader !== 'skip') {
          mappedRow[fieldKey] = row[csvHeader] || '';
        }
      });
      return mappedRow;
    });

    // Check for duplicates
    const duplicates = await checkForDuplicates(mappedData);
    setDuplicateCount(duplicates);
    setShowImportOptions(true);
  };

  const handleImportOptionsConfirm = async (options: ImportOptions) => {
    setShowImportOptions(false);
    await performImport(options);
  };

  const performImport = async (options: ImportOptions) => {
    if (!file || !parsedData.length) return;

    setIsImporting(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Map the data according to column mapping
      const mappedData = parsedData.map(row => {
        const mappedRow: any = {};
        Object.entries(columnMapping).forEach(([fieldKey, csvHeader]) => {
          if (csvHeader !== 'skip') {
            mappedRow[fieldKey] = row[csvHeader] || '';
          }
        });
        return mappedRow;
      });

      const results: ImportResult = {
        success: 0,
        updated: 0,
        skipped: 0,
        errors: [],
        total: mappedData.length
      };

      // Get existing students if handling duplicates
      let existingStudents: any[] = [];
      if (options.duplicateHandling !== 'create_new') {
        const { data } = await supabase
          .from('students')
          .select('*');
        existingStudents = data || [];
      }

      for (let i = 0; i < mappedData.length; i++) {
        const studentData = mappedData[i];
        setProgress(((i + 1) / mappedData.length) * 100);

        try {
          // Validate email if option is enabled
          if (options.validateEmails && studentData.parent_email && 
              !validateEmail(studentData.parent_email)) {
            results.errors.push(`Row ${i + 2}: Invalid email format: ${studentData.parent_email}`);
            continue;
          }

          // Check for duplicates
          const existingStudent = existingStudents.find(existing => 
            (existing.first_name?.toLowerCase() === studentData.first_name?.toLowerCase() &&
             existing.last_name?.toLowerCase() === studentData.last_name?.toLowerCase()) ||
            (studentData.student_id && existing.student_id === studentData.student_id)
          );

          if (existingStudent && options.duplicateHandling === 'skip') {
            results.skipped++;
            continue;
          }

          // Prepare student object
          const student = {
            first_name: studentData.first_name || '',
            last_name: studentData.last_name || '',
            student_id: studentData.student_id || '',
            grade_level: studentData.grade_level || '1st',
            learning_goals: studentData.learning_goals || '',
            special_considerations: studentData.special_considerations || '',
            parent_name: studentData.parent_name || '',
            parent_email: studentData.parent_email || '',
            parent_phone: studentData.parent_phone || '',
            teacher_id: user.id
          };

          // Validate required fields
          if (!student.first_name || !student.last_name) {
            results.errors.push(`Row ${i + 2}: Missing first name or last name`);
            continue;
          }

          if (existingStudent && options.duplicateHandling === 'update') {
            await studentService.updateStudent(existingStudent.id, student);
            results.updated++;
          } else {
            await studentService.createStudent(student);
            results.success++;
          }
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResult(results);

      if (results.success > 0 || results.updated > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${results.success} students, updated ${results.updated}`,
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
      title="Import Students" 
      description="Upload a CSV file to add multiple students at once"
      icon={<Upload className="h-6 w-6 text-blue-600" />}
      link="/app/students"
      linkText="Back to Students"
    >
      <div className="space-y-6">
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
              <ul className="text-sm space-y-1">
                <li>• <strong>first_name</strong> - Student's first name (required)</li>
                <li>• <strong>last_name</strong> - Student's last name (required)</li>
                <li>• <strong>grade_level</strong> - Grade level (K, 1st, 2nd, etc.)</li>
                <li>• <strong>student_id</strong> - Unique student identifier</li>
                <li>• <strong>learning_goals</strong> - Learning objectives</li>
                <li>• <strong>special_considerations</strong> - Special needs or notes</li>
                <li>• <strong>parent_name</strong> - Parent or guardian name</li>
                <li>• <strong>parent_email</strong> - Parent email address</li>
                <li>• <strong>parent_phone</strong> - Parent phone number</li>
              </ul>
            </div>
            
            <Button variant="outline" onClick={downloadSampleCSV}>
              <Download className="h-4 w-4 mr-2" />
              Download Sample CSV Template
            </Button>
          </CardContent>
        </Card>

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

            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-gray-600">Importing students... {Math.round(progress)}%</p>
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
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {error}
                      </div>
                    ))}
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
        duplicateCount={duplicateCount}
      />
    </PageShell>
  );
};

export default ImportStudents;
