
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Users, 
  BarChart3, 
  Pencil, 
  Trash2, 
  Clock,
  CheckCircle,
  BookOpen,
  Target
} from 'lucide-react';
import { 
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardFooter,
  DSButton,
  DSStatusBadge,
  DSFlexContainer,
  DSBodyText,
  DSHelpText
} from '@/components/ui/design-system';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Assessment } from '@/types/assessment';

interface EnhancedAssessmentCardProps {
  assessment: Assessment;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EnhancedAssessmentCard: React.FC<EnhancedAssessmentCardProps> = ({
  assessment,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}) => {
  const getStatusConfig = () => {
    const isActive = assessment.assessment_date && new Date(assessment.assessment_date) <= new Date();
    const isDraft = assessment.is_draft;
    
    if (isDraft) {
      return { 
        status: 'Draft', 
        variant: 'warning' as const, 
        icon: Clock
      };
    } else if (isActive) {
      return { 
        status: 'Active', 
        variant: 'success' as const, 
        icon: CheckCircle
      };
    } else {
      return { 
        status: 'Completed', 
        variant: 'neutral' as const, 
        icon: CheckCircle
      };
    }
  };

  const getSubjectIcon = (subject: string) => {
    const subjectIcons: Record<string, React.ComponentType<any>> = {
      'Math': Target,
      'Science': BookOpen,
      'English': FileText,
      'History': BookOpen,
      'Art': Pencil
    };
    return subjectIcons[subject] || BookOpen;
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const SubjectIcon = getSubjectIcon(assessment.subject);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DSCard className={`
      group relative transition-all duration-200 hover:shadow-lg
      ${isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'hover:ring-1 hover:ring-gray-200'}
    `}>
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-50/30 rounded-lg pointer-events-none" />
      )}
      
      {/* Card Header */}
      <DSCardHeader className="pb-4">
        <DSFlexContainer justify="between" align="start">
          <DSFlexContainer gap="sm" align="start" className="flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            
            <div className="flex-1 min-w-0">
              <DSFlexContainer gap="sm" align="center" className="mb-3">
                <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <SubjectIcon className="h-4 w-4 text-blue-600" />
                </div>
                <DSStatusBadge variant={statusConfig.variant} size="sm">
                  <StatusIcon className="mr-1.5 h-3 w-3" />
                  {statusConfig.status}
                </DSStatusBadge>
              </DSFlexContainer>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {assessment.title}
              </h3>
              
              <DSFlexContainer gap="sm" align="center" className="text-sm text-gray-600 mb-3">
                <span className="font-medium">{assessment.subject}</span>
                <span>•</span>
                <span>Grade {assessment.grade_level}</span>
                <span>•</span>
                <span className="capitalize">{assessment.assessment_type}</span>
              </DSFlexContainer>
            </div>
          </DSFlexContainer>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DSButton 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </DSButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={`/app/assessments/${assessment.id}`} className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/assessments/${assessment.id}/responses`} className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Add Responses
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/app/assessments/${assessment.id}/analysis`} className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analysis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit} className="flex items-center">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Assessment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="flex items-center text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DSFlexContainer>
      </DSCardHeader>

      {/* Assessment Info */}
      <DSCardContent className="py-4">
        <DSFlexContainer gap="lg" align="center" className="text-sm mb-3">
          <DSFlexContainer gap="sm" align="center" className="text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(assessment.assessment_date)}</span>
          </DSFlexContainer>
          <DSFlexContainer gap="sm" align="center" className="text-gray-600">
            <Target className="h-4 w-4" />
            <span>Max: {assessment.max_score} pts</span>
          </DSFlexContainer>
        </DSFlexContainer>

        {assessment.description && (
          <DSHelpText className="line-clamp-2 leading-relaxed">
            {assessment.description}
          </DSHelpText>
        )}
      </DSCardContent>

      {/* Card Footer */}
      <DSCardFooter className="pt-4">
        <DSFlexContainer justify="between" align="center">
          <DSFlexContainer gap="sm">
            <DSButton variant="secondary" size="sm" asChild>
              <Link to={`/app/assessments/${assessment.id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                Details
              </Link>
            </DSButton>
            <DSButton size="sm" asChild>
              <Link to={`/app/assessments/${assessment.id}/responses`}>
                <Users className="mr-1.5 h-3 w-3" />
                Add Data
              </Link>
            </DSButton>
          </DSFlexContainer>
          
          {!assessment.is_draft && (
            <DSButton variant="ghost" size="sm" asChild>
              <Link to={`/app/assessments/${assessment.id}/analysis`}>
                <BarChart3 className="mr-1.5 h-3 w-3" />
                Analysis
              </Link>
            </DSButton>
          )}
        </DSFlexContainer>
      </DSCardFooter>
    </DSCard>
  );
};

export default EnhancedAssessmentCard;
