
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Eye, Clock, AlertCircle } from 'lucide-react';

interface AIAnalysisStatusProps {
  assessmentId: string;
  studentId: string;
  onViewAnalysis?: () => void;
}

const AIAnalysisStatus: React.FC<AIAnalysisStatusProps> = ({
  assessmentId,
  studentId,
  onViewAnalysis
}) => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['assessment-analysis', assessmentId, studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_analysis')
        .select('*')
        .eq('assessment_id', assessmentId)
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Checking analysis...</span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <AlertCircle className="h-4 w-4" />
        <span>No AI analysis available</span>
      </div>
    );
  }

  const getStatusBadge = () => {
    // Analysis exists, so it's completed
    return <Badge variant="default" className="flex items-center gap-1">
      <Brain className="h-3 w-3" />
      Analysis Complete
    </Badge>;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <Brain className="h-5 w-5 text-blue-600" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600">
            {analysis.strengths?.length || 0} insights generated
          </p>
        </div>
      </div>
      
      {analysis && onViewAnalysis && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAnalysis}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Analysis
        </Button>
      )}
    </div>
  );
};

export default AIAnalysisStatus;
