import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { assessmentService } from '@/services/assessment-service';
import InsightMetricsDashboard from '@/components/insights/InsightMetricsDashboard';
import InsightFilters from '@/components/insights/InsightFilters';
import ComprehensiveSummary from '@/components/insights/ComprehensiveSummary';
import AssessmentSelection from '@/components/insights/AssessmentSelection';
import InsightsDisplay from '@/components/insights/InsightsDisplay';
import EmptyInsightsState from '@/components/insights/EmptyInsightsState';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  assessment_date?: string;
}

interface StudentInsight {
  id: string;
  overall_summary?: string;
  strengths: string[];
  growth_areas: string[];
  recommendations: string[];
  patterns_observed: string[];
  created_at: string;
  assessments?: Assessment;
}

interface InsightsTabContentProps {
  insights: StudentInsight[];
  isLoading: boolean;
  onViewAssessments: () => void;
  studentId?: string;
  assessments?: Assessment[];
  onInsightsUpdated?: () => void;
}

const InsightsTabContent: React.FC<InsightsTabContentProps> = ({ 
  insights, 
  isLoading, 
  onViewAssessments,
  studentId,
  assessments = [],
  onInsightsUpdated
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [showAssessmentSelection, setShowAssessmentSelection] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'subject' | 'type'>('date');

  // Find assessments that don't have AI analysis yet
  const assessmentsWithoutAnalysis = assessments.filter(assessment => {
    if (!assessment || !assessment.id) {
      console.warn('Invalid assessment found:', assessment);
      return false;
    }
    
    const hasAnalysis = insights.some(insight => {
      if (!insight.assessments) return false;
      return insight.assessments.id === assessment.id;
    });
    
    return !hasAnalysis;
  });

  // Get unique subjects for filtering
  const availableSubjects = [...new Set(insights.map(insight => insight.assessments?.subject).filter(Boolean))];

  // Filter and sort insights
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = !searchTerm || 
      insight.overall_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.strengths.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      insight.growth_areas.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
      insight.recommendations.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubjects.length === 0 || 
      (insight.assessments && selectedSubjects.includes(insight.assessments.subject));
    
    return matchesSearch && matchesSubject;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'subject':
        return (a.assessments?.subject || '').localeCompare(b.assessments?.subject || '');
      case 'type':
        return a.assessments?.title.localeCompare(b.assessments?.title || '') || 0;
      default:
        return 0;
    }
  });

  // Aggregate insights for display
  const aggregatedInsights = {
    strengths: [...new Set(filteredInsights.flatMap(insight => insight.strengths || []))],
    growthAreas: [...new Set(filteredInsights.flatMap(insight => insight.growth_areas || []))],
    recommendations: [...new Set(filteredInsights.flatMap(insight => insight.recommendations || []))],
  };

  const handleGenerateAnalysis = async (assessmentIds: string[]) => {
    if (!studentId || assessmentIds.length === 0) {
      console.error('Missing studentId or assessmentIds:', { studentId, assessmentIds });
      toast({
        title: "Error",
        description: "Missing student ID or no assessments selected.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAnalysis(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const assessmentId of assessmentIds) {
        try {
          await assessmentService.generateAssessmentAnalysis(assessmentId, studentId);
          successCount++;
        } catch (error) {
          console.error(`Failed to generate analysis for assessment ${assessmentId}:`, error);
          failureCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: "Analysis Generated",
          description: `Successfully generated AI analysis for ${successCount} assessment${successCount > 1 ? 's' : ''}${failureCount > 0 ? `. ${failureCount} failed.` : '.'}`,
        });
        
        if (onInsightsUpdated) {
          setTimeout(() => {
            onInsightsUpdated();
          }, 1000);
        }
      } else {
        toast({
          title: "Analysis Failed",
          description: "Failed to generate AI analysis. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in analysis generation process:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating analysis.",
        variant: "destructive",
      });
    } finally {
      setGeneratingAnalysis(false);
      setSelectedAssessments([]);
      setShowAssessmentSelection(false);
    }
  };

  const handleGenerateAll = () => {
    const allAssessmentIds = assessmentsWithoutAnalysis.map(a => a.id).filter(Boolean);
    handleGenerateAnalysis(allAssessmentIds);
  };

  const handleGenerateSelected = () => {
    handleGenerateAnalysis(selectedAssessments);
  };

  const toggleAssessmentSelection = (assessmentId: string) => {
    setSelectedAssessments(prev => 
      prev.includes(assessmentId) 
        ? prev.filter(id => id !== assessmentId)
        : [...prev, assessmentId]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSubjects([]);
    setSortBy('date');
  };

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleMarkAsAddressed = (item: string) => {
    toast({
      title: "Marked as Addressed",
      description: "This recommendation has been marked as addressed.",
    });
  };

  const handleCreateGoal = (item: string) => {
    if (!studentId) {
      toast({
        title: "Error",
        description: "Student ID is required to create a goal.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to goals page with the insight data
    navigate(`/app/students/${studentId}/goals`, {
      state: {
        fromInsight: true,
        insightText: item,
        autoOpenDialog: true
      }
    });

    toast({
      title: "Redirecting to Goals",
      description: "Opening goal creation form with insight data...",
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading insights...</p>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <EmptyInsightsState
        assessmentsWithoutAnalysis={assessmentsWithoutAnalysis}
        showAssessmentSelection={showAssessmentSelection}
        setShowAssessmentSelection={setShowAssessmentSelection}
        selectedAssessments={selectedAssessments}
        toggleAssessmentSelection={toggleAssessmentSelection}
        generatingAnalysis={generatingAnalysis}
        onGenerateAll={handleGenerateAll}
        onGenerateSelected={handleGenerateSelected}
        onViewAssessments={onViewAssessments}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Metrics Dashboard */}
      <InsightMetricsDashboard 
        insights={insights}
        assessmentsWithoutAnalysis={assessmentsWithoutAnalysis.length}
      />

      {/* Generate More Analysis Button */}
      <AssessmentSelection
        assessmentsWithoutAnalysis={assessmentsWithoutAnalysis}
        showAssessmentSelection={showAssessmentSelection}
        setShowAssessmentSelection={setShowAssessmentSelection}
        selectedAssessments={selectedAssessments}
        toggleAssessmentSelection={toggleAssessmentSelection}
        generatingAnalysis={generatingAnalysis}
        onGenerateAll={handleGenerateAll}
        onGenerateSelected={handleGenerateSelected}
      />

      {/* Comprehensive Summary */}
      <ComprehensiveSummary insights={insights} />

      {/* Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Learning Insights</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {(searchTerm || selectedSubjects.length > 0 || sortBy !== 'date') && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <InsightFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSubjects={selectedSubjects}
          onSubjectToggle={handleSubjectToggle}
          availableSubjects={availableSubjects}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Main Insights Display */}
      <InsightsDisplay
        filteredInsights={filteredInsights}
        aggregatedInsights={aggregatedInsights}
        onMarkAsAddressed={handleMarkAsAddressed}
        onCreateGoal={handleCreateGoal}
      />
    </div>
  );
};

export default InsightsTabContent;
