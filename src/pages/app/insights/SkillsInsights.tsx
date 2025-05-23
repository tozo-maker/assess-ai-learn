
import React, { useState } from 'react';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle, TrendingDown, Target } from 'lucide-react';
import SkillsMasteryGrid from '@/components/charts/SkillsMasteryGrid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SkillsInsights = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('4th');

  // Mock data for skills mastery
  const skillsData = [
    {
      student_id: '1',
      student_name: 'Emma S.',
      skills: [
        { skill_name: 'Number Sense', mastery_level: 'Advanced' as const, score: 95, assessments_count: 4 },
        { skill_name: 'Fractions', mastery_level: 'Proficient' as const, score: 85, assessments_count: 3 },
        { skill_name: 'Geometry', mastery_level: 'Advanced' as const, score: 92, assessments_count: 2 },
        { skill_name: 'Measurement', mastery_level: 'Proficient' as const, score: 88, assessments_count: 3 },
      ]
    },
    {
      student_id: '2',
      student_name: 'John D.',
      skills: [
        { skill_name: 'Number Sense', mastery_level: 'Proficient' as const, score: 78, assessments_count: 4 },
        { skill_name: 'Fractions', mastery_level: 'Developing' as const, score: 62, assessments_count: 3 },
        { skill_name: 'Geometry', mastery_level: 'Proficient' as const, score: 82, assessments_count: 2 },
        { skill_name: 'Measurement', mastery_level: 'Approaching' as const, score: 75, assessments_count: 3 },
      ]
    },
    {
      student_id: '3',
      student_name: 'Sarah M.',
      skills: [
        { skill_name: 'Number Sense', mastery_level: 'Approaching' as const, score: 65, assessments_count: 4 },
        { skill_name: 'Fractions', mastery_level: 'Developing' as const, score: 58, assessments_count: 3 },
        { skill_name: 'Geometry', mastery_level: 'Approaching' as const, score: 71, assessments_count: 2 },
        { skill_name: 'Measurement', mastery_level: 'Developing' as const, score: 63, assessments_count: 3 },
      ]
    },
  ];

  const skills = ['Number Sense', 'Fractions', 'Geometry', 'Measurement'];

  const skillAnalytics = [
    {
      skill: 'Number Sense',
      classAverage: 79.3,
      masteryRate: 68,
      trend: 'improving',
      studentsStruggling: 2,
      interventionNeeded: false
    },
    {
      skill: 'Fractions',
      classAverage: 68.3,
      masteryRate: 45,
      trend: 'declining',
      studentsStruggling: 8,
      interventionNeeded: true
    },
    {
      skill: 'Geometry',
      classAverage: 81.7,
      masteryRate: 72,
      trend: 'stable',
      studentsStruggling: 3,
      interventionNeeded: false
    },
    {
      skill: 'Measurement',
      classAverage: 75.3,
      masteryRate: 58,
      trend: 'improving',
      studentsStruggling: 4,
      interventionNeeded: false
    }
  ];

  const interventionRecommendations = [
    {
      skill: 'Fractions',
      priority: 'High',
      studentsAffected: 8,
      recommendation: 'Implement manipulative-based fraction instruction with visual models',
      resources: ['Fraction tiles', 'Digital fraction tools', 'Peer tutoring program'],
      timeframe: '2-3 weeks intensive support'
    },
    {
      skill: 'Measurement',
      priority: 'Medium',
      studentsAffected: 4,
      recommendation: 'Practice with real-world measurement applications and estimation strategies',
      resources: ['Measurement tools kit', 'Estimation activities', 'Cross-curricular projects'],
      timeframe: '1-2 weeks focused practice'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-600 rotate-180" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <PageShell 
      title="Skills Mastery Analysis" 
      description="Track skill development and mastery across all students"
      icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="reading">Reading</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="social_studies">Social Studies</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Grade Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3rd">3rd Grade</SelectItem>
              <SelectItem value="4th">4th Grade</SelectItem>
              <SelectItem value="5th">5th Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Skills Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillAnalytics.map((skill, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                  {skill.interventionNeeded && (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Class Average</span>
                    <span className="font-medium">{skill.classAverage}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Mastery Rate</span>
                    <span className="font-medium">{skill.masteryRate}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trend</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(skill.trend)}
                      <span className="text-sm capitalize">{skill.trend}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Need Support</span>
                    <Badge variant={skill.studentsStruggling > 5 ? 'destructive' : 'secondary'}>
                      {skill.studentsStruggling} students
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="mastery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mastery">Mastery Grid</TabsTrigger>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="mastery" className="space-y-6">
            <SkillsMasteryGrid data={skillsData} skills={skills} />
          </TabsContent>

          <TabsContent value="interventions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Interventions</CardTitle>
                <CardDescription>
                  Targeted support strategies based on skill deficits identified across the class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {interventionRecommendations.map((intervention, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-semibold">{intervention.skill}</h4>
                          <Badge variant={intervention.priority === 'High' ? 'destructive' : 'secondary'}>
                            {intervention.priority} Priority
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {intervention.studentsAffected} students affected
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{intervention.recommendation}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Recommended Resources:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {intervention.resources.map((resource, resourceIndex) => (
                              <li key={resourceIndex}>• {resource}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Implementation Timeline:</h5>
                          <p className="text-sm text-gray-600">{intervention.timeframe}</p>
                          <Button size="sm" className="mt-2">
                            Create Action Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor skill development over time with detailed progress analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Detailed progress tracking charts will be implemented here showing skill mastery progression over time.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default SkillsInsights;
