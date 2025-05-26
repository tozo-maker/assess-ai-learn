
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, Search, Filter, MoreHorizontal, Pencil, Users, BarChart2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import { Assessment, AssessmentType, assessmentTypeOptions } from '@/types/assessment';

const AssessmentList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [selectedAssessments, setSelectedAssessments] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentService.getAssessments,
  });

  console.log('AssessmentList - Loaded assessments:', assessments?.length || 0);

  const handleDelete = async (id: string) => {
    try {
      await assessmentService.deleteAssessment(id);
      toast({
        title: "Assessment deleted",
        description: "The assessment has been successfully deleted",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssessments.size === 0) return;
    
    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedAssessments).map(id => 
        assessmentService.deleteAssessment(id)
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: "Assessments deleted",
        description: `Successfully deleted ${selectedAssessments.size} assessment${selectedAssessments.size > 1 ? 's' : ''}`,
      });
      
      setSelectedAssessments(new Set());
      refetch();
    } catch (error) {
      console.error('Error deleting assessments:', error);
      toast({
        title: "Error",
        description: "Failed to delete some assessments",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAssessment = (assessmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssessments);
    if (checked) {
      newSelected.add(assessmentId);
    } else {
      newSelected.delete(assessmentId);
    }
    setSelectedAssessments(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredAssessments) {
      setSelectedAssessments(new Set(filteredAssessments.map(a => a.id)));
    } else {
      setSelectedAssessments(new Set());
    }
  };

  const filteredAssessments = assessments?.filter(assessment => {
    const matchesSearch = searchQuery === '' || 
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || assessment.assessment_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  const isAllSelected = filteredAssessments?.length > 0 && 
    filteredAssessments.every(assessment => selectedAssessments.has(assessment.id));

  const isIndeterminate = selectedAssessments.size > 0 && !isAllSelected;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading assessments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold">Error Loading Assessments</h2>
        <p className="mt-2">There was a problem loading your assessments.</p>
        <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          <h1 className="text-2xl font-bold">Assessments</h1>
        </div>
        <Button onClick={() => navigate('/app/assessments/add')}>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assessments..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={typeFilter || undefined}
          onValueChange={(value) => setTypeFilter(value === 'all' ? undefined : value)}
        >
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {assessmentTypeOptions.filter(type => type && type.trim() !== '').map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-right text-sm text-gray-500 flex items-center justify-end">
          {filteredAssessments?.length || 0} assessment{filteredAssessments?.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedAssessments.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedAssessments.size} assessment{selectedAssessments.size > 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssessments(new Set())}
            >
              Clear selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Assessments</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedAssessments.size} assessment{selectedAssessments.size > 1 ? 's' : ''}? 
                    This action cannot be undone and will also delete all associated student responses and analysis data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      {filteredAssessments && filteredAssessments.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b">
          <Checkbox
            checked={isAllSelected ? true : isIndeterminate ? "indeterminate" : false}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            Select all assessments
          </span>
        </div>
      )}
      
      {filteredAssessments?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">No assessments found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || typeFilter ? 
                'Try adjusting your filters to see more results.' : 
                'Start by creating your first assessment.'}
            </p>
            {!searchQuery && !typeFilter && (
              <Button className="mt-4" onClick={() => navigate('/app/assessments/add')}>
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssessments?.map((assessment) => (
            <Card key={assessment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedAssessments.has(assessment.id)}
                      onCheckedChange={(checked) => 
                        handleSelectAssessment(assessment.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="font-medium">{assessment.title}</CardTitle>
                      <CardDescription>
                        {assessment.subject} | Grade {assessment.grade_level}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/app/assessments/${assessment.id}`)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/app/assessments/${assessment.id}/responses`)}>
                        <Users className="mr-2 h-4 w-4" />
                        Add Student Responses
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/app/assessments/${assessment.id}/analysis`)}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        View Analysis
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(`/app/assessments/edit/${assessment.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Assessment
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600" 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
                            handleDelete(assessment.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <Badge variant="outline">
                    {assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1)}
                  </Badge>
                  <span>|</span>
                  <span>Max score: {assessment.max_score}</span>
                </div>

                {assessment.assessment_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {formatDate(assessment.assessment_date)}
                  </p>
                )}

                {assessment.description && (
                  <p className="text-sm mt-2 line-clamp-2">{assessment.description}</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex space-x-2 text-sm">
                  <Button variant="outline" size="sm" asChild className="h-8 flex-1">
                    <Link to={`/app/assessments/${assessment.id}`}>View Details</Link>
                  </Button>
                  <Button size="sm" asChild className="h-8 flex-1">
                    <Link to={`/app/assessments/${assessment.id}/responses`}>Add Responses</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
