import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Filter, MoreHorizontal, Pencil, Users, BarChart2, Trash2, Plus } from 'lucide-react';

// Design System Components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardFooter,
  DSButton,
  DSInput,
  DSFlexContainer,
  DSContentGrid
} from '@/components/ui/design-system';

// Original Components
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

  const getStatusBadge = (assessment: Assessment) => {
    const isActive = assessment.assessment_date && new Date(assessment.assessment_date) <= new Date();
    const isDraft = assessment.is_draft;
    
    if (isDraft) {
      return <Badge className="bg-[#f59e0b] text-white">Draft</Badge>;
    } else if (isActive) {
      return <Badge className="bg-[#10b981] text-white">Active</Badge>;
    } else {
      return <Badge className="bg-[#6b7280] text-white">Completed</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
        <span className="ml-3 text-gray-600">Loading assessments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <DSCard>
        <DSCardContent>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900">Error Loading Assessments</h2>
            <p className="mt-2 text-base text-gray-600">There was a problem loading your assessments.</p>
            <DSButton onClick={() => refetch()} className="mt-4">Try Again</DSButton>
          </div>
        </DSCardContent>
      </DSCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Bar with gray-50 background */}
      <DSCard className="bg-gray-50">
        <DSCardContent>
          <DSFlexContainer justify="between" align="center">
            <DSFlexContainer gap="lg" className="flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <DSInput
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
                <SelectTrigger className="w-48">
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
            </DSFlexContainer>
            
            <div className="text-sm text-gray-600">
              {filteredAssessments?.length || 0} assessment{filteredAssessments?.length !== 1 ? 's' : ''} found
            </div>
          </DSFlexContainer>
        </DSCardContent>
      </DSCard>

      {/* Bulk Actions Bar */}
      {selectedAssessments.size > 0 && (
        <DSCard className="bg-blue-50 border-blue-200">
          <DSCardContent>
            <DSFlexContainer justify="between" align="center">
              <DSFlexContainer gap="md">
                <span className="text-sm font-medium text-blue-900">
                  {selectedAssessments.size} assessment{selectedAssessments.size > 1 ? 's' : ''} selected
                </span>
                <DSButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssessments(new Set())}
                >
                  Clear selection
                </DSButton>
              </DSFlexContainer>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DSButton
                    variant="danger"
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DSButton>
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
                      className="bg-[#ef4444] text-white hover:bg-[#dc2626]"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DSFlexContainer>
          </DSCardContent>
        </DSCard>
      )}
      
      {filteredAssessments?.length === 0 ? (
        <DSCard className="border-dashed">
          <DSCardContent>
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || typeFilter ? 
                  'Try adjusting your filters to see more results.' : 
                  'Start by creating your first assessment.'}
              </p>
              {!searchQuery && !typeFilter && (
                <DSButton onClick={() => navigate('/app/assessments/add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </DSButton>
              )}
            </div>
          </DSCardContent>
        </DSCard>
      ) : (
        <DSContentGrid cols={3}>
          {filteredAssessments?.map((assessment) => (
            <DSCard key={assessment.id} className="hover:shadow-md transition-shadow duration-300">
              <DSCardHeader>
                <DSFlexContainer justify="between" align="start">
                  <DSFlexContainer align="start" gap="md" className="flex-1">
                    <Checkbox
                      checked={selectedAssessments.has(assessment.id)}
                      onCheckedChange={(checked) => 
                        handleSelectAssessment && handleSelectAssessment(assessment.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-gray-700 mb-1">{assessment.title}</h3>
                      <p className="text-sm text-gray-500">
                        {assessment.subject} | Grade {assessment.grade_level}
                      </p>
                    </div>
                  </DSFlexContainer>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DSButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </DSButton>
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
                        className="text-[#ef4444]" 
                        onClick={() => handleDelete && handleDelete(assessment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DSFlexContainer>
              </DSCardHeader>
              
              <DSCardContent>
                <DSFlexContainer gap="sm" className="mb-4">
                  {getStatusBadge(assessment)}
                  <Badge variant="outline">
                    {assessment.assessment_type.charAt(0).toUpperCase() + assessment.assessment_type.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600">Max: {assessment.max_score}</span>
                </DSFlexContainer>

                {assessment.assessment_date && (
                  <p className="text-sm text-gray-600 mb-3">
                    Date: {formatDate(assessment.assessment_date)}
                  </p>
                )}

                {assessment.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">{assessment.description}</p>
                )}
              </DSCardContent>
              
              <DSCardFooter>
                <DSFlexContainer gap="sm" className="w-full">
                  <DSButton variant="secondary" size="sm" asChild className="flex-1">
                    <Link to={`/app/assessments/${assessment.id}`}>View Details</Link>
                  </DSButton>
                  <DSButton variant="primary" size="sm" asChild className="flex-1">
                    <Link to={`/app/assessments/${assessment.id}/responses`}>Add Responses</Link>
                  </DSButton>
                </DSFlexContainer>
              </DSCardFooter>
            </DSCard>
          ))}
        </DSContentGrid>
      )}
    </div>
  );
};

export default AssessmentList;
