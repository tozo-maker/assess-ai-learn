import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, BookOpen, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SkillsInsightsDashboard: React.FC = () => {
  // Fetch all skills with aggregated student data
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ['skills-insights'],
    queryFn: async () => {
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .order('subject', { ascending: true });

      if (skillsError) throw skillsError;

      const { data: studentSkills, error: studentSkillsError } = await supabase
        .from('student_skills')
        .select(`
          *,
          skill:skills(name, subject, grade_level),
          student:students(grade_level)
        `);

      if (studentSkillsError) throw studentSkillsError;

      return { skills, studentSkills };
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
  const skillsWithData = new Set(studentSkills.map(ss => ss.skill_id)).size;
  const masteryStats = studentSkills.reduce((acc, ss) => {
    const level = ss.current_mastery_level || 'Beginning';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAssessments = studentSkills.length;
  const advancedCount = masteryStats['Advanced'] || 0;
  const proficientCount = masteryStats['Proficient'] || 0;
  const developingCount = masteryStats['Developing'] || 0;
  const beginningCount = masteryStats['Beginning'] || 0;

  const masteryRate = totalAssessments > 0 ? Math.round(((advancedCount + proficientCount) / totalAssessments) * 100) : 0;

  // Group by subject
  const subjectStats = skills.reduce((acc, skill) => {
    const subject = skill.subject;
    if (!acc[subject]) {
      acc[subject] = {
        total: 0,
        assessed: 0,
        mastered: 0
      };
    }
    acc[subject].total++;
    
    const skillAssessments = studentSkills.filter(ss => ss.skill_id === skill.id);
    if (skillAssessments.length > 0) {
      acc[subject].assessed++;
      const masteredCount = skillAssessments.filter(ss => 
        ss.current_mastery_level === 'Advanced' || ss.current_mastery_level === 'Proficient'
      ).length;
      acc[subject].mastered += masteredCount;
    }
    
    return acc;
  }, {} as Record<string, { total: number; assessed: number; mastered: number }>);

  // Skills needing attention (low mastery rates)
  const skillsNeedingAttention = skills
    .map(skill => {
      const assessments = studentSkills.filter(ss => ss.skill_id === skill.id);
      if (assessments.length === 0) return null;
      
      const beginningCount = assessments.filter(ss => ss.current_mastery_level === 'Beginning').length;
      const strugglingRate = (beginningCount / assessments.length) * 100;
      
      return {
        skill,
        assessments: assessments.length,
        strugglingRate,
        strugglingCount: beginningCount
      };
    })
    .filter(item => item && item.strugglingRate > 50)
    .sort((a, b) => (b?.strugglingRate || 0) - (a?.strugglingRate || 0))
    .slice(0, 5);

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
            <div className="text-2xl font-bold">{masteryRate}%</div>
            <Progress value={masteryRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advanced Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{advancedCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalAssessments > 0 ? Math.round((advancedCount / totalAssessments) * 100) : 0}% of assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Support</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{beginningCount}</div>
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
              Subject Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(subjectStats).map(([subject, stats]) => {
              const masteryRate = stats.assessed > 0 ? Math.round((stats.mastered / stats.assessed) * 100) : 0;
              return (
                <div key={subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{subject}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.assessed}/{stats.total} assessed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={masteryRate} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-12">
                      {masteryRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mastery Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Mastery Level Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { level: 'Advanced', count: advancedCount, color: 'bg-success' },
              { level: 'Proficient', count: proficientCount, color: 'bg-primary' },
              { level: 'Developing', count: developingCount, color: 'bg-warning' },
              { level: 'Beginning', count: beginningCount, color: 'bg-destructive' }
            ].map(({ level, count, color }) => {
              const percentage = totalAssessments > 0 ? (count / totalAssessments) * 100 : 0;
              return (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm font-medium">{level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({Math.round(percentage)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Skills Needing Attention */}
      {skillsNeedingAttention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Skills Requiring Additional Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {skillsNeedingAttention.map((item) => (
                <div key={item!.skill.id} className="p-3 border rounded-lg bg-warning/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item!.skill.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item!.skill.subject} • Grade {item!.skill.grade_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs mb-1">
                        {item!.strugglingCount}/{item!.assessments} struggling
                      </Badge>
                      <p className="text-xs text-warning font-medium">
                        {Math.round(item!.strugglingRate)}% need support
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};