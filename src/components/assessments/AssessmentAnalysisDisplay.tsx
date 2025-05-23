
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { assessmentService } from '@/services/assessment-service';
import { AIModelType, aiModelOptions } from '@/types/assessment';

interface AssessmentAnalysisDisplayProps {
  assessmentId: string;
  studentId: string;
}

const AssessmentAnalysisDisplay: React.FC<AssessmentAnalysisDisplayProps> = ({ assessmentId, studentId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModelType>('openai');
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
      const result = await assessmentService.triggerAnalysis(assessmentId, studentId, selectedModel);
      
      if (result.success) {
        setSuccessMessage(`Analysis generated successfully using ${selectedModel.toUpperCase()}`);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-8 border rounded-lg bg-red-50">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-semibold mt-4">Error Loading Analysis</h2>
        <p className="mt-2">Failed to load the analysis data.</p>
        <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate AI Analysis</CardTitle>
            <CardDescription>
              No analysis found for this student's assessment. Generate an AI-powered analysis to get insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select 
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as AIModelType)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model === 'openai' ? 'OpenAI GPT' : 'Anthropic Claude'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGenerateAnalysis}
                disabled={isGenerating}
                className="ml-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Analysis'
                )}
              </Button>
            </div>
            
            {generationError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{generationError}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get model used from analysis_json if available
  const modelUsed = analysis.analysis_json?.model 
    ? analysis.analysis_json.model.includes('claude') ? 'Anthropic Claude' : 'OpenAI GPT'
    : 'AI';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription className="mt-1">
                Insights generated by {modelUsed}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
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
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Select 
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as AIModelType)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  {aiModelOptions.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model === 'openai' ? 'OpenAI GPT' : 'Anthropic Claude'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {generationError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{generationError}</p>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 mb-6 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">Overall Summary</h3>
            <p className="text-blue-800">{analysis.overall_summary}</p>
          </div>
          
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
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="growth" className="pt-4">
              <ul className="list-disc pl-5 space-y-2">
                {analysis.growth_areas.map((area, index) => (
                  <li key={index} className="text-orange-700">{area}</li>
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
        </CardContent>
        <CardFooter className="text-sm text-gray-500 pt-2 border-t">
          Analysis generated on {new Date(analysis.created_at).toLocaleString()}
          {analysis.created_at !== analysis.updated_at && 
            ` • Updated on ${new Date(analysis.updated_at).toLocaleString()}`}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentAnalysisDisplay;
