
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, Users, BookOpen, Target, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import RecommendationFiltersComponent, { RecommendationFilters } from './RecommendationFilters';
import StudentRecommendationCard from './StudentRecommendationCard';
import { Skeleton } from '@/components/ui/loading-skeleton';

const getEmptyFilters = (): RecommendationFilters => ({
  search: '',
  student: '',
  subject: '',
  gradeLevel: '',
  priority: '',
  category: '',
  status: '',
  sortBy: 'date_desc'
});

export const RecommendationsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<RecommendationFilters>(getEmptyFilters());
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch recommendations data
  const { data: recommendationsData, isLoading, refetch } = useQuery({
    queryKey: ['recommendations-enhanced', filters],
    queryFn: async () => {
      // Get analyses with recommendations
      const { data: analyses, error: analysesError } = await supabase
        .from('assessment_analysis')
        .select(`
          *,
          student:students(id, first_name, last_name, grade_level),
          assessment:assessments(title, subject, grade_level)
        `)
        .not('recommendations', 'eq', '{}')
        .order('created_at', { ascending: false });

      if (analysesError) throw analysesError;

      // Get students for filtering
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade_level')
        .order('last_name');

      if (studentsError) throw studentsError;

      return { analyses: analyses || [], students: students || [] };
    },
    staleTime: 2 * 60 * 1000,
  });

  // Process and filter data
  const processedData = useMemo(() => {
    if (!recommendationsData) return { studentRecommendations: [], totalCount: 0 };

    const { analyses, students } = recommendationsData;
    
    // Convert analyses to recommendation format
    const allRecommendations = analyses.flatMap(analysis => 
      (analysis.recommendations || []).map((rec: string, index: number) => ({
        id: `${analysis.id}-${index}`,
        text: rec,
        student: analysis.student,
        assessment: analysis.assessment,
        priority: analysis.growth_areas?.length > 2 ? 'high' : 
                 analysis.growth_areas?.length > 0 ? 'medium' : 'low',
        category: categorizeRecommendation(rec),
        growthAreas: analysis.growth_areas || [],
        created_at: analysis.created_at,
        status: 'new' as const
      }))
    );

    // Apply filters
    let filteredRecommendations = allRecommendations.filter(rec => {
      if (filters.search && !rec.text.toLowerCase().includes(filters.search.toLowerCase()) &&
          !`${rec.student.first_name} ${rec.student.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) &&
          !rec.assessment.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.student && rec.student.id !== filters.student) return false;
      if (filters.subject && rec.assessment.subject !== filters.subject) return false;
      if (filters.gradeLevel && rec.student.grade_level !== filters.gradeLevel) return false;
      if (filters.priority && rec.priority !== filters.priority) return false;
      if (filters.category && rec.category !== filters.category) return false;
      return true;
    });

    // Apply sorting
    filteredRecommendations.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'student_asc':
          return `${a.student.last_name} ${a.student.first_name}`.localeCompare(`${b.student.last_name} ${b.student.first_name}`);
        case 'student_desc':
          return `${b.student.last_name} ${b.student.first_name}`.localeCompare(`${a.student.last_name} ${a.student.first_name}`);
        case 'priority_desc':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'subject':
          return a.assessment.subject.localeCompare(b.assessment.subject);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    // Group by student
    const studentRecommendations = students
      .map(student => ({
        student,
        recommendations: filteredRecommendations.filter(rec => rec.student.id === student.id)
      }))
      .filter(group => group.recommendations.length > 0);

    return {
      studentRecommendations,
      totalCount: allRecommendations.length,
      filteredCount: filteredRecommendations.length
    };
  }, [recommendationsData, filters]);

  const categorizeRecommendation = (rec: string): string => {
    const lower = rec.toLowerCase();
    if (lower.includes('practice') || lower.includes('drill')) return 'practice';
    if (lower.includes('support') || lower.includes('help')) return 'support';
    if (lower.includes('challenge') || lower.includes('advance')) return 'enrichment';
    if (lower.includes('review') || lower.includes('revisit')) return 'review';
    return 'general';
  };

  const handleRecommendationAction = (recommendationId: string, action: string) => {
    if (action === 'implement') {
      toast({
        title: "Recommendation Implemented",
        description: "This recommendation has been marked as implemented.",
      });
    } else if (action === 'view') {
      toast({
        title: "View Details",
        description: "Opening detailed view for this recommendation.",
      });
    }
  };

  const handleViewStudentDetails = (studentId: string) => {
    navigate(`/app/insights/student/${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { studentRecommendations, totalCount, filteredCount } = processedData;

  // Calculate stats
  const stats = useMemo(() => {
    const allRecs = studentRecommendations.flatMap(sr => sr.recommendations);
    return {
      total: allRecs.length,
      highPriority: allRecs.filter(r => r.priority === 'high').length,
      studentsWithRecommendations: studentRecommendations.length,
      subjects: new Set(allRecs.map(r => r.assessment.subject)).size
    };
  }, [studentRecommendations]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              across all students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsWithRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              with recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjects}</div>
            <p className="text-xs text-muted-foreground">
              areas covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <RecommendationFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(getEmptyFilters())}
        students={recommendationsData?.students || []}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      {/* Student Recommendation Cards */}
      <div className="space-y-4">
        {studentRecommendations.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Recommendations Found</h3>
              <p className="text-muted-foreground mb-4">
                {totalCount === 0 
                  ? "No AI recommendations have been generated yet. Complete some assessments to get personalized recommendations."
                  : "No recommendations match your current filters. Try adjusting your search criteria."
                }
              </p>
              {totalCount === 0 && (
                <Button onClick={() => navigate('/app/assessments')}>
                  Go to Assessments
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          studentRecommendations.map((studentGroup) => (
            <StudentRecommendationCard
              key={studentGroup.student.id}
              student={studentGroup.student}
              recommendations={studentGroup.recommendations}
              onRecommendationAction={handleRecommendationAction}
              onViewStudentDetails={handleViewStudentDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};
