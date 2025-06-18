
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
  Target,
  MoreVertical
} from 'lucide-react';
import { DSCard, DSCardContent, DSButton, DSStatusBadge, DSFlexContainer } from '@/components/ui/design-system';
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
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else if (isActive) {
      return { 
        status: 'Active', 
        variant: 'success' as const, 
        icon: CheckCircle,
        className: 'bg-green-50 text-green-700 border-green-200'
      };
    } else {
      return { 
        status: 'Completed', 
        variant: 'info' as const, 
        icon: CheckCircle,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
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
      group relative transition-all duration-300 hover:shadow-lg
      ${isSelected 
        ? 'border-blue-500 shadow-lg shadow-blue-100/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' 
        : 'border-blue-100 hover:border-blue-300 hover:shadow-blue-100/30'
      }
    `}>
      <DSCardContent className="p-6">
        <DSFlexContainer direction="row" justify="between" align="start" className="mb-4">
          <DSFlexContainer direction="row" align="start" gap="sm" className="flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            
            <div className="flex-1 min-w-0">
              <DSFlexContainer direction="row" align="center" gap="sm" className="mb-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <SubjectIcon className="h-4 w-4 text-blue-600" />
                </div>
                <DSFlexContainer direction="row" align="center" gap="sm">
                  <StatusIcon className="h-4 w-4 text-gray-500" />
                  <DSStatusBadge variant={statusConfig.variant} size="sm">
                    {statusConfig.status}
                  </DSStatusBadge>
                </DSFlexContainer>
              </DSFlexContainer>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {assessment.title}
              </h3>
              
              <DSFlexContainer direction="row" align="center" gap="sm" className="text-sm text-gray-600 mb-3">
                <span className="font-medium text-blue-600">{assessment.subject}</span>
                <span className="text-gray-400">•</span>
                <span>Grade {assessment.grade_level}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{assessment.assessment_type}</span>
              </DSFlexContainer>
            </div>
          </DSFlexContainer>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DSButton 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-blue-50"
              >
                <MoreVertical className="h-4 w-4" />
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

        {/* Assessment Info */}
        <div className="space-y-3">
          <DSFlexContainer direction="row" align="center" gap="md" className="text-sm">
            <DSFlexContainer direction="row" align="center" gap="sm" className="text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(assessment.assessment_date)}</span>
            </DSFlexContainer>
            <DSFlexContainer direction="row" align="center" gap="sm" className="text-gray-600">
              <Target className="h-4 w-4" />
              <span>Max: {assessment.max_score} pts</span>
            </DSFlexContainer>
          </DSFlexContainer>

          {assessment.description && (
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>
      </DSCardContent>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50/30 to-indigo-50/20 border-t border-blue-100 rounded-b-xl">
        <DSFlexContainer direction="row" justify="between" align="center">
          <DSFlexContainer direction="row" gap="sm">
            <DSButton variant="secondary" size="sm" asChild className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
              <Link to={`/app/assessments/${assessment.id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                Details
              </Link>
            </DSButton>
            <DSButton variant="primary" size="sm" asChild className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              <Link to={`/app/assessments/${assessment.id}/responses`}>
                <Users className="mr-1.5 h-3 w-3" />
                Add Data
              </Link>
            </DSButton>
          </DSFlexContainer>
          
          {!assessment.is_draft && (
            <DSButton variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link to={`/app/assessments/${assessment.id}/analysis`}>
                <BarChart3 className="mr-1.5 h-3 w-3" />
                Analysis
              </Link>
            </DSButton>
          )}
        </DSFlexContainer>
      </div>
    </DSCard>
  );
};

export default EnhancedAssessmentCard;
