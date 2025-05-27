
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '@/components/ui/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Search, Filter } from 'lucide-react';
import { skillsService } from '@/services/skills-service';
import SkillLibrary from '@/components/skills/SkillLibrary';
import SkillCategoryManager from '@/components/skills/SkillCategoryManager';
import ClassSkillsOverview from '@/components/skills/ClassSkillsOverview';

const SkillsManagement = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch skill categories
  const { data: categories } = useQuery({
    queryKey: ['skill-categories'],
    queryFn: skillsService.getSkillCategories,
  });

  // Fetch skills with filters
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills', selectedSubject, selectedGradeLevel],
    queryFn: () => skillsService.getSkills({
      subject: selectedSubject || undefined,
      grade_level: selectedGradeLevel || undefined,
    }),
  });

  const subjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
  const gradeLevels = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th'];

  const filteredSkills = skills?.filter(skill =>
    searchQuery === '' || 
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageShell
      title="Skills Management"
      description="Manage skill taxonomies, track student mastery, and analyze progress"
      icon={<BookOpen className="h-6 w-6 text-blue-600" />}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
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

        {/* Skills Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Skills</p>
                  <p className="text-3xl font-bold text-gray-900">{skills?.length || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-3xl font-bold text-gray-900">{categories?.length || 0}</p>
                </div>
                <Filter className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subjects</p>
                  <p className="text-3xl font-bold text-gray-900">{subjects.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Grade Levels</p>
                  <p className="text-3xl font-bold text-gray-900">{gradeLevels.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="library" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="library">Skills Library</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="class-overview">Class Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-6">
            <SkillLibrary 
              skills={filteredSkills || []}
              categories={categories || []}
              isLoading={skillsLoading}
              onRefresh={() => {}}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <SkillCategoryManager 
              categories={categories || []}
              onRefresh={() => {}}
            />
          </TabsContent>

          <TabsContent value="class-overview" className="space-y-6">
            <ClassSkillsOverview />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Analytics</CardTitle>
                <CardDescription>
                  Comprehensive analytics and reporting on skill mastery across your classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Skills analytics dashboard coming soon with detailed mastery trends and gap analysis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
};

export default SkillsManagement;
