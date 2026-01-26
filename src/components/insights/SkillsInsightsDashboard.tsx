import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, BookOpen, Award, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SkillsInsightsDashboard: React.FC = () => {
  // Fetch all skills (student_skills table doesn't exist yet)
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ['skills-insights'],
    queryFn: async () => {
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .order('subject', { ascending: true });

      if (skillsError) throw skillsError;

      // student_skills table doesn't exist yet - return empty array
      return { skills: skills || [], studentSkills: [] };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { skills = [], studentSkills = [] } = skillsData || {};

  // Calculate statistics
  const totalSkills = skills.length;
  const skillsWithData = 0; // No student_skills data yet
  const totalAssessments = studentSkills.length;

  // Group by subject
  const subjectStats = skills.reduce((acc, skill) => {
    const subject = skill.subject || 'Other';
    if (!acc[subject]) {
      acc[subject] = {
        total: 0,
        assessed: 0,
        mastered: 0
      };
    }
    acc[subject].total++;
    return acc;
  }, {} as Record<string, { total: number; assessed: number; mastered: number }>);

  // Show empty state if no student skills data
  if (totalAssessments === 0) {
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSkills}</div>
              <p className="text-xs text-muted-foreground">
                {skillsWithData} have assessment data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastery Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <Progress value={0} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Advanced Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">0</div>
              <p className="text-xs text-muted-foreground">
                0% of assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Support</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">0</div>
              <p className="text-xs text-muted-foreground">
                beginning level students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Available Skills by Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(subjectStats).length > 0 ? (
                Object.entries(subjectStats).map(([subject, stats]) => (
                  <div key={subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{subject}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stats.total} skills
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills available.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Skills tracking helps you monitor student mastery across different learning objectives.
                </p>
                <p>
                  Once students complete assessments, their skill mastery levels will appear here automatically.
                </p>
                <div className="pt-2">
                  <p className="font-medium text-foreground mb-2">Mastery Levels:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span>Advanced - Full mastery</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Proficient - Strong understanding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span>Developing - Making progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span>Beginning - Needs support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Full dashboard with data (placeholder for when student_skills exists)
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <Info className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-lg font-medium mb-2">Skills Insights Coming Soon</h3>
          <p className="text-muted-foreground">
            Student skill tracking is being set up. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
