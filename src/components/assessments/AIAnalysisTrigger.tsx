
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { enhancedAnalysisService } from '@/services/enhanced-analysis-service';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAnalysisTriggerProps {
  assessmentId: string;
  studentId: string;
  responses: Array<{
    question_id: string;
    answer: string;
    points_earned: number;
    is_correct?: boolean;
  }>;
  onAnalysisComplete?: (analysisId: string) => void;
}

const AIAnalysisTrigger: React.FC<AIAnalysisTriggerProps> = ({
  assessmentId,
  studentId,
  responses,
  onAnalysisComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const result = await enhancedAnalysisService.generateComprehensiveAnalysis({
        assessmentId,
        studentId,
        responses
      });
      
      setAnalysisResult(result);
      onAnalysisComplete?.(result.id);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Failed to generate AI analysis. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (analysisResult) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            AI Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Level:</span>
              <Badge variant={
                analysisResult.performance_level === 'excellent' ? 'default' :
                analysisResult.performance_level === 'good' ? 'secondary' : 'destructive'
              }>
                {analysisResult.performance_level}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score:</span>
              <span className="font-bold">{analysisResult.overall_score}%</span>
            </div>

            {analysisResult.strengths?.length > 0 && (
              <div>
                <span className="text-sm font-medium">Key Strengths:</span>
                <div className="mt-1 space-y-1">
                  {analysisResult.strengths.slice(0, 3).map((strength: string, index: number) => (
                    <div key={index} className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.recommendations?.length > 0 && (
              <div>
                <span className="text-sm font-medium">Top Recommendations:</span>
                <div className="mt-1 space-y-1">
                  {analysisResult.recommendations.slice(0, 2).map((rec: any, index: number) => (
                    <div key={index} className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                      {rec.title || rec.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          AI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-blue-700 mb-4">
          Generate comprehensive AI analysis of this student's assessment performance, 
          including strengths, growth areas, and personalized recommendations.
        </p>
        
        <Button 
          onClick={generateAnalysis}
          disabled={isGenerating || responses.length === 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Analysis...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Analysis
            </>
          )}
        </Button>

        {responses.length === 0 && (
          <div className="flex items-center gap-2 mt-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Add student responses first</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisTrigger;
