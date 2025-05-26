
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Plus, Loader2, Sparkles } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
}

interface EmptyInsightsStateProps {
  assessmentsWithoutAnalysis: Assessment[];
  showAssessmentSelection: boolean;
  setShowAssessmentSelection: (show: boolean) => void;
  selectedAssessments: string[];
  toggleAssessmentSelection: (id: string) => void;
  generatingAnalysis: boolean;
  onGenerateAll: () => void;
  onGenerateSelected: () => void;
  onViewAssessments: () => void;
}

const EmptyInsightsState: React.FC<EmptyInsightsStateProps> = ({
  assessmentsWithoutAnalysis,
  showAssessmentSelection,
  setShowAssessmentSelection,
  selectedAssessments,
  toggleAssessmentSelection,
  generatingAnalysis,
  onGenerateAll,
  onGenerateSelected,
  onViewAssessments
}) => {
  return (
    <div className="text-center py-12">
      <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium mb-2">No insights available</h3>
      <p className="text-gray-500 mb-6">
        Generate AI insights from assessment data to get personalized learning recommendations.
      </p>
      
      {assessmentsWithoutAnalysis.length > 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4 max-w-md mx-auto">
          <p className="text-blue-800 text-sm mb-4">
            Found {assessmentsWithoutAnalysis.length} assessment{assessmentsWithoutAnalysis.length > 1 ? 's' : ''} ready for AI analysis.
          </p>
          
          {!showAssessmentSelection ? (
            <div className="flex flex-col gap-3">
              <Button 
                onClick={onGenerateAll}
                disabled={generatingAnalysis}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generatingAnalysis ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate AI Insights for All
              </Button>
              
              {assessmentsWithoutAnalysis.length > 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowAssessmentSelection(true)}
                  disabled={generatingAnalysis}
                >
                  Choose Specific Assessments
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-left">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Select assessments for AI analysis:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assessmentsWithoutAnalysis.map((assessment) => (
                    <div key={assessment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={assessment.id}
                        checked={selectedAssessments.includes(assessment.id)}
                        onCheckedChange={() => toggleAssessmentSelection(assessment.id)}
                      />
                      <label htmlFor={assessment.id} className="text-sm text-blue-800 cursor-pointer">
                        {assessment.title} ({assessment.subject})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={onGenerateSelected}
                  disabled={generatingAnalysis || selectedAssessments.length === 0}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generatingAnalysis ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Selected ({selectedAssessments.length})
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowAssessmentSelection(false)}
                  disabled={generatingAnalysis}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onViewAssessments}>
          View Assessments
        </Button>
      )}
    </div>
  );
};

export default EmptyInsightsState;
