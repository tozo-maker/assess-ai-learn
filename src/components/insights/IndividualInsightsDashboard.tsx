import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Calendar, Award, Info } from 'lucide-react';
import { useAssessmentAnalysis } from '@/hooks/useAssessmentAnalysis';
import { useStudentSkills, StudentSkillData } from '@/hooks/useStudentSkills';
import { format } from 'date-fns';

interface IndividualInsightsDashboardProps {
  studentId: string;
  studentName: string;
}

export const IndividualInsightsDashboard: React.FC<IndividualInsightsDashboardProps> = ({
  studentId,
  studentName
}) => {
  const { analyses, isLoading: analysesLoading } = useAssessmentAnalysis(studentId);
  const { skills, isLoading: skillsLoading } = useStudentSkills(studentId);

  const isLoading = analysesLoading || skillsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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

  const latestAnalysis = analyses?.[0];
  const totalSkills = skills?.length || 0;
  const masteredSkills = skills?.filter((s: StudentSkillData) => 
    s.current_mastery_level === 'Advanced' || s.current_mastery_level === 'Proficient'
  ).length || 0;
  const needsAttentionSkills = skills?.filter((s: StudentSkillData) => 
    s.current_mastery_level === 'Beginning'
  ).length || 0;

  const overallProgress = totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Mastered</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{masteredSkills}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalSkills} total skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{needsAttentionSkills}</div>
            <p className="text-xs text-muted-foreground">
              skills requiring focus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {latestAnalysis?.created_at 
                ? format(new Date(latestAnalysis.created_at), 'MMM dd, yyyy')
                : 'No assessments yet'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Growth Areas */}
        {latestAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Latest Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestAnalysis.overall_summary && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{latestAnalysis.overall_summary}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {latestAnalysis.strengths?.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {strength}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">No strengths identified yet</p>}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Growth Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {latestAnalysis.growth_areas?.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">No growth areas identified yet</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Mastery Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {skills && skills.length > 0 ? (
              <div className="space-y-4">
                {skills.slice(0, 8).map((skill: StudentSkillData) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{skill.skill?.name || 'Unknown Skill'}</p>
                      <p className="text-xs text-muted-foreground">{skill.skill?.subject || 'No subject'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          skill.current_mastery_level === 'Advanced' ? 'default' :
                          skill.current_mastery_level === 'Proficient' ? 'secondary' :
                          skill.current_mastery_level === 'Developing' ? 'outline' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {skill.current_mastery_level}
                      </Badge>
                      {skill.mastery_score !== null && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(skill.mastery_score)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {skills.length > 8 && (
                  <p className="text-xs text-muted-foreground text-center">
                    and {skills.length - 8} more skills...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No skills data available yet.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Skills will appear after assessments are completed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {latestAnalysis?.recommendations && latestAnalysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommendations for {studentName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {latestAnalysis.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state when no analysis */}
      {!latestAnalysis && (
        <Card>
          <CardContent className="p-8 text-center">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analysis Available</h3>
            <p className="text-muted-foreground">
              Complete an assessment to generate AI-powered insights for {studentName}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
