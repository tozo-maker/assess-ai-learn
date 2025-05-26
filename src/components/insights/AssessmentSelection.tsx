
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, Sparkles } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
}

interface AssessmentSelectionProps {
  assessmentsWithoutAnalysis: Assessment[];
  showAssessmentSelection: boolean;
  setShowAssessmentSelection: (show: boolean) => void;
  selectedAssessments: string[];
  toggleAssessmentSelection: (id: string) => void;
  generatingAnalysis: boolean;
  onGenerateAll: () => void;
  onGenerateSelected: () => void;
}

const AssessmentSelection: React.FC<AssessmentSelectionProps> = ({
  assessmentsWithoutAnalysis,
  showAssessmentSelection,
  setShowAssessmentSelection,
  selectedAssessments,
  toggleAssessmentSelection,
  generatingAnalysis,
  onGenerateAll,
  onGenerateSelected
}) => {
  if (assessmentsWithoutAnalysis.length === 0) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Generate More Insights</p>
            <p className="text-sm text-blue-700">
              {assessmentsWithoutAnalysis.length} more assessment{assessmentsWithoutAnalysis.length > 1 ? 's' : ''} can have AI analysis generated
            </p>
          </div>
          {!showAssessmentSelection ? (
            <div className="flex gap-2">
              <Button 
                onClick={onGenerateAll}
                disabled={generatingAnalysis}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generatingAnalysis ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Generate All
              </Button>
              {assessmentsWithoutAnalysis.length > 1 && (
                <Button 
                  variant="outline"
                  onClick={() => setShowAssessmentSelection(true)}
                  disabled={generatingAnalysis}
                  size="sm"
                >
                  Select Specific
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
      </CardContent>
    </Card>
  );
};

export default AssessmentSelection;
