
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, BookOpen, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
}

const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  hasActiveFilters,
  onClearFilters
}) => {
  const navigate = useNavigate();

  if (hasActiveFilters) {
    return (
      <div className="text-center py-16 px-6">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments match your filters</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Try adjusting your search criteria or clearing some filters to see more results.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={() => navigate('/app/assessments/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20 px-6">
      {/* Hero Illustration */}
      <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
        <div className="relative z-10 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <BookOpen className="h-6 w-6 text-purple-600" />
          <Target className="h-5 w-5 text-blue-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Start creating assessments</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
        Assessments help you track student progress and identify learning opportunities. 
        Create your first assessment to get started with data-driven insights.
      </p>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button 
          onClick={() => navigate('/app/assessments/add')}
          className="gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create New Assessment
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/app/assessments/batch')}
          className="gap-2 h-12 px-6 border-gray-300 hover:bg-gray-50"
        >
          <FileText className="h-5 w-5" />
          Import Assessment Data
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">Quick Tips</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-900 mb-1">Start Simple</div>
            <div className="text-blue-700">Begin with a basic quiz or test to familiarize yourself with the system.</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="font-medium text-green-900 mb-1">Track Progress</div>
            <div className="text-green-700">Regular assessments help identify student learning patterns over time.</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <div className="font-medium text-purple-900 mb-1">Use Analytics</div>
            <div className="text-purple-700">Our AI analysis provides insights into student performance and recommendations.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmptyState;
