
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { skillsService } from '@/services/skills-service';
import { studentService } from '@/services/student-service';
import { useAuth } from '@/contexts/AuthContext';

const ClassSkillsOverview = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');

  // Fetch students for class overview
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents,
    enabled: !!user,
  });

  // Mock data for skills overview - in real implementation, this would come from the database
  const classSkillsData = [
    {
      skill_name: 'Addition Facts 0-10',
      subject: 'Mathematics',
      grade_level: '1st',
      students_assessed: 24,
      total_students: 25,
      mastery_distribution: {
        Advanced: 8,
        Proficient: 10,
        Developing: 4,
        Beginning: 2,
      },
      average_score: 78.5,
      trend: 'improving'
    },
    {
      skill_name: 'Subtraction Facts 0-10',
      subject: 'Mathematics',
      grade_level: '1st',
      students_assessed: 24,
      total_students: 25,
      mastery_distribution: {
        Advanced: 5,
        Proficient: 8,
        Developing: 7,
        Beginning: 4,
      },
      average_score: 71.2,
      trend: 'stable'
    },
    {
      skill_name: 'Reading Comprehension - Main Idea',
      subject: 'English Language Arts',
      grade_level: '3rd',
      students_assessed: 22,
      total_students: 25,
      mastery_distribution: {
        Advanced: 6,
        Proficient: 9,
        Developing: 5,
        Beginning: 2,
      },
      average_score: 81.3,
      trend: 'improving'
    },
  ];

  const subjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
  const gradeLevels = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th'];

  const filteredSkillsData = classSkillsData.filter(skill => {
    if (selectedSubject && skill.subject !== selectedSubject) return false;
    if (selectedGradeLevel && skill.grade_level !== selectedGradeLevel) return false;
    return true;
  });

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'bg-green-500';
      case 'Proficient': return 'bg-blue-500';
      case 'Developing': return 'bg-yellow-500';
      case 'Beginning': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Class Skills Overview</h3>
          <p className="text-gray-600">Monitor skill mastery across all students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Grade Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Grade Levels</SelectItem>
            {gradeLevels.map(grade => (
              <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skills Tracked</p>
                <p className="text-3xl font-bold text-gray-900">{filteredSkillsData.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredSkillsData.length > 0 
                    ? Math.round(filteredSkillsData.reduce((sum, skill) => sum + skill.average_score, 0) / filteredSkillsData.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                <p className="text-3xl font-bold text-gray-900">
                  {filteredSkillsData.filter(skill => skill.average_score < 75).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSkillsData.map((skill, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {skill.skill_name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{skill.subject}</Badge>
                    <Badge variant="outline">Grade {skill.grade_level}</Badge>
                    {getTrendIcon(skill.trend)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(skill.average_score)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {skill.students_assessed}/{skill.total_students} assessed
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Class Progress</span>
                    <span>{Math.round(skill.average_score)}%</span>
                  </div>
                  <Progress value={skill.average_score} className="h-2" />
                </div>

                {/* Mastery Distribution */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Mastery Distribution</h4>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {Object.entries(skill.mastery_distribution).map(([level, count]) => (
                      <div key={level} className="text-center">
                        <div className={`h-2 rounded ${getMasteryColor(level)} mb-1`} style={{
                          width: `${(count / skill.students_assessed) * 100}%`,
                          minWidth: '4px'
                        }} />
                        <p className="text-gray-600">{level}</p>
                        <p className="font-medium">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSkillsData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Skills Data</h3>
            <p className="text-gray-600">
              Complete some assessments to see class-wide skill mastery data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassSkillsOverview;
