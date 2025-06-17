
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
  Target
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
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
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
      group relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50
      ${isSelected ? 'border-blue-500 shadow-md shadow-blue-100/50' : 'border-gray-100 hover:border-blue-200'}
      ${statusConfig.bgColor} hover:bg-white
    `}>
      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-blue-50/30 rounded-xl pointer-events-none" />
      )}
      
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                  <SubjectIcon className={`h-4 w-4 ${statusConfig.color}`} />
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                  <Badge variant={statusConfig.variant} className="text-xs font-medium">
                    {statusConfig.status}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {assessment.title}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="font-medium">{assessment.subject}</span>
                <span>•</span>
                <span>Grade {assessment.grade_level}</span>
                <span>•</span>
                <span className="capitalize">{assessment.assessment_type}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
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
        </div>

        {/* Assessment Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(assessment.assessment_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Target className="h-4 w-4" />
              <span>Max: {assessment.max_score} pts</span>
            </div>
          </div>

          {assessment.description && (
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {assessment.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200">
              <Link to={`/app/assessments/${assessment.id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                Details
              </Link>
            </Button>
            <Button size="sm" asChild className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
              <Link to={`/app/assessments/${assessment.id}/responses`}>
                <Users className="mr-1.5 h-3 w-3" />
                Add Data
              </Link>
            </Button>
          </div>
          
          {!assessment.is_draft && (
            <Button variant="ghost" size="sm" asChild className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link to={`/app/assessments/${assessment.id}/analysis`}>
                <BarChart3 className="mr-1.5 h-3 w-3" />
                Analysis
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssessmentCard;
