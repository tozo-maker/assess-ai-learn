
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Users, FileText, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  type: 'student' | 'assessment' | 'goal' | 'insight';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

interface UniversalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  filters?: {
    types?: Array<'student' | 'assessment' | 'goal' | 'insight'>;
    dateRange?: { start: Date; end: Date };
    subjects?: string[];
    gradeLevel?: string;
  };
}

const UniversalSearch: React.FC<UniversalSearchProps> = ({
  onResultSelect,
  filters = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ['universal-search', searchQuery, activeFilters],
    queryFn: async () => {
      if (!searchQuery.trim() && Object.keys(activeFilters).length === 0) {
        return [];
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const results: SearchResult[] = [];

      // Search students
      if (!activeFilters.types || activeFilters.types.includes('student')) {
        const { data: students } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', user.id)
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,student_id.ilike.%${searchQuery}%`)
          .limit(10);

        students?.forEach(student => {
          results.push({
            id: student.id,
            type: 'student',
            title: `${student.first_name} ${student.last_name}`,
            subtitle: student.grade_level,
            description: student.learning_goals,
            url: `/app/students/${student.id}`,
            metadata: { gradeLevel: student.grade_level }
          });
        });
      }

      // Search assessments
      if (!activeFilters.types || activeFilters.types.includes('assessment')) {
        const { data: assessments } = await supabase
          .from('assessments')
          .select('*')
          .eq('teacher_id', user.id)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`)
          .limit(10);

        assessments?.forEach(assessment => {
          results.push({
            id: assessment.id,
            type: 'assessment',
            title: assessment.title,
            subtitle: `${assessment.subject} - ${assessment.grade_level}`,
            description: assessment.description,
            url: `/app/assessments/${assessment.id}`,
            metadata: { subject: assessment.subject, gradeLevel: assessment.grade_level }
          });
        });
      }

      // Search goals
      if (!activeFilters.types || activeFilters.types.includes('goal')) {
        const { data: goals } = await supabase
          .from('goals')
          .select(`
            *,
            student:students(first_name, last_name)
          `)
          .eq('teacher_id', user.id)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(10);

        goals?.forEach(goal => {
          results.push({
            id: goal.id,
            type: 'goal',
            title: goal.title,
            subtitle: goal.student ? `${goal.student.first_name} ${goal.student.last_name}` : 'Class Goal',
            description: goal.description,
            url: `/app/goals/${goal.id}`,
            metadata: { status: goal.status }
          });
        });
      }

      // Search insights (assessment analysis)
      if (!activeFilters.types || activeFilters.types.includes('insight')) {
        const { data: insights } = await supabase
          .from('assessment_analysis')
          .select(`
            *,
            assessment:assessments(title, subject),
            student:students(first_name, last_name)
          `)
          .textSearch('overall_summary', searchQuery)
          .limit(10);

        insights?.forEach(insight => {
          results.push({
            id: insight.id,
            type: 'insight',
            title: insight.assessment?.title || 'Assessment Insight',
            subtitle: insight.student ? `${insight.student.first_name} ${insight.student.last_name}` : 'Student Analysis',
            description: insight.overall_summary,
            url: `/app/insights/${insight.id}`,
            metadata: { subject: insight.assessment?.subject }
          });
        });
      }

      return results;
    },
    enabled: searchQuery.trim().length > 0 || Object.keys(activeFilters).length > 0
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'student': return <Users className="h-4 w-4" />;
      case 'assessment': return <FileText className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'assessment': return 'bg-green-100 text-green-800';
      case 'goal': return 'bg-purple-100 text-purple-800';
      case 'insight': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students, assessments, goals, and insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
            onFocus={() => setIsExpanded(true)}
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
              {Object.keys(activeFilters).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {(searchQuery.trim() || hasActiveFilters) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isFetching ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-6 w-6 mx-auto mb-2 animate-pulse" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={result.url}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      onResultSelect?.(result);
                      setSearchQuery('');
                      setIsExpanded(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-xs text-gray-600 mb-1">{result.subtitle}</p>
                        )}
                        {result.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-6 w-6 mx-auto mb-2" />
                No results found for "{searchQuery}"
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UniversalSearch;
