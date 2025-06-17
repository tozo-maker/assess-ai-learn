
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
  AlertCircle,
  BookOpen,
  Target,
  MoreVertical
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        variant: 'secondary' as const, 
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      };
    } else if (isActive) {
      return { 
        status: 'Active', 
        variant: 'default' as const, 
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return { 
        status: 'Completed', 
        variant: 'outline' as const, 
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
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
    <div className={`
      group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
      ${isSelected 
        ? 'border-blue-500 shadow-lg shadow-blue-100/50 ring-2 ring-blue-500/20' 
        : 'border-gray-200 hover:border-gray-300'
      }
    `}>
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant={statusConfig.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusConfig.status}
        </Badge>
      </div>
      
      {/* Card Content */}
      <div className="p-6 pt-16">
        {/* Subject Icon & Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`
            p-3 rounded-xl border transition-colors
            ${statusConfig.bgColor} ${statusConfig.borderColor}
          `}>
            <SubjectIcon className={`h-6 w-6 ${statusConfig.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
              {assessment.title}
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
              <span className="font-medium px-2 py-1 bg-gray-100 rounded-md">
                {assessment.subject}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                Grade {assessment.grade_level}
              </span>
              <span className="capitalize px-2 py-1 bg-gray-100 rounded-md">
                {assessment.assessment_type}
              </span>
            </div>
          </div>
        </div>

        {/* Assessment Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(assessment.assessment_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="h-4 w-4" />
              <span>{assessment.max_score} points</span>
            </div>
          </div>

          {assessment.description && (
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200"
            >
              <Link to={`/app/assessments/${assessment.id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                View
              </Link>
            </Button>
            
            <Button 
              size="sm" 
              asChild 
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Link to={`/app/assessments/${assessment.id}/responses`}>
                <Users className="mr-1.5 h-3 w-3" />
                Add Data
              </Link>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
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
              {!assessment.is_draft && (
                <DropdownMenuItem asChild>
                  <Link to={`/app/assessments/${assessment.id}/analysis`} className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analysis
                  </Link>
                </DropdownMenuItem>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssessmentCard;
