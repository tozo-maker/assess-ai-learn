
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';
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

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

const ImportStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 2) {
        const student: any = {};
        headers.forEach((header, index) => {
          student[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
        });
        students.push(student);
      }
    }

    return students;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      // Get current user for teacher_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const csvText = await file.text();
      const parsedStudents = parseCSV(csvText);

      if (parsedStudents.length === 0) {
        throw new Error("No valid student data found in CSV file");
      }

      const results: ImportResult = {
        success: 0,
        errors: [],
        total: parsedStudents.length
      };

      for (let i = 0; i < parsedStudents.length; i++) {
        const studentData = parsedStudents[i];
        setProgress(((i + 1) / parsedStudents.length) * 100);

        try {
          // Map CSV fields to student schema
          const student = {
            first_name: studentData.first_name || studentData.firstname || studentData['first name'] || '',
            last_name: studentData.last_name || studentData.lastname || studentData['last name'] || '',
            student_id: studentData.student_id || studentData.id || studentData['student id'] || '',
            grade_level: studentData.grade_level || studentData.grade || studentData['grade level'] || '1st',
            learning_goals: studentData.learning_goals || studentData['learning goals'] || '',
            special_considerations: studentData.special_considerations || studentData['special considerations'] || '',
            teacher_id: user.id
          };

          // Validate required fields
          if (!student.first_name || !student.last_name) {
            results.errors.push(`Row ${i + 2}: Missing first name or last name`);
            continue;
          }

          await studentService.createStudent(student);
          results.success++;
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      setImportResult(results);

      if (results.success > 0) {
        toast({
          title: "Import completed",
          description: `Successfully imported ${results.success} students`,
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

  const downloadSampleCSV = () => {
    const sampleData = `first_name,last_name,student_id,grade_level,learning_goals,special_considerations
John,Doe,12345,3rd,Reading fluency,None
Jane,Smith,12346,3rd,Math problem solving,Extra time for tests
Mike,Johnson,12347,3rd,Writing skills,None`;

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_sample.csv';
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
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>first_name</strong> - Student's first name (required)</li>
                <li>• <strong>last_name</strong> - Student's last name (required)</li>
                <li>• <strong>grade_level</strong> - Grade level (K, 1st, 2nd, etc.)</li>
                <li>• <strong>student_id</strong> - Unique student identifier (optional)</li>
                <li>• <strong>learning_goals</strong> - Learning objectives (optional)</li>
                <li>• <strong>special_considerations</strong> - Special needs or notes (optional)</li>
              </ul>
            </div>
            
            <Button variant="outline" onClick={downloadSampleCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Download Sample CSV
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

            {file && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to import: {file.name} ({Math.round(file.size / 1024)} KB)
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
                disabled={!file || isImporting}
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
                {importResult.success === importResult.total ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
                )}
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                  <div className="text-sm text-blue-700">Total</div>
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

              {importResult.success > 0 && (
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
    </PageShell>
  );
};

export default ImportStudents;
