
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, CheckCircle, AlertCircle, Brain } from 'lucide-react';

// Design System Components
import {
  DSCard,
  DSCardHeader,
  DSCardContent,
  DSCardFooter,
  DSCardTitle,
  DSCardDescription,
  DSButton,
  DSFlexContainer
} from '@/components/ui/design-system';

// Original Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assessmentService } from '@/services/assessment-service';

interface AssessmentAnalysisDisplayProps {
  assessmentId: string;
  studentId: string;
}

const AssessmentAnalysisDisplay: React.FC<AssessmentAnalysisDisplayProps> = ({ assessmentId, studentId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: analysis, isLoading, isError, refetch } = useQuery({
    queryKey: ['assessment-analysis', assessmentId, studentId],
    queryFn: () => assessmentService.getAssessmentAnalysis(assessmentId, studentId),
  });

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setSuccessMessage(null);
    
    try {
      const result = await assessmentService.triggerAnalysis(assessmentId, studentId);
      
      if (result.success) {
        setSuccessMessage('AI analysis generated successfully');
        refetch();
      } else {
        setGenerationError(result.message || 'Unknown error occurred');
      }
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto"></div>
          <p className="mt-4">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <DSCard className="border-red-200 bg-red-50">
        <DSCardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-[#ef4444] mx-auto" />
            <h2 className="text-xl font-semibold mt-4">Error Loading Analysis</h2>
            <p className="mt-2">Failed to load the analysis data.</p>
            <DSButton onClick={() => refetch()} className="mt-4">Try Again</DSButton>
          </div>
        </DSCardContent>
      </DSCard>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-8">
        <DSCard>
          <DSCardHeader>
            <DSCardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Generate AI Analysis
            </DSCardTitle>
            <DSCardDescription>
              No analysis found for this student's assessment. Generate an AI-powered analysis to get educational insights.
            </DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <DSFlexContainer gap="lg">
              <DSButton 
                onClick={handleGenerateAnalysis}
                disabled={isGenerating}
                variant="primary"
              >
                {isGenerating ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </DSButton>
            </DSFlexContainer>
            
            {generationError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-[#ef4444]">
                <DSFlexContainer align="start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{generationError}</p>
                </DSFlexContainer>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-[#10b981]">
                <DSFlexContainer align="start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{successMessage}</p>
                </DSFlexContainer>
              </div>
            )}
          </DSCardContent>
        </DSCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DSCard>
        <DSCardHeader>
          <DSFlexContainer justify="between" align="start">
            <div>
              <DSCardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Analysis Results
              </DSCardTitle>
              <DSCardDescription className="mt-1">
                Educational insights generated by AI analysis
              </DSCardDescription>
            </div>
            <DSButton 
              variant="secondary" 
              size="sm" 
              onClick={handleGenerateAnalysis} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </DSButton>
          </DSFlexContainer>
        </DSCardHeader>
        <DSCardContent>
          {generationError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-[#ef4444]">
              <DSFlexContainer align="start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{generationError}</p>
              </DSFlexContainer>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-[#10b981]">
              <DSFlexContainer align="start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{successMessage}</p>
              </DSFlexContainer>
            </div>
          )}

          {analysis.overall_summary && (
            <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Overall Summary</h3>
              <p className="text-blue-800">{analysis.overall_summary}</p>
            </div>
          )}
          
          <Tabs defaultValue="strengths">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="growth">Growth Areas</TabsTrigger>
              <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths" className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="text-[#10b981]">{strength}</li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="growth" className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {analysis.growth_areas.map((area, index) => (
                  <li key={index} className="text-[#f59e0b]">{area}</li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="patterns" className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {analysis.patterns_observed.map((pattern, index) => (
                  <li key={index} className="text-indigo-700">{pattern}</li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="recommendations" className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-purple-700">{recommendation}</li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </DSCardContent>
        <DSCardFooter className="text-sm text-gray-500 pt-2 border-t">
          Analysis generated on {new Date(analysis.created_at).toLocaleString()}
          {analysis.created_at !== analysis.updated_at && 
            ` • Updated on ${new Date(analysis.updated_at).toLocaleString()}`}
        </DSCardFooter>
      </DSCard>
    </div>
  );
};

export default AssessmentAnalysisDisplay;
