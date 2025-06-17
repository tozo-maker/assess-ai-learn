
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, BookOpen, Target, Lightbulb, Upload, Search } from 'lucide-react';
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
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments match your criteria</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Try adjusting your search terms or clearing some filters to see more results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            Clear All Filters
          </Button>
          <Button onClick={() => navigate('/app/assessments/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20 px-6">
      {/* Animated Illustration */}
      <div className="mx-auto w-32 h-32 relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl animate-pulse"></div>
        <div className="absolute inset-2 bg-white rounded-xl shadow-sm flex items-center justify-center">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-1">
              <div className="w-8 h-2 bg-blue-200 rounded-full"></div>
              <div className="w-6 h-2 bg-purple-200 rounded-full"></div>
              <div className="w-10 h-2 bg-blue-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Create your first assessment</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
        Start tracking student progress with assessments. Create tests, quizzes, or projects to gather data and generate insights about your students' learning.
      </p>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <Button 
          onClick={() => navigate('/app/assessments/add')}
          className="gap-2 h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Create New Assessment
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/app/assessments/batch')}
          className="gap-2 h-12 px-8 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          <Upload className="h-5 w-5" />
          Import Assessment Data
        </Button>
      </div>

      {/* Feature Highlights */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">Getting Started</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900 mb-2">Create Assessments</h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Design quizzes, tests, and projects with detailed rubrics and scoring criteria.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-900 mb-2">Track Progress</h3>
            <p className="text-green-800 text-sm leading-relaxed">
              Monitor student performance over time and identify learning patterns.
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900 mb-2">Generate Insights</h3>
            <p className="text-purple-800 text-sm leading-relaxed">
              Get AI-powered analysis and recommendations to improve teaching effectiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmptyState;
