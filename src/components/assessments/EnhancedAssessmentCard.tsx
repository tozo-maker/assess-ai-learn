
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
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    } else if (isActive) {
      return { 
        status: 'Active', 
        variant: 'default' as const, 
        icon: CheckCircle,
        className: 'bg-green-50 text-green-700 border-green-200'
      };
    } else {
      return { 
        status: 'Completed', 
        variant: 'outline' as const, 
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
    <div className={`
      group relative bg-white rounded-xl border-2 transition-all duration-300 
      ${isSelected 
        ? 'border-blue-500 shadow-lg shadow-blue-100/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50' 
        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/30'
      }
    `}>
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
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <SubjectIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4 text-gray-500" />
                  <Badge className={statusConfig.className}>
                    {statusConfig.status}
                  </Badge>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {assessment.title}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="font-medium text-blue-600">{assessment.subject}</span>
                <span className="text-gray-400">•</span>
                <span>Grade {assessment.grade_level}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{assessment.assessment_type}</span>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-blue-50"
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
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="h-8 text-xs hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
              <Link to={`/app/assessments/${assessment.id}`}>
                <FileText className="mr-1.5 h-3 w-3" />
                Details
              </Link>
            </Button>
            <Button size="sm" asChild className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
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
