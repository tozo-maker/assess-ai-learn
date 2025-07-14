
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Target, 
  TrendingUp, 
  Filter, 
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date: string;
  max_score: number;
  assessment_type: string;
  description?: string;
}

interface StudentResponse {
  id: string;
  score: number;
  assessment: Assessment;
  created_at: string;
  teacher_notes?: string;
}

interface StudentAssessmentsTabProps {
  studentId: string;
}

const StudentAssessmentsTab: React.FC<StudentAssessmentsTabProps> = ({ studentId }) => {
  const [showAddResponse, setShowAddResponse] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [score, setScore] = useState('');
  const [teacherNotes, setTeacherNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student responses
  const { data: responses = [], isLoading: responsesLoading } = useQuery({
    queryKey: ['student-responses', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_responses')
        .select(`
          *,
          assessment:assessments(*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudentResponse[];
    }
  });

  // Fetch available assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Assessment[];
    }
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async (responseData: { assessment_id: string; score: number; teacher_notes?: string }) => {
      const { data, error } = await supabase
        .from('student_responses')
        .insert({
          student_id: studentId,
          assessment_id: responseData.assessment_id,
          assessment_item_id: null, // We'll handle this later for detailed responses
          score: responseData.score,
          teacher_notes: responseData.teacher_notes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assessment response added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['student-responses', studentId] });
      setShowAddResponse(false);
      setSelectedAssessment('');
      setScore('');
      setTeacherNotes('');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add assessment response"
      });
    }
  });

  const handleAddResponse = () => {
    if (!selectedAssessment || !score) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select an assessment and enter a score"
      });
      return;
    }

    const assessment = assessments.find(a => a.id === selectedAssessment);
    const scoreNum = parseFloat(score);
    
    if (isNaN(scoreNum) || scoreNum < 0 || (assessment && scoreNum > assessment.max_score)) {
      toast({
        variant: "destructive",
        title: "Invalid Score",
        description: `Score must be between 0 and ${assessment?.max_score || 100}`
      });
      return;
    }

    addResponseMutation.mutate({
      assessment_id: selectedAssessment,
      score: scoreNum,
      teacher_notes: teacherNotes || undefined
    });
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getPerformanceLabel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (responses.length === 0) return null;
    
    const totalAssessments = responses.length;
    const avgScore = responses.reduce((sum, r) => sum + (r.score / r.assessment.max_score) * 100, 0) / totalAssessments;
    const recentTrend = responses.slice(0, 3);
    const olderTrend = responses.slice(3, 6);
    
    let trendDirection = 'stable';
    if (recentTrend.length > 0 && olderTrend.length > 0) {
      const recentAvg = recentTrend.reduce((sum, r) => sum + (r.score / r.assessment.max_score) * 100, 0) / recentTrend.length;
      const olderAvg = olderTrend.reduce((sum, r) => sum + (r.score / r.assessment.max_score) * 100, 0) / olderTrend.length;
      trendDirection = recentAvg > olderAvg + 5 ? 'improving' : recentAvg < olderAvg - 5 ? 'declining' : 'stable';
    }
    
    return {
      totalAssessments,
      averageScore: Math.round(avgScore),
      trendDirection,
      subjectBreakdown: responses.reduce((acc, r) => {
        acc[r.assessment.subject] = (acc[r.assessment.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [responses]);

  // Get unique subjects and types for filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = [...new Set(responses.map(r => r.assessment.subject))];
    return subjects.sort();
  }, [responses]);

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(responses.map(r => r.assessment.assessment_type))];
    return types.sort();
  }, [responses]);

  // Filter and sort responses
  const filteredAndSortedResponses = useMemo(() => {
    let filtered = responses.filter(response => {
      const matchesSearch = searchTerm === '' || 
        response.assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.assessment.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSubject = filterSubject === 'all' || response.assessment.subject === filterSubject;
      const matchesType = filterType === 'all' || response.assessment.assessment_type === filterType;
      
      return matchesSearch && matchesSubject && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.assessment.assessment_date || a.created_at).getTime() - 
                      new Date(b.assessment.assessment_date || b.created_at).getTime();
          break;
        case 'score':
          comparison = (a.score / a.assessment.max_score) - (b.score / b.assessment.max_score);
          break;
        case 'title':
          comparison = a.assessment.title.localeCompare(b.assessment.title);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [responses, searchTerm, filterSubject, filterType, sortBy, sortOrder]);

  // Paginate results
  const paginatedResponses = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredAndSortedResponses.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedResponses, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedResponses.length / pageSize);

  const handleSort = (column: 'date' | 'score' | 'title') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(0);
  };

  if (responsesLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Assessment Results
          </h3>
          <p className="text-sm text-muted-foreground">Track student performance across assessments</p>
        </div>
        
        <Dialog open={showAddResponse} onOpenChange={setShowAddResponse}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Response
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Assessment Response</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assessment">Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger id="assessment">
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map(assessment => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        {assessment.title} - {assessment.subject} (Max: {assessment.max_score})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="score">Score</Label>
                <Input
                  id="score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="Enter score"
                  min="0"
                  max={assessments.find(a => a.id === selectedAssessment)?.max_score || 100}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Teacher Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Add any notes about this assessment..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddResponse}
                  disabled={addResponseMutation.isPending}
                  className="flex-1"
                >
                  {addResponseMutation.isPending ? 'Adding...' : 'Add Response'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddResponse(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-xl font-semibold">{summaryStats.totalAssessments}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-xl font-semibold">{summaryStats.averageScore}%</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${
                summaryStats.trendDirection === 'improving' ? 'text-green-600' :
                summaryStats.trendDirection === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`} />
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <p className="text-lg font-medium capitalize">{summaryStats.trendDirection}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(summaryStats.subjectBreakdown).slice(0, 3).map(([subject, count]) => (
                  <Badge key={subject} variant="secondary" className="text-xs">
                    {subject} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      {responses.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-full sm:w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Assessment Results Table */}
      {responses.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Assessment
                    {sortBy === 'title' ? (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortBy === 'date' ? (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50 text-right"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Score
                    {sortBy === 'score' ? (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Performance</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.map((response) => (
                <TableRow key={response.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{response.assessment.title}</div>
                      {response.teacher_notes && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-48">
                          Note: {response.teacher_notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {response.assessment.subject}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {response.assessment.assessment_type}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(response.assessment.assessment_date || response.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {response.score}/{response.assessment.max_score}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className={getScoreColor(response.score, response.assessment.max_score)}>
                      {Math.round((response.score / response.assessment.max_score) * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filteredAndSortedResponses.length)} of {filteredAndSortedResponses.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Assessment Results</h3>
            <p className="text-muted-foreground mb-4">
              No assessment results have been recorded for this student yet.
            </p>
            <Button onClick={() => setShowAddResponse(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add First Assessment Result
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAssessmentsTab;
